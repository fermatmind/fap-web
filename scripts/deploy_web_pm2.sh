#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fap-web}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
APP_USER="${APP_USER:-ubuntu}"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-3000}"
CANDIDATE_APP_PORT="${CANDIDATE_APP_PORT:-3101}"
APP_MANAGER="${APP_MANAGER:-pm2}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-${APP_NAME}.service}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://fermatmind.com}"
CORE_PUBLIC_PATH="${CORE_PUBLIC_PATH:-/zh/tests/clinical-depression-anxiety-assessment-professional-edition/take}"
SITEMAP_PATH="${SITEMAP_PATH:-/sitemap.xml}"
SITEMAP_URL="${SITEMAP_URL:-${PUBLIC_BASE_URL%/}${SITEMAP_PATH}}"
REVISION_PATH="${REVISION_PATH:-/api/deployment/revision}"
SITEMAP_CURL_TIMEOUT_SEC="${SITEMAP_CURL_TIMEOUT_SEC:-20}"
RUN_SITEMAP_HEALTH="${RUN_SITEMAP_HEALTH:-1}"
GIT_BRANCH="${GIT_BRANCH:-main}"
DEPLOY_SHA="${DEPLOY_SHA:-}"
EXPECTED_NODE_MAJOR="${EXPECTED_NODE_MAJOR:-24}"
EXPECTED_NODE_BIN="${EXPECTED_NODE_BIN:-/usr/bin/node}"
RUN_CMS_BASELINE_STAGING_SMOKE="${RUN_CMS_BASELINE_STAGING_SMOKE:-0}"
CMS_BASELINE_API_URL="${CMS_BASELINE_API_URL:-${NEXT_PUBLIC_API_URL:-https://staging-api.fermatmind.com}}"
CMS_BASELINE_WEB_URL="${CMS_BASELINE_WEB_URL:-${STAGING_WEB_URL:-${PUBLIC_BASE_URL}}}"
RUN_CONTENT_RELEASE_REVALIDATE_SMOKE="${RUN_CONTENT_RELEASE_REVALIDATE_SMOKE:-0}"
CONTENT_RELEASE_REVALIDATE_URL="${CONTENT_RELEASE_REVALIDATE_URL:-${PUBLIC_BASE_URL}/api/content-release/revalidate}"
CONTENT_RELEASE_REVALIDATE_SECRET="${CONTENT_RELEASE_REVALIDATE_SECRET:-}"
CONTENT_RELEASE_REVALIDATE_LOCALE="${CONTENT_RELEASE_REVALIDATE_LOCALE:-zh-CN}"
CONTENT_RELEASE_REVALIDATE_TYPE="${CONTENT_RELEASE_REVALIDATE_TYPE:-content_page}"
CONTENT_RELEASE_REVALIDATE_SLUG="${CONTENT_RELEASE_REVALIDATE_SLUG:-help-privacy}"
CONTENT_RELEASE_REVALIDATE_PATHS="${CONTENT_RELEASE_REVALIDATE_PATHS:-/help/privacy,/support}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLLING_RELOAD_SCRIPT="${ROLLING_RELOAD_SCRIPT:-${SCRIPT_DIR}/rolling_reload_pm2.sh}"
SYNC_STANDALONE_ASSETS_SCRIPT="${SYNC_STANDALONE_ASSETS_SCRIPT:-${SCRIPT_DIR}/sync_standalone_assets.sh}"
GENERATED_PUBLIC_ARTIFACTS="${GENERATED_PUBLIC_ARTIFACTS:-}"
ANALYTICS_PUBLIC_PATHS="${ANALYTICS_PUBLIC_PATHS:-/zh /zh/personality /zh/articles}"
ANALYTICS_PRIVATE_PATHS="${ANALYTICS_PRIVATE_PATHS:-/zh/result/SYNTHETIC_DO_NOT_USE /zh/orders/lookup /zh/pay/wait /zh/payment/stripe/cancel}"
PRIVATE_SITEMAP_PATH_PATTERN='<loc>[[:space:]]*https?://[^/<]+(/(en|zh))?/(result|results|order|orders|share|pay|payment|payments|history)(/|[?#]|<)'
PRIVATE_TEST_TAKE_SITEMAP_PATH_PATTERN='<loc>[[:space:]]*https?://[^/<]+(/(en|zh))?/tests/[^/<]+/take(/|[?#]|<)'

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

