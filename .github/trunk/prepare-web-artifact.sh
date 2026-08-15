#!/usr/bin/env bash
set -euo pipefail

: "${ARTIFACT_ID:?}"
: "${EXPECTED_ARTIFACT_DIGEST:?}"
: "${DEPLOY_SHA:?}"
: "${GH_TOKEN:?}"

[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$EXPECTED_ARTIFACT_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]

root="$RUNNER_TEMP/web-artifact-${DEPLOY_SHA}"
zip="$root/artifact.zip"
archive="$root/fap-web-${DEPLOY_SHA}.tar.gz"
extract="$root/extracted"
mkdir -p "$root" "$extract"

curl -fsSL -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/actions/artifacts/$ARTIFACT_ID/zip" -o "$zip"
test "sha256:$(sha256sum "$zip" | awk '{print $1}')" = "$EXPECTED_ARTIFACT_DIGEST"
gh attestation verify "$zip" --repo "$GITHUB_REPOSITORY" \
  --signer-workflow "$GITHUB_REPOSITORY/.github/workflows/ci.yml" \
  --source-ref refs/heads/main --source-digest "$DEPLOY_SHA"

mapfile -t entries < <(unzip -Z1 "$zip")
test "${#entries[@]}" -eq 1
test "${entries[0]}" = "fap-web-${DEPLOY_SHA}.tar.gz"
unzip -q "$zip" -d "$root"

while IFS= read -r entry; do
  test -n "$entry"
  [[ "$entry" != /* && "$entry" != *"/../"* && "$entry" != ../* && "$entry" != *"/.." ]]
  case "$entry" in "fap-web-${DEPLOY_SHA}"|"fap-web-${DEPLOY_SHA}/"*) ;; *) exit 1 ;; esac
done < <(tar -tzf "$archive")
tar -xzf "$archive" -C "$extract"
node scripts/release/standalone-release.mjs verify \
  --artifact="$extract/fap-web-${DEPLOY_SHA}" --expected-git-sha="$DEPLOY_SHA" --require-production-config

{
  echo "archive=$archive"
  echo "archive_sha256=$(sha256sum "$archive" | awk '{print $1}')"
  echo "manifest_digest=sha256:$(sha256sum "$extract/fap-web-${DEPLOY_SHA}/RELEASE_MANIFEST.json" | awk '{print $1}')"
} >> "$GITHUB_OUTPUT"
