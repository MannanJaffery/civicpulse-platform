import hashlib
from app.providers.triage.base import Category, Priority, TriageProvider, TriageResult


class SimulatedTriage(TriageProvider):
    name: str = "simulated"

    def __init__(self, should_fail: bool = False, malformed: bool = False):
        self.should_fail = should_fail
        self.malformed = malformed

    def triage(self, text: str, location: str) -> TriageResult:
        if self.should_fail:
            raise RuntimeError("Injected simulated triage provider failure")

        # Deterministic pseudo-randomness based on text hash for consistent testing
        h = int(hashlib.md5(text.encode()).hexdigest(), 16)
        categories = list(Category)
        priorities = list(Priority)

        category = categories[h % len(categories)]
        priority = priorities[h % len(priorities)]

        summary = f"Simulated: {text[:100]}..." if len(text) > 100 else f"Simulated: {text}"

        return TriageResult(
            category=category,
            priority=priority,
            summary=summary[:140],
            confidence=0.95,
        )
