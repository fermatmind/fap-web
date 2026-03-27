#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3000}"

bash scripts/visual/sync_standalone_assets.sh
exec env HOST="$HOST" PORT="$PORT" node .next/standalone/server.js
