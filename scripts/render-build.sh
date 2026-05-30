#!/usr/bin/env bash
# Render build — single entry point (see render.yaml).
set -euo pipefail

npm ci --ignore-scripts
npm run build:deploy -w api
(cd apps/api && npx prisma migrate deploy)
