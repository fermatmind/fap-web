#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fap-web}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-3000}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://fermatmind.com}"
GIT_BRANCH="${GIT_BRANCH:-main}"

log() {
  printf '[deploy_web_pm2] %s\n' "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit 1
  fi
}

probe_headers() {
  local url="$1"
  local follow_redirects="${2:-0}"
  local headers

  if [[ "$follow_redirects" == "1" ]]; then
    headers="$(curl -fsSIL "$url")"
  else
    headers="$(curl -fsSI "$url")"
  fi

  printf '%s\n' "$headers" | head -n 20
}

require_bin git
require_bin pnpm
require_bin rsync
require_bin pm2
require_bin curl
require_bin ss

CURRENT_USER="$(id -un)"
if [[ "$CURRENT_USER" != "$APP_USER" ]]; then
  log "run this script as ${APP_USER} (current user: ${CURRENT_USER})"
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  log "app directory not found: ${APP_DIR}"
  exit 1
fi

cd "$APP_DIR"

log "sync code with origin/${GIT_BRANCH}"
git fetch --prune origin
git checkout "$GIT_BRANCH"
git reset --hard "origin/${GIT_BRANCH}"
log "current commit: $(git rev-parse --short HEAD)"

log "install/build"
rm -rf .next
pnpm install --frozen-lockfile
pnpm run build

if [[ ! -f .next/standalone/server.js ]]; then
  log "missing build artifact: .next/standalone/server.js"
  exit 1
fi

log "sync standalone static assets"
mkdir -p .next/standalone/public
rsync -a --delete public/ .next/standalone/public/
mkdir -p .next/standalone/.next
rsync -a --delete .next/static/ .next/standalone/.next/static/

if [[ ! -f ecosystem.config.cjs ]]; then
  log "missing PM2 config: ecosystem.config.cjs"
  exit 1
fi

log "restart pm2 app ${APP_NAME}"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.cjs --only "$APP_NAME"
pm2 save

log "runtime checks"
pm2 status
pm2 logs "$APP_NAME" --lines 80 --nostream || true
ss -ltnp | grep ":${APP_PORT}" >/dev/null
ss -ltnp | grep ":${APP_PORT}"

log "probe local endpoints"
probe_headers "http://${APP_HOST}:${APP_PORT}/en"
probe_headers "http://${APP_HOST}:${APP_PORT}/zh"

log "probe public endpoints"
probe_headers "${PUBLIC_BASE_URL}/en" 1
probe_headers "${PUBLIC_BASE_URL}/zh" 1
probe_headers "${PUBLIC_BASE_URL}/en/pay/wait" 1

log "deploy completed"
