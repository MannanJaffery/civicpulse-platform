# Triage System Specification & Architecture

The AI Triage engine classifies citizen complaints into structured taxonomy with categories, priority levels, and concise summaries.

---

## 1. Triage Schema

```python
class Category(str, Enum):
    WATER = "water"
    ELECTRICITY = "electricity"
    SANITATION = "sanitation"
    ROADS = "roads"
    STREETLIGHTS = "streetlights"
    OTHER = "other"

class Priority(str, Enum):
    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"

class TriageResult(BaseModel):
    category: Category
    priority: Priority
    summary: str = Field(max_length=140)
    confidence: float = Field(ge=0.0, le=1.0)
```

---

## 2. Defensive Engineering & Guardrails

1. **Structured Output Enforcement**: Enforce JSON schema and validate via Pydantic model.
2. **Hard Timeout**: 10 seconds timeout on all external LLM calls.
3. **Retry with Jitter**: 1 retry for 429 and 5xx errors only.
4. **Fallback Mechanism**: Automatic fallback to `RuleBasedTriage` marking `triaged_by="rules:fallback"`.
5. **Content Hash Caching**: Redis cache using SHA-256 hash of complaint text (TTL 24 hours).
6. **Prompt-Injection Guardrail**: Strict input delimitation and output schema constraint.
