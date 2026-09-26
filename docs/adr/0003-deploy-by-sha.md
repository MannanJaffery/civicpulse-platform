# ADR 0003: Immutable Deployments by Git Commit SHA

## Status
Accepted

## Context
Deploying mutable tags such as `:latest` introduces ambiguity regarding what exact revision of code is running in production and prevents reliable rollbacks.

## Decision
All CI/CD pipelines tag images with the full or short git commit SHA `${{ github.sha }}`. K8s manifests in production overlays are deployed referencing this immutable SHA.

## Consequences
- Every running workload maps 1-to-1 with a commit in Git history (`git show <sha>`).
- Rollbacks are deterministic and auditable.
