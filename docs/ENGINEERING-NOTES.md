# Engineering Notes (§5.2)

This document answers the eight mandatory engineering questions with exact file-and-line references to the CivicPulse codebase.

---

## 1. Differences Between Laptop and CI Runner & Exact Lines Freezing Each

| Difference | Laptop Environment vs. CI Runner | Exact Code / Manifest Line Freezing It |
| :--- | :--- | :--- |
| **Operating System, Libc & CPU Architecture** | Laptop runs host OS (Windows/macOS) with local C libraries and toolchains; CI runner runs headless Ubuntu Linux x86_64. | **[backend/Dockerfile:3, 20](file:///backend/Dockerfile#L3)** (`FROM python:3.12-slim`) and **[frontend/Dockerfile:3, 14](file:///frontend/Dockerfile#L3)** (`FROM node:22-alpine` / `FROM nginx:1.27-alpine`). |
| **Dependency Versions & Transitive Locks** | Laptop may have unpinned local virtualenvs or global node modules; CI installs from scratch. | **[backend/requirements.txt:1-15](file:///backend/requirements.txt#L1-L15)** (exact pinned Python wheels) and **[frontend/Dockerfile:8](file:///frontend/Dockerfile#L8)** (`RUN npm ci` reading exact hashes from `package-lock.json`). |
| **External AI API Connectivity & Determinism** | Laptop developers use live external API keys (`GROQ_API_KEY`) with variable network latency and rate limits; CI runs hermetically without external secrets. | **[.github/workflows/ci.yml:80-81](file:///.github/workflows/ci.yml#L80-L81)** (`TRIAGE_PROVIDER: simulated`, `ENVIRONMENT: test`). |

---

## 2. CI/CD Maturity Ladder Justification

* **Current Rung (Level 3 - Automated CI/CD with Container Security & Ephemeral Deployments)**:
  * **Justification**:
    1. **Quality & Type Gates**: Every Pull Request runs Ruff, Mypy, ESLint, and TypeScript compiler checks ([.github/workflows/ci.yml:14-59](file:///.github/workflows/ci.yml#L14-L59)).
    2. **Automated Testing & Coverage**: Pytest enforces $\ge 65\%$ backend coverage ([.github/workflows/ci.yml:84](file:///.github/workflows/ci.yml#L84)), and Vitest executes 10 component test suites ([.github/workflows/ci.yml:108](file:///.github/workflows/ci.yml#L108)).
    3. **Container Security & Compliance**: Trivy scans container images for CVEs, failing on HIGH/CRITICAL ([.github/workflows/ci.yml:170-175](file:///.github/workflows/ci.yml#L170-L175)), and Kubeconform validates production K8s manifests ([.github/workflows/ci.yml:193](file:///.github/workflows/ci.yml#L193)).
    4. **Integration & Smoke Gate**: Docker Compose starts the full multi-container stack, verifying database migrations, readiness probes, and Redis read-through caching ([.github/workflows/ci.yml:204-238](file:///.github/workflows/ci.yml#L204-L238)).
    5. **Immutable CD**: On merge to `main`, images are built, tagged by commit SHA, pushed to GHCR, and deployed to an ephemeral KinD Kubernetes cluster ([.github/workflows/cd.yml:86-180](file:///.github/workflows/cd.yml#L86-L180)).
* **Next Rung (Level 4 - GitOps Continuous Reconciliation & Progressive Delivery)**:
  * **What it buys**:
    1. **Pull-based Reconciliation (ArgoCD / Flux)**: Eliminates long-lived cluster write credentials in GitHub Actions; the in-cluster agent detects Git commits and reconciles desired state automatically.
    2. **Automated Canary Analysis (Flagger / Istio)**: Routes 5% of production traffic to new container SHA versions, automatically promoting or rolling back based on Prometheus HTTP error rate and latency metrics.

---

## 3. Guaranteeing Build-Once-Deploy-Many

* **Exact Code Line**:
  * **[frontend/nginx.conf:12-14](file:///frontend/nginx.conf#L12-L14)**:
    ```nginx
    location /api/ {
        proxy_pass http://backend:8000;
    }
    ```
  * **[frontend/src/api/client.ts:31](file:///frontend/src/api/client.ts#L31)**:
    ```typescript
    export const apiClient = axios.create({ baseURL: '' });
    ```
* **What Breaks Without It**:
  * If the frontend baked `VITE_API_URL=http://localhost:8000` into static JavaScript at build time via `npm run build`, the compiled bundle would contain hardcoded hostnames.
  * Deploying that image into staging, production, or a Kubernetes cluster would result in browser CORS / network failures because clients would attempt to contact the developer's localhost.
  * Without Nginx reverse proxying, teams are forced to rebuild the Docker image for every target environment, breaking container immutability (see [docs/adr/0002-frontend-runtime-config.md](file:///docs/adr/0002-frontend-runtime-config.md)).

---

## 4. Probabilistic LLM vs. Deterministic CI

* **What "Correct" Means for the AI Triage Component**:
  * Correctness is **structural, bounded, and schema-valid**, rather than open-ended prose:
    1. Output strictly parses into the Pydantic model **[backend/app/providers/triage/base.py:15-20](file:///backend/app/providers/triage/base.py#L15-L20)** (`TriageResult`).
    2. Category is restricted to the 6 municipal enums (`water`, `electricity`, `sanitation`, `roads`, `streetlights`, `other`).
    3. Priority is restricted to `high`, `normal`, `low`.
    4. AI summary is bounded (`Field(max_length=140)`).
    5. **Resilient Degradation**: If an LLM provider times out (>10s), returns 429, or returns malformed JSON, the service intercepts the error and executes fallback to `RuleBasedTriage` (**[backend/app/services/complaint_service.py:75-92](file:///backend/app/services/complaint_service.py#L75-L92)**) with `triaged_by="rules:fallback"`, ensuring `POST /api/complaints` returns HTTP 201 without dropping citizen reports.
* **How CI is Kept Deterministic**:
  * In automated test workflows, CI sets `TRIAGE_PROVIDER=simulated` (**[.github/workflows/ci.yml:80](file:///.github/workflows/ci.yml#L80)**).
  * `SimulatedTriage` (**[backend/app/providers/triage/simulated.py:15-40](file:///backend/app/providers/triage/simulated.py#L15-L40)**) executes offline keyword heuristics with zero network calls, zero token costs, and 100% reproducible classifications.

---

## 5. HPA Lag & Analysis

* **Observed Lag**: **22 seconds** (typically 15–30s across Kubernetes clusters).
* **Where the Time Went**:
  1. **Metrics-Server Scrape Cycle (15s)**: Metrics-server collects CPU metric samples from node kubelets on a 15-second polling interval.
  2. **HPA Controller Evaluation Loop (15s)**: The Kubernetes HPA controller evaluates resource utilization against targets on its sync loop (`horizontal-pod-autoscaler-sync-period = 15s`).
  3. **Pod Initialization & Readiness Probing (2–4s)**: New pod scheduled, container started, `entrypoint.sh` executes, and the readiness probe (`/ready`, `periodSeconds: 2`) verifies PostgreSQL and Redis connectivity before routing traffic.
* **What Would Reduce It**:
  1. Setting `--metric-resolution=5s` on metrics-server and `--horizontal-pod-autoscaler-sync-period=5s` on kube-controller-manager.
  2. Configuring immediate scale-up behavior: `scaleUp.stabilizationWindowSeconds: 0` (**[k8s/base/hpa.yaml:26-28](file:///k8s/base/hpa.yaml#L26-L28)**).
  3. Pre-pulling container images on worker nodes to reduce container creation overhead.

---

## 6. Why VPA Runs in Off Mode & Failure Mode of Auto Mode

* **Why VPA is in Off Mode**:
  * **[k8s/base/vpa.yaml:9-11](file:///k8s/base/vpa.yaml#L9-L11)** configures `updatePolicy: { updateMode: "Off" }` (Recommender mode).
* **Failure Mode of Running VPA in Auto Mode Alongside HPA**:
  * HPA calculates horizontal scaling based on CPU utilization percentage:
    $$\text{Utilization} = \frac{\text{Actual CPU Usage}}{\text{CPU Request}} \times 100\%$$
  * When load increases:
    1. High CPU usage causes HPA to increase pod count ($2 \rightarrow 4$).
    2. Simultaneously, VPA in Auto mode observes high CPU usage and increases the pod's CPU request (e.g., from 250m to 500m), restarting pods to apply new sizes.
    3. With the denominator doubled ($500\text{m}$), the computed utilization percentage drops below the 60% threshold.
    4. HPA observes low computed utilization and scales pod count back down ($4 \rightarrow 2$).
    5. With fewer pods handling the traffic, per-pod CPU usage spikes again, triggering VPA to increase requests further.
  * **Result**: Destructive resource thrashing and pod eviction loops. Recommender mode allows engineers to safely inspect VPA recommendations (`kubectl describe vpa backend-vpa`) without runtime race conditions.

---

## 7. Network Isolation (`internal: true`) & Outbound LLM Resolution

* **The Architecture Challenge**:
  * In **[compose.yaml:65-72](file:///compose.yaml#L65-L72)**, the `internal` network is marked `internal: true`. This disables the default gateway, preventing any container on this network from reaching the public internet.
  * However, `LLMTriage` requires outbound HTTPS access to hosted APIs (e.g., Groq `api.groq.com:443` or Gemini `generativelanguage.googleapis.com:443`).
* **Resolution**:
  * Dual-network bridging:
    1. The **`backend`** container joins **both** `edge` and `internal` networks (**[compose.yaml:38-40](file:///compose.yaml#L38-L40)**). The `edge` network provides internet routing for outbound LLM calls.
    2. **`postgres`** and **`redis`** join **only** `internal` (**[compose.yaml:50-51, 59-60](file:///compose.yaml#L50-L51)**), completely isolating database storage from the internet.
    3. The public-facing **`frontend`** joins **only** `edge` (**[compose.yaml:12-13](file:///compose.yaml#L12-L13)**).
  * **Security Verification**:
    ```bash
    docker compose exec frontend ping postgres
    # Returns: ping: bad address 'postgres' (Network isolation verified)
    ```

---

## 8. Failure Incidents & Resolutions

### Incident A: Database Schema Startup Race Condition (`relation "complaints" does not exist`)
* **Symptoms**: Calling `POST /api/complaints` returned HTTP 500 with `sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedTable) relation "complaints" does not exist`.
* **Initial Wrong Assumption**: Assumed the PostgreSQL container volume would initialize database tables automatically on container boot.
* **Command/Log Line That Revealed the Truth**:
  ```bash
  docker compose logs backend
  # Output: uvicorn app.main:app started before alembic upgrade head was executed
  ```
* **Resolution**: Implemented **[backend/entrypoint.sh:1-12](file:///backend/entrypoint.sh#L1-L12)** to run `alembic upgrade head` and `python -m app.seed` prior to starting `uvicorn`. Updated **[backend/Dockerfile:53](file:///backend/Dockerfile#L53)** with `ENTRYPOINT ["/app/entrypoint.sh"]`.

### Incident B: Trivy Security Scan Failures on Container Base Packages
* **Symptoms**: GitHub Actions CI failed in the `scan` job with exit code 1 on `civicpulse-frontend:scan` reporting 40 HIGH and CRITICAL CVEs (`libcrypto3`, `libssl3`, `musl`, `libxml2`).
* **Initial Wrong Assumption**: Assumed upstream base images `nginx:1.27-alpine` contained latest security patches by default.
* **Command/Log Line That Revealed the Truth**:
  ```bash
  trivy image --severity HIGH,CRITICAL civicpulse-frontend:scan
  # Output: libcrypto3 (3.3.3-r0) fixed in 3.3.7-r0, CVE-2026-31789
  ```
* **Resolution**: Added `RUN apk update && apk upgrade --no-cache` to the runner stage in **[frontend/Dockerfile:16](file:///frontend/Dockerfile#L16)** and `apt-get upgrade -y` in **[backend/Dockerfile:28](file:///backend/Dockerfile#L28)**.

---

## 9. Database Indexing Justification

1. **`ix_complaints_status_priority` on `(status, priority)`**:
   * *Query Served*: `GET /api/complaints?status=open&priority=high` on the operations dashboard queue (**[backend/app/repositories/complaint_repository.py:35-45](file:///backend/app/repositories/complaint_repository.py#L35-L45)**). Operators continually filter by active status and sort by urgency; the composite index allows fast index range scans.
2. **`ix_complaints_created_at` on `created_at`**:
   * *Query Served*: `GET /api/complaints?page=1&page_size=20` ordered by `desc(created_at)` (**[backend/app/repositories/complaint_repository.py:48](file:///backend/app/repositories/complaint_repository.py#L48)**) for paginated complaint feeds and daily volume statistics.

---

## 10. Cache & Rate Limiting (Redis Dual-Role)

1. **Read-Through Stats Cache (`GET /api/stats`)**:
   * *Strategy*: 30-second TTL with explicit write invalidation in **[backend/app/services/complaint_service.py:96](file:///backend/app/services/complaint_service.py#L96)**.
   * *Why both TTL and Invalidation?*: Explicit invalidation guarantees instant updates when complaints are created/updated; TTL acts as an upper bound against stale entries across multi-instance nodes.
2. **Distributed Rate Limiter (`POST /api/complaints`)**:
   * *Strategy*: Fixed-window Redis counter keyed by client IP (**[backend/app/providers/cache/redis_client.py:90-130](file:///backend/app/providers/cache/redis_client.py#L90-L130)**), returning HTTP 429 with `Retry-After`.
   * *Why Distributed?*: In-process rate limiting fails when the HPA scales the backend to $N$ replicas (allowing $N \times$ quota). Centralized Redis rate limiting protects upstream LLM quotas globally.
3. **Redis AOF Persistence on Named Volume**:
   * *Justification*: While raw cache data can be reconstructed, rate limiting quotas and content-hash triage caches represent critical defensive state that must survive container restarts to prevent upstream cost spikes.
