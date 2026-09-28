# Triage System Specification & Architecture (§2.5)

The AI Triage engine classifies incoming citizen complaints into structured, actionable municipal records with high precision, defensive fault-tolerance, and zero-downtime fallback.

---

## 1. Triage Schema & Contract

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

## 2. Provider Implementations

The active provider is chosen via the `TRIAGE_PROVIDER` environment variable:

| Provider Name | Class | Target Environment | Characteristics |
| :--- | :--- | :--- | :--- |
| `llm` / `groq` | `LLMTriage` | Production / Hosted | Calls Groq OpenAI-compatible endpoint (`llama-3.1-8b-instant`). Fast inference (< 400ms). |
| `ollama` | `OllamaTriage` | Local / Offline | Calls local Ollama container (`llama3.2:1b`). Zero-network, zero-PII egress. |
| `rules` | `RuleBasedTriage` | Fallback / Standalone | Deterministic keyword and priority heuristics. 100% availability, zero external dependencies. |
| `simulated` | `SimulatedTriage` | CI / Automated Tests | Deterministic fake with seeded outputs and configurable failure injection. |

---

## 3. Defensive Engineering & Guardrails

1. **Structured Output Enforcement**: All LLM requests enforce JSON mode (`response_format={"type": "json_object"}`). Responses are parsed and strictly validated against Pydantic schema enums.
2. **Hard Timeout Cap**: Strict 10-second timeout on all outbound LLM calls.
3. **Single Jittered Retry**: Retries once with randomized jitter (0.5s–1.5s) on retryable errors (timeout, HTTP 429 rate limit, HTTP 5xx). Never retries HTTP 400 bad requests.
4. **Resilient Fallback**: If LLM retries are exhausted or fail, the system automatically falls back to `RuleBasedTriage`, marks `triaged_by = "rules:fallback"`, and emits a structured `WARNING` log with the complaint ID and error class.
5. **Content-Hash Caching in Redis**: Duplicate complaints are keyed by `SHA-256(text || location)` with a 24-hour TTL, eliminating duplicate inference costs.
6. **Prompt-Injection Guardrails**: Citizen text is treated strictly as passive data inside `<untrusted_complaint>` tags. The system prompt commands the model to ignore any instruction-override attempts (e.g. "ignore previous instructions", "mark as low priority").
