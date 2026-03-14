#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-${APP_NAME:-fap-web}}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
PM2_BIN="${PM2_BIN:-pm2}"
PM2_CONFIG="${PM2_CONFIG:-${APP_DIR}/ecosystem.config.cjs}"
ROLLING_TIMEOUT_SEC="${ROLLING_TIMEOUT_SEC:-60}"
EXPECTED_EXEC_PATH="${APP_DIR%/}/.next/standalone/server.js"
EXPECTED_EXEC_MODE="cluster"

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

current_app_shape() {
  local raw
  raw="$("$PM2_BIN" jlist 2>/dev/null || true)"
  printf '%s' "$raw" | node -e '
const fs = require("fs");
const app = process.argv[1];
const raw = fs.readFileSync(0, "utf8");
let rows = [];
try {
  rows = JSON.parse(raw);
} catch {
  process.stdout.write("-\t0\t-\tnot_found\n");
  process.exit(0);
}
const appRows = rows.filter((item) => item && item.name === app);
const total = appRows.length;
const online = appRows.filter(
  (item) => item && item.pm2_env && item.pm2_env.status === "online"
).length;
const modes = [...new Set(
  appRows
    .map((item) => String(item && item.pm2_env && item.pm2_env.exec_mode ? item.pm2_env.exec_mode : ""))
    .filter(Boolean)
    .map((value) => value.replace(/_mode$/, ""))
)];
const paths = [...new Set(
  appRows
    .map((item) => String(item && item.pm2_env && item.pm2_env.pm_exec_path ? item.pm2_env.pm_exec_path : ""))
    .filter(Boolean)
)];
const mode = modes.length === 1 ? modes[0] : (modes.length > 1 ? "mixed" : "-");
const path = paths.length === 1 ? paths[0] : (paths.length > 1 ? "mixed" : "-");
const status = total === 0 ? "not_found" : (online === total ? "online" : "degraded");
process.stdout.write([mode, total, path, status].join("\t") + "\n");
' "$APP_NAME"
}

load_current_app_shape() {
  local line

  line="$(current_app_shape)"
  [[ -n "$line" ]]
  IFS=$'\t' read -r CURRENT_MODE CURRENT_INSTANCES CURRENT_PATH CURRENT_STATUS <<< "$line"
  [[ -n "${CURRENT_MODE:-}" ]]
  [[ -n "${CURRENT_INSTANCES:-}" ]]
  [[ -n "${CURRENT_PATH:-}" ]]
  [[ -n "${CURRENT_STATUS:-}" ]]
}

app_exists() {
  load_current_app_shape
  [[ "$CURRENT_STATUS" != "not_found" ]]
}

app_is_drifted() {
  load_current_app_shape
  if [[ "$CURRENT_STATUS" != "online" ]]; then
    return 0
  fi
  if [[ "$CURRENT_MODE" != "$EXPECTED_EXEC_MODE" ]]; then
    return 0
  fi
  if [[ "$CURRENT_PATH" != "$EXPECTED_EXEC_PATH" ]]; then
    return 0
  fi
  if (( CURRENT_INSTANCES < DESIRED_INSTANCES )); then
    return 0
  fi
  return 1
}

recreate_from_config() {
  log "detected drift, recreating from ecosystem config mode=${CURRENT_MODE} instances=${CURRENT_INSTANCES} path=${CURRENT_PATH} status=${CURRENT_STATUS}"
  "$PM2_BIN" delete "$APP_NAME" >/dev/null 2>&1 || true
  "$PM2_BIN" start "$PM2_CONFIG" --only "$APP_NAME" --update-env >/dev/null
}

reload_existing_app() {
  log "app already aligned, performing rolling reload"
  if ! "$PM2_BIN" reload "$APP_NAME" --update-env >/dev/null; then
    log "reload failed, fallback to restart app=${APP_NAME}"
    "$PM2_BIN" restart "$APP_NAME" --update-env >/dev/null
  fi
}

assert_app_converged() {
  local deadline
  deadline="$(( $(date +%s) + ROLLING_TIMEOUT_SEC ))"

  while (( $(date +%s) <= deadline )); do
    load_current_app_shape
    log "post-check: mode=${CURRENT_MODE}, instances=${CURRENT_INSTANCES}, path=${CURRENT_PATH}, status=${CURRENT_STATUS}"
    if [[ "$CURRENT_STATUS" == "online" ]] \
      && [[ "$CURRENT_MODE" == "$EXPECTED_EXEC_MODE" ]] \
      && [[ "$CURRENT_PATH" == "$EXPECTED_EXEC_PATH" ]] \
      && (( CURRENT_INSTANCES >= DESIRED_INSTANCES )); then
      log "convergence succeeded"
      return 0
    fi
    sleep 1
  done

  load_current_app_shape
  log "post-check: mode=${CURRENT_MODE}, instances=${CURRENT_INSTANCES}, path=${CURRENT_PATH}, status=${CURRENT_STATUS}"
  log "convergence failed expected_mode=${EXPECTED_EXEC_MODE} expected_min_instances=${DESIRED_INSTANCES} expected_path=${EXPECTED_EXEC_PATH}"
  return 1
}

require_bin "$PM2_BIN"
require_bin node

if [[ ! -f "$PM2_CONFIG" ]]; then
  log "missing PM2 config: ${PM2_CONFIG}"
  exit 1
fi

DESIRED_INSTANCES="$(resolve_desired_instances)"
CURRENT_MODE="-"
CURRENT_INSTANCES="0"
CURRENT_PATH="-"
CURRENT_STATUS="not_found"

if ! app_exists; then
  log "app not found, starting from ecosystem config"
  "$PM2_BIN" start "$PM2_CONFIG" --only "$APP_NAME" --update-env >/dev/null
elif app_is_drifted; then
  recreate_from_config
else
  reload_existing_app
fi

assert_app_converged
