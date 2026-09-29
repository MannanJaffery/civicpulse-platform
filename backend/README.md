# CivicPulse Backend Architecture & API Specification

Built with **FastAPI + Pydantic v2 + SQLAlchemy 2.0 (PostgreSQL 16) + Redis 7**.

---

## 1. 4-Layer Architecture

The backend strictly enforces unidirectional dependency flow across four distinct layers:

1. **`app/routes/` (HTTP Layer)**:
   - Request parsing, Pydantic validation, status code assignment, serialization.
   - *Zero SQL and zero business logic.*

2. **`app/services/` (Business Rules Layer)**:
   - Triage orchestration, status state machine enforcement, cache invalidation, statistics aggregation.

3. **`app/repositories/` (Persistence Layer)**:
   - Encapsulates all SQL and SQLAlchemy queries.

4. **`app/providers/` (Outbound Integrations Layer)**:
   - LLM integrations (`LLMTriage`, `OllamaTriage`, `RuleBasedTriage`, `SimulatedTriage`) and Redis cache / rate limiter.

---

## 2. API Endpoints Table

| Method | Path | Description | Response Codes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Validate, triage, persist complaint | `201`, `400`, `429` |
| `GET` | `/api/complaints/{id}` | Fetch complaint by UUID | `200`, `404` |
| `GET` | `/api/complaints` | Filterable and paginated list | `200` |
| `PATCH` | `/api/complaints/{id}/status` | Update status (enforce state machine) | `200`, `404`, `409` |
| `GET` | `/api/stats` | Aggregate stats (Redis-cached, 30s TTL) | `200` (`X-Cache: HIT/MISS`) |
| `GET` | `/api/meta/providers` | Active triage provider & outcomes | `200` |
| `GET` | `/health` | Liveness probe (no DB access) | `200` |
| `GET` | `/ready` | Readiness probe (checks DB + Redis) | `200`, `503` |
| `GET` | `/metrics` | Prometheus metrics text format | `200` |

---

## 3. Running Tests & Coverage

```bash
# In backend directory
pytest --cov=app --cov-report=term --cov-fail-under=65
```
