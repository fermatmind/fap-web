#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/apps/fap-web}"
APP_USER="${APP_USER:-ubuntu}"
DEPLOY_SHA="${DEPLOY_SHA:-}"
ARTIFACT_DIGEST="${ARTIFACT_DIGEST:-}"
ARCHIVE_SHA256="${ARCHIVE_SHA256:-}"
RELEASE_MANIFEST_DIGEST="${RELEASE_MANIFEST_DIGEST:-}"
RELEASE_ARCHIVE="${RELEASE_ARCHIVE:-}"
DEPLOY_SCRIPT="${DEPLOY_SCRIPT:-}"
ROLLING_RELOAD_SCRIPT="${ROLLING_RELOAD_SCRIPT:-}"
RELEASES_TO_KEEP="${RELEASES_TO_KEEP:-3}"

log() {
  printf '[install_standalone_release] %s\n' "$*"
}

fail() {
  log "$*"
  exit 1
}

require_bin() {
  command -v "$1" >/dev/null 2>&1 || fail "missing dependency: $1"
}

atomic_replace_link() {
  local source="$1"
  local target="$2"

  if mv -Tf "$source" "$target" 2>/dev/null; then
    return
  fi
  mv -fh "$source" "$target"
}

[[ "$APP_DIR" == /* ]] || fail "APP_DIR must be absolute"
[[ "$APP_DIR" != "/" ]] || fail "APP_DIR must not be the filesystem root"
[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "DEPLOY_SHA must be an exact lowercase SHA"
[[ "$ARTIFACT_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]] || fail "ARTIFACT_DIGEST must be a SHA-256 digest"
[[ "$ARCHIVE_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "ARCHIVE_SHA256 must be a SHA-256 digest"
[[ "$RELEASE_MANIFEST_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]] || fail "RELEASE_MANIFEST_DIGEST must be a SHA-256 digest"
[[ -f "$RELEASE_ARCHIVE" ]] || fail "release archive is missing"
[[ -x "$DEPLOY_SCRIPT" ]] || fail "deploy controller is missing or not executable"
[[ -x "$ROLLING_RELOAD_SCRIPT" ]] || fail "rolling reload controller is missing or not executable"
[[ "$(id -un)" == "$APP_USER" ]] || fail "installer must run as ${APP_USER}"

require_bin tar
require_bin sha256sum
require_bin mv
require_bin ln
require_bin realpath
require_bin stat

[[ "$RELEASES_TO_KEEP" =~ ^[1-9][0-9]*$ ]] || fail "RELEASES_TO_KEEP must be a positive integer"
(( RELEASES_TO_KEEP >= 2 && RELEASES_TO_KEEP <= 10 )) \
  || fail "RELEASES_TO_KEEP must be between 2 and 10"

actual_archive_sha256="$(sha256sum "$RELEASE_ARCHIVE" | awk '{print $1}')"
[[ "$actual_archive_sha256" == "$ARCHIVE_SHA256" ]] || fail "release archive digest mismatch after transport"

release_name="fap-web-${DEPLOY_SHA}"
while IFS= read -r entry; do
  [[ -n "$entry" ]] || fail "release archive contains an empty path"
  [[ "$entry" != /* ]] || fail "release archive contains an absolute path"
  [[ "$entry" != *"/../"* && "$entry" != "../"* && "$entry" != *"/.." ]] \
    || fail "release archive contains a traversal path"
  case "$entry" in
    "$release_name"|"$release_name/"*) ;;
    *) fail "release archive contains a path outside ${release_name}" ;;
  esac
done < <(tar -tzf "$RELEASE_ARCHIVE")

releases_dir="${APP_DIR%/}/releases"
active_parent="${APP_DIR%/}/.next"
active_link="${active_parent}/standalone"
artifact_hex="${ARTIFACT_DIGEST#sha256:}"
release_dir="${releases_dir}/${DEPLOY_SHA}-${artifact_hex}"
incoming_dir=""
previous_target=""
legacy_release=""
active_switched=0
install_complete=0

cleanup_release_history() {
  local active_release
  local releases_root
  local previous_release=""
  local candidate
  local resolved
  local keep_count=0
  local -a protected_releases=()
  local -a candidates=()

  releases_root="$(realpath "$releases_dir")"
  active_release="$(realpath "$active_link")"
  [[ "$active_release" == "${releases_root}/"* ]] || fail "active release escaped releases directory"
  protected_releases+=("$active_release")
  keep_count=1

  if [[ -L "${releases_dir}/previous" ]]; then
    previous_release="$(realpath "${releases_dir}/previous")"
    [[ "$previous_release" == "${releases_root}/"* ]] || fail "previous release escaped releases directory"
    if [[ "$previous_release" != "$active_release" ]]; then
      protected_releases+=("$previous_release")
      keep_count=$((keep_count + 1))
    fi
  fi

  while IFS= read -r candidate; do
    [[ -n "$candidate" ]] || continue
    resolved="$(realpath "$candidate")"
    [[ "$resolved" == "${releases_root}/"* ]] || fail "release candidate escaped releases directory"
    if printf '%s\n' "${protected_releases[@]}" | grep -Fqx "$resolved"; then
      continue
    fi
    candidates+=("$resolved")
  done < <(
    find "$releases_dir" -mindepth 1 -maxdepth 1 -type d ! -name '.incoming.*' -print0 \
      | while IFS= read -r -d '' candidate; do
          printf '%s\t%s\n' "$(stat -c '%Z' "$candidate")" "$candidate"
        done \
      | sort -rn \
      | cut -f2-
  )

  for candidate in "${candidates[@]}"; do
    if (( keep_count < RELEASES_TO_KEEP )); then
      keep_count=$((keep_count + 1))
      continue
    fi
    log "remove inactive release: $(basename "$candidate")"
    rm -rf -- "$candidate"
  done

  for candidate in "${releases_dir}"/.incoming.*; do
    [[ -d "$candidate" ]] || continue
    [[ "$candidate" == "$incoming_dir" ]] && continue
    resolved="$(realpath "$candidate")"
    [[ "$resolved" == "${releases_root}/.incoming."* ]] || fail "incoming release escaped releases directory"
    log "remove stale incoming release: $(basename "$candidate")"
    rm -rf -- "$candidate"
  done
}

cleanup_transport_history() {
  local archive_directory
  local transport_root
  local candidate
  local resolved
  local keep_count=0

  archive_directory="$(realpath "$(dirname "$RELEASE_ARCHIVE")")"
  transport_root="$(realpath "$(dirname "$archive_directory")")"
  case "$(basename "$transport_root")" in
    .deploy-artifacts|.deploy-incoming) ;;
    *) return 0 ;;
  esac
  [[ "$transport_root" == "${APP_DIR%/}/"* ]] || fail "transport directory escaped application root"

  while IFS= read -r candidate; do
    [[ -n "$candidate" ]] || continue
    resolved="$(realpath "$candidate")"
    [[ "$resolved" == "${transport_root}/"* ]] || fail "transport candidate escaped transport root"
    if (( keep_count < RELEASES_TO_KEEP )); then
      keep_count=$((keep_count + 1))
      continue
    fi
    log "remove stale transport directory: $(basename "$candidate")"
    rm -rf -- "$candidate"
  done < <(
    find "$transport_root" -mindepth 1 -maxdepth 1 -type d -print0 \
      | while IFS= read -r -d '' candidate; do
          printf '%s\t%s\n' "$(stat -c '%Z' "$candidate")" "$candidate"
        done \
      | sort -rn \
      | cut -f2-
  )
}

rollback_active_release() {
  local rollback_revision=""

  if [[ "$active_switched" != "1" ]] || [[ "$install_complete" == "1" ]]; then
    return
  fi

  log "deployment failed; restoring previous release boundary"
  if [[ -n "$previous_target" ]]; then
    ln -s "$previous_target" "${active_link}.rollback"
    atomic_replace_link "${active_link}.rollback" "$active_link"
    if [[ -f "${active_link}/REVISION" ]]; then
      rollback_revision="$(tr -d '[:space:]' < "${active_link}/REVISION")"
    fi
  elif [[ -n "$legacy_release" && -d "$legacy_release" ]]; then
    rm -f "$active_link"
    mv "$legacy_release" "$active_link"
  else
    rm -f "$active_link"
  fi

  if [[ "$rollback_revision" =~ ^[0-9a-f]{40}$ ]]; then
    APP_DIR="$APP_DIR" DEPLOY_SHA="$rollback_revision" \
      ROLLING_RELOAD_SCRIPT="$ROLLING_RELOAD_SCRIPT" \
      "$DEPLOY_SCRIPT" >/dev/null 2>&1 \
      || log "automatic rollback reload failed; operator rollback is required"
  fi
}

cleanup() {
  rollback_active_release
  if [[ -n "$incoming_dir" && -d "$incoming_dir" ]]; then
    rm -rf "$incoming_dir"
  fi
}
trap cleanup EXIT

mkdir -p "$releases_dir" "$active_parent"
incoming_dir="$(mktemp -d "${releases_dir}/.incoming.${DEPLOY_SHA}.XXXXXX")"
tar -xzf "$RELEASE_ARCHIVE" -C "$incoming_dir"
release_source="${incoming_dir}/${release_name}"

[[ -f "${release_source}/server.js" ]] || fail "release server.js is missing"
[[ -f "${release_source}/REVISION" ]] || fail "release REVISION is missing"
[[ -f "${release_source}/RELEASE_MANIFEST.json" ]] || fail "release manifest is missing"
[[ "$(tr -d '[:space:]' < "${release_source}/REVISION")" == "$DEPLOY_SHA" ]] \
  || fail "release revision does not match requested SHA"
actual_manifest_digest="sha256:$(sha256sum "${release_source}/RELEASE_MANIFEST.json" | awk '{print $1}')"
[[ "$actual_manifest_digest" == "$RELEASE_MANIFEST_DIGEST" ]] \
  || fail "release manifest digest mismatch after transport"

if [[ -e "$release_dir" ]]; then
  [[ -f "${release_dir}/REVISION" ]] || fail "existing immutable release is malformed"
  [[ "$(tr -d '[:space:]' < "${release_dir}/REVISION")" == "$DEPLOY_SHA" ]] \
    || fail "existing immutable release revision mismatch"
  existing_manifest_digest="sha256:$(sha256sum "${release_dir}/RELEASE_MANIFEST.json" | awk '{print $1}')"
  [[ "$existing_manifest_digest" == "$RELEASE_MANIFEST_DIGEST" ]] \
    || fail "existing immutable release manifest mismatch"
else
  mv "$release_source" "$release_dir"
fi

if [[ -L "$active_link" ]]; then
  previous_target="$(readlink "$active_link")"
elif [[ -e "$active_link" ]]; then
  legacy_release="${releases_dir}/legacy-before-${DEPLOY_SHA}"
  [[ ! -e "$legacy_release" ]] || fail "legacy rollback directory already exists"
  mv "$active_link" "$legacy_release"
  previous_target="$legacy_release"
fi

ln -s "$release_dir" "${active_link}.next"
atomic_replace_link "${active_link}.next" "$active_link"
active_switched=1

APP_DIR="$APP_DIR" DEPLOY_SHA="$DEPLOY_SHA" \
  ROLLING_RELOAD_SCRIPT="$ROLLING_RELOAD_SCRIPT" \
  "$DEPLOY_SCRIPT"

if [[ -n "$previous_target" ]]; then
  ln -s "$previous_target" "${releases_dir}/.previous.next"
  atomic_replace_link "${releases_dir}/.previous.next" "${releases_dir}/previous"
fi

install_complete=1
cleanup_release_history
cleanup_transport_history
log "immutable release activated: sha=${DEPLOY_SHA} artifact=${ARTIFACT_DIGEST}"
