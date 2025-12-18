#!/bin/sh
set -e

echo "[backend:start-prod.sh] Starting production backend..."

echo "[backend:start-prod.sh] Running migrations..."
yarn db:migrate

echo "[backend:start-prod.sh] Migrations completed, starting server..."
node dist/index.js
