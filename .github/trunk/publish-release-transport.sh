#!/usr/bin/env bash
set -euo pipefail

for name in OSS_BUCKET OSS_PUBLIC_ENDPOINT OSS_REGION OSS_PREFIX RELEASE_TRANSPORT_RECEIPT \
  STAGING_RELEASE_ARCHIVE PRODUCTION_RELEASE_ARCHIVE; do
  [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
done
[[ "$OSS_BUCKET" =~ ^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$ ]]
[[ "$OSS_PUBLIC_ENDPOINT" =~ ^https://oss-[a-z0-9-]+\.aliyuncs\.com$ ]]
[[ "$OSS_REGION" =~ ^cn-[a-z0-9-]+$ ]]
[[ "$OSS_PREFIX" =~ ^[A-Za-z0-9._/-]+$ && "$OSS_PREFIX" != *..* ]]

staging_archive="$STAGING_RELEASE_ARCHIVE"
production_archive="$PRODUCTION_RELEASE_ARCHIVE"
staging_artifact_digest="$(jq -r '.objects.staging.github_artifact_digest' "$RELEASE_TRANSPORT_RECEIPT")"
production_artifact_digest="$(jq -r '.objects.production.github_artifact_digest' "$RELEASE_TRANSPORT_RECEIPT")"
node .github/trunk/release-transport.mjs verify \
  --receipt="$RELEASE_TRANSPORT_RECEIPT" --sha="$GITHUB_SHA" --ci-run-id="$GITHUB_RUN_ID" --prefix="$OSS_PREFIX" \
  --staging-artifact-digest="$staging_artifact_digest" \
  --production-artifact-digest="$production_artifact_digest"

publish_one() {
  local variant="$1" archive="$2" key archive_sha bytes stat_output
  key="$(jq -r --arg variant "$variant" '.objects[$variant].object_key' "$RELEASE_TRANSPORT_RECEIPT")"
  archive_sha="$(jq -r --arg variant "$variant" '.objects[$variant].archive_sha256' "$RELEASE_TRANSPORT_RECEIPT")"
  bytes="$(jq -r --arg variant "$variant" '.objects[$variant].bytes' "$RELEASE_TRANSPORT_RECEIPT")"
  [[ "$key" == "$OSS_PREFIX/$GITHUB_SHA/$variant/fap-web-$GITHUB_SHA.tar.gz" ]]
  test "$(sha256sum "$archive" | awk '{print $1}')" = "$archive_sha"
  test "$(stat -c %s "$archive")" = "$bytes"
  stat_output="$RUNNER_TEMP/oss-stat-$variant.txt"
  if ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken \
    stat "oss://$OSS_BUCKET/$key" > "$stat_output" 2>/dev/null; then
    grep -Eiq "Content-Length[^0-9]+$bytes([^0-9]|$)" "$stat_output"
    grep -Eiq "x-oss-meta-sha256[^0-9a-f]+$archive_sha([^0-9a-f]|$)" "$stat_output"
    grep -Eiq "x-oss-meta-release-sha[^0-9a-f]+$GITHUB_SHA([^0-9a-f]|$)" "$stat_output"
    grep -Eiq "x-oss-meta-release-variant[^A-Za-z]+$variant([^A-Za-z]|$)" "$stat_output"
    echo "immutable OSS object already exists with matching identity: $key"
    return
  fi
  ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken --retry-times 10 \
    api put-object --bucket "$OSS_BUCKET" --key "$key" --body "file://$archive" --forbid-overwrite \
    --metadata "sha256=$archive_sha" --metadata "release-sha=$GITHUB_SHA" \
    --metadata "release-variant=$variant"
  ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken \
    stat "oss://$OSS_BUCKET/$key" > "$stat_output"
  grep -Eiq "Content-Length[^0-9]+$bytes([^0-9]|$)" "$stat_output"
  grep -Eiq "x-oss-meta-sha256[^0-9a-f]+$archive_sha([^0-9a-f]|$)" "$stat_output"
  grep -Eiq "x-oss-meta-release-sha[^0-9a-f]+$GITHUB_SHA([^0-9a-f]|$)" "$stat_output"
  grep -Eiq "x-oss-meta-release-variant[^A-Za-z]+$variant([^A-Za-z]|$)" "$stat_output"
}

started="$(date +%s)"
publish_one staging "$staging_archive"
publish_one production "$production_archive"
elapsed="$(( $(date +%s) - started ))"
echo "oss_publish_seconds=$elapsed"