write_deployed_revision() {
  local revision="$1"
  local target="$2"
  local temporary

  if [[ ! "$revision" =~ ^[0-9a-f]{40}$ ]]; then
    log "refusing to write invalid deployed revision"
    return 1
  fi
  if [[ ! -d "$(dirname "$target")" ]]; then
    log "deployed revision target directory is missing: $(dirname "$target")"
    return 1
  fi

  temporary="$(mktemp "${target}.tmp.XXXXXX")"
  if ! printf '%s\n' "$revision" > "$temporary" \
    || ! chmod 0444 "$temporary" \
    || ! mv -f "$temporary" "$target"; then
    rm -f "$temporary"
    log "failed to persist deployed revision: ${target}"
    return 1
  fi
}

require_deployed_revision_endpoint() {
  local url="$1"
  local expected_revision="$2"
  local payload

  if ! payload="$(curl -fsS --max-time 20 "$url")"; then
    log "deployed revision endpoint request failed: ${url}"
    return 1
  fi
  if ! REVISION_PAYLOAD="$payload" EXPECTED_REVISION="$expected_revision" node <<'NODE'
const payload = JSON.parse(process.env.REVISION_PAYLOAD || "null");
const expected = process.env.EXPECTED_REVISION || "";
if (
  !payload ||
  typeof payload !== "object" ||
  Array.isArray(payload) ||
  Object.keys(payload).join(",") !== "revision" ||
  payload.revision !== expected
) {
  process.exit(1);
}
NODE
  then
    log "deployed revision endpoint mismatch: ${url}"
    return 1
  fi

  log "deployed revision endpoint passed: ${url}"
}

require_analytics_build_config() {
  local failed=0

  if [[ "${NEXT_PUBLIC_ANALYTICS_ENABLED:-}" == "true" ]]; then
    log "analytics_enabled=PASS"
  else
    log "analytics_enabled=FAIL"
    failed=1
  fi

  if [[ "${NEXT_PUBLIC_GA_MEASUREMENT_ID:-}" =~ ^G-[A-Z0-9]{4,32}$ ]]; then
    log "ga_measurement_id=PASS"
  else
    log "ga_measurement_id=FAIL"
    failed=1
  fi

  if [[ "${NEXT_PUBLIC_BAIDU_TONGJI_ID:-}" =~ ^[a-f0-9]{16,64}$ ]]; then
    log "baidu_tongji_id=PASS"
  else
    log "baidu_tongji_id=FAIL"
    failed=1
  fi

  if [[ "$failed" != "0" ]]; then
    log "analytics build configuration failed"
    exit 1
  fi
}

write_systemd_analytics_runtime_env() {
  local runtime_env
  local runtime_env_tmp

  if [[ "$APP_MANAGER" != "systemd" ]]; then
    return 0
  fi

  runtime_env="${APP_DIR}/.next/standalone/.env.production.local"
  runtime_env_tmp="${runtime_env}.tmp"
  umask 077
  {
    printf 'NEXT_PUBLIC_ANALYTICS_ENABLED=%s\n' "$NEXT_PUBLIC_ANALYTICS_ENABLED"
    printf 'NEXT_PUBLIC_GA_MEASUREMENT_ID=%s\n' "$NEXT_PUBLIC_GA_MEASUREMENT_ID"
    printf 'NEXT_PUBLIC_BAIDU_TONGJI_ID=%s\n' "$NEXT_PUBLIC_BAIDU_TONGJI_ID"
  } > "$runtime_env_tmp"
  mv "$runtime_env_tmp" "$runtime_env"
  chmod 600 "$runtime_env"
  log "systemd analytics runtime environment prepared"
}

require_analytics_bootstrap_contract() {
  local base_url="$1"
  local phase="$2"
  local path
  local body_file
  local status

  for path in $ANALYTICS_PUBLIC_PATHS; do
    body_file="$(mktemp "${TMPDIR:-/tmp}/fap-web-analytics-public.XXXXXX")"
    status="$(curl -sSL --max-time 20 -o "$body_file" -w '%{http_code}' "${base_url%/}${path}")"
    if [[ "$status" != "200" ]] || ! grep -q 'fm-analytics-bootstrap' "$body_file"; then
      rm -f "$body_file"
      log "analytics public smoke failed: phase=${phase} path=${path} status=${status}"
      exit 1
    fi
    rm -f "$body_file"
    log "analytics public smoke passed: phase=${phase} path=${path}"
  done

  for path in $ANALYTICS_PRIVATE_PATHS; do
    body_file="$(mktemp "${TMPDIR:-/tmp}/fap-web-analytics-private.XXXXXX")"
    status="$(curl -sSL --max-time 20 -o "$body_file" -w '%{http_code}' "${base_url%/}${path}")"
    if [[ "$status" =~ ^5 ]] || grep -Eiq 'fm-analytics-bootstrap|data-analytics-bootstrap|googletagmanager|hm\.baidu' "$body_file"; then
      rm -f "$body_file"
      log "analytics private smoke failed: phase=${phase} path=${path} status=${status}"
      exit 1
    fi
    rm -f "$body_file"
    log "analytics private smoke passed: phase=${phase} path=${path} status=${status}"
  done
}

