import redis
import json
import hashlib
from .config import config
from typing import Optional


class CacheService:
    def __init__(self):
        try:
            self.redis_client = redis.from_url(config.REDIS_URL, decode_responses=True)
            # Test connection
            self.redis_client.ping()
            self.cache_enabled = True
        except Exception as e:
            print(f"Redis connection failed: {e}")
            self.cache_enabled = False

    def _generate_cache_key(self, text: str, tone: str) -> str:
        """Generate a cache key for the given text and tone"""
        content = f"{text}:{tone}"
        return f"rephrase:{hashlib.md5(content.encode()).hexdigest()}"

    def get_cached_rephrase(self, text: str, tone: str) -> Optional[str]:
        """Get cached rephrased text"""
        if not self.cache_enabled:
            return None

        try:
            cache_key = self._generate_cache_key(text, tone)
            cached_result = self.redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None

    def cache_rephrase(
        self, text: str, tone: str, rephrased_text: str, ttl: int = 3600
    ):
        """Cache the rephrased text"""
        if not self.cache_enabled:
            return

        try:
            cache_key = self._generate_cache_key(text, tone)
            self.redis_client.setex(cache_key, ttl, json.dumps(rephrased_text))
        except Exception as e:
            print(f"Cache set error: {e}")


# Global instance
cache_service = CacheService()
