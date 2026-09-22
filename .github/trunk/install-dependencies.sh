#!/usr/bin/env bash
set -euo pipefail

corepack enable
for attempt in 1 2 3; do
  if pnpm install --frozen-lockfile; then
    exit 0
  fi
  if [[ "$attempt" -eq 3 ]]; then
    echo "pnpm install failed after $attempt attempts" >&2
    exit 1
  fi
  sleep "$((attempt * 5))"
done
