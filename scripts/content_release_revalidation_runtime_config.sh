#!/usr/bin/env bash
set -euo pipefail

MODE="${MODE:-preflight}"
APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
MANAGED_APP_DIR="${MANAGED_APP_DIR:-/opt/apps/fap-web}"
APP_NAME="${APP_NAME:-fap-web}"
EXPECTED_CONTROL_PLANE_SHA="${EXPECTED_CONTROL_PLANE_SHA:-}"
EXPECTED_FRONTEND_SHA="${EXPECTED_FRONTEND_SHA:-}"
EXPECTED_ENV_SHA256="${EXPECTED_ENV_SHA256:-}"
EXPECTED_RUNTIME_FINGERPRINT_SHA256="${EXPECTED_RUNTIME_FINGERPRINT_SHA256:-}"
EXPECTED_CREDENTIAL_BUNDLE_SHA256="${EXPECTED_CREDENTIAL_BUNDLE_SHA256:-}"
PREFLIGHT_RUN_ID="${PREFLIGHT_RUN_ID:-}"
PREFLIGHT_RUN_ATTEMPT="${PREFLIGHT_RUN_ATTEMPT:-}"
AUTHORIZATION_PHRASE="${AUTHORIZATION_PHRASE:-}"
TARGET_ENV_FILE="${APP_DIR}/.env.production.local"
ZERO_SHA256="0000000000000000000000000000000000000000000000000000000000000000"
WRITES_COMMITTED=false
RUNTIME_SETTING_WRITE_COUNT=0
PM2_RELOAD_COMMITTED=false
PM2_STATE_PERSISTED=false
SECRET_PATTERN='^[A-Za-z0-9_-]+$'
REDIS_URL_PATTERN='^https://[A-Za-z0-9._~:/?&=%+-]+$'
REDIS_TOKEN_PATTERN='^[A-Za-z0-9._~+/=-]+$'

fail() {
  jq -cnS \
    --arg error_code "$1" \
    --argjson writes_committed "$WRITES_COMMITTED" \
    --argjson runtime_setting_write_count "$RUNTIME_SETTING_WRITE_COUNT" \
    --argjson pm2_reload_committed "$PM2_RELOAD_COMMITTED" \
    --argjson pm2_state_persisted "$PM2_STATE_PERSISTED" \
    '{
      ok: false,
      status: (if $writes_committed then "FAIL_CLOSED_PARTIAL_CONFIG_WRITE" else "FAIL_CLOSED_NO_WRITES" end),
      error_code: $error_code,
      writes_committed: $writes_committed,
      runtime_setting_write_count: $runtime_setting_write_count,
      pm2_reload_committed: $pm2_reload_committed,
      pm2_state_persisted: $pm2_state_persisted,
      application_deploy: false,
      cache_revalidation: false,
      automatic_rollback: false,
      secret_values_output: false
    }'
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "MISSING_REQUIRED_COMMAND"
}

file_sha256() {
  local file="$1"
  if [[ -f "$file" ]]; then
    sha256sum "$file" | cut -d' ' -f1
  else
    printf '%s' "$ZERO_SHA256"
  fi
}

credential_bundle_sha256() {
  local secret="$1"
  local redis_url="$2"
  local redis_token="$3"

  if [[ -z "$secret" || -z "$redis_url" || -z "$redis_token" ]]; then
    printf '%s' "$ZERO_SHA256"
    return
  fi

  printf '%s\0%s\0%s' "$secret" "$redis_url" "$redis_token" | sha256sum | cut -d' ' -f1
}

env_file_value() {
  local key="$1"
  local value

  [[ -f "$TARGET_ENV_FILE" ]] || return 0
  value="$(sed -n "s/^${key}=//p" "$TARGET_ENV_FILE" | tail -n 1)"
  value="${value#\"}"
  value="${value%\"}"
  printf '%s' "$value"
}

redis_read_preflight() {
  local redis_url="$1"
  local redis_token="$2"
  local response

  [[ -n "$redis_url" && -n "$redis_token" ]] || return 1
  response="$(curl --fail --silent --show-error --max-time 15 \
    --request POST \
    --header "Authorization: Bearer ${redis_token}" \
    "${redis_url%/}/GET/fap%3Arevalidate%3Aconfig-preflight%3Anonexistent" 2>/dev/null)" || return 1
  jq -e 'has("result")' <<<"$response" >/dev/null
}

