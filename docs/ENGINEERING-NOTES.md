# Engineering Notes (§5.2)

This document answers the eight mandatory engineering questions with precise references to files and lines in the codebase.

---

## 1. Differences Between Laptop and CI Runner & Exact Lines Freezing Each

1. **Operating System & Architecture**:
   - *Issue*: Local machine may run Windows/macOS with varying libc / architectures, whereas CI runs Linux x86_64.
   - *Freezing Line*: [backend/Dockerfile](file:///backend/Dockerfile#L1) (`FROM python:3.12-slim`) and [frontend/Dockerfile](file:///frontend/Dockerfile#L1) (`FROM node:22-alpine`).
2. **Deterministic Python & Node Dependencies**:
   - *Issue*: Floating dependency versions (`latest`) can cause non-deterministic builds.
   - *Freezing Line*: [backend/requirements.txt](file:///backend/requirements.txt) (exact pinned versions) and [frontend/package.json](file:///frontend/package.json) (package-lock.json / pinned semver).
3. **AI Triage Provider Determinism**:
   - *Issue*: Live LLM calls have non-deterministic network latency and probabilistic output.
   - *Freezing Line*: [.github/workflows/ci.yml](file:///.github/workflows/ci.yml) (`TRIAGE_PROVIDER=simulated`).

---

## 2. CI/CD Maturity Ladder Justification

- **Current Level**: Automated Integration & Continuous Delivery with Container Scanning, Manifest Validation, and Ephemeral Cluster Deployment.
- **Justification**: Every PR is validated via linting, unit/integration testing, container vulnerability scanning (Trivy), and Kustomize manifest validation (Kubeconform). Pushes to `main` build signed/immutable images pushed to GHCR and validated against a running Kind cluster.
- **Next Rung**: GitOps (ArgoCD / Flux) pull-based continuous deployment and automated canary rollouts with automated progressive delivery.

---

## 3. Guaranteeing Build-Once-Deploy-Many

- **Frontend Runtime Config**: The frontend container serves static assets via Nginx and proxies `/api` calls directly to the backend service without embedding absolute URLs into JavaScript bundles during build time.
- **Exact Line*: [frontend/nginx.conf](file:///frontend/nginx.conf) (`location /api/ { proxy_pass http://backend:8000; }`).
- **What breaks without it**: Baking `VITE_API_URL` during `npm run build` would produce an image tied to a single domain, requiring separate Docker builds for every environment (dev, staging, prod).

---

## 4. Probabilistic LLM vs. Deterministic CI

- **Definition of "Correct"**: Adherence to the Pydantic schema (`TriageResult`), valid category enums, priority enums, bounded string length (`summary <= 140`), and defensive error handling (fallbacks).
- **Keeping CI Deterministic**: In CI, `TRIAGE_PROVIDER=simulated` is enforced. `SimulatedTriage` returns deterministic, seeded classification responses and test fixtures without external network dependencies.

---

## 5. HPA Lag & Analysis

- **Observed Lag**: ~15–30 seconds between load rising and replicas scaling out.
- **Root Cause Breakdown**:
  1. Metrics Server scrape interval (typically 15s).
  2. HPA controller sync loop (typically 15s).
  3. Container startup + readiness probe pass (`periodSeconds: 2`).
- **Mitigation**: Adjusting `--metric-resolution` on metrics-server, tuning HPA `scaleUp.stabilizationWindowSeconds: 0`, and optimizing image pull / startup times.

---

## 6. Why VPA Runs in Off (Recommender) Mode

- **Conflict Explanation**: HPA scales horizontally based on CPU utilization percentage ($\text{Usage} / \text{Request}$). If VPA runs in Auto mode and increases CPU requests during high load, computed CPU utilization drops, causing HPA to scale down pod count. This increases load per pod, prompting VPA to raise requests again in an unstable oscillation loop.
- **Solution**: VPA is placed in `updateMode: "Off"` so recommendations can be reviewed and applied statically by engineers.

---

## 7. Network Isolation (`internal: true`) & Outbound LLM Calls

- **Problem**: With `internal: true` on the internal Docker network, containers on that network cannot route to the public internet.
- **Resolution**: The backend container joins *both* networks (`edge` and `internal`). The `edge` network has internet connectivity allowing outbound HTTPS calls to Groq/Gemini APIs, while the database and Redis join *only* `internal`, ensuring the database is completely unreachable from the public internet or compromised frontend containers.

---

## 8. Failure Incidents & Resolutions

### Incident A: LLM Provider Unhandled Outage & SQLite UUID Translation
- **Symptoms**: `pytest tests/test_triage.py` raised unhandled `ConnectionError: Simulated remote LLM outage 503` causing HTTP 500 status on `POST /api/complaints`, and SQLite tests raised `AttributeError: 'int' object has no attribute 'replace'` during seed tests.
- **Initial Wrong Assumption**: We initially assumed provider-level internal try/except inside `LLMTriage` was sufficient to catch all errors, and that PostgreSQL `UUID` dialect would map transparently to in-memory SQLite during hermetic test runs.
- **Actual Cause & Fix**:
  1. If an external or injected provider raised an unhandled exception before returning a `TriageResult`, `ComplaintService` did not intercept it. We updated [backend/app/services/complaint_service.py](file:///backend/app/services/complaint_service.py) with a service-level defensive try/except block that catches all provider exceptions, logs a structured `WARNING` with provider metadata, and falls back to `RuleBasedTriage()` with `triaged_by="rules:fallback"`.
  2. For database models, we switched to SQLAlchemy 2.0's universal `Uuid(as_uuid=True)` in [backend/app/models.py](file:///backend/app/models.py), ensuring native PostgreSQL UUID in production and seamless string/binary mapping in SQLite test fixtures.

### Incident B: Container Startup Race & Missing Database Tables (`UndefinedTable: relation "complaints" does not exist`)
- **Symptoms**: `POST /api/complaints` threw `sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedTable) relation "complaints" does not exist` in Docker Compose logs.
- **Initial Wrong Assumption**: Assumed the PostgreSQL container volume would inherit pre-migrated schema automatically without an explicit migration runner in the container lifecycle.
- **Actual Cause & Fix**:
  1. The backend application started `uvicorn` before Alembic migrations were applied to the newly provisioned PostgreSQL instance. Because CivicPulse strictly prohibits runtime DDL (`Base.metadata.create_all()`), the `complaints` table was absent.
  2. Implemented [backend/entrypoint.sh](file:///backend/entrypoint.sh) which runs `alembic upgrade head` and idempotent seeding `python -m app.seed` before starting `uvicorn`. Updated [backend/Dockerfile](file:///backend/Dockerfile) to execute via this entrypoint script.
  3. Added container execution fallback command in [docs/RUNBOOK.md](file:///docs/RUNBOOK.md) for manual migration trigger: `docker compose exec backend alembic upgrade head`.

---

## 9. Database Indexing Justification

1. **`ix_complaints_status_priority` on `(status, priority)`**:
   - *Query Served*: `GET /api/complaints?status=open&priority=high` on the operations dashboard queue. Operators constantly filter by unresolved status and order by highest priority. The composite index enables index-only/index-range scans without full table scans.
2. **`ix_complaints_created_at` on `created_at`**:
   - *Query Served*: `GET /api/complaints?page=1&page_size=20` (ordered by `desc(created_at)`), serving pagination of incoming complaints and time-window analytics.

---

## 10. Cache & Rate Limiting (Redis Dual-Role)

1. **Read-Through Stats Cache (`/api/stats`)**:
   - *Strategy*: 30s TTL with explicit invalidation on every complaint creation or status change.
   - *Why both TTL and Invalidation?*: Explicit invalidation guarantees freshness on new writes; TTL acts as a safety ceiling against orphaned cache entries in distributed nodes.
2. **Distributed Rate Limiter (`POST /api/complaints`)**:
   - *Strategy*: Fixed-window key in Redis (`ratelimit:<client_ip>:<window_bucket>`).
   - *Why Distributed?*: In-process rate limiting fails when the HPA scales the backend to $N$ pods (permitting $N \times$ quota). A centralized Redis limiter enforces global quotas across all replicas.
3. **Redis AOF Persistence on Named Volume**:
   - *Justification*: Although cache data can theoretically be reconstructed, rate limiting state and content-hash inference caches protect upstream LLM quotas and costs across pod restarts.
