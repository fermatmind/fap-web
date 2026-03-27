#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .next/standalone/server.js ]]; then
  echo "missing build artifact: .next/standalone/server.js"
  exit 1
fi

sync_dir() {
  local source_dir="$1"
  local target_dir="$2"

  mkdir -p "$target_dir"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${source_dir}/" "${target_dir}/"
    return
  fi

  rm -rf "${target_dir:?}/"*
  cp -a "${source_dir}/." "$target_dir/"
}

echo "sync standalone static assets"
sync_dir "public" ".next/standalone/public"
sync_dir ".next/static" ".next/standalone/.next/static"
