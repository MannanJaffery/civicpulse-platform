#!/bin/sh
set -e

echo "[*] Waiting for PostgreSQL database to be ready..."
python -c "
import time, os, psycopg2
db_url = os.environ.get('DATABASE_URL', '')
for i in range(30):
    try:
        if db_url:
            conn = psycopg2.connect(db_url)
            conn.close()
            print('[+] PostgreSQL connection established!')
            break
    except Exception:
        time.sleep(1)
" || true

echo "[*] Running Alembic migrations..."
alembic upgrade head

echo "[*] Running idempotent database seeding..."
python -m app.seed || true

echo "[*] Starting CivicPulse backend..."
exec "$@"
