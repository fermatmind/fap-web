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
ossutil_args=(-e "$OSS_PUBLIC_ENDPOINT" --region "$OSS_REGION" --mode StsToken \
  --connect-timeout 10 --read-timeout 60 --retry-times 2)
staging_artifact_digest="$(jq -r '.objects.staging.github_artifact_digest' "$RELEASE_TRANSPORT_RECEIPT")"
production_artifact_digest="$(jq -r '.objects.production.github_artifact_digest' "$RELEASE_TRANSPORT_RECEIPT")"
node .github/trunk/release-transport.mjs verify \
  --receipt="$RELEASE_TRANSPORT_RECEIPT" --sha="$GITHUB_SHA" --ci-run-id="$GITHUB_RUN_ID" --prefix="$OSS_PREFIX" \
  --staging-artifact-digest="$staging_artifact_digest" \
  --production-artifact-digest="$production_artifact_digest"

head_object() {
  local key="$1" output="$2"
  timeout --signal=TERM --kill-after=5s 45s ossutil "${ossutil_args[@]}" \
    api head-object --bucket "$OSS_BUCKET" --key "$key" --output-format json > "$output" 2>/dev/null
}

publish_one() {
  local variant="$1" archive="$2" key archive_sha bytes head_output put_status attempt
  key="$(jq -r --arg variant "$variant" '.objects[$variant].object_key' "$RELEASE_TRANSPORT_RECEIPT")"
  archive_sha="$(jq -r --arg variant "$variant" '.objects[$variant].archive_sha256' "$RELEASE_TRANSPORT_RECEIPT")"
  bytes="$(jq -r --arg variant "$variant" '.objects[$variant].bytes' "$RELEASE_TRANSPORT_RECEIPT")"
  [[ "$key" == "$OSS_PREFIX/$GITHUB_SHA/$variant/fap-web-$GITHUB_SHA.tar.gz" ]]
  test "$(sha256sum "$archive" | awk '{print $1}')" = "$archive_sha"
  test "$(wc -c < "$archive" | awk '{print $1}')" = "$bytes"
  head_output="$RUNNER_TEMP/oss-head-$variant.json"
  echo "oss_transport_phase=check variant=$variant"
  if head_object "$key" "$head_output"; then
    verify_head_output "$head_output" "$bytes" "$archive_sha" "$GITHUB_SHA" "$variant"
    echo "oss_transport_status=verified_existing variant=$variant"
    return
  fi
  # A timed-out PUT may have committed. Reconcile by HEAD before one bounded retry.
  for attempt in 1 2; do
    put_status=0
    echo "oss_transport_phase=put variant=$variant attempt=$attempt"
    timeout --signal=TERM --kill-after=5s 5m ossutil "${ossutil_args[@]}" \
      api put-object --bucket "$OSS_BUCKET" --key "$key" --body "file://$archive" --forbid-overwrite \
      --metadata "sha256=$archive_sha" --metadata "release-sha=$GITHUB_SHA" \
      --metadata "release-variant=$variant" || put_status=$?
    if (( put_status != 0 )); then
      echo "oss_transport_status=put_uncertain variant=$variant attempt=$attempt exit_code=$put_status" >&2
    fi
    echo "oss_transport_phase=verify variant=$variant attempt=$attempt"
    if head_object "$key" "$head_output"; then
      verify_head_output "$head_output" "$bytes" "$archive_sha" "$GITHUB_SHA" "$variant"
      echo "oss_transport_status=verified variant=$variant attempt=$attempt"
      return
    fi
    if (( attempt == 2 )); then
      echo "oss_transport_status=unverified variant=$variant" >&2
      return 1
    fi
    echo "oss_transport_status=retry_unverified variant=$variant" >&2
  done
}

verify_head_output() {
  local output="$1" expected_bytes="$2" expected_archive_sha="$3" expected_release_sha="$4" expected_variant="$5"
  local normalized_output="${output}.normalized.json"
  node -e '
    const fs = require("node:fs");
    const raw = fs.readFileSync(process.argv[1], "utf8");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("OSS HeadObject did not return JSON");
    const value = JSON.parse(raw.slice(start, end + 1));
    fs.writeFileSync(process.argv[2], `${JSON.stringify(value)}\n`);
  ' "$output" "$normalized_output"
  if ! jq -e \
    --arg expected_bytes "$expected_bytes" \
    --arg expected_archive_sha "$expected_archive_sha" \
    --arg expected_release_sha "$expected_release_sha" \
    --arg expected_variant "$expected_variant" '
      def normalized_entries:
        [paths(scalars) as $path |
          {key: (($path | map(select(type == "string")) | last) | ascii_downcase | gsub("[^a-z0-9]"; "")),
           value: (getpath($path) | tostring)}];
      normalized_entries as $entries |
      any($entries[]; .key == "contentlength" and .value == $expected_bytes) and
      any($entries[]; (.key == "sha256" or .key == "xossmetasha256") and .value == $expected_archive_sha) and
      any($entries[]; (.key == "releasesha" or .key == "xossmetareleasesha") and .value == $expected_release_sha) and
      any($entries[]; (.key == "releasevariant" or .key == "xossmetareleasevariant") and .value == $expected_variant)
    ' "$normalized_output" >/dev/null; then
    echo "OSS HeadObject response did not contain the required release identity; scalar fields:" >&2
    jq -r '[paths(scalars) | map(tostring) | join(".")] | unique[]' "$normalized_output" >&2
    return 1
  fi
}

started="$(date +%s)"
publish_one staging "$staging_archive"
publish_one production "$production_archive"
elapsed="$(( $(date +%s) - started ))"
echo "oss_publish_seconds=$elapsed"
