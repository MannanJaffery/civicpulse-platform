# CivicPulse Operations Runbook

Operational procedures for deploying, monitoring, rolling back, and troubleshooting CivicPulse.

---

## 1. Deployment Procedures

### Docker Compose (Local / Single Host)
```bash
# Start development environment
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

# Verify rollout
kubectl rollout status deployment/backend -n civicpulse
kubectl rollout status deployment/frontend -n civicpulse
```

---

## 2. Emergency Rollback Procedures

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

## 3. Logs & Observability

```bash
# Backend structured JSON logs
kubectl logs -n civicpulse -l app=backend --tail=100 -f

# Check active triage provider & failure metrics
curl -s http://localhost:8000/api/meta/providers | jq .

# Check Prometheus metrics
curl -s http://localhost:8000/metrics
```

---

## 4. Triage Failure & Fallback Troubleshooting

If the primary LLM provider fails (e.g. rate limit 429, timeout > 10s):
1. The backend automatically catches errors, logs a `WARNING` with `request_id`, and falls back to `RuleBasedTriage`.
2. Check provider health in `/api/meta/providers`.
3. To switch provider without code changes:
```bash
kubectl set env deployment/backend -n civicpulse TRIAGE_PROVIDER=rules
```
