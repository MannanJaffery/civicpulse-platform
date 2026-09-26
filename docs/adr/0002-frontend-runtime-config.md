# ADR 0002: Frontend Runtime Configuration and Reverse Proxying

## Status
Accepted

## Context
Vite compiles `import.meta.env` values statically at build time. Hardcoding backend API URLs into the image breaks the 12-factor "build-once-deploy-many" principle.

## Decision
Configure the frontend Nginx web server to serve static assets and proxy `/api/*` requests directly to `http://backend:8000/api/*`.

## Consequences
- Single frontend Docker image runs unchanged across local compose, CI, and production Kubernetes clusters.
- Avoids CORS issues because the browser communicates with the same origin.
