#!/bin/sh
set -e

echo "[*] Waiting for PostgreSQL database to be ready and running Alembic migrations..."
alembic upgrade head

echo "[*] Running idempotent database seeding..."
python -m app.seed || true

echo "[*] Starting CivicPulse backend..."
exec "$@"