require_candidate_analytics_smoke() {
  local candidate_pid
  local candidate_log
  local candidate_base_url
  local ready=0
  local attempt

  if ss -ltn | grep -Eq ":${CANDIDATE_APP_PORT}[[:space:]]"; then
    log "candidate port is already in use: ${CANDIDATE_APP_PORT}"
    exit 1
  fi

  candidate_log="$(mktemp "${TMPDIR:-/tmp}/fap-web-analytics-candidate.XXXXXX")"
  candidate_base_url="http://${APP_HOST}:${CANDIDATE_APP_PORT}"
  (
    cd .next/standalone
    exec env NODE_ENV=production HOSTNAME="$APP_HOST" PORT="$CANDIDATE_APP_PORT" "$EXPECTED_NODE_BIN" server.js
  ) >"$candidate_log" 2>&1 &
  candidate_pid=$!

  cleanup_candidate() {
    if kill -0 "$candidate_pid" >/dev/null 2>&1; then
      kill "$candidate_pid" >/dev/null 2>&1 || true
      wait "$candidate_pid" >/dev/null 2>&1 || true
    fi
    rm -f "$candidate_log"
  }
  trap cleanup_candidate RETURN EXIT

  for attempt in $(seq 1 30); do
    if curl -fsS --max-time 2 "${candidate_base_url}/zh" >/dev/null 2>&1; then
      ready=1
      break
    fi
    if ! kill -0 "$candidate_pid" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if [[ "$ready" != "1" ]]; then
    log "candidate server failed to become ready"
    sed -n '1,80p' "$candidate_log" >&2 || true
    exit 1
  fi

  require_analytics_bootstrap_contract "$candidate_base_url" "candidate"
  cleanup_candidate
  trap - RETURN EXIT
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

  if grep -Eiq "$PRIVATE_SITEMAP_PATH_PATTERN" "$body_file"; then
    log "sitemap health failed: private result/order/share/pay/history URL family found url=${url}"
    exit 1
  fi

  if grep -Eiq "$PRIVATE_TEST_TAKE_SITEMAP_PATH_PATTERN" "$body_file"; then
    log "sitemap health failed: private test take URL found url=${url}"
    exit 1
  fi

  loc_count="$(grep -Eio '<loc>' "$body_file" | wc -l | tr -d '[:space:]')"
  log "sitemap health passed: url=${url} status=${status} loc_count=${loc_count}"
  rm -f "$body_file"
  trap - RETURN
}

restore_generated_public_artifacts() {
  local artifact
  local restored=0

  for artifact in $GENERATED_PUBLIC_ARTIFACTS; do
    if git ls-files --error-unmatch "$artifact" >/dev/null 2>&1 && ! git diff --quiet -- "$artifact"; then
      git restore -- "$artifact"
      log "restored generated public artifact after standalone sync: ${artifact}"
      restored=1
    fi
  done

  if [[ "$restored" == "0" ]]; then
    log "no tracked generated public artifacts required restore"
  fi
}

require_bin node
require_bin git
require_bin pnpm
require_bin rsync
if [[ "$APP_MANAGER" == "pm2" ]]; then
  require_bin pm2
elif [[ "$APP_MANAGER" == "systemd" ]]; then
  require_bin systemctl
else
  log "unsupported APP_MANAGER: ${APP_MANAGER}"
  exit 1
fi
require_bin curl
require_bin ss

PATH_NODE_BIN="$(command -v node)"
PATH_NODE_VERSION="$(require_node_major "shell node" "$PATH_NODE_BIN")"
EXPECTED_NODE_VERSION="$(require_node_major "runtime node" "$EXPECTED_NODE_BIN")"
print_runtime_summary
require_analytics_build_config

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
git checkout -B "$GIT_BRANCH" "origin/${GIT_BRANCH}"
if [[ -n "$DEPLOY_SHA" ]]; then
  git reset --hard "$DEPLOY_SHA"
else
  git reset --hard "origin/${GIT_BRANCH}"
fi
DEPLOYED_REVISION="$(git rev-parse HEAD)"
if [[ ! "$DEPLOYED_REVISION" =~ ^[0-9a-f]{40}$ ]]; then
  log "current deployed revision is invalid"
  exit 1
