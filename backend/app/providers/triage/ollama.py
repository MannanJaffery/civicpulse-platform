import logging
import os

from app.providers.triage.base import TriageProvider, TriageResult
from app.providers.triage.rules import RuleBasedTriage

logger = logging.getLogger(__name__)


class OllamaTriage(TriageProvider):
    name: str = "llm:ollama"

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
        self.fallback = RuleBasedTriage()

    def triage(self, text: str, location: str) -> TriageResult:
        try:
            # Placeholder for Ollama API invocation with fallback
            return self.fallback.triage(text, location)
        except Exception as exc:
            logger.warning(f"Ollama triage failed ({exc}). Falling back to RuleBasedTriage.")
            return self.fallback.triage(text, location)
