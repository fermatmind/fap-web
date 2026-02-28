#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-${APP_NAME:-fap-web}}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
PM2_BIN="${PM2_BIN:-pm2}"
PM2_CONFIG="${PM2_CONFIG:-${APP_DIR}/ecosystem.config.cjs}"
ROLLING_TIMEOUT_SEC="${ROLLING_TIMEOUT_SEC:-60}"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[rolling_reload_pm2] %s %s\n' "$(timestamp)" "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit 1
  fi
}

resolve_desired_instances() {
  local raw="${PM2_INSTANCES:-2}"
  if [[ ! "$raw" =~ ^[0-9]+$ ]]; then
    printf '2'
    return
  fi
  if (( raw < 2 )); then
    printf '2'
    return
  fi
  printf '%s' "$raw"
}

pm2_counts() {
  "$PM2_BIN" jlist 2>/dev/null | node -e '
const fs = require("fs");
const app = process.argv[1];
const raw = fs.readFileSync(0, "utf8");
let rows = [];
try {
  rows = JSON.parse(raw);
} catch {
  process.stdout.write("0 0 0");
  process.exit(0);
}
const appRows = rows.filter((item) => item && item.name === app);
const total = appRows.length;
const online = appRows.filter(
  (item) => item && item.pm2_env && item.pm2_env.status === "online"
).length;
const exists = total > 0 ? 1 : 0;
process.stdout.write(`${exists} ${online} ${total}`);
' "$APP_NAME"
}

wait_for_online() {
  local desired="$1"
  local deadline
  deadline="$(( $(date +%s) + ROLLING_TIMEOUT_SEC ))"

  while (( $(date +%s) <= deadline )); do
    local exists online total
    read -r exists online total < <(pm2_counts)
    if (( exists == 1 && total >= desired && online == total )); then
      log "healthy app=${APP_NAME} online=${online}/${total}"
      return 0
    fi
    sleep 1
  done

  local exists online total
  read -r exists online total < <(pm2_counts)
  log "timeout waiting online app=${APP_NAME} online=${online}/${total} expected_min=${desired}"
  return 1
}

require_bin "$PM2_BIN"
require_bin node

if [[ ! -f "$PM2_CONFIG" ]]; then
  log "missing PM2 config: ${PM2_CONFIG}"
  exit 1
fi

DESIRED_INSTANCES="$(resolve_desired_instances)"
read -r app_exists app_online app_total < <(pm2_counts)

if (( app_exists == 0 )); then
  log "app not found in PM2, starting from config"
  "$PM2_BIN" start "$PM2_CONFIG" --only "$APP_NAME" --update-env >/dev/null
else
  log "rolling reload app=${APP_NAME} online=${app_online}/${app_total}"
  if ! "$PM2_BIN" reload "$APP_NAME" --update-env >/dev/null; then
    log "reload failed, fallback to restart app=${APP_NAME}"
    "$PM2_BIN" restart "$APP_NAME" --update-env >/dev/null
  fi
fi

read -r app_exists app_online app_total < <(pm2_counts)
if (( app_total < DESIRED_INSTANCES )); then
  log "scale app=${APP_NAME} current=${app_total} target=${DESIRED_INSTANCES}"
  "$PM2_BIN" scale "$APP_NAME" "$DESIRED_INSTANCES" >/dev/null
fi

wait_for_online "$DESIRED_INSTANCES"
