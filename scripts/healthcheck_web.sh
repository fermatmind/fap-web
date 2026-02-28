#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fap-web}"
PM2_BIN="${PM2_BIN:-pm2}"
LOCAL_URLS_CSV="${HEALTHCHECK_LOCAL_URLS:-http://127.0.0.1:3000/en,http://127.0.0.1:3000/zh}"
PUBLIC_URLS_CSV="${HEALTHCHECK_PUBLIC_URLS:-https://fermatmind.com/en,https://fermatmind.com/zh}"
CURL_TIMEOUT_SEC="${HEALTHCHECK_CURL_TIMEOUT_SEC:-8}"

# Exit code contract:
# 0 = healthy
# 1 = local endpoint failure
# 2 = public endpoint failure
# 3 = pm2 process failure
EXIT_OK=0
EXIT_LOCAL_FAIL=1
EXIT_PUBLIC_FAIL=2
EXIT_PROCESS_FAIL=3

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[healthcheck_web] %s %s\n' "$(timestamp)" "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit "$EXIT_PROCESS_FAIL"
  fi
}

split_csv_lines() {
  local csv="$1"
  printf '%s\n' "$csv" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed '/^$/d'
}

probe_url() {
  local url="$1"
  if curl -fsSI --max-time "$CURL_TIMEOUT_SEC" "$url" >/dev/null; then
    log "ok url=${url}"
    return 0
  fi
  log "fail url=${url}"
  return 1
}

require_bin "$PM2_BIN"
require_bin curl
require_bin node

pm2_status_line=""
pm2_parse_code=0
if ! pm2_status_line="$(
  "$PM2_BIN" jlist 2>/dev/null | node -e '
const fs = require("fs");
const app = process.argv[1];
const raw = fs.readFileSync(0, "utf8");
let parsed = [];
try {
  parsed = JSON.parse(raw);
} catch {
  process.exit(2);
}
const hit = parsed.find((item) => item && item.name === app);
if (!hit) {
  process.exit(3);
}
const status = hit.pm2_env && hit.pm2_env.status ? String(hit.pm2_env.status) : "";
process.stdout.write(status);
' "$APP_NAME"
)"; then
  pm2_parse_code="$?"
fi

if [[ "$pm2_parse_code" == "3" ]]; then
  log "fail pm2 app not found app=${APP_NAME}"
  exit "$EXIT_PROCESS_FAIL"
fi

if [[ "$pm2_parse_code" != "0" ]]; then
  log "fail pm2 status parse app=${APP_NAME} code=${pm2_parse_code}"
  exit "$EXIT_PROCESS_FAIL"
fi

if [[ "$pm2_status_line" != "online" ]]; then
  log "fail pm2 app status app=${APP_NAME} status=${pm2_status_line}"
  exit "$EXIT_PROCESS_FAIL"
fi

log "ok pm2 app status app=${APP_NAME} status=online"

while IFS= read -r local_url; do
  if ! probe_url "$local_url"; then
    exit "$EXIT_LOCAL_FAIL"
  fi
done < <(split_csv_lines "$LOCAL_URLS_CSV")

while IFS= read -r public_url; do
  if ! probe_url "$public_url"; then
    exit "$EXIT_PUBLIC_FAIL"
  fi
done < <(split_csv_lines "$PUBLIC_URLS_CSV")

log "healthy"
exit "$EXIT_OK"
