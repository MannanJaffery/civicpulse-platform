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

        lower_text = text.lower()
        if "water" in lower_text or "pipe" in lower_text or "drain" in lower_text:
            category = Category.WATER
            priority = (
                Priority.HIGH if "flood" in lower_text or "burst" in lower_text else Priority.NORMAL
            )
        elif "light" in lower_text or "pole" in lower_text:
            category = Category.STREETLIGHTS
            priority = Priority.LOW
        elif "electric" in lower_text or "power" in lower_text:
            category = Category.ELECTRICITY
            priority = Priority.HIGH
        elif "garbage" in lower_text or "trash" in lower_text:
            category = Category.SANITATION
            priority = Priority.NORMAL
        elif "road" in lower_text or "pothole" in lower_text:
            category = Category.ROADS
            priority = Priority.NORMAL
        else:
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