pm2_safe_state() {
  local source_bundle_sha256="$1"

  PM2_JLIST="$(pm2 jlist 2>/dev/null || printf '[]')" \
    APP_NAME="$APP_NAME" \
    APP_DIR="$APP_DIR" \
    SOURCE_BUNDLE_SHA256="$source_bundle_sha256" \
    node <<'NODE'
const { createHash } = require("node:crypto");

const rows = JSON.parse(process.env.PM2_JLIST || "[]")
  .filter((row) => row && row.name === process.env.APP_NAME);
const bundle = (env) => {
  const secret = String(env.CONTENT_RELEASE_REVALIDATE_SECRET || "");
  const redisUrl = String(env.CONTENT_RELEASE_REVALIDATE_REDIS_URL || "");
  const redisToken = String(env.CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN || "");
  if (!secret || !redisUrl || !redisToken) return null;
  return createHash("sha256")
    .update(secret)
    .update("\0")
    .update(redisUrl)
    .update("\0")
    .update(redisToken)
    .digest("hex");
};
const configured = rows.filter((row) => bundle(row.pm2_env || {}) !== null);
const matching = configured.filter(
  (row) => bundle(row.pm2_env || {}) === process.env.SOURCE_BUNDLE_SHA256
);
const expectedExecPath = `${String(process.env.APP_DIR || "").replace(/\/$/, "")}/.next/standalone/server.js`;
const shapeMatching = rows.filter((row) => {
  const env = row.pm2_env || {};
  return String(env.pm_cwd || "").replace(/\/$/, "") === String(process.env.APP_DIR || "").replace(/\/$/, "")
    && String(env.pm_exec_path || "") === expectedExecPath
    && ["cluster", "cluster_mode"].includes(String(env.exec_mode || ""));
});
process.stdout.write(JSON.stringify({
  instance_count: rows.length,
  online_count: rows.filter((row) => row.pm2_env?.status === "online").length,
  configured_count: configured.length,
  matching_count: matching.length,
  shape_matching_count: shapeMatching.length,
}));
NODE
}

