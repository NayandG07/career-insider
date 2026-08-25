import time
import logging
from typing import Dict, Any, List, Optional
# pyrefly: ignore [missing-import]
import google.genai as genai
from openai import AsyncOpenAI
from huggingface_hub import AsyncInferenceClient
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
        
        # Check cache (60 seconds TTL)
        if task in self.config_cache:
            cache_entry = self.config_cache[task]
            if current_time - cache_entry['timestamp'] < 60:
                return cache_entry['config']
                
        db = await get_db()
        config_doc = await db.aiConfigs.find_one({"task": task})
        
        if not config_doc:
            # Fallback default configuration
            config = LLMConfig(
                primaryProvider="gemini",
                primaryModel="gemini-1.5-flash",
                fallbackChain=["openai", "huggingface"]
            )
        else:
            config = LLMConfig(
                primaryProvider=config_doc.get("primaryProvider", "gemini"),
                primaryModel=config_doc.get("primaryModel", "gemini-1.5-flash"),
                fallbackChain=config_doc.get("fallbackChain", ["openai", "huggingface"])
            )
            
        self.config_cache[task] = {
            'config': config,
            'timestamp': current_time
        }
        
        return config

    async def _get_api_keys(self, provider: str) -> List[str]:
        db = await get_db()
        keys_cursor = db.apiKeys.find({"provider": provider, "isActive": True})
        keys = await keys_cursor.to_list(length=None)
        
        decrypted_keys = []
        for key_doc in keys:
            try:
                decrypted = decrypt_api_key(key_doc["encryptedKey"])
                decrypted_keys.append(decrypted)
            except Exception as e:
                logger.error(f"Failed to decrypt key for provider {provider}: {e}")
                
        return decrypted_keys

    async def _invoke_gemini(self, model_name: str, prompt: str, api_key: str) -> str:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        response = await model.generate_content_async(prompt)
        return response.text

    async def _invoke_openai(self, model_name: str, prompt: str, api_key: str) -> str:
        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model=model_name or "gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content or ""

    async def _invoke_huggingface(self, model_name: str, prompt: str, api_key: str) -> str:
        client = AsyncInferenceClient(token=api_key)
        response = await client.text_generation(
            prompt,
            model=model_name or "meta-llama/Meta-Llama-3-8B-Instruct",
            max_new_tokens=1024
        )
        return response

    async def _try_provider(self, provider: str, model_name: str, prompt: str) -> Optional[str]:
        keys = await self._get_api_keys(provider)
        if not keys:
            logger.warning(f"No active keys found for provider {provider}")
            return None
            
        for key in keys:
            masked_key = f"{key[:4]}...{key[-4:]}" if len(key) > 8 else "***"
            logger.info(f"Trying provider {provider} with key {masked_key}")
            try:
                if provider == "gemini":
                    return await self._invoke_gemini(model_name, prompt, key)
                elif provider == "openai":
                    return await self._invoke_openai(model_name, prompt, key)
                elif provider == "huggingface":
                    return await self._invoke_huggingface(model_name, prompt, key)
                else:
                    logger.error(f"Unknown provider {provider}")
                    return None
            except Exception as e:
                error_msg = str(e).lower()
                if "429" in error_msg or "rate limit" in error_msg or "quota" in error_msg:
                    logger.warning(f"Rate limited on {provider} with key {masked_key}. Rotating...")
                    continue
                else:
                    logger.error(f"Error calling {provider}: {e}")
                    # Might not be rate limit, but let's try next key anyway or just break
                    continue
                    
        return None

    async def invoke(self, task: str, prompt: str) -> str:
        """
        Invokes an LLM for a specific task based on dynamic configuration.
        Implements fallback logic and key rotation.
        """
        config = await self._get_task_config(task)
        
        # Try primary provider
        result = await self._try_provider(config.primaryProvider, config.primaryModel, prompt)
        if result:
            return result
            
        # Try fallbacks
        for fallback_provider in config.fallbackChain:
            logger.info(f"Falling back to {fallback_provider} for task {task}")
            # We don't have specific models for fallbacks in config, so we pass None to use defaults
            result = await self._try_provider(fallback_provider, "", prompt)
            if result:
                return result
                
        raise RuntimeError(f"All providers failed for task {task}")

llm_manager = LLMManager()
