#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-fap-web}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
PM2_BIN="${PM2_BIN:-pm2}"
AUTOHEAL_COOLDOWN_SEC="${AUTOHEAL_COOLDOWN_SEC:-600}"
AUTOHEAL_STATE_FILE="${AUTOHEAL_STATE_FILE:-/tmp/fap-web-autoheal.last}"
WECOM_BOT_WEBHOOK="${WECOM_BOT_WEBHOOK:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HEALTHCHECK_SCRIPT="${HEALTHCHECK_SCRIPT:-${SCRIPT_DIR}/healthcheck_web.sh}"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[autoheal_pm2] %s %s\n' "$(timestamp)" "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit 1
  fi
}

escape_json() {
  sed ':a;N;$!ba;s/\\/\\\\/g;s/"/\\"/g;s/\n/\\n/g'
}

send_wecom_alert() {
  local title="$1"
  local body="$2"

  if [[ -z "$WECOM_BOT_WEBHOOK" ]]; then
    log "skip wecom alert (WECOM_BOT_WEBHOOK is empty)"
    return 0
  fi

  local hostname_short
  local content
  local payload
  hostname_short="$(hostname -s 2>/dev/null || hostname)"
  content="${title}
time=$(timestamp)
host=${hostname_short}
app=${APP_NAME}
${body}"

  payload="$(printf '%s' "$content" | escape_json)"
  if ! curl -fsS -X POST "$WECOM_BOT_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"${payload}\"}}" >/dev/null; then
    log "wecom alert failed"
  fi
  return 0
}

failure_label_from_code() {
  case "$1" in
    1) printf 'local endpoint failure' ;;
    2) printf 'public endpoint failure' ;;
    3) printf 'pm2 process failure' ;;
    *) printf 'unknown failure' ;;
  esac
}

recent_pm2_summary() {
  local summary
  summary="$("$PM2_BIN" logs "$APP_NAME" --lines 20 --nostream 2>/dev/null | tail -n 12 || true)"
  if [[ -z "$summary" ]]; then
    printf 'no recent pm2 logs'
    return 0
  fi
  printf '%s' "$summary" | tr '\n' ';' | sed 's/;/; /g' | cut -c1-900
}

in_cooldown() {
  local now last elapsed
  now="$(date +%s)"
  if [[ ! -f "$AUTOHEAL_STATE_FILE" ]]; then
    return 1
  fi
  last="$(cat "$AUTOHEAL_STATE_FILE" 2>/dev/null || true)"
  if [[ -z "$last" || ! "$last" =~ ^[0-9]+$ ]]; then
    return 1
  fi
  elapsed="$((now - last))"
  if (( elapsed < AUTOHEAL_COOLDOWN_SEC )); then
    return 0
  fi
  return 1
}

mark_restart_attempt() {
  date +%s > "$AUTOHEAL_STATE_FILE"
}

attempt_recover() {
  if "$PM2_BIN" restart "$APP_NAME" >/dev/null 2>&1; then
    return 0
  fi

  # Fallback for cases where the app disappeared from pm2 list.
  if [[ -f "${APP_DIR}/ecosystem.config.cjs" ]]; then
    "$PM2_BIN" start "${APP_DIR}/ecosystem.config.cjs" --only "$APP_NAME" >/dev/null 2>&1 || return 1
    return 0
  fi
  return 1
}

require_bin "$PM2_BIN"
require_bin curl
require_bin sed
require_bin cut
require_bin tail

if [[ ! -x "$HEALTHCHECK_SCRIPT" ]]; then
  log "healthcheck script is not executable: ${HEALTHCHECK_SCRIPT}"
  exit 1
fi

healthcheck_output=""
if healthcheck_output="$("$HEALTHCHECK_SCRIPT" 2>&1)"; then
  log "healthcheck passed"
  exit 0
fi

healthcheck_exit_code="$?"
failure_label="$(failure_label_from_code "$healthcheck_exit_code")"
pm2_summary="$(recent_pm2_summary)"

if in_cooldown; then
  log "skip restart due cooldown (${AUTOHEAL_COOLDOWN_SEC}s)"
  send_wecom_alert "fap-web autoheal cooldown skip" \
    "failure=${failure_label}
check_output=${healthcheck_output}
pm2_recent=${pm2_summary}
auto_recovered=no
action=skip_restart_due_cooldown"
  exit "$healthcheck_exit_code"
fi

send_wecom_alert "fap-web healthcheck failed" \
  "failure=${failure_label}
check_output=${healthcheck_output}
pm2_recent=${pm2_summary}
auto_recovered=pending
action=restart_pm2"

mark_restart_attempt
if ! attempt_recover; then
  pm2_summary_after="$(recent_pm2_summary)"
  send_wecom_alert "fap-web autoheal failed" \
    "failure=${failure_label}
check_output=${healthcheck_output}
pm2_recent=${pm2_summary_after}
auto_recovered=no
action=restart_failed"
  exit "$healthcheck_exit_code"
fi

post_health_output=""
if post_health_output="$("$HEALTHCHECK_SCRIPT" 2>&1)"; then
  send_wecom_alert "fap-web autoheal recovered" \
    "failure=${failure_label}
check_output_after=${post_health_output}
pm2_recent=$(recent_pm2_summary)
auto_recovered=yes
action=restart_succeeded"
  exit 0
fi

send_wecom_alert "fap-web autoheal unstable" \
  "failure=${failure_label}
check_output_after=${post_health_output}
pm2_recent=$(recent_pm2_summary)
auto_recovered=no
action=restart_succeeded_but_healthcheck_failed"
exit "$healthcheck_exit_code"
