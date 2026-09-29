# Kubernetes Manifests & Kustomize Hierarchy

```
k8s/
├── base/
│   ├── namespace.yaml              # Dedicated civicpulse namespace
│   ├── backend.yaml                # FastAPI Deployment (2+ replicas, probes, resources) + Service
│   ├── frontend.yaml               # Nginx Deployment (2+ replicas, probes, resources) + Service
│   ├── postgres.yaml               # PostgreSQL StatefulSet + PVC + Service
│   ├── redis.yaml                  # Redis Deployment + PVC + Service
│   ├── ingress.yaml                # Host Ingress (/ -> frontend, /api -> backend)
│   ├── configmap.yaml              # Non-secret application configurations
│   ├── secret.yaml                 # Secret placeholders (passwords, LLM keys)
│   ├── hpa.yaml                    # HorizontalPodAutoscaler (v2, 60% CPU target)
│   ├── vpa.yaml                    # VerticalPodAutoscaler (updateMode: Off)
│   ├── pdb.yaml                    # PodDisruptionBudget (minAvailable: 1)
│   └── kustomization.yaml          # Base manifest aggregator
└── overlays/
    ├── dev/
    │   └── kustomization.yaml      # Development overlay (replica overrides, dev prefix)
    └── prod/
        └── kustomization.yaml      # Production overlay with immutable SHA image tags
```
