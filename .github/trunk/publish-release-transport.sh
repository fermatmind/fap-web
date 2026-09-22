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
  local variant="$1" archive="$2" key archive_sha bytes head_output
  key="$(jq -r --arg variant "$variant" '.objects[$variant].object_key' "$RELEASE_TRANSPORT_RECEIPT")"
  archive_sha="$(jq -r --arg variant "$variant" '.objects[$variant].archive_sha256' "$RELEASE_TRANSPORT_RECEIPT")"
  bytes="$(jq -r --arg variant "$variant" '.objects[$variant].bytes' "$RELEASE_TRANSPORT_RECEIPT")"
  [[ "$key" == "$OSS_PREFIX/$GITHUB_SHA/$variant/fap-web-$GITHUB_SHA.tar.gz" ]]
  test "$(sha256sum "$archive" | awk '{print $1}')" = "$archive_sha"
  test "$(stat -c %s "$archive")" = "$bytes"
  head_output="$RUNNER_TEMP/oss-head-$variant.json"
  if ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken \
    api head-object --bucket "$OSS_BUCKET" --key "$key" --output-format json > "$head_output" 2>/dev/null; then
    verify_head_output "$head_output" "$bytes" "$archive_sha" "$GITHUB_SHA" "$variant"
    echo "immutable OSS object already exists with matching identity: $key"
    return
  fi
  ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken --retry-times 10 \
    api put-object --bucket "$OSS_BUCKET" --key "$key" --body "file://$archive" --forbid-overwrite \
    --metadata "sha256=$archive_sha" --metadata "release-sha=$GITHUB_SHA" \
    --metadata "release-variant=$variant"
  ossutil -e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken \
    api head-object --bucket "$OSS_BUCKET" --key "$key" --output-format json > "$head_output"
  verify_head_output "$head_output" "$bytes" "$archive_sha" "$GITHUB_SHA" "$variant"
}

verify_head_output() {
  local output="$1" expected_bytes="$2" expected_archive_sha="$3" expected_release_sha="$4" expected_variant="$5"
  jq -e \
    --arg expected_bytes "$expected_bytes" \
    --arg expected_archive_sha "$expected_archive_sha" \
    --arg expected_release_sha "$expected_release_sha" \
    --arg expected_variant "$expected_variant" '
      def normalized_entries:
        [.. | objects | to_entries[]? |
          {key: (.key | ascii_downcase | gsub("[^a-z0-9]"; "")), value: (.value | tostring)}];
      normalized_entries as $entries |
      any($entries[]; .key == "contentlength" and .value == $expected_bytes) and
      any($entries[]; .key == "sha256" and .value == $expected_archive_sha) and
      any($entries[]; .key == "releasesha" and .value == $expected_release_sha) and
      any($entries[]; .key == "releasevariant" and .value == $expected_variant)
    ' "$output" >/dev/null
}

started="$(date +%s)"
publish_one staging "$staging_archive"
publish_one production "$production_archive"
elapsed="$(( $(date +%s) - started ))"
echo "oss_publish_seconds=$elapsed"
