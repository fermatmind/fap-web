#!/usr/bin/env bash
set -euo pipefail

for name in DEPLOY_HOST DEPLOY_USER DEPLOY_PORT APP_DIR APP_NAME APP_PORT PUBLIC_BASE_URL DEPLOY_SHA \
  RELEASE_ARCHIVE_SHA256 RELEASE_MANIFEST_DIGEST ARTIFACT_DIGEST; do
  [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
done
[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]]
[[ "$APP_PORT" =~ ^[0-9]+$ ]]
[[ "$APP_DIR" =~ ^/[A-Za-z0-9._/-]+$ && "$APP_DIR" != *..* ]]
[[ "$APP_NAME" =~ ^[A-Za-z0-9._-]+$ ]]
[[ "$PUBLIC_BASE_URL" =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?$ ]]
[[ "$RELEASE_ARCHIVE_SHA256" =~ ^[0-9a-f]{64}$ ]]
[[ "$RELEASE_MANIFEST_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]
[[ "$ARTIFACT_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]
RELEASE_TRANSPORT_MODE="${RELEASE_TRANSPORT_MODE:-local}"
[[ "$RELEASE_TRANSPORT_MODE" == "local" || "$RELEASE_TRANSPORT_MODE" == "oss" ]]
if [[ "$RELEASE_TRANSPORT_MODE" == "local" ]]; then
  [[ -n "${RELEASE_ARCHIVE:-}" ]]
else
  for name in OSS_BUCKET OSS_INTERNAL_ENDPOINT OSS_REGION OSS_OBJECT_KEY OSS_ECS_ROLE_NAME; do
    [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
  done
  [[ "$OSS_BUCKET" =~ ^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$ ]]
  [[ "$OSS_INTERNAL_ENDPOINT" =~ ^https://oss-[a-z0-9-]+-internal\.aliyuncs\.com$ ]]
  [[ "$OSS_REGION" =~ ^cn-[a-z0-9-]+$ ]]
  [[ "$OSS_OBJECT_KEY" =~ ^[A-Za-z0-9._/-]+$ && "$OSS_OBJECT_KEY" != *..* ]]
  [[ "$OSS_ECS_ROLE_NAME" =~ ^[A-Za-z0-9._-]{1,64}$ ]]
fi
REQUIRE_LLMS_FULL_ARTIFACT="${REQUIRE_LLMS_FULL_ARTIFACT:-0}"
[[ "$REQUIRE_LLMS_FULL_ARTIFACT" =~ ^[01]$ ]]
REQUIRE_CONTENT_RELEASE_REVALIDATION="${REQUIRE_CONTENT_RELEASE_REVALIDATION:-0}"
[[ "$REQUIRE_CONTENT_RELEASE_REVALIDATION" =~ ^[01]$ ]]
local_runtime_config=""
if [[ "$REQUIRE_CONTENT_RELEASE_REVALIDATION" == "1" ]]; then
  runtime_tmp="$(mktemp -d "${RUNNER_TEMP:?}/content-release-runtime.XXXXXX")"
  local_runtime_config="$runtime_tmp/input.json"
  trap 'rm -f -- "$local_runtime_config"; rmdir -- "$runtime_tmp"' EXIT
  node .github/trunk/content-release-runtime.mjs from-env "$local_runtime_config"
fi

control="${APP_DIR%/}/.deploy-incoming/${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}-${DEPLOY_SHA:0:12}"
remote_archive="$control/fap-web-${DEPLOY_SHA}.tar.gz"
remote_llms_full_receipt="$control/llms-full-artifact-receipt.json"
local_llms_full_receipt="${LLMS_FULL_RECEIPT_LOCAL_PATH:-${RUNNER_TEMP:?}/llms-full-artifact-receipt.json}"
remote_outcome="$control/deploy-outcome.json"
remote_transport_duration="$control/transport-seconds"
local_outcome="${RUNNER_TEMP:?}/deploy-outcome.json"
ssh_args=(-o ServerAliveInterval=15 -o ServerAliveCountMax=4 -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -p "$DEPLOY_PORT")

ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$control' && chmod 700 '$control'"
control_files=(scripts/install_standalone_release.sh scripts/deploy_web_pm2.sh \
  scripts/rolling_reload_pm2.sh scripts/ops/verify-llms-full-artifact.mjs scripts/ops/career-current-inventory.mjs ecosystem.config.cjs .github/trunk/content-release-runtime.mjs \
  .github/trunk/fetch-oss-release.sh .github/trunk/install-ossutil.sh)
if [[ "$RELEASE_TRANSPORT_MODE" == "local" ]]; then control_files=("$RELEASE_ARCHIVE" "${control_files[@]}"); fi
scp -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -P "$DEPLOY_PORT" \
  "${control_files[@]}" "$DEPLOY_USER@$DEPLOY_HOST:$control/"

if [[ -n "$local_runtime_config" ]]; then
  scp -q -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -P "$DEPLOY_PORT" \
    "$local_runtime_config" "$DEPLOY_USER@$DEPLOY_HOST:$control/content-release-runtime.json"
fi
transport_status=0
if [[ "$RELEASE_TRANSPORT_MODE" == "oss" ]]; then
  set +e
  ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
    "chmod 700 '$control/fetch-oss-release.sh' '$control/install-ossutil.sh' && \
     ossutil_bin='$APP_DIR/.deploy-tools/ossutil-2.4.0/bin/ossutil' && \
     export OSS_BUCKET='$OSS_BUCKET' OSS_INTERNAL_ENDPOINT='$OSS_INTERNAL_ENDPOINT' \
       OSS_REGION='$OSS_REGION' OSS_OBJECT_KEY='$OSS_OBJECT_KEY' OSS_ECS_ROLE_NAME='$OSS_ECS_ROLE_NAME' DEPLOY_SHA='$DEPLOY_SHA' \
       RELEASE_ARCHIVE='$remote_archive' RELEASE_ARCHIVE_SHA256='$RELEASE_ARCHIVE_SHA256' \
       DEPLOY_OUTCOME_PATH='$remote_outcome' TRANSPORT_DURATION_FILE='$remote_transport_duration' && \
     if [ ! -x \"\$ossutil_bin\" ] && ! RUNNER_TEMP='$APP_DIR/.deploy-tools' bash '$control/install-ossutil.sh' >/dev/null; then \
       bash '$control/fetch-oss-release.sh'; exit \$?; \
     fi && \
     export PATH=\"\$(dirname \"\$ossutil_bin\"):\$PATH\" && \
     timeout --kill-after=30s 900 bash '$control/fetch-oss-release.sh'"
  transport_status=$?
  set -e
fi

if [[ "$transport_status" -eq 0 ]]; then
  set +e
  ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "chmod 700 '$control/'*.sh && install -m 0644 '$control/ecosystem.config.cjs' '$APP_DIR/ecosystem.config.cjs' && \
   APP_DIR='$APP_DIR' APP_USER='$DEPLOY_USER' APP_NAME='$APP_NAME' APP_PORT='$APP_PORT' \
   APP_MANAGER='${APP_MANAGER:-pm2}' SYSTEMD_SERVICE='${SYSTEMD_SERVICE:-fap-web.service}' \
   PUBLIC_BASE_URL='$PUBLIC_BASE_URL' DEPLOY_SHA='$DEPLOY_SHA' ARTIFACT_DIGEST='$ARTIFACT_DIGEST' \
   ARCHIVE_SHA256='$RELEASE_ARCHIVE_SHA256' RELEASE_MANIFEST_DIGEST='$RELEASE_MANIFEST_DIGEST' \
   RELEASE_ARCHIVE='$remote_archive' DEPLOY_SCRIPT='$control/deploy_web_pm2.sh' \
   TRANSPORT_SOURCE='$([[ "$RELEASE_TRANSPORT_MODE" == oss ]] && echo oss || echo github-artifact-scp)' \
   TRANSPORT_OBJECT_KEY='${OSS_OBJECT_KEY:-}' TRANSPORT_DURATION_FILE='$remote_transport_duration' \
   ROLLING_RELOAD_SCRIPT='$control/rolling_reload_pm2.sh' RUN_SITEMAP_HEALTH='${RUN_SITEMAP_HEALTH:-1}' \
   REQUIRE_LLMS_FULL_ARTIFACT='$REQUIRE_LLMS_FULL_ARTIFACT' \
   REQUIRE_CONTENT_RELEASE_REVALIDATION='$REQUIRE_CONTENT_RELEASE_REVALIDATION' \
   CONTENT_RELEASE_RUNTIME_SOURCE='$control/content-release-runtime.json' \
   CONTENT_RELEASE_RUNTIME_HELPER='$control/content-release-runtime.mjs' \
   LLMS_FULL_VERIFY_SCRIPT='$control/verify-llms-full-artifact.mjs' \
   DEPLOY_OUTCOME_PATH='$remote_outcome' \
   LLMS_FULL_RECEIPT_PATH='$remote_llms_full_receipt' LLMS_FULL_VERIFY_TIMEOUT_MS='330000' \
   REQUIRE_THIRD_PARTY_ANALYTICS_BOOTSTRAP='${REQUIRE_THIRD_PARTY_ANALYTICS_BOOTSTRAP:-1}' \
   REQUIRE_CAREER_RENDERER_REVISION='${REQUIRE_CAREER_RENDERER_REVISION:-1}' \
   CORE_PUBLIC_PATH='${CORE_PUBLIC_PATH:-/zh/personality/intj-a}' timeout --kill-after=360s 1800 bash '$control/install_standalone_release.sh'"
  transport_status=$?
  set -e
fi
# An interrupted SSH session is ambiguous. Reconnect only to read its exact-SHA
# outcome; never repeat installation or switching the active release.
for attempt in $(seq 1 24); do
  if scp -q -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -P "$DEPLOY_PORT" \
    "$DEPLOY_USER@$DEPLOY_HOST:$remote_outcome" "$local_outcome"; then
    if jq -e --arg sha "$DEPLOY_SHA" '.revision == $sha and (.status == "success" or .status == "failed")' "$local_outcome" >/dev/null; then
      break
    fi
  fi
  if [ "$transport_status" -ne 255 ]; then break; fi
  echo "deploy_reconciliation=waiting_for_remote_outcome attempt=$attempt"
  sleep 15
done
[[ -s "$local_outcome" ]] || { echo "deploy_reconciliation=outcome_missing" >&2; exit 1; }
jq -e --arg sha "$DEPLOY_SHA" '.schema_version == "fermatmind.deploy-outcome.v1" and .revision == $sha and .status == "success" and .phase == "complete" and .exit_code == 0' "$local_outcome" >/dev/null
curl --fail --silent --show-error --connect-timeout 10 --max-time 20 "$PUBLIC_BASE_URL/revision" \
  | jq -e --arg sha "$DEPLOY_SHA" '.revision == $sha' >/dev/null

if [ "$REQUIRE_LLMS_FULL_ARTIFACT" = 1 ]; then
  scp -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -P "$DEPLOY_PORT" \
    "$DEPLOY_USER@$DEPLOY_HOST:$remote_llms_full_receipt" "$local_llms_full_receipt"
  expected_career_count="$(node --input-type=module <<'NODE'
import { parseCareerCurrentInventory } from './scripts/ops/career-current-inventory.mjs';
const response = await fetch('https://api.fermatmind.com/api/v0.5/seo/sitemap-source', { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error('CAREER_CURRENT_INVENTORY_UNAVAILABLE');
console.log(parseCareerCurrentInventory(await response.json()).paths.length);
NODE
  )"
  jq -e --arg sha "$DEPLOY_SHA" --argjson career_count "$expected_career_count" '
    .schema_version == "fermatmind.llms-full-artifact-receipt.v1" and
    .revision == $sha and .mode == "complete" and .source == "cache" and
    (.body_sha256 | test("^[0-9a-f]{64}$")) and (.bytes | numbers and . > 0) and
    .counts.career == $career_count and .counts.big_five == 104 and .counts.enneagram == 116 and
    (.counts | keys | sort) == ["big_five","career","enneagram"] and
    (.duration_ms | numbers and . >= 0) and
    (keys | sort) == ["body_sha256","bytes","counts","duration_ms","mode","revision","schema_version","source","verified_at"]
  ' "$local_llms_full_receipt" >/dev/null
  if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "llms_full_receipt=$local_llms_full_receipt" >> "$GITHUB_OUTPUT"
  fi
fi
