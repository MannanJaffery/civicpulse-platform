# CI/CD Failures & Fixes Log

This document provides a detailed breakdown of the CI/CD and static analysis failures detected in the repository, their root causes, and the exact remediation steps implemented.

---

## 1. Backend Ruff Linter & Formatter Violations

### Issue Summary
Running `ruff check .` on the backend produced 20 errors:
- **`I001` (Unsorted/unformatted import blocks)**: Imports were out of standard order (stdlib -> third-party -> local app) across multiple backend modules.
- **`F401` (Unused imports)**: Unused modules and symbols remained in source files.
- **`W293` (Whitespace-only blank lines)**: Blank lines containing spaces or tabs.

### Files Affected & Remediations
1. **Import Sorting & Ordering (`I001`)**:
   - `backend/alembic/env.py`
   - `backend/app/main.py`
   - `backend/app/providers/triage/base.py`
   - `backend/app/providers/triage/factory.py`
   - `backend/app/providers/triage/llm.py`
   - `backend/app/providers/triage/ollama.py`
   - `backend/app/providers/triage/rules.py`
   - `backend/app/providers/triage/simulated.py`
   - `backend/app/routes/complaints.py`
   - `backend/app/routes/meta.py`
   - `backend/tests/conftest.py`
   - `backend/tests/test_complaints.py`
2. **Unused Imports Cleaned (`F401`)**:
   - `json`, `Category`, `Priority` removed from `backend/app/providers/triage/llm.py`.
   - `Response` removed from `backend/app/routes/complaints.py`.
   - `timezone` removed from `backend/app/routes/meta.py`.
   - `SimulatedTriage` removed from `backend/tests/test_complaints.py`.
3. **Whitespace Cleanup (`W293`)**:
   - Whitespace-only blank lines stripped from `rules.py` and `complaints.py`.

### Verification Command
```bash
ruff check .
ruff format --check .
```
**Result**: 0 errors, all 21 Python files clean and formatted.

---

## 2. GHCR (GitHub Container Registry) Image Naming Case Sensitivity

### Issue Summary
In `.github/workflows/cd.yml` and `.github/workflows/release.yml`, image repository names were constructed directly from `${{ github.repository }}`:
```yaml
env:
  IMAGE_BACKEND: ghcr.io/${{ github.repository }}/backend
  IMAGE_FRONTEND: ghcr.io/${{ github.repository }}/frontend
```
When a GitHub username or organization name contains uppercase characters (e.g. `MannanJaffery/civicpulse-platform`), Docker and GHCR reject the tag with:
```text
invalid reference format: repository name must be lowercase
```

### Remediation
1. Removed static uppercase-vulnerable environment variables from workflow top-level `env:` blocks.
2. Added an explicit lowercase transformation step to all relevant jobs (`build-push`, `deploy-k8s` in `cd.yml`, and `release` in `release.yml`):
   ```yaml
   - name: Set lowercase image repository names
     run: |
       REPO_LOWER=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
       echo "IMAGE_BACKEND=ghcr.io/${REPO_LOWER}/backend" >> $GITHUB_ENV
       echo "IMAGE_FRONTEND=ghcr.io/${REPO_LOWER}/frontend" >> $GITHUB_ENV
   ```
3. Subsequent workflow steps seamlessly access `env.IMAGE_BACKEND` and `env.IMAGE_FRONTEND` in pure lowercase.

---

## 3. Verification Matrix

| Check / Pipeline Stage | Tool | Local / Workflow Status |
| :--- | :--- | :--- |
| Backend Linting | `ruff check backend/` | **PASSED** (0 errors) |
| Backend Code Formatting | `ruff format backend/ --check` | **PASSED** (all files formatted) |
| Frontend Type Check | `npx tsc --noEmit` (in `frontend/`) | **PASSED** (0 errors) |
| CD GHCR Image Tags | Bash `tr '[:upper:]' '[:lower:]'` | **PASSED** (valid lowercase tag format) |
| Release GHCR Image Tags | Bash `tr '[:upper:]' '[:lower:]'` | **PASSED** (valid lowercase tag format) |
