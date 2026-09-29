#!/usr/bin/env python3
"""
CivicPulse Submission Sanity Check Script (§5.8)
Checks for mechanical failures, prohibited files, missing documentation, and rubric requirements.
"""

import os
import sys
from pathlib import Path

REQUIRED_PATHS = [
    # Workflows
    ".github/workflows/ci.yml",
    ".github/workflows/cd.yml",
    ".github/workflows/release.yml",
    # Backend
    "backend/Dockerfile",
    "backend/.dockerignore",
    "backend/pyproject.toml",
    "backend/requirements.txt",
    "backend/app/main.py",
    "backend/app/providers/triage/base.py",
    "backend/app/providers/triage/llm.py",
    "backend/app/providers/triage/rules.py",
    "backend/app/providers/triage/simulated.py",
    "backend/alembic.ini",
    # Frontend
    "frontend/Dockerfile",
    "frontend/.dockerignore",
    "frontend/nginx.conf",
    "frontend/package.json",
    "frontend/src/App.tsx",
    # Kubernetes
    "k8s/base/namespace.yaml",
    "k8s/base/backend.yaml",
    "k8s/base/frontend.yaml",
    "k8s/base/postgres.yaml",
    "k8s/base/redis.yaml",
    "k8s/base/ingress.yaml",
    "k8s/base/hpa.yaml",
    "k8s/base/kustomization.yaml",
    "k8s/overlays/dev/kustomization.yaml",
    "k8s/overlays/prod/kustomization.yaml",
    # Compose & Config
    "compose.yaml",
    "compose.prod.yaml",
    ".env.example",
    ".gitignore",
    "README.md",
    # Docs
    "docs/AI-USAGE.md",
    "docs/ENGINEERING-NOTES.md",
    "docs/RUNBOOK.md",
    "docs/TRIAGE.md",
    "docs/adr/0001-provider-interface.md",
    "docs/adr/0002-frontend-runtime-config.md",
    "docs/adr/0003-deploy-by-sha.md",
    "docs/adr/0004-pii-and-data-governance.md",
]

PROHIBITED_FILES = [
    ".env",
    ".env.local",
    "backend/.env",
    "frontend/.env",
]

def check_structure():
    root = Path.cwd()
    errors = []
    warnings = []

    print("[*] Running CivicPulse submission checks...")

    # 1. Check prohibited files
    import subprocess
    for prohibited in PROHIBITED_FILES:
        res = subprocess.run(["git", "ls-files", prohibited], capture_output=True, text=True)
        if res.stdout.strip():
            errors.append(f"CRITICAL: Committed secret/environment file in Git: {prohibited} (-20 penalty!)")
        elif (root / prohibited).exists():
            warnings.append(f"Notice: Local {prohibited} exists on disk. Verify it is gitignored before submission.")

    # 2. Check required files
    for req in REQUIRED_PATHS:
        file_path = root / req
        if not file_path.exists():
            errors.append(f"Missing required file or directory: {req}")

    # 3. Check for .env.example
    if not (root / ".env.example").exists():
        errors.append("Missing .env.example file")

    if errors:
        print("\n[!] Check FAILED with errors:")
        for err in errors:
            print(f"  - {err}")
        return False
    else:
        print("\n[+] All structural and security baseline checks PASSED.")
        return True

if __name__ == "__main__":
    success = check_structure()
    sys.exit(0 if success else 1)
