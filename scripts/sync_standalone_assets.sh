#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .next/standalone/server.js ]]; then
  echo "missing build artifact: .next/standalone/server.js" >&2
  exit 1
fi

sync_dir() {
  local source_dir="$1"
  local target_dir="$2"

  if [[ ! -d "$source_dir" ]]; then
    echo "missing source directory: ${source_dir}" >&2
    exit 1
  fi

  mkdir -p "$target_dir"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${source_dir}/" "${target_dir}/"
    return
  fi

  find "$target_dir" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  cp -a "${source_dir}/." "$target_dir/"
}

echo "sync standalone static assets"
sync_dir "public" ".next/standalone/public"
sync_dir ".next/static" ".next/standalone/.next/static"

# These files travel in the checksummed server release outside the public web root.
install -d .next/standalone/.next/history-ingress
install -m 0644 deploy/openresty/nginx.conf .next/standalone/.next/history-ingress/nginx.conf
install -m 0644 scripts/ops/install-history-avatars.sh .next/standalone/.next/history-ingress/install-history-avatars.sh

if ! find .next/standalone/.next/static -type f \( -name '*.js' -o -name '*.css' -o -name '*.woff2' \) -print -quit | grep -q .; then
  echo "standalone static asset verification failed: no js/css/font assets found" >&2
  exit 1
fi
