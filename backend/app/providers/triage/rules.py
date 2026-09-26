import re
from app.providers.triage.base import Category, Priority, TriageProvider, TriageResult


class RuleBasedTriage(TriageProvider):
    name: str = "rules"

    def triage(self, text: str, location: str) -> TriageResult:
        lower_text = text.lower()
        
        # Keyword-based heuristics
        if any(w in lower_text for w in ["water", "pipe", "burst", "leak", "drain", "flooding", "sewage"]):
            category = Category.WATER
            priority = Priority.HIGH if any(w in lower_text for w in ["flood", "burst", "urgent", "ground floor"]) else Priority.NORMAL
        elif any(w in lower_text for w in ["light", "dark", "lamp", "pole", "bulb", "streetlight"]):
            category = Category.STREETLIGHTS
            priority = Priority.LOW
        elif any(w in lower_text for w in ["electric", "power", "transformer", "spark", "wire", "voltage"]):
            category = Category.ELECTRICITY
            priority = Priority.HIGH if any(w in lower_text for w in ["fire", "spark", "fallen wire", "danger"]) else Priority.NORMAL
        elif any(w in lower_text for w in ["garbage", "trash", "waste", "cleaning", "dump"]):
            category = Category.SANITATION
            priority = Priority.NORMAL
        elif any(w in lower_text for w in ["road", "pothole", "asphalt", "traffic", "crater"]):
            category = Category.ROADS
            priority = Priority.NORMAL
        else:
            category = Category.OTHER
            priority = Priority.LOW

        # Generate concise summary <= 140 chars
        clean_text = re.sub(r'\s+', ' ', text).strip()
        summary = clean_text[:137] + "..." if len(clean_text) > 140 else clean_text

        return TriageResult(
            category=category,
            priority=priority,
            summary=summary,
            confidence=0.80,
        )
