import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://civicpulse_user:civicpulse_password@localhost:5432/civicpulse_db",
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    TRIAGE_PROVIDER: str = os.getenv("TRIAGE_PROVIDER", "rules")
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "20"))
    STATS_CACHE_TTL_SECONDS: int = int(os.getenv("STATS_CACHE_TTL_SECONDS", "30"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
