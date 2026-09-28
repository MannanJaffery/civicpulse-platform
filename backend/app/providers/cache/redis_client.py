import json
import logging
import os
import time
from typing import Any, Optional

import redis

logger = logging.getLogger("civicpulse.cache")


class RedisClient:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self._client: Optional[redis.Redis] = None
        self._in_memory_store: dict[str, tuple[str, float]] = {}  # fallback: key -> (value, expiry)
        self._in_memory_mode: bool = os.getenv("ENVIRONMENT") == "test"
        if not self._in_memory_mode:
            self._init_client()

    def _init_client(self) -> None:
        try:
            client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_timeout=0.5,
                socket_connect_timeout=0.5,
            )
            # Verify connectivity
            client.ping()
            self._client = client
        except Exception as e:
            logger.warning(
                f"Failed to connect to Redis ({e}). Operating in resilient in-memory fallback mode."
            )
            self._client = None
            self._in_memory_mode = True

    @property
    def is_connected(self) -> bool:
        client = self._client
        if client is not None:
            try:
                return bool(client.ping())
            except Exception:
                return False
        return not self._in_memory_mode

    def ping(self) -> bool:
        client = self._client
        if client is not None:
            try:
                return bool(client.ping())
            except Exception:
                return False
        return False

    def get_stats_cache(self) -> Optional[dict[str, Any]]:
        key = "cache:stats:aggregates"
        client = self._client
        if client is not None:
            try:
                raw_val: Any = client.get(key)
                if raw_val is not None and isinstance(raw_val, str):
                    parsed: dict[str, Any] = json.loads(raw_val)
                    return parsed
            except Exception as e:
                logger.warning(f"Redis get_stats_cache error: {e}")

        # In-memory fallback
        item = self._in_memory_store.get(key)
        if item is not None:
            val_mem, exp = item
            if time.time() < exp and isinstance(val_mem, str):
                parsed_mem: dict[str, Any] = json.loads(val_mem)
                return parsed_mem
            else:
                self._in_memory_store.pop(key, None)
        return None

    def set_stats_cache(self, data: dict[str, Any], ttl_seconds: int = 30) -> None:
        key = "cache:stats:aggregates"
        serialized = json.dumps(data)
        client = self._client
        if client is not None:
            try:
                client.setex(key, ttl_seconds, serialized)
                return
            except Exception as e:
                logger.warning(f"Redis set_stats_cache error: {e}")

        # In-memory fallback
        self._in_memory_store[key] = (serialized, time.time() + ttl_seconds)

    def invalidate_stats_cache(self) -> None:
        key = "cache:stats:aggregates"
        client = self._client
        if client is not None:
            try:
                client.delete(key)
            except Exception as e:
                logger.warning(f"Redis invalidate_stats_cache error: {e}")

        self._in_memory_store.pop(key, None)

    def get_triage_cache(self, content_hash: str) -> Optional[dict[str, Any]]:
        key = f"cache:triage:{content_hash}"
        client = self._client
        if client is not None:
            try:
                raw_val: Any = client.get(key)
                if raw_val is not None and isinstance(raw_val, str):
                    parsed: dict[str, Any] = json.loads(raw_val)
                    return parsed
            except Exception as e:
                logger.warning(f"Redis get_triage_cache error: {e}")

        item = self._in_memory_store.get(key)
        if item is not None:
            val_mem, exp = item
            if time.time() < exp and isinstance(val_mem, str):
                parsed_mem: dict[str, Any] = json.loads(val_mem)
                return parsed_mem
            else:
                self._in_memory_store.pop(key, None)
        return None

    def set_triage_cache(
        self, content_hash: str, data: dict[str, Any], ttl_seconds: int = 86400
    ) -> None:
        key = f"cache:triage:{content_hash}"
        serialized = json.dumps(data)
        client = self._client
        if client is not None:
            try:
                client.setex(key, ttl_seconds, serialized)
                return
            except Exception as e:
                logger.warning(f"Redis set_triage_cache error: {e}")

        self._in_memory_store[key] = (serialized, time.time() + ttl_seconds)

    def check_rate_limit(
        self, client_ip: str, limit: int = 20, window_seconds: int = 60
    ) -> tuple[bool, int]:
        """
        Fixed-window distributed rate limiter in Redis.
        Returns: (is_allowed, retry_after_seconds)
        """
        current_time = int(time.time())
        window_bucket = current_time // window_seconds
        key = f"ratelimit:{client_ip}:{window_bucket}"
        retry_after = (window_bucket + 1) * window_seconds - current_time

        client = self._client
        if client is not None:
            try:
                pipe = client.pipeline()
                pipe.incr(key)
                pipe.expire(key, window_seconds + 5)
                results = pipe.execute()
                count = int(results[0])
                if count > limit:
                    return False, max(1, retry_after)
                return True, 0
            except Exception as e:
                logger.warning(f"Redis rate limiting error: {e}")

        # In-memory fallback rate limiting
        item = self._in_memory_store.get(key)
        current_count = 0
        if item is not None:
            val_mem, exp = item
            if time.time() < exp:
                current_count = int(val_mem)

        new_count = current_count + 1
        self._in_memory_store[key] = (str(new_count), time.time() + window_seconds + 5)

        if new_count > limit:
            return False, max(1, retry_after)
        return True, 0

    def close(self) -> None:
        client = self._client
        if client is not None:
            try:
                client.close()
            except Exception:
                pass


_redis_singleton: Optional[RedisClient] = None


def get_redis_client() -> RedisClient:
    global _redis_singleton
    if _redis_singleton is None:
        _redis_singleton = RedisClient()
    return _redis_singleton
