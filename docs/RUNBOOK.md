# CivicPulse Operations Runbook (§5.2 / §5.3)

Operational procedures for deploying, migrating, seeding, monitoring, rolling back, and troubleshooting CivicPulse.

---

## 1. Database Migrations & Seeding

### Apply Database Migrations (Alembic)
```bash
# In backend directory
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```

### Run Idempotent Seed Script
```bash
# Loads 32 realistic Urdu-English municipal complaints across all categories
python -m app.seed
```

---

## 2. Deployment Procedures

### Docker Compose (Local / Single Host)
```bash
# Start development environment with hot-reload and seed
docker compose up -d

# Start production stack
docker compose -f compose.prod.yaml up -d
```

### Kubernetes (Kustomize)
```bash
# Apply development overlay
kubectl apply -k k8s/overlays/dev

# Apply production overlay
kubectl apply -k k8s/overlays/prod

# Verify rollout status
kubectl rollout status deployment/backend -n civicpulse
kubectl rollout status deployment/frontend -n civicpulse
```

---

## 3. Emergency Rollback Procedures

### Method 1: Imperative Pod Rollback (3 a.m. Quick Fix)
```bash
kubectl rollout undo deployment/backend -n civicpulse
kubectl rollout undo deployment/frontend -n civicpulse
```

### Method 2: Declarative Rollback (Auditable Fix)
```bash
# Revert commit in Git and apply previous SHA image overlay
kubectl apply -k k8s/overlays/prod
```

---

## 4. Logs, Health Checks & Observability

```bash
# Liveness Probe (does NOT touch DB)
curl -i http://localhost:8000/health

# Readiness Probe (verifies PostgreSQL and Redis connectivity)
curl -i http://localhost:8000/ready

# Prometheus Metrics
curl -s http://localhost:8000/metrics

# Observability Surface (Active provider & last 20 triage outcomes)
curl -s http://localhost:8000/api/meta/providers | jq .

# Backend Structured JSON Logs
kubectl logs -n civicpulse -l app=backend --tail=100 -f
```

---

## 5. Triage Failure & Fallback Troubleshooting

If the primary LLM provider fails (e.g. rate limit 429, timeout > 10s):
1. The backend automatically catches errors, logs a `WARNING` with `request_id`, and falls back to `RuleBasedTriage` (`triaged_by = "rules:fallback"`).
2. Check provider health in `/api/meta/providers`.
3. To switch provider dynamically without code deployment:
```bash
kubectl set env deployment/backend -n civicpulse TRIAGE_PROVIDER=rules
```
