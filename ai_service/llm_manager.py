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
        HuggingFace Hub Inference via InferenceClient.
        Supports any dynamic model name configured in DB or passed by task.
        Tries chat_completion first, then text_generation, and modern router endpoints.
        """
        hf_model = model_name.strip() if (model_name and model_name.strip()) else "deepseek-ai/DeepSeek-V4-Pro"

        def _run_hf_inference():
            client = InferenceClient(token=api_key)

            # 1. Try standard OpenAI-compatible chat_completion via Hugging Face Hub router
            try:
                messages = [{"role": "user", "content": prompt}]
                response = client.chat_completion(
                    messages=messages,
                    model=hf_model,
                    max_tokens=2048,
                    temperature=0.7,
                )
                if response and response.choices and len(response.choices) > 0:
                    content = response.choices[0].message.content
                    if content is not None:
                        return content
            except Exception as e:
                logger.warning(f"HuggingFace chat_completion failed for '{hf_model}': {e}. Trying text_generation...")

            # 2. Try text_generation via InferenceClient
            try:
                gen_response = client.text_generation(
                    prompt=prompt,
                    model=hf_model,
                    max_new_tokens=2048,
                    temperature=0.7,
                    return_full_text=False,
                )
                if gen_response and gen_response.strip():
                    return gen_response.strip()
            except Exception as e:
                logger.warning(f"HuggingFace text_generation failed for '{hf_model}': {e}. Trying router HTTP request...")

            # 3. Direct HTTP POST to modern HF router endpoint (https://router.huggingface.co/hf-inference/models/...)
            import httpx
            headers = {"Authorization": f"Bearer {api_key}"}

            # Try router chat completions
            try:
                with httpx.Client(timeout=60.0) as http_client:
                    resp = http_client.post(
                        "https://router.huggingface.co/v1/chat/completions",
                        json={
                            "model": hf_model,
                            "messages": [{"role": "user", "content": prompt}],
                            "max_tokens": 2048,
                            "temperature": 0.7
                        },
                        headers=headers
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"Direct router chat completion failed for '{hf_model}': {e}")

            # Try router model endpoint
            url = f"https://router.huggingface.co/hf-inference/models/{hf_model}" if not hf_model.startswith("http") else hf_model
            formatted_prompt = f"<s>[INST] {prompt} [/INST]"
            payload = {
                "inputs": formatted_prompt,
                "parameters": {
                    "max_new_tokens": 2048,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
            with httpx.Client(timeout=60.0) as http_client:
                resp = http_client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
                    return data[0]["generated_text"].strip()
                elif isinstance(data, dict) and "generated_text" in data:
                    return data["generated_text"].strip()
                else:
                    return str(data)

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

        # 1. Try primary provider with its configured model
        result = await self._try_provider(config.primaryProvider, config.primaryModel, prompt)
        if result:
            return result

        # 2. Iterate through fallback providers
        for fallback_provider in config.fallbackChain:
            if fallback_provider == config.primaryProvider:
                continue
            logger.info(f"Falling back to '{fallback_provider}' for task '{task}'")
            result = await self._try_provider(fallback_provider, "", prompt)
            if result:
                return result

        raise RuntimeError(f"All providers failed for task '{task}'")


llm_manager = LLMManager()