fi
if [[ -n "$DEPLOY_SHA" && "$DEPLOYED_REVISION" != "$DEPLOY_SHA" ]]; then
  log "current deployed revision does not match DEPLOY_SHA"
  exit 1
fi
log "current commit: ${DEPLOYED_REVISION:0:12}"

log "install/build"
rm -rf .next
pnpm install --frozen-lockfile
NODE_OPTIONS='' pnpm run build

if [[ ! -f .next/standalone/server.js ]]; then
  log "missing build artifact: .next/standalone/server.js"
  exit 1
fi

log "sync standalone static assets"
bash "$SYNC_STANDALONE_ASSETS_SCRIPT"
restore_generated_public_artifacts
write_systemd_analytics_runtime_env
require_candidate_analytics_smoke

if [[ "$APP_MANAGER" == "pm2" ]]; then
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
else
  log "restart systemd service ${SYSTEMD_SERVICE}"
  sudo -n systemctl restart "$SYSTEMD_SERVICE"
fi

log "runtime checks"
if [[ "$APP_MANAGER" == "pm2" ]]; then
  pm2 status
  pm2 logs "$APP_NAME" --lines 80 --nostream || true
else
  systemctl is-active --quiet "$SYSTEMD_SERVICE"
  systemctl status "$SYSTEMD_SERVICE" --no-pager -l | sed -n '1,80p'
fi
ss -ltnp | grep ":${APP_PORT}" >/dev/null
ss -ltnp | grep ":${APP_PORT}"
write_deployed_revision "$DEPLOYED_REVISION" "${APP_DIR}/REVISION"

log "probe local endpoints"
probe_headers "http://${APP_HOST}:${APP_PORT}/en"
probe_headers "http://${APP_HOST}:${APP_PORT}/zh"
require_deployed_revision_endpoint "http://${APP_HOST}:${APP_PORT}${REVISION_PATH}" "$DEPLOYED_REVISION"

log "probe public endpoints"
probe_headers "${PUBLIC_BASE_URL}/en" 1
probe_headers "${PUBLIC_BASE_URL}/zh" 1
probe_headers "${PUBLIC_BASE_URL}/en/pay/wait" 1
probe_headers "${PUBLIC_BASE_URL}${CORE_PUBLIC_PATH}" 1
require_deployed_revision_endpoint "${PUBLIC_BASE_URL%/}${REVISION_PATH}" "$DEPLOYED_REVISION"
require_analytics_bootstrap_contract "$PUBLIC_BASE_URL" "production"
if [[ "$RUN_SITEMAP_HEALTH" == "1" ]]; then
  require_sitemap_health "$SITEMAP_URL"
else
  log "skip sitemap health (RUN_SITEMAP_HEALTH=0)"
fi

if [[ "$RUN_CMS_BASELINE_STAGING_SMOKE" == "1" ]]; then
  log "run staging CMS baseline smoke"
  CMS_BASELINE_API_URL="$CMS_BASELINE_API_URL" CMS_BASELINE_WEB_URL="$CMS_BASELINE_WEB_URL" bash scripts/staging_cms_baseline_smoke.sh
else
  log "skip staging CMS baseline smoke (set RUN_CMS_BASELINE_STAGING_SMOKE=1 for staging releases)"
fi

if [[ "$RUN_CONTENT_RELEASE_REVALIDATE_SMOKE" == "1" ]]; then
  log "run content release revalidation smoke"
  CONTENT_RELEASE_REVALIDATE_URL="$CONTENT_RELEASE_REVALIDATE_URL" \
  CONTENT_RELEASE_REVALIDATE_SECRET="$CONTENT_RELEASE_REVALIDATE_SECRET" \
  CONTENT_RELEASE_REVALIDATE_LOCALE="$CONTENT_RELEASE_REVALIDATE_LOCALE" \
  CONTENT_RELEASE_REVALIDATE_TYPE="$CONTENT_RELEASE_REVALIDATE_TYPE" \
  CONTENT_RELEASE_REVALIDATE_SLUG="$CONTENT_RELEASE_REVALIDATE_SLUG" \
  CONTENT_RELEASE_REVALIDATE_PATHS="$CONTENT_RELEASE_REVALIDATE_PATHS" \
  bash scripts/content_release_revalidate_smoke.sh
else
  log "skip content release revalidation smoke (set RUN_CONTENT_RELEASE_REVALIDATE_SMOKE=1 when release invalidation wiring should be verified)"
fi

log "deploy completed"
