import time
import logging
import asyncio
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor

from google import genai as google_genai
from openai import AsyncOpenAI
from huggingface_hub import InferenceClient
from pydantic import BaseModel

from utils.db import get_db
from utils.encryption import decrypt_api_key

logger = logging.getLogger(__name__)

# Thread pool for running sync HuggingFace calls
_hf_executor = ThreadPoolExecutor(max_workers=4)

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
        response = await client.aio.models.generate_content(
            model=model_name or "gemini-3.5-flash",
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                max_output_tokens=4096,
                temperature=0.7,
            )
        )
        return response.text

    async def _invoke_openai(self, model_name: str, prompt: str, api_key: str) -> str:
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model=model_name or "gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content or ""

    async def _invoke_huggingface(self, model_name: str, prompt: str, api_key: str) -> str:
        """
        HuggingFace Inference via huggingface_hub InferenceClient.
        Uses text_generation with proper instruction format for instruct models.
        Runs in a thread pool since InferenceClient is synchronous.
        """
        hf_model = model_name or "mistralai/Mistral-7B-Instruct-v0.3"

        def _run_hf_inference():
            client = InferenceClient(token=api_key)
            # Format as instruction prompt (works for Mistral, Llama, Zephyr instruction models)
            formatted_prompt = f"<s>[INST] {prompt} [/INST]"
            response = client.text_generation(
                prompt=formatted_prompt,
                model=hf_model,
                max_new_tokens=2048,
                return_full_text=False,
                temperature=0.7,
                do_sample=True,
            )
            return str(response).strip()

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_hf_executor, _run_hf_inference)
        return result

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

                    logger.info(f"Provider '{provider}' succeeded on attempt {attempt + 1}.")
                    return result

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
        then falls back through the fallbackChain.
        """
        config = await self._get_task_config(task)
        logger.info(
            f"Task '{task}': primary={config.primaryProvider}/{config.primaryModel}, "
            f"fallbacks={config.fallbackChain}"
        )

        result = await self._try_provider(config.primaryProvider, config.primaryModel, prompt)
        if result:
            return result

        for fallback_provider in config.fallbackChain:
            logger.info(f"Falling back to '{fallback_provider}' for task '{task}'")
            result = await self._try_provider(fallback_provider, "", prompt)
            if result:
                return result

        raise RuntimeError(f"All providers failed for task '{task}'")


llm_manager = LLMManager()
