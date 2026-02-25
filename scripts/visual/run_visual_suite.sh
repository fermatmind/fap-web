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

# Keep local visual output aligned with CI by default:
# temporarily hide developer-local env overrides while building/running visuals.
declare -a HIDDEN_ENV_FILES=()
if [[ "${VISUAL_USE_LOCAL_ENV:-0}" != "1" ]]; then
  for ENV_FILE in ".env.local" ".env.production.local"; do
    if [[ -f "$ENV_FILE" ]]; then
      BACKUP_FILE="${ENV_FILE}.visual-bak.$$"
      mv "$ENV_FILE" "$BACKUP_FILE"
      HIDDEN_ENV_FILES+=("${ENV_FILE}:${BACKUP_FILE}")
    fi
  done
fi

restore_hidden_env_files() {
  for ENTRY in "${HIDDEN_ENV_FILES[@]}"; do
    ORIGINAL_FILE="${ENTRY%%:*}"
    BACKUP_FILE="${ENTRY#*:}"
    if [[ -f "$BACKUP_FILE" ]]; then
      mv "$BACKUP_FILE" "$ORIGINAL_FILE"
    fi
  done
}
trap restore_hidden_env_files EXIT

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
