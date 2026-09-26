# Engineering Notes (§5.2)

This document answers the eight mandatory engineering questions with precise references to files and lines in the codebase.

---

## 1. Differences Between Laptop and CI Runner & Exact Lines Freezing Each

1. **Operating System & Architecture**:
   - *Issue*: Local machine may run Windows/macOS with varying libc / architectures, whereas CI runs Linux.
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
- **Exact Line**: [frontend/nginx.conf](file:///frontend/nginx.conf) (`location /api/ { proxy_pass http://backend:8000; }`).
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

## 8. The Failure Incident & Resolution

- **Symptoms**: (To be recorded during active implementation and testing of the application).
- **Initial Wrong Assumption**: ...
- **Actual Cause & Fix**: ...