safe_state_json() {
  local source_secret="$1"
  local source_redis_url="$2"
  local source_redis_token="$3"
  local source_bundle_sha256="$4"
  local active_revision="$5"
  local env_sha256="$6"
  local pm2_state="$7"
  local env_secret
  local env_redis_url
  local env_redis_token
  local env_bundle_sha256
  local source_credentials_ready=false
  local redis_read_ok=false

  env_secret="$(env_file_value CONTENT_RELEASE_REVALIDATE_SECRET)"
  env_redis_url="$(env_file_value CONTENT_RELEASE_REVALIDATE_REDIS_URL)"
  env_redis_token="$(env_file_value CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN)"
  env_bundle_sha256="$(credential_bundle_sha256 "$env_secret" "$env_redis_url" "$env_redis_token")"

  if (( ${#source_secret} >= 32 && ${#source_secret} <= 256 )) \
    && [[ "$source_secret" =~ $SECRET_PATTERN ]] \
    && [[ "$source_redis_url" =~ $REDIS_URL_PATTERN ]] \
    && (( ${#source_redis_token} >= 16 && ${#source_redis_token} <= 2048 )) \
    && [[ "$source_redis_token" =~ $REDIS_TOKEN_PATTERN ]]; then
    source_credentials_ready=true
  fi
  if redis_read_preflight "$source_redis_url" "$source_redis_token"; then
    redis_read_ok=true
  fi

  jq -cnS \
    --arg schema_version "content_release_revalidation_runtime_config.v1" \
    --arg mode "$MODE" \
    --arg control_plane_sha "$EXPECTED_CONTROL_PLANE_SHA" \
    --arg active_frontend_sha "$active_revision" \
    --arg expected_frontend_sha "$EXPECTED_FRONTEND_SHA" \
    --arg env_sha256 "$env_sha256" \
    --arg source_credential_bundle_sha256 "$source_bundle_sha256" \
    --arg env_credential_bundle_sha256 "$env_bundle_sha256" \
    --argjson source_credentials_ready "$source_credentials_ready" \
    --argjson redis_read_ok "$redis_read_ok" \
    --argjson pm2 "$pm2_state" \
    '{
      schema_version: $schema_version,
      mode: $mode,
      control_plane_sha: $control_plane_sha,
      active_frontend_sha: $active_frontend_sha,
      expected_frontend_sha: $expected_frontend_sha,
      active_revision_matches: ($active_frontend_sha == $expected_frontend_sha),
      env_sha256: $env_sha256,
      source_credential_bundle_sha256: $source_credential_bundle_sha256,
      env_credential_bundle_sha256: $env_credential_bundle_sha256,
      source_credentials_ready: $source_credentials_ready,
      redis_read_ok: $redis_read_ok,
      pm2: $pm2,
      runtime_credentials_match_source: (
        $pm2.instance_count > 0
        and $pm2.configured_count == $pm2.instance_count
        and $pm2.matching_count == $pm2.instance_count
        and $pm2.shape_matching_count == $pm2.instance_count
      ),
      production_write_execution: false,
      writes_committed: false,
      application_deploy: false,
      cache_revalidation: false,
      automatic_rollback: false,
      secret_values_output: false
    }'
}

runtime_fingerprint_sha256() {
  jq -cS 'del(.mode, .runtime_fingerprint_sha256, .ok, .status, .apply_ready)' | sha256sum | cut -d' ' -f1
}

write_runtime_env() {
  local temp_file
  temp_file="${TARGET_ENV_FILE}.tmp.$$"
  umask 077

  TARGET_ENV_FILE="$TARGET_ENV_FILE" \
    TEMP_FILE="$temp_file" \
    node <<'NODE'
const fs = require("node:fs");

const target = process.env.TARGET_ENV_FILE;
const temp = process.env.TEMP_FILE;
const keys = [
  "CONTENT_RELEASE_REVALIDATE_SECRET",
  "CONTENT_RELEASE_REVALIDATE_REDIS_URL",
  "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN",
];
const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf8").split(/\r?\n/) : [];
const retained = existing.filter((line) => !keys.some((key) => line.startsWith(`${key}=`)));
while (retained.length > 0 && retained[retained.length - 1] === "") retained.pop();
for (const key of keys) {
  const value = String(process.env[key] || "");
  if (!value || /[\r\n]/.test(value)) throw new Error("invalid runtime credential value");
  retained.push(`${key}=${value}`);
}
fs.writeFileSync(temp, `${retained.join("\n")}\n`, { mode: 0o600, flag: "wx" });
fs.chmodSync(temp, 0o600);
fs.renameSync(temp, target);
NODE
}

require_command jq
require_command node
require_command sha256sum
require_command curl
require_command pm2

[[ "$MODE" == "preflight" || "$MODE" == "apply" ]] || fail "INVALID_MODE"
[[ "$EXPECTED_CONTROL_PLANE_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "INVALID_CONTROL_PLANE_SHA"
[[ "$EXPECTED_FRONTEND_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "INVALID_FRONTEND_SHA"
[[ "$APP_DIR" == "$MANAGED_APP_DIR" ]] || fail "UNMANAGED_APP_DIR"
[[ "$APP_NAME" == "fap-web" ]] || fail "UNMANAGED_APP_NAME"
[[ -d "$APP_DIR" && -f "$APP_DIR/REVISION" ]] || fail "INVALID_APP_DIR"

active_revision="$(tr -d '[:space:]' < "$APP_DIR/REVISION")"
env_sha256="$(file_sha256 "$TARGET_ENV_FILE")"
source_secret="${CONTENT_RELEASE_REVALIDATE_SECRET:-}"
source_redis_url="${CONTENT_RELEASE_REVALIDATE_REDIS_URL:-}"
source_redis_token="${CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN:-}"
source_bundle_sha256="$(credential_bundle_sha256 "$source_secret" "$source_redis_url" "$source_redis_token")"
if ! pm2_state="$(pm2_safe_state "$source_bundle_sha256")"; then
  fail "PM2_STATE_READ_FAILED"
fi
if ! state="$(safe_state_json \
  "$source_secret" \
  "$source_redis_url" \
  "$source_redis_token" \
  "$source_bundle_sha256" \
  "$active_revision" \
  "$env_sha256" \
  "$pm2_state")"; then
  fail "RUNTIME_STATE_BUILD_FAILED"
fi
runtime_fingerprint_sha256="$(printf '%s' "$state" | runtime_fingerprint_sha256)"
apply_ready="$(jq -r '
  .active_revision_matches
  and .source_credentials_ready
  and .redis_read_ok
  and .pm2.instance_count > 0
  and .pm2.online_count == .pm2.instance_count
  and .pm2.shape_matching_count == .pm2.instance_count
' <<<"$state")"

if [[ "$MODE" == "preflight" ]]; then
  jq -cS \
    --arg runtime_fingerprint_sha256 "$runtime_fingerprint_sha256" \
    --argjson apply_ready "$apply_ready" \
    '. + {
      ok: true,
      status: (if $apply_ready then "PASS_AUTHORIZATION_REQUIRED" else "PASS_PREFLIGHT_CONFIG_INPUT_REQUIRED" end),
      apply_ready: $apply_ready,
      runtime_fingerprint_sha256: $runtime_fingerprint_sha256
    }' <<<"$state"
  exit 0
fi

[[ "$EXPECTED_ENV_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "INVALID_EXPECTED_ENV_SHA256"
[[ "$EXPECTED_RUNTIME_FINGERPRINT_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "INVALID_EXPECTED_RUNTIME_FINGERPRINT"
[[ "$EXPECTED_CREDENTIAL_BUNDLE_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "INVALID_EXPECTED_CREDENTIAL_BUNDLE"
[[ "$PREFLIGHT_RUN_ID" =~ ^[0-9]+$ ]] || fail "INVALID_PREFLIGHT_RUN_ID"
[[ "$PREFLIGHT_RUN_ATTEMPT" =~ ^[0-9]+$ ]] || fail "INVALID_PREFLIGHT_RUN_ATTEMPT"
[[ "$env_sha256" == "$EXPECTED_ENV_SHA256" ]] || fail "ENV_FILE_DRIFT"
[[ "$runtime_fingerprint_sha256" == "$EXPECTED_RUNTIME_FINGERPRINT_SHA256" ]] || fail "RUNTIME_FINGERPRINT_DRIFT"
[[ "$source_bundle_sha256" == "$EXPECTED_CREDENTIAL_BUNDLE_SHA256" ]] || fail "CREDENTIAL_BUNDLE_DRIFT"
[[ "$apply_ready" == "true" ]] || fail "PREFLIGHT_NOT_READY"

expected_phrase="I explicitly approve fap-web content-release revalidation runtime config convergence from preflight run ${PREFLIGHT_RUN_ID} attempt ${PREFLIGHT_RUN_ATTEMPT} with control-plane SHA ${EXPECTED_CONTROL_PLANE_SHA} active frontend SHA ${EXPECTED_FRONTEND_SHA} environment SHA256 ${EXPECTED_ENV_SHA256} runtime fingerprint ${EXPECTED_RUNTIME_FINGERPRINT_SHA256} credential bundle SHA256 ${EXPECTED_CREDENTIAL_BUNDLE_SHA256}; write only the three revalidation runtime settings, rolling reload only fap-web PM2, persist PM2 state, no application deploy/cache revalidation/CMS/backend/database/PR23/automatic rollback."
[[ "$AUTHORIZATION_PHRASE" == "$expected_phrase" ]] || fail "AUTHORIZATION_PHRASE_MISMATCH"

if ! write_runtime_env; then
  fail "ENV_WRITE_FAILED"
fi
WRITES_COMMITTED=true
RUNTIME_SETTING_WRITE_COUNT=3
export CONTENT_RELEASE_REVALIDATE_SECRET="$source_secret"
export CONTENT_RELEASE_REVALIDATE_REDIS_URL="$source_redis_url"
export CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN="$source_redis_token"
pm2 reload "$APP_NAME" --update-env >/dev/null 2>&1 || fail "PM2_RELOAD_FAILED"
PM2_RELOAD_COMMITTED=true
pm2 save --force >/dev/null 2>&1 || fail "PM2_SAVE_FAILED"
PM2_STATE_PERSISTED=true

post_env_sha256="$(file_sha256 "$TARGET_ENV_FILE")"
if ! post_pm2_state="$(pm2_safe_state "$source_bundle_sha256")"; then
  fail "POST_PM2_STATE_READ_FAILED"
fi
if ! post_state="$(safe_state_json \
  "$source_secret" \
  "$source_redis_url" \
  "$source_redis_token" \
  "$source_bundle_sha256" \
  "$active_revision" \
  "$post_env_sha256" \
  "$post_pm2_state")"; then
  fail "POST_RUNTIME_STATE_BUILD_FAILED"
fi
post_runtime_fingerprint_sha256="$(printf '%s' "$post_state" | runtime_fingerprint_sha256)"
post_ok="$(jq -r '
  .active_revision_matches
  and .source_credentials_ready
  and .redis_read_ok
  and .runtime_credentials_match_source
  and .pm2.instance_count > 0
  and .pm2.online_count == .pm2.instance_count
  and .pm2.shape_matching_count == .pm2.instance_count
' <<<"$post_state")"
[[ "$post_ok" == "true" ]] || fail "POST_APPLY_VERIFICATION_FAILED"

jq -cS \
  --arg runtime_fingerprint_sha256 "$post_runtime_fingerprint_sha256" \
  '. + {
    ok: true,
    status: "PASS_RUNTIME_CONFIG_CONVERGED",
    runtime_fingerprint_sha256: $runtime_fingerprint_sha256,
    production_write_execution: true,
    writes_committed: true,
    runtime_setting_write_count: 3,
    pm2_reload_committed: true,
    pm2_state_persisted: true
  }' <<<"$post_state"
