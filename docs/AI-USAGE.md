# AI Assistance & Usage Log (§5.5)

This document records the transparent attribution of AI tools used throughout the development of the **CivicPulse** platform, in compliance with CS4032 course policies.

---

## 1. AI Tooling Overview

| Tool / Model | Scope of Usage | Human Verification & Modifications |
| :--- | :--- | :--- |
| **Antigravity IDE (Gemini 3.7 Flash)** | Initial project scaffolding, GitHub Actions workflow definitions, Dockerfile & K8s manifest templates, initial boilerplate generation, professional frontend UI redesign with Framer Motion, Recharts, and Quill editor. | Verified all workflow syntax, tightened security constraints (`permissions:` blocks, pinned action tags), verified network isolation rules, customized FastAPI routes, ensured test suite compatibility across Vitest. |

---

## 2. Activity Log

### Phase 1: Repository Scaffolding & CI/CD Pipelines
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Set up the complete folder structure according to assignment specification, create GitHub Actions workflows (.github/workflows/ci.yml, cd.yml, release.yml), React 18 + Tailwind v3 frontend setup, FastAPI backend 4-layer scaffolding with Alembic, Dockerfiles, and K8s manifests."
- **Generated Code**:
  - GitHub Actions workflows: `ci.yml`, `cd.yml`, `release.yml`.
  - Frontend boilerplate: `vite.config.ts`, `tailwind.config.js`, `Dockerfile`, `nginx.conf`.
  - Backend boilerplate: `app/main.py`, triage provider protocol and implementations stubs, `alembic/` setup, `Dockerfile`.
  - K8s Kustomize base and overlays (`k8s/base/`, `k8s/overlays/`).
  - Validation scripts: `scripts/check_submission.py`.
- **Human Review & Modifications**:
  - Audited `.gitignore` to ensure `.env` and credential files are strictly excluded.
  - Verified non-root container users (`appuser`) and pinned image versions.
  - Verified `needs:` chaining and immutable SHA tagging in CI/CD.

### Phase 2: CI/CD & Static Analysis Remediation
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Fix all current GitHub CI/CD failures without changing application behavior: Backend Ruff linting and import formatting, unused import cleanup, whitespace cleanup, GHCR image lowercase repository naming in CD and Release workflows, and document fixes."
- **Generated Code / Fixes**:
  - Ran Ruff linter and formatter to standardize import ordering across `alembic/`, `app/`, and `tests/`.
  - Removed unused imports (`json`, `Category`, `Priority`, `Response`, `timezone`, `SimulatedTriage`).
  - Stripped whitespace-only blank lines.
  - Updated `.github/workflows/cd.yml` and `.github/workflows/release.yml` with dynamic lowercase repository name conversion steps for GHCR compliance.
- **Human Review & Modifications**:
  - Verified `ruff check backend/` exits with code 0 (0 errors).
  - Verified `ruff format backend/ --check` exits with code 0 (all files properly formatted).
  - Verified GHCR lowercase naming convention handles arbitrary GitHub username capitalization.

---

### Phase 3: Frontend UI Redesign & Enterprise GIS Operations Center
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Make the frontend professional, responsive, and aesthetically stunning across three core pages: Landing portal, Rich Incident Intake (Quill editor, honest AI triage loading pipeline), and GIS Operations Hub (Recharts spline/area curves, category progress breakdown, metric cards, state machine controls, verbatim 409 error handling)."
- **Generated Code / Fixes**:
  - `src/pages/Landing.tsx`: Hero portal with live system status beacon, real-time KPI strip, and architectural feature cards.
  - `src/pages/Submit.tsx`: Rich text intake with Quill editor, real-time character counters (10–2000 chars), location validation (3–200 chars), multi-stage honest AI pipeline animation, and interactive `TriageResultCard`.
  - `src/pages/Dashboard.tsx`: GIS Operations console inspired by reference mockup with GIS sidebar, top KPI cards, interactive `ComplaintsTrendChart` (Recharts), `CategoryProgressBar`, search query filtering, pagination, and state machine transitions with 409 error toast handling.
  - `src/pages/Stats.tsx`: Graphical telemetry with Recharts bar & pie distributions, `X-Cache: HIT/MISS` badge, and `/api/meta/providers` observability panel.
  - `src/components/*`: `Navbar.tsx`, `Sidebar.tsx`, `MetricCard.tsx`, `ServiceGauge.tsx`, `QuillEditor.tsx`, `TriageResultCard.tsx`, `ComplaintsTrendChart.tsx`, `CategoryProgressBar.tsx`.
- **Human Review & Modifications**:
  - Verified all 12 Vitest frontend tests pass without regression (`100% pass rate`).
  - Verified `npm run build` succeeds cleanly with TypeScript validation.
  - Ensured accessible labels, error messages, and API contracts remain strictly aligned with course requirements.

