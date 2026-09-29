# CivicPulse Frontend Architecture & Component Guide

Built with **React 18 + Vite + TypeScript + Tailwind CSS v3**, served via **Nginx Alpine** in a multi-stage Docker container.

---

## 1. Views & Workflow

1. **Intake / Submit Portal (`src/pages/Submit.tsx`)**:
   - Client-side validation strictly matching server limits (10–2000 chars text, 3–200 chars location).
   - Honest multi-stage loading animation sequence showing live pipeline status during multi-second AI inference.
   - Structured triage result rendering (`Category`, `Priority`, `AI Summary`, `Triaged By`, `Confidence`).

2. **Operations Dashboard (`src/pages/Dashboard.tsx`)**:
   - Filter complaints by category, priority, and status.
   - Paginated list (`page`, `page_size <= 100`).
   - Interactive status state machine transitions (`open` -> `in_progress` -> `resolved` / `rejected`).
   - Surface server 409 conflict errors verbatim.

3. **Live Stats & Telemetry (`src/pages/Stats.tsx`)**:
   - Aggregate counts by category, priority, and status using Recharts.
   - Dynamic `X-Cache: HIT` / `MISS` indicator directly extracted from response headers.
   - AI observability metrics panel displaying the active provider and recent triage outcomes.

---

## 2. Runtime Configuration

- **Zero Baked-In URLs**: All API calls use relative paths (`/api/`) reverse-proxied via Nginx.
- Works identically in local development, Docker Compose, and Kubernetes without rebuilding JavaScript bundles.

---

## 3. Component Test Suite

Run all Vitest component tests:
```bash
npm test -- --run
```
7 component test suites covering:
- `Submit.test.tsx`: Form validation and triage result display.
- `TriageResult.test.tsx`: Structured output badge rendering.
- `Dashboard.test.tsx` / `ApiClientFilter.test.tsx`: Pagination and query filtering.
- `StatusTransition.test.tsx`: 409 conflict and state machine enforcement.
- `CacheBadge.test.tsx`: `X-Cache: HIT/MISS` badge states.
- `MetaObservability.test.tsx`: Observability provider metadata rendering.
- `App.test.tsx`: Navigation routing and tab persistence.
