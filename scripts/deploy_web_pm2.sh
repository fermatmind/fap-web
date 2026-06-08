#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fap-web}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-3000}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://fermatmind.com}"
CORE_PUBLIC_PATH="${CORE_PUBLIC_PATH:-/zh/tests/clinical-depression-anxiety-assessment-professional-edition/take}"
SITEMAP_PATH="${SITEMAP_PATH:-/sitemap.xml}"
SITEMAP_URL="${SITEMAP_URL:-${PUBLIC_BASE_URL%/}${SITEMAP_PATH}}"
SITEMAP_CURL_TIMEOUT_SEC="${SITEMAP_CURL_TIMEOUT_SEC:-20}"
GIT_BRANCH="${GIT_BRANCH:-main}"
EXPECTED_NODE_MAJOR="${EXPECTED_NODE_MAJOR:-24}"
EXPECTED_NODE_BIN="${EXPECTED_NODE_BIN:-/usr/bin/node}"
RUN_CMS_BASELINE_STAGING_SMOKE="${RUN_CMS_BASELINE_STAGING_SMOKE:-0}"
CMS_BASELINE_API_URL="${CMS_BASELINE_API_URL:-${NEXT_PUBLIC_API_URL:-https://staging-api.fermatmind.com}}"
CMS_BASELINE_WEB_URL="${CMS_BASELINE_WEB_URL:-${STAGING_WEB_URL:-${PUBLIC_BASE_URL}}}"
RUN_CONTENT_RELEASE_REVALIDATE_SMOKE="${RUN_CONTENT_RELEASE_REVALIDATE_SMOKE:-0}"
CONTENT_RELEASE_REVALIDATE_URL="${CONTENT_RELEASE_REVALIDATE_URL:-${PUBLIC_BASE_URL}/api/content-release/revalidate}"
CONTENT_RELEASE_REVALIDATE_TOKEN="${CONTENT_RELEASE_REVALIDATE_TOKEN:-}"
CONTENT_RELEASE_REVALIDATE_LOCALE="${CONTENT_RELEASE_REVALIDATE_LOCALE:-zh-CN}"
CONTENT_RELEASE_REVALIDATE_TYPE="${CONTENT_RELEASE_REVALIDATE_TYPE:-content_page}"
CONTENT_RELEASE_REVALIDATE_SLUG="${CONTENT_RELEASE_REVALIDATE_SLUG:-help-privacy}"
CONTENT_RELEASE_REVALIDATE_PATHS="${CONTENT_RELEASE_REVALIDATE_PATHS:-/help/privacy,/support}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLLING_RELOAD_SCRIPT="${ROLLING_RELOAD_SCRIPT:-${SCRIPT_DIR}/rolling_reload_pm2.sh}"

log() {
  printf '[deploy_web_pm2] %s\n' "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit 1
  fi
}

node_major_from_version() {
  local version="$1"
  version="${version#v}"
  printf '%s\n' "${version%%.*}"
}

require_node_major() {
  local label="$1"
  local node_bin="$2"
  local version
  local major

  if [[ ! -x "$node_bin" ]]; then
    log "${label} is not executable: ${node_bin}"
    exit 1
  fi

  version="$("$node_bin" -v 2>/dev/null || true)"
  if [[ -z "$version" ]]; then
    log "failed to read ${label} version from ${node_bin}"
    exit 1
  fi

  major="$(node_major_from_version "$version")"
  if [[ "$major" != "$EXPECTED_NODE_MAJOR" ]]; then
    log "${label} version mismatch: ${node_bin} -> ${version}"
    log "expected Node ${EXPECTED_NODE_MAJOR}.x to match the current repository runtime standard"
    if [[ "$node_bin" == "$EXPECTED_NODE_BIN" ]]; then
      log "${EXPECTED_NODE_BIN} is referenced by PM2/systemd assets and must satisfy the same Node ${EXPECTED_NODE_MAJOR}.x contract"
    else
      log "the deploy shell runtime must also satisfy the same Node ${EXPECTED_NODE_MAJOR}.x contract"
    fi
    log "fix the runtime and rerun deploy"
    exit 1
  fi

  printf '%s\n' "$version"
}

