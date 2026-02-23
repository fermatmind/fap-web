#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

MODE="${MODE:-mock}"

case "$MODE" in
  mock)
    echo "[uat] running mock UAT matrix..."
    pnpm test:e2e tests/e2e/uat-matrix.spec.ts
    ;;
  live)
    echo "[uat] running live UAT matrix against current environment..."
    UAT_MODE=live pnpm test:e2e tests/e2e/uat-matrix.spec.ts
    ;;
  *)
    echo "[uat] unsupported MODE: $MODE (expected: mock|live)"
    exit 1
    ;;
esac
