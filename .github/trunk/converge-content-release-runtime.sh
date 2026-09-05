#!/usr/bin/env bash
set -euo pipefail

for name in DEPLOY_HOST DEPLOY_USER DEPLOY_PORT APP_DIR APP_NAME DEPLOY_SHA GITHUB_RUN_ID GITHUB_RUN_ATTEMPT \
  CONTENT_RELEASE_REVALIDATE_SECRET CONTENT_RELEASE_REVALIDATE_REDIS_URL CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN; do
  [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
done
[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]]
[[ "$APP_DIR" == "/opt/apps/fap-web" ]]
[[ "$APP_NAME" == "fap-web" ]]
[[ "$GITHUB_RUN_ID" =~ ^[0-9]+$ ]]
[[ "$GITHUB_RUN_ATTEMPT" =~ ^[0-9]+$ ]]

receipt_dir="${RECEIPT_DIR:-content-release-runtime-receipts}"
mkdir -p "$receipt_dir"
chmod 700 "$receipt_dir"
preflight_receipt="$receipt_dir/preflight.json"
apply_receipt="$receipt_dir/apply.json"
ssh_args=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -p "$DEPLOY_PORT")

run_remote() {
  local mode="$1"
  local receipt="$2"
  local expected_env_sha256="${3:-}"
  local expected_runtime_fingerprint_sha256="${4:-}"
  local expected_credential_bundle_sha256="${5:-}"
  local authorization_phrase="${6:-}"

  {
    printf 'export MODE=%q\n' "$mode"
    printf 'export APP_DIR=%q\n' "$APP_DIR"
    printf 'export APP_NAME=%q\n' "$APP_NAME"
    printf 'export EXPECTED_CONTROL_PLANE_SHA=%q\n' "$DEPLOY_SHA"
    printf 'export EXPECTED_FRONTEND_SHA=%q\n' "$DEPLOY_SHA"
    printf 'export PREFLIGHT_RUN_ID=%q\n' "$GITHUB_RUN_ID"
    printf 'export PREFLIGHT_RUN_ATTEMPT=%q\n' "$GITHUB_RUN_ATTEMPT"
    printf 'export EXPECTED_ENV_SHA256=%q\n' "$expected_env_sha256"
    printf 'export EXPECTED_RUNTIME_FINGERPRINT_SHA256=%q\n' "$expected_runtime_fingerprint_sha256"
    printf 'export EXPECTED_CREDENTIAL_BUNDLE_SHA256=%q\n' "$expected_credential_bundle_sha256"
    printf 'export AUTHORIZATION_PHRASE=%q\n' "$authorization_phrase"
    printf 'export CONTENT_RELEASE_REVALIDATE_SECRET=%q\n' "$CONTENT_RELEASE_REVALIDATE_SECRET"
    printf 'export CONTENT_RELEASE_REVALIDATE_REDIS_URL=%q\n' "$CONTENT_RELEASE_REVALIDATE_REDIS_URL"
    printf 'export CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN=%q\n' "$CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN"
    cat scripts/content_release_revalidation_runtime_config.sh
  } | ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "bash -s" > "$receipt"
}

run_remote preflight "$preflight_receipt"
jq -e --arg sha "$DEPLOY_SHA" '
  .mode == "preflight"
  and .ok == true
  and .apply_ready == true
  and .active_frontend_sha == $sha
  and .expected_frontend_sha == $sha
  and .production_write_execution == false
  and .writes_committed == false
  and .application_deploy == false
  and .cache_revalidation == false
  and .secret_values_output == false
' "$preflight_receipt" >/dev/null

if jq -e '.runtime_credentials_match_source == true' "$preflight_receipt" >/dev/null; then
  jq -cS '. + {mode: "no-op", status: "PASS_RUNTIME_CONFIG_ALREADY_CONVERGED"}' \
    "$preflight_receipt" > "$apply_receipt"
  exit 0
fi

env_sha256="$(jq -r .env_sha256 "$preflight_receipt")"
runtime_fingerprint_sha256="$(jq -r .runtime_fingerprint_sha256 "$preflight_receipt")"
credential_bundle_sha256="$(jq -r .source_credential_bundle_sha256 "$preflight_receipt")"
for digest in "$env_sha256" "$runtime_fingerprint_sha256" "$credential_bundle_sha256"; do
  [[ "$digest" =~ ^[0-9a-f]{64}$ ]]
done

authorization_phrase="I explicitly approve fap-web content-release revalidation runtime config convergence from preflight run ${GITHUB_RUN_ID} attempt ${GITHUB_RUN_ATTEMPT} with control-plane SHA ${DEPLOY_SHA} active frontend SHA ${DEPLOY_SHA} environment SHA256 ${env_sha256} runtime fingerprint ${runtime_fingerprint_sha256} credential bundle SHA256 ${credential_bundle_sha256}; write only the three revalidation runtime settings, rolling reload only fap-web PM2, persist PM2 state, no application deploy/cache revalidation/CMS/backend/database/PR23/automatic rollback."

run_remote apply "$apply_receipt" "$env_sha256" "$runtime_fingerprint_sha256" \
  "$credential_bundle_sha256" "$authorization_phrase"
jq -e --arg sha "$DEPLOY_SHA" '
  .mode == "apply"
  and .ok == true
  and .status == "PASS_RUNTIME_CONFIG_CONVERGED"
  and .active_frontend_sha == $sha
  and .expected_frontend_sha == $sha
  and .runtime_credentials_match_source == true
  and .production_write_execution == true
  and .writes_committed == true
  and .runtime_setting_write_count == 3
  and .pm2_reload_committed == true
  and .pm2_state_persisted == true
  and .application_deploy == false
  and .cache_revalidation == false
  and .secret_values_output == false
' "$apply_receipt" >/dev/null
