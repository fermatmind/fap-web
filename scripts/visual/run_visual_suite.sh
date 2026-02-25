#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"

if [[ "$MODE" != "verify" && "$MODE" != "update" ]]; then
  echo "Usage: bash scripts/visual/run_visual_suite.sh <verify|update>"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ "${VISUAL_FORCE_CLEAN:-0}" == "1" ]]; then
  node -e "require('node:fs').rmSync('.next',{ recursive: true, force: true })"
fi

pnpm build

ARGS=(
  test
  tests/e2e/visual
  --config=playwright.visual.config.ts
  --workers=1
)

if [[ "$MODE" == "update" ]]; then
  ARGS+=(--update-snapshots)
fi

NEXT_PUBLIC_E2E_VISUAL_MODE=1 pnpm exec playwright "${ARGS[@]}"
