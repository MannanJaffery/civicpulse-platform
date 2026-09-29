#!/bin/sh
set -e

echo "[*] Waiting for PostgreSQL database to be ready..."
python -c "
import time, os, psycopg2
db_url = os.environ.get('DATABASE_URL', '')
connected = False
for i in range(60):
    try:
        if db_url:
            conn = psycopg2.connect(db_url)
            conn.close()
            print('[+] PostgreSQL connection established!')
            connected = True
            break
    except Exception:
        pass
    time.sleep(1)

if not connected and db_url:
    print('[-] Warning: PostgreSQL not reachable yet, proceeding...')
" || true

echo "[*] Running Alembic migrations..."
for i in $(seq 1 10); do
  if alembic upgrade head; then
    echo "[+] Alembic migrations applied successfully!"
    break
  fi
  echo "[-] Migration attempt $i failed, retrying in 2s..."
  sleep 2
done

echo "[*] Running idempotent database seeding..."
python -m app.seed || true

echo "[*] Starting CivicPulse backend..."
exec "$@"
