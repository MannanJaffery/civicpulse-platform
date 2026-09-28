import json
import logging
import os

import httpx

from app.providers.triage.base import Category, Priority, TriageProvider, TriageResult
from app.providers.triage.rules import RuleBasedTriage

logger = logging.getLogger("civicpulse.triage.ollama")

SYSTEM_PROMPT = """You are a municipal complaint triage AI. Classify the citizen complaint into JSON with keys: category (water, electricity, sanitation, roads, streetlights, other), priority (high, normal, low), summary (max 140 chars), confidence (0.0 to 1.0)."""


class OllamaTriage(TriageProvider):
    name: str = "llm:ollama"

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
        self.fallback = RuleBasedTriage()

    def triage(self, text: str, location: str) -> TriageResult:
        prompt = f"Location: {location}\nComplaint: {text}"
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": f"{SYSTEM_PROMPT}\n\n{prompt}",
                        "format": "json",
                        "stream": False,
                    },
                )
                if res.status_code == 200:
                    data = json.loads(res.json().get("response", "{}"))
                    cat = Category(data.get("category", "other").lower())
                    prio = Priority(data.get("priority", "normal").lower())
                    summary = str(data.get("summary", text[:137]))[:140]
                    conf = float(data.get("confidence", 0.8))
                    return TriageResult(
                        category=cat,
                        priority=prio,
                        summary=summary,
                        confidence=conf,
                    )
        except Exception as exc:
            logger.warning(
                json.dumps(
                    {
                        "event": "triage_fallback",
                        "provider": self.name,
                        "error_class": exc.__class__.__name__,
                        "message": f"Ollama triage failed ({exc}). Falling back to RuleBasedTriage.",
                    }
                )
            )
        return self.fallback.triage(text, location)
