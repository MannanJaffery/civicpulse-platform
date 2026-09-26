import os
import json
import logging
from app.providers.triage.base import Category, Priority, TriageProvider, TriageResult
from app.providers.triage.rules import RuleBasedTriage

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a municipal triage AI. Your job is to classify civic complaints into structured JSON.
Categorize into one of: water, electricity, sanitation, roads, streetlights, other.
Priority must be one of: high, normal, low.
Provide a one-line summary (max 140 chars) and confidence (0.0 to 1.0).
Respond with valid JSON matching this schema:
{"category": "...", "priority": "...", "summary": "...", "confidence": 0.9}
"""


class LLMTriage(TriageProvider):
    name: str = "llm:groq"

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY") or os.getenv("GEMINI_API_KEY", "")
        self.fallback = RuleBasedTriage()

    def triage(self, text: str, location: str) -> TriageResult:
        # If no API key configured, use fallback gracefully
        if not self.api_key:
            logger.warning("No LLM API key provided. Falling back to RuleBasedTriage.")
            return self.fallback.triage(text, location)

        try:
            # Placeholder for OpenAI SDK Groq / Gemini invocation with 10s timeout
            # In full implementation, calls Groq client with response_format={"type": "json_object"}
            return self.fallback.triage(text, location)
        except Exception as exc:
            logger.warning(f"LLM triage failed ({exc}). Falling back to RuleBasedTriage.")
            return self.fallback.triage(text, location)
