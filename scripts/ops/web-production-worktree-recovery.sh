#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "worktree_recovery_error=$*" >&2
  exit 1
}

require_value() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "missing $name"
}

sha256_file() {
  sha256sum "$1" | awk '{print $1}'
}

MODE="${1:-}"
[[ "$MODE" == "inventory" || "$MODE" == "apply" ]] || fail "mode must be inventory or apply"

require_value APP_DIR
require_value EXPECTED_ACTIVE_SHA

[[ "$APP_DIR" == /* ]] || fail "APP_DIR must be absolute"
[[ "$EXPECTED_ACTIVE_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "invalid EXPECTED_ACTIVE_SHA"

cd "$APP_DIR"
git rev-parse --is-inside-work-tree >/dev/null
active_sha="$(git rev-parse HEAD)"
[[ "$active_sha" == "$EXPECTED_ACTIVE_SHA" ]] || fail "active SHA mismatch"
git diff --cached --quiet || fail "staged changes are not allowed"

scratch_dir="$(mktemp -d)"
trap 'rm -rf "$scratch_dir"' EXIT
paths_file="$scratch_dir/tracked-paths.nul"
patch_file="$scratch_dir/worktree.patch"
residue_manifest="$scratch_dir/residue-manifest.nul"

git diff --name-only -z --diff-filter=ACDMRTUXB > "$paths_file"
git diff --binary > "$patch_file"

tracked_path_count=0
while IFS= read -r -d '' tracked_path; do
  tracked_path_count=$((tracked_path_count + 1))
  [[ "$tracked_path_count" -le 20 ]] || fail "tracked dirty path cap exceeded"
  [[ -n "$tracked_path" && "$tracked_path" != /* ]] || fail "invalid tracked dirty path"
  [[ "$tracked_path" != ".." && "$tracked_path" != ../* && "$tracked_path" != */../* && "$tracked_path" != */.. ]] \
    || fail "tracked dirty path escapes repository"
  [[ "$tracked_path" != *$'\n'* && "$tracked_path" != *$'\r'* ]] || fail "unsupported tracked dirty path"

  if [[ -e "$tracked_path" ]]; then
    [[ -f "$tracked_path" && ! -L "$tracked_path" ]] || fail "tracked dirty path is not a regular file"
    file_sha256="$(sha256_file "$tracked_path")"
    file_state="present"
  else
    file_sha256="0000000000000000000000000000000000000000000000000000000000000000"
    file_state="deleted"
  fi
  printf '%s\0%s\0%s\0' "$tracked_path" "$file_state" "$file_sha256" >> "$residue_manifest"
done < "$paths_file"

[[ "$tracked_path_count" -gt 0 ]] || fail "no tracked dirty paths"
path_set_sha256="$(sha256_file "$paths_file")"
patch_sha256="$(sha256_file "$patch_file")"
residue_set_sha256="$(
  {
    printf 'active_sha=%s\0' "$active_sha"
    printf 'path_set_sha256=%s\0' "$path_set_sha256"
    printf 'patch_sha256=%s\0' "$patch_sha256"
    cat "$residue_manifest"
  } | sha256sum | awk '{print $1}'
)"
tracked_paths_base64="$(base64 < "$paths_file" | tr -d '\n')"

emit_receipt() {
  local state="$1"
  local backup_dir="${2:-}"
  local backup_manifest_sha256="${3:-}"
  local backup_patch_sha256="${4:-}"
  printf '{'
  printf '"mode":"%s",' "$MODE"
  printf '"state":"%s",' "$state"
  printf '"active_sha":"%s",' "$active_sha"
  printf '"tracked_path_count":%s,' "$tracked_path_count"
  printf '"tracked_paths_base64":"%s",' "$tracked_paths_base64"
  printf '"path_set_sha256":"%s",' "$path_set_sha256"
  printf '"patch_sha256":"%s",' "$patch_sha256"
  printf '"residue_set_sha256":"%s",' "$residue_set_sha256"
  printf '"backup_dir":"%s",' "$backup_dir"
  printf '"backup_manifest_sha256":"%s",' "$backup_manifest_sha256"
  printf '"backup_patch_sha256":"%s"' "$backup_patch_sha256"
  printf '}\n'
}

if [[ "$MODE" == "inventory" ]]; then
  emit_receipt "dirty_bounded_inventory"
  exit 0
fi

require_value EXPECTED_PATH_SET_SHA256
require_value EXPECTED_PATCH_SHA256
require_value EXPECTED_RESIDUE_SET_SHA256
require_value RELEASE_ID

[[ "$EXPECTED_PATH_SET_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_PATH_SET_SHA256"
[[ "$EXPECTED_PATCH_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_PATCH_SHA256"
[[ "$EXPECTED_RESIDUE_SET_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_RESIDUE_SET_SHA256"
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || fail "invalid RELEASE_ID"
[[ "$path_set_sha256" == "$EXPECTED_PATH_SET_SHA256" ]] || fail "path set SHA mismatch"
[[ "$patch_sha256" == "$EXPECTED_PATCH_SHA256" ]] || fail "patch SHA mismatch"
[[ "$residue_set_sha256" == "$EXPECTED_RESIDUE_SET_SHA256" ]] || fail "residue set SHA mismatch"

git_dir="$(git rev-parse --git-dir)"
if [[ "$git_dir" != /* ]]; then
  git_dir="$APP_DIR/$git_dir"
fi
backup_root="$git_dir/codex-recovery-backups"
backup_dir="$backup_root/$RELEASE_ID"
[[ ! -e "$backup_dir" ]] || fail "backup release already exists"
mkdir -p "$backup_dir/original-files"
cp -p "$paths_file" "$backup_dir/tracked-paths.nul"
cp -p "$patch_file" "$backup_dir/worktree.patch"
cp -p "$residue_manifest" "$backup_dir/residue-manifest.nul"

while IFS= read -r -d '' tracked_path; do
  if [[ -e "$tracked_path" ]]; then
    backup_file="$backup_dir/original-files/$tracked_path"
    mkdir -p "$(dirname "$backup_file")"
    cp -p "$tracked_path" "$backup_file"
    [[ "$(sha256_file "$backup_file")" == "$(sha256_file "$tracked_path")" ]] \
      || fail "backup file verification failed"
  fi
done < "$paths_file"

backup_manifest_sha256="$(sha256_file "$backup_dir/residue-manifest.nul")"
backup_patch_sha256="$(sha256_file "$backup_dir/worktree.patch")"
[[ "$backup_manifest_sha256" == "$(sha256_file "$residue_manifest")" ]] \
  || fail "backup manifest verification failed"
[[ "$backup_patch_sha256" == "$patch_sha256" ]] || fail "backup patch verification failed"

while IFS= read -r -d '' tracked_path; do
  git restore --worktree --source=HEAD -- "$tracked_path"
done < "$paths_file"
git diff --quiet || fail "tracked worktree remains dirty after restore"
git diff --cached --quiet || fail "index became dirty after restore"

emit_receipt "cleaned_exact_bounded_inventory" "$backup_dir" "$backup_manifest_sha256" "$backup_patch_sha256"
