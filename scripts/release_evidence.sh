#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

if [[ ! -d ".next" ]]; then
  echo "[release_evidence] .next not found. Run 'pnpm build' first." >&2
  exit 1
fi

OUT_DIR="${1:-artifacts/release-evidence}"
TIMESTAMP_UTC="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="$OUT_DIR/build-hash-$TIMESTAMP_UTC.txt"

mkdir -p "$OUT_DIR"

{
  echo "generated_at_utc=$TIMESTAMP_UTC"
  echo "git_commit=$(git rev-parse HEAD)"
  echo "git_branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "node_version=$(node -v)"
  echo "pnpm_version=$(pnpm -v)"
  echo
  echo "[hashes]"
  find .next -type f \
    \( -name '*.js' -o -name '*.css' -o -name '*.json' -o -name '*.html' -o -name '*.wasm' \) \
    -print0 \
    | sort -z \
    | xargs -0 shasum -a 256
} > "$OUT_FILE"

echo "[release_evidence] wrote $OUT_FILE"

