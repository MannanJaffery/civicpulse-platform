import os
from app.providers.triage.base import TriageProvider
from app.providers.triage.llm import LLMTriage
from app.providers.triage.ollama import OllamaTriage
from app.providers.triage.rules import RuleBasedTriage
from app.providers.triage.simulated import SimulatedTriage


def get_triage_provider(name: str | None = None) -> TriageProvider:
    provider_name = name or os.getenv("TRIAGE_PROVIDER", "rules").lower()

    if provider_name == "simulated":
        return SimulatedTriage()
    elif provider_name in ("llm", "groq", "gemini"):
        return LLMTriage()
    elif provider_name == "ollama":
        return OllamaTriage()
    elif provider_name == "rules":
        return RuleBasedTriage()
    else:
        return RuleBasedTriage()
