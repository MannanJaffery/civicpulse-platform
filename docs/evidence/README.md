# Evidence & Submission Artifacts (§4 Rubric A, H & J)

This directory contains evidence documentation and references for CivicPulse rubric compliance:

---

## 1. Protected Branch Configuration (Rubric A.1)
- `main` branch protected: direct pushes blocked, PR required with CI checks passing, and >= 1 review approval.
- Reference: GitHub Repository Settings -> Branches -> Branch Protection Rules.

---

## 2. Deliberate Merge Conflict Resolution (Rubric A.5)
- **Feature Tracks**: `feat/backend-hardening` vs `feat/frontend-ux-revamp` on shared schema models.
- **Markers & Conflict**: Resolved in favor of unified Pydantic v2 and TypeScript definitions supporting both structured LLM triage and optimistic frontend state.
- **Rationale**: Preserved contract parity between backend serialization and frontend API client.

---

## 3. Kubernetes HPA Autoscaling & Load Verification (Rubric H.5)
- Load test executed via `k6 run load/k6-script.js`.
- Observed scale-out from 2 to 10 replicas upon sustained CPU threshold breach (>60%).
- Captured replica response timeline documented in `docs/ENGINEERING-NOTES.md` §5.

---

## 4. Rollback Demonstrations (Rubric J)
- **Fast Imperative Rollback (3 a.m. fix)**:
  ```bash
  kubectl rollout undo deployment/backend -n civicpulse
  ```
- **Declarative GitOps Rollback (Auditable fix)**:
  ```bash
  git revert <bad-commit-sha>
  kubectl apply -k k8s/overlays/prod
  ```
