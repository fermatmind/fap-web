#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to update Linux visual snapshots."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLAYWRIGHT_VERSION="$(
  node -p "require('${ROOT_DIR}/package.json').devDependencies['@playwright/test'].replace(/^[^0-9]*/, '')"
)"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_DOCKER_IMAGE:-mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy}"

docker run --rm --ipc=host \
  --user "$(id -u):$(id -g)" \
  -e CI=1 \
  -e VISUAL_FORCE_CLEAN=1 \
  -e HOME=/tmp \
  -v "${ROOT_DIR}:/work" \
  -w /work \
  "${PLAYWRIGHT_IMAGE}" \
  bash -lc '
    set -euo pipefail
    export NPM_CONFIG_PREFIX=/tmp/npm-global
    export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"

    npm install -g pnpm@10.28.1
    pnpm install --frozen-lockfile
    bash scripts/visual/run_visual_suite.sh update
  '
