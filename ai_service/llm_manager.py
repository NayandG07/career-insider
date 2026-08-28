import time
import logging
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from google import genai as google_genai
from openai import AsyncOpenAI
from pydantic import BaseModel

from utils.db import get_db
from utils.encryption import decrypt_api_key

logger = logging.getLogger(__name__)


class LLMConfig(BaseModel):
    primaryProvider: str
    primaryModel: str
    fallbackChain: List[str]

class LLMManager:
    def __init__(self):
        self.config_cache: Dict[str, Dict[str, Any]] = {}

    async def _get_task_config(self, task: str) -> LLMConfig:
        current_time = time.time()

        if task in self.config_cache:
            cache_entry = self.config_cache[task]
            if current_time - cache_entry['timestamp'] < 30:  # 30s TTL
                return cache_entry['config']

        db = await get_db()
        # Mongoose lowercases collection names: aiconfigs, not aiConfigs
        config_doc = await db.aiconfigs.find_one({"task": task})

        if not config_doc:
            logger.warning(f"No aiconfig found for task '{task}', using default gemini-3.6-flash")
            config = LLMConfig(
                primaryProvider="gemini",
                primaryModel="gemini-3.6-flash",
                fallbackChain=["openai", "huggingface"]
            )
        else:
            config = LLMConfig(
                primaryProvider=config_doc.get("primaryProvider", "gemini"),
                primaryModel=config_doc.get("primaryModel", "gemini-3.6-flash"),
                fallbackChain=config_doc.get("fallbackChain", ["openai", "huggingface"])
            )

        self.config_cache[task] = {'config': config, 'timestamp': current_time}
        return config

    async def _get_api_keys(self, provider: str) -> List[str]:
        db = await get_db()
        # Mongoose lowercases collection names: apikeys, not apiKeys
        keys_cursor = db.apikeys.find({"provider": provider, "isActive": True})
        keys = await keys_cursor.to_list(length=None)

        decrypted_keys = []
        for key_doc in keys:
            try:
                decrypted = decrypt_api_key(key_doc["encryptedKey"])
                decrypted_keys.append(decrypted)
            except Exception as e:
                logger.error(f"Failed to decrypt key for provider '{provider}': {e}")

        logger.info(f"Found {len(decrypted_keys)} active key(s) for provider '{provider}'")
        return decrypted_keys

    async def _invoke_gemini(self, model_name: str, prompt: str, api_key: str) -> str:
        """Use google-genai SDK v1+: Client().aio.models.generate_content()"""
        from google.genai import types as genai_types
        client = google_genai.Client(api_key=api_key)
        gemini_model = model_name.strip() if (model_name and "gemini" in model_name.lower()) else "gemini-3.6-flash"
        response = await client.aio.models.generate_content(
            model=gemini_model,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                max_output_tokens=4096,
                temperature=0.7,
            )
        )
        return response.text

    async def _invoke_openai(self, model_name: str, prompt: str, api_key: str) -> str:
        client = AsyncOpenAI(api_key=api_key)
        openai_model = model_name.strip() if (model_name and ("gpt" in model_name.lower() or "o1" in model_name.lower() or "o3" in model_name.lower())) else "gpt-4o-mini"
        response = await client.chat.completions.create(
            model=openai_model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content or ""

    async def _invoke_huggingface(self, model_name: str, prompt: str, api_key: str) -> str:
        """
        Hugging Face Router API (OpenAI-compatible) via async httpx.
        Supports standard models and explicit model:provider syntax.
        Includes 503 cold-start handling with automatic 15s retry and HTML error sanitization.
        """
        hf_model = (model_name.strip()
                    if model_name and model_name.strip()
                    else "Qwen/Qwen2.5-72B-Instruct")

        url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": hf_model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 4096,
            "temperature": 0.7,
            "stream": False
        }

        timeout_seconds = 90.0
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.post(url, headers=headers, json=payload)

            # Handle 503 Cold Start (model spinning up)
            if response.status_code == 503:
                logger.warning(
                    f"503 received for {hf_model} — model is cold-starting on HuggingFace router. Waiting 15s before retry..."
                )
                await asyncio.sleep(15)
                logger.info(f"Retrying {hf_model} after 503 cold-start wait...")
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code == 200:
                result = response.json()
                if "choices" in result and len(result["choices"]) > 0:
                    choice = result["choices"][0]
                    message = choice.get("message", {})
                    content = message.get("content")
                    if content and content.strip():
                        return content.strip()
                    # If finish_reason is length or content is empty
                    finish_reason = choice.get("finish_reason", "unknown")
                    raise RuntimeError(f"HuggingFace model '{hf_model}' returned empty content (finish_reason: {finish_reason})")
                raise RuntimeError(f"HuggingFace router returned empty choices: {result}")

            # Error sanitization
            error_text = response.text
            if error_text.startswith("<!DOCTYPE") or error_text.startswith("<html"):
                error_msg = f"Hugging Face Router API error: {response.status_code} Gateway Timeout / Error"
            else:
                error_msg = f"Hugging Face Router API error ({response.status_code}): {error_text[:200]}"

            raise RuntimeError(error_msg)



    async def _try_provider(self, provider: str, model_name: str, prompt: str) -> Optional[str]:
        keys = await self._get_api_keys(provider)
        if not keys:
            logger.warning(f"No active keys found for provider '{provider}'")
            return None

        for key in keys:
            masked_key = f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "***"
            logger.info(f"Trying provider '{provider}' with key {masked_key}")

            max_retries = 2
            for attempt in range(max_retries):
                try:
                    if provider == "gemini":
                        result = await self._invoke_gemini(model_name, prompt, key)
                    elif provider == "openai":
                        result = await self._invoke_openai(model_name, prompt, key)
                    elif provider == "huggingface":
                        result = await self._invoke_huggingface(model_name, prompt, key)
                    else:
                        logger.error(f"Unknown provider '{provider}'")
                        return None

                    if result and result.strip():
                        logger.info(f"Provider '{provider}' succeeded on attempt {attempt + 1}.")
                        return result.strip()
                    else:
                        logger.warning(f"Provider '{provider}' returned empty output on attempt {attempt + 1}.")

                except Exception as e:
                    error_msg = str(e).lower()
                    logger.error(f"Provider '{provider}' attempt {attempt + 1} failed: {e}")

                    if "429" in error_msg or "rate limit" in error_msg or "quota" in error_msg:
                        if attempt < max_retries - 1:
                            wait_secs = 5 * (2 ** attempt)  # 5s, 10s
                            logger.warning(f"Rate limited on '{provider}'. Waiting {wait_secs}s...")
                            await asyncio.sleep(wait_secs)
                            continue
                        else:
                            logger.warning(f"Rate limit exhausted for key {masked_key}, rotating...")
                            break
                    else:
                        break  # Non-rate-limit error — try next key

        return None

    async def invoke(self, task: str, prompt: str) -> str:
        """
        Invokes the configured LLM for a task.
        Reads config from DB (aiconfigs collection), tries primary provider,
        then falls back through the fallbackChain and standard provider list.
        """
        config = await self._get_task_config(task)
        logger.info(
            f"Task '{task}': primary={config.primaryProvider}/{config.primaryModel}, "
            f"fallbacks={config.fallbackChain}"
        )

        tried_providers = set()

        # 1. Try primary provider with its configured model
        tried_providers.add(config.primaryProvider)
        result = await self._try_provider(config.primaryProvider, config.primaryModel, prompt)
        if result and result.strip():
            return result

        # 2. Iterate through configured fallback providers
        for fallback_provider in config.fallbackChain:
            if fallback_provider in tried_providers:
                continue
            tried_providers.add(fallback_provider)
            logger.info(f"Falling back to '{fallback_provider}' for task '{task}'")
            fallback_model = config.primaryModel if fallback_provider == config.primaryProvider else ""
            result = await self._try_provider(fallback_provider, fallback_model, prompt)
            if result and result.strip():
                return result

        # 3. Last-resort fallback to any remaining standard providers
        all_standard_providers = ["gemini", "openai", "huggingface"]
        for provider in all_standard_providers:
            if provider in tried_providers:
                continue
            logger.info(f"Trying remaining fallback provider '{provider}' for task '{task}'")
            result = await self._try_provider(provider, "", prompt)
            if result and result.strip():
                return result

        raise RuntimeError(f"All providers failed for task '{task}'")


llm_manager = LLMManager()
