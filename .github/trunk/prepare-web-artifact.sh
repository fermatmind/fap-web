#!/usr/bin/env bash
set -euo pipefail

: "${ARTIFACT_ID:?}"
: "${EXPECTED_ARTIFACT_DIGEST:?}"
: "${DEPLOY_SHA:?}"
: "${GH_TOKEN:?}"

artifact_variant="${ARTIFACT_VARIANT:-production}"
case "$artifact_variant" in
  production)
    archive_basename="fap-web-${DEPLOY_SHA}.tar.gz"
    release_basename="fap-web-${DEPLOY_SHA}"
    verification_flag="--require-production-config"
    ;;
  staging)
    archive_basename="fap-web-staging-${DEPLOY_SHA}.tar.gz"
    release_basename="fap-web-${DEPLOY_SHA}"
    verification_flag="--require-staging-config"
    ;;
  *)
    echo "Unsupported artifact variant" >&2
    exit 1
    ;;
esac

[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$EXPECTED_ARTIFACT_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]

root="$RUNNER_TEMP/web-artifact-${DEPLOY_SHA}"
zip="$root/artifact.zip"
downloaded_archive="$root/$archive_basename"
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
test "${entries[0]}" = "$archive_basename"
unzip -q "$zip" -d "$root"

while IFS= read -r entry; do
  test -n "$entry"
  [[ "$entry" != /* && "$entry" != *"/../"* && "$entry" != ../* && "$entry" != *"/.." ]]
  case "$entry" in "$release_basename"|"$release_basename/"*) ;; *) exit 1 ;; esac
done < <(tar -tzf "$downloaded_archive")
tar -xzf "$downloaded_archive" -C "$extract"
node scripts/release/standalone-release.mjs verify \
  --artifact="$extract/$release_basename" --expected-git-sha="$DEPLOY_SHA" "$verification_flag"

if [[ "$downloaded_archive" != "$archive" ]]; then
  cp "$downloaded_archive" "$archive"
fi

{
  echo "archive=$archive"
  echo "archive_sha256=$(sha256sum "$archive" | awk '{print $1}')"
  echo "manifest_digest=sha256:$(sha256sum "$extract/$release_basename/RELEASE_MANIFEST.json" | awk '{print $1}')"
} >> "$GITHUB_OUTPUT"
