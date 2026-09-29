# Kubernetes Architecture & Operations Guide (§3.3)

This document provides a comprehensive operational overview of the CivicPulse Kubernetes workload topology, scaling strategies, resilience configuration, and verification commands.

---

## 1. Workload Topology & Objects Overview

CivicPulse is deployed under the dedicated `civicpulse` namespace with full separation of stateless and stateful workloads:

| Object | Kind | Configuration | Rationale |
| :--- | :--- | :--- | :--- |
| `backend` | `Deployment` | Replicas: 2+, Resources: 100m/128Mi requests, 500m/512Mi limits | Stateless FastAPI app scaled via HPA |
| `frontend` | `Deployment` | Replicas: 2+, Resources: 50m/32Mi requests, 200m/64Mi limits | Nginx serving static assets and proxying `/api` |
| `postgres` | `StatefulSet` | 1 replica, PVC `pgdata` (1Gi ReadWriteOnce), ClusterIP Service | Persistent relational database storage |
| `redis` | `Deployment` + PVC | 1 replica, PVC `redisdata` (500Mi), `--appendonly yes` | Cache and distributed rate limiter persistence |
| `civicpulse-ingress` | `Ingress` | Host routing: `/` -> frontend, `/api` -> backend | Single-entrypoint external traffic routing |
| `backend-hpa` | `HorizontalPodAutoscaler` | Min: 2, Max: 10, Target CPU: 60% | Automated load-driven horizontal scaling |
| `backend-vpa` | `VerticalPodAutoscaler` | `updateMode: "Off"` (Recommender) | Static sizing recommendations without HPA fights |
| `backend-pdb` | `PodDisruptionBudget` | `minAvailable: 1` | High availability during voluntary node drains |

---

## 2. Triple-Probe Configuration (Startup, Liveness, Readiness)

Each backend pod defines 3 distinct probes serving specific operational roles:

1. **`startupProbe` (`/health`, 8000)**:
   - `failureThreshold: 30`, `periodSeconds: 2` (Allows up to 60s slow bootstrap).
   - Prevents premature container kill loops during initial startup, migration execution, and model warmup.
2. **`livenessProbe` (`/health`, 8000)**:
   - Evaluates process liveness without touching PostgreSQL or Redis.
   - Restarts the pod only if the process is completely hung or deadlocked.
3. **`readinessProbe` (`/ready`, 8000)**:
   - Evaluates downstream connectivity to both PostgreSQL and Redis (returns 503 if unreachable).
   - Dynamically removes unready pods from the Kubernetes Service endpoint pool without triggering rolling restarts.

---

## 3. Rolling Updates & Zero-Downtime Verification

To ensure zero downtime during rollouts:
- `strategy.rollingUpdate.maxSurge: 1`
- `strategy.rollingUpdate.maxUnavailable: 0`
- `lifecycle.preStop: exec: command: ["/bin/sh", "-c", "sleep 5"]`
- `terminationGracePeriodSeconds: 30`

This guarantees that existing pods drain in-flight connections while traffic smoothly shifts to freshly ready new pods.

---

## 4. Kustomize Overlays

```bash
# Development Overlay (single replica, dev prefixes)
kubectl apply -k k8s/overlays/dev

# Production Overlay (multi-replica, strict resource allocations)
kubectl apply -k k8s/overlays/prod

# Validate manifests using kubeconform
kustomize build k8s/overlays/prod | kubeconform -strict -summary -ignore-missing-schemas -kubernetes-version 1.30.0
```
