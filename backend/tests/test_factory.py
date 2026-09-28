from app.providers.triage.factory import get_triage_provider
from app.providers.triage.llm import LLMTriage
from app.providers.triage.ollama import OllamaTriage
from app.providers.triage.rules import RuleBasedTriage
from app.providers.triage.simulated import SimulatedTriage


def test_factory_providers():
    assert isinstance(get_triage_provider("simulated"), SimulatedTriage)
    assert isinstance(get_triage_provider("rules"), RuleBasedTriage)
    assert isinstance(get_triage_provider("llm"), LLMTriage)
    assert isinstance(get_triage_provider("groq"), LLMTriage)
    assert isinstance(get_triage_provider("ollama"), OllamaTriage)
    assert isinstance(get_triage_provider("unknown_fallback"), RuleBasedTriage)