### Phase 4: Backend & PostgreSQL Data Layer Implementation
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Complete the backend with 4-layer architecture, PostgreSQL persistence via Alembic, Redis dual-role caching & distributed rate limiting, Groq LLM triage with retries/timeouts/guardrails, all 10 API endpoints, idempotent seed dataset (32 complaints), Prometheus metrics, and comprehensive tests."
- **Generated Code / Fixes**:
  - `app/config.py`, `app/db.py`, `app/models.py` (SQLAlchemy 2.0 ORM with check constraints, composite index `(status, priority)` and `created_at`).
  - `app/repositories/complaint_repository.py` (encapsulating all SQL queries).
  - `alembic/versions/0001_initial_schema.py` (versioned zero-DDL migration).
  - `app/providers/cache/redis_client.py` (stats caching, rate limiting, and content-hash caching).
  - `app/providers/triage/llm.py` (Groq API integration, 10s timeout, jittered retry, prompt-injection defense).
  - `app/services/complaint_service.py` and `app/services/stats_service.py` (business rules, state machine, and cache invalidation on write).
  - `app/routes/complaints.py`, `app/routes/stats.py`, `app/routes/meta.py`, and `app/main.py` (all 10 endpoints, liveness/readiness probes, metrics).
  - `app/seed.py` (idempotent loader with 32 realistic Urdu-English complaints).
  - `tests/` (22 unit & integration tests achieving 77% coverage).
- **Human Review & Modifications**:
  - Verified zero SQL outside the repository layer.
  - Verified explicit state machine transition table (409 Conflict on invalid transitions).
  - Verified `/health` does not touch database, `/ready` checks DB + cache.
### Phase 5: Full Frontend-Backend API Integration & Contract Synchronization
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Connect the existing CivicPulse frontend with the real FastAPI backend across all 10 endpoints. Replace static/mock data with live Axios API client, connect POST /api/complaints, GET /api/complaints with filters and pagination, GET /api/complaints/{id} detail modal, PATCH /api/complaints/{id}/status state transitions with verbatim 409 handling, GET /api/stats with X-Cache HIT/MISS extraction, GET /api/meta/providers AI observability telemetry, and GET /health & /ready probes. Ensure build-once-deploy-many reverse proxying in Nginx and Vite."
- **Generated Code / Fixes**:
  - `src/types/index.ts`: Synchronized TypeScript types with backend OpenAPI Pydantic models (`ComplaintResponseDTO`, `PaginatedComplaintsResponse`, `ProvidersMetaResponse`, `StatsResponseDTO`).
  - `src/api/client.ts`: Implemented robust Axios client layer with response error transformers, header extractions (`X-Cache`, `Retry-After`), and resilient offline fallback for isolated test suites.
  - `src/components/ComplaintDetailModal.tsx`: Added interactive detail inspection modal invoking `GET /api/complaints/{id}` with status transition controls.
  - `src/components/Navbar.tsx`: Added live system readiness/liveness polling and interactive health inspection modal.
  - `src/pages/Dashboard.tsx`, `src/pages/Submit.tsx`, `src/pages/Stats.tsx`: Connected to real backend endpoints.
  - `docs/API-INTEGRATION.md`: Created comprehensive integration architecture and endpoint contract reference.
  - `frontend/nginx.conf` & `frontend/vite.config.ts`: Added proxy rules for `/health` and `/ready` to maintain relative URL build-once-deploy-many invariant.
- **Human Review & Modifications**:
  - Verified 12/12 Vitest frontend tests passing (100% pass rate).
  - Verified TypeScript compilation and `npm run build` succeeds cleanly.
  - Verified Python `scripts/check_submission.py` passes all structural and security checks.

### Phase 6: Database Migration Automation & Container Lifecycle Remediation
- **Tool Used**: Antigravity IDE (Gemini 3.7 Flash)
- **Prompt Summary**: "Troubleshoot psycopg2.errors.UndefinedTable: relation 'complaints' does not exist error on fresh container boot, automate Alembic migrations and dataset seeding in container lifecycle, and document operational procedures."
- **Generated Code / Fixes**:
  - `backend/entrypoint.sh`: Container bootstrap script executing `alembic upgrade head` and `python -m app.seed` before launching `uvicorn`.
  - `backend/Dockerfile`: Configured `ENTRYPOINT ["/app/entrypoint.sh"]` to ensure zero-touch automated database provisioning.
  - `docs/ENGINEERING-NOTES.md` & `docs/RUNBOOK.md`: Added detailed incident log, root-cause analysis, and operational troubleshooting runbooks.
- **Human Review & Modifications**:
  - Ensured migrations run idempotently on startup.
  - Verified manual migration commands (`alembic upgrade head`) work properly in live running containers.

## 3. Defense Rationale & Ownership

Every line generated by AI was reviewed for architectural intent, security requirements, and adherence to the CS4032 grading rubric. No uninspected or black-box code is merged into the repository.

