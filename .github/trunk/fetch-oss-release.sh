#!/usr/bin/env bash
set -euo pipefail

for name in OSS_BUCKET OSS_INTERNAL_ENDPOINT OSS_REGION OSS_OBJECT_KEY OSS_ECS_ROLE_NAME DEPLOY_SHA \
  RELEASE_ARCHIVE RELEASE_ARCHIVE_SHA256 DEPLOY_OUTCOME_PATH TRANSPORT_DURATION_FILE; do
  [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
done
[[ "$OSS_BUCKET" =~ ^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$ ]]
[[ "$OSS_INTERNAL_ENDPOINT" =~ ^https://oss-[a-z0-9-]+-internal\.aliyuncs\.com$ ]]
[[ "$OSS_REGION" =~ ^cn-[a-z0-9-]+$ ]]
[[ "$OSS_OBJECT_KEY" =~ ^[A-Za-z0-9._/-]+$ && "$OSS_OBJECT_KEY" != *..* ]]
[[ "$OSS_ECS_ROLE_NAME" =~ ^[A-Za-z0-9._-]{1,64}$ ]]
[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$RELEASE_ARCHIVE_SHA256" =~ ^[0-9a-f]{64}$ ]]
[[ "$RELEASE_ARCHIVE" == /* && "$RELEASE_ARCHIVE" != *..* ]]
[[ "$DEPLOY_OUTCOME_PATH" == /* && "$DEPLOY_OUTCOME_PATH" != *..* ]]
[[ "$TRANSPORT_DURATION_FILE" == /* && "$TRANSPORT_DURATION_FILE" != *..* ]]

started="$(date +%s)"
partial="${RELEASE_ARCHIVE}.part"
checkpoint="$(dirname "$RELEASE_ARCHIVE")/.ossutil-checkpoint"
mkdir -p "$(dirname "$RELEASE_ARCHIVE")" "$checkpoint"

write_failure() {
  local code="$1" elapsed
  elapsed="$(( $(date +%s) - started ))"
  printf '{"schema_version":"fermatmind.deploy-outcome.v1","revision":"%s","status":"failed","phase":"transport","exit_code":%s,"signal":"none","rollback":"not_needed","transport_source":"oss","transport_object_key":"%s","transport_seconds":%s,"archive_sha256":"%s"}\n' \
    "$DEPLOY_SHA" "$code" "$OSS_OBJECT_KEY" "$elapsed" "$RELEASE_ARCHIVE_SHA256" > "${DEPLOY_OUTCOME_PATH}.tmp"
  chmod 600 "${DEPLOY_OUTCOME_PATH}.tmp"
  mv -f "${DEPLOY_OUTCOME_PATH}.tmp" "$DEPLOY_OUTCOME_PATH"
}
trap 'code=$?; if [[ $code -ne 0 ]]; then write_failure "$code"; fi' EXIT

command -v ossutil >/dev/null 2>&1 || { echo "missing dependency: ossutil" >&2; exit 2; }
command -v sha256sum >/dev/null 2>&1 || { echo "missing dependency: sha256sum" >&2; exit 2; }
command -v curl >/dev/null 2>&1 || { echo "missing dependency: curl" >&2; exit 2; }

metadata_token="$(curl -fsS -X PUT -H 'X-aliyun-ecs-metadata-token-ttl-seconds: 1800' \
  http://100.100.100.200/latest/api/token)"
actual_role="$(curl -fsS -H "X-aliyun-ecs-metadata-token: $metadata_token" \
  http://100.100.100.200/latest/meta-data/ram/security-credentials/)"
[[ "$actual_role" == "$OSS_ECS_ROLE_NAME" ]]

ossutil -e "$OSS_INTERNAL_ENDPOINT" --region "$OSS_REGION" --mode EcsRamRole \
  cp -f "oss://$OSS_BUCKET/$OSS_OBJECT_KEY" "$partial" \
  --bigfile-threshold=10Mi --part-size=8Mi --parallel=4 --retry-times=10 \
  --checkpoint-dir="$checkpoint"
actual_sha="$(sha256sum "$partial" | awk '{print $1}')"
[[ "$actual_sha" == "$RELEASE_ARCHIVE_SHA256" ]]
mv -f "$partial" "$RELEASE_ARCHIVE"
elapsed="$(( $(date +%s) - started ))"
printf '%s\n' "$elapsed" > "${TRANSPORT_DURATION_FILE}.tmp"
chmod 600 "${TRANSPORT_DURATION_FILE}.tmp"
mv -f "${TRANSPORT_DURATION_FILE}.tmp" "$TRANSPORT_DURATION_FILE"
trap - EXIT