print_runtime_summary() {
  local pnpm_bin
  local pnpm_version

  pnpm_bin="$(command -v pnpm)"
  pnpm_version="$(pnpm -v)"
  log "runtime summary: node=${PATH_NODE_BIN} (${PATH_NODE_VERSION}), ${EXPECTED_NODE_BIN} (${EXPECTED_NODE_VERSION}), pnpm=${pnpm_bin} (${pnpm_version})"
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

require_sitemap_health() {
  local url="$1"
  local body_file
  local status
  local loc_count

  body_file="$(mktemp "${TMPDIR:-/tmp}/fap-web-sitemap.XXXXXX")"
  trap 'rm -f "$body_file"' RETURN

  if ! status="$(curl -sS --max-time "$SITEMAP_CURL_TIMEOUT_SEC" -o "$body_file" -w '%{http_code}' "$url")"; then
    log "sitemap health failed: curl request failed url=${url}"
    exit 1
  fi

  if [[ "$status" != "200" ]]; then
    log "sitemap health failed: expected status=200 actual=${status} url=${url}"
    exit 1
  fi

  if ! grep -Eiq '<loc>[[:space:]]*[^<]+' "$body_file"; then
    log "sitemap health failed: no <loc> entries url=${url}"
    exit 1
  fi

  if grep -Eiq '<loc>[[:space:]]*https?://[^<]+(/(en|zh))?/(result|results|order|orders|share|pay|payment|payments|history)(/|[?#]|<)' "$body_file"; then
    log "sitemap health failed: private result/order/share/pay/history URL family found url=${url}"
    exit 1
  fi

  if grep -Eiq '<loc>[[:space:]]*https?://[^<]+(/(en|zh))?/tests/[^/<]+/take(/|[?#]|<)' "$body_file"; then
    log "sitemap health failed: private test take URL found url=${url}"
    exit 1
  fi

  loc_count="$(grep -Eio '<loc>' "$body_file" | wc -l | tr -d '[:space:]')"
  log "sitemap health passed: url=${url} status=${status} loc_count=${loc_count}"
  rm -f "$body_file"
  trap - RETURN
}

require_bin node
require_bin git
require_bin pnpm
require_bin rsync
require_bin pm2
require_bin curl
require_bin ss

PATH_NODE_BIN="$(command -v node)"
PATH_NODE_VERSION="$(require_node_major "shell node" "$PATH_NODE_BIN")"
EXPECTED_NODE_VERSION="$(require_node_major "runtime node" "$EXPECTED_NODE_BIN")"
print_runtime_summary

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

if [[ ! -x "$ROLLING_RELOAD_SCRIPT" ]]; then
  log "missing rolling reload script: ${ROLLING_RELOAD_SCRIPT}"
  exit 1
fi

log "rolling reload pm2 app ${APP_NAME}"
APP_DIR="$APP_DIR" PM2_BIN="pm2" PM2_CONFIG="${APP_DIR}/ecosystem.config.cjs" "$ROLLING_RELOAD_SCRIPT" "$APP_NAME"
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
probe_headers "${PUBLIC_BASE_URL}${CORE_PUBLIC_PATH}" 1
require_sitemap_health "$SITEMAP_URL"

if [[ "$RUN_CMS_BASELINE_STAGING_SMOKE" == "1" ]]; then
  log "run staging CMS baseline smoke"
  CMS_BASELINE_API_URL="$CMS_BASELINE_API_URL" CMS_BASELINE_WEB_URL="$CMS_BASELINE_WEB_URL" bash scripts/staging_cms_baseline_smoke.sh
else
  log "skip staging CMS baseline smoke (set RUN_CMS_BASELINE_STAGING_SMOKE=1 for staging releases)"
fi

if [[ "$RUN_CONTENT_RELEASE_REVALIDATE_SMOKE" == "1" ]]; then
  log "run content release revalidation smoke"
  CONTENT_RELEASE_REVALIDATE_URL="$CONTENT_RELEASE_REVALIDATE_URL" \
  CONTENT_RELEASE_REVALIDATE_TOKEN="$CONTENT_RELEASE_REVALIDATE_TOKEN" \
  CONTENT_RELEASE_REVALIDATE_LOCALE="$CONTENT_RELEASE_REVALIDATE_LOCALE" \
  CONTENT_RELEASE_REVALIDATE_TYPE="$CONTENT_RELEASE_REVALIDATE_TYPE" \
  CONTENT_RELEASE_REVALIDATE_SLUG="$CONTENT_RELEASE_REVALIDATE_SLUG" \
  CONTENT_RELEASE_REVALIDATE_PATHS="$CONTENT_RELEASE_REVALIDATE_PATHS" \
  bash scripts/content_release_revalidate_smoke.sh
else
  log "skip content release revalidation smoke (set RUN_CONTENT_RELEASE_REVALIDATE_SMOKE=1 when release invalidation wiring should be verified)"
fi

log "deploy completed"
