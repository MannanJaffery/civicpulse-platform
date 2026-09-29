# CivicPulse — Project Walkthrough & Architecture Tour

## 1. System Overview
CivicPulse provides an automated municipal complaint intake and triage platform. Key system components:
1. **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS with responsive layout, honest multi-stage AI loader, GIS operations dashboard, Redis `X-Cache: HIT/MISS` telemetry badge, and accessible controls.
2. **Backend**: FastAPI 4-layer architecture with Pydantic v2 schemas, Alembic migrations, explicit status state machine, and Prometheus metrics.
3. **AI Triage**: `TriageProvider` protocol supporting Groq (`llama-3.1-8b-instant`), Gemini, Ollama, deterministic keyword fallback, and simulated CI fake.
4. **Cache & Rate Limiting**: Redis 7 dual-role caching (`/api/stats` 30s TTL, invalidation on write) and distributed rate limiting (429 with `Retry-After`).
5. **DevOps & Kubernetes**: Multi-stage non-root Docker images, network segmentation (`internal: true`), Kustomize overlays (`dev`/`prod`), HPA v2, VPA Recommender, PDB, and triple probes.

---

## 2. Test Execution Summary
- **Backend Tests**: 22 unit & integration tests passing with 77% code coverage (`pytest`).
- **Frontend Tests**: 9 comprehensive Vitest component test suites passing (100% pass rate).
- **Submission Check**: `python scripts/check_submission.py` passed with 0 structural errors.
