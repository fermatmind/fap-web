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

sha256_stdin() {
  sha256sum | awk '{print $1}'
}

MODE="${1:-}"
[[ "$MODE" == "preflight" || "$MODE" == "apply" ]] || fail "mode must be preflight or apply"

require_value APP_DIR
require_value EXPECTED_ACTIVE_SHA

[[ "$APP_DIR" == /* ]] || fail "APP_DIR must be absolute"
[[ "$EXPECTED_ACTIVE_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "invalid EXPECTED_ACTIVE_SHA"

TARGET_PATH='app/(localized)/[locale]/tests/[slug]/page.tsx'
cd "$APP_DIR"

git rev-parse --is-inside-work-tree >/dev/null
active_sha="$(git rev-parse HEAD)"
[[ "$active_sha" == "$EXPECTED_ACTIVE_SHA" ]] || fail "active SHA mismatch"
git diff --cached --quiet || fail "staged changes are not allowed"

tracked_paths=()
while IFS= read -r tracked_path; do
  tracked_paths+=("$tracked_path")
done < <(git diff --name-only --diff-filter=ACDMRTUXB)
[[ "${#tracked_paths[@]}" -eq 1 ]] || fail "expected exactly one tracked dirty path"
[[ "${tracked_paths[0]}" == "$TARGET_PATH" ]] || fail "unexpected tracked dirty path"
[[ -f "$TARGET_PATH" ]] || fail "target path is not a regular file"

file_sha256="$(sha256_file "$TARGET_PATH")"
patch_sha256="$(git diff --binary -- "$TARGET_PATH" | sha256_stdin)"
residue_set_sha256="$(
  printf 'active_sha=%s\ntarget_path=%s\nfile_sha256=%s\npatch_sha256=%s\n' \
    "$active_sha" "$TARGET_PATH" "$file_sha256" "$patch_sha256" | sha256_stdin
)"

emit_receipt() {
  local state="$1"
  local backup_dir="${2:-}"
  local backup_file_sha256="${3:-}"
  local backup_patch_sha256="${4:-}"
  printf '{'
  printf '"mode":"%s",' "$MODE"
  printf '"state":"%s",' "$state"
  printf '"active_sha":"%s",' "$active_sha"
  printf '"target_path":"%s",' "$TARGET_PATH"
  printf '"file_sha256":"%s",' "$file_sha256"
  printf '"patch_sha256":"%s",' "$patch_sha256"
  printf '"residue_set_sha256":"%s",' "$residue_set_sha256"
  printf '"backup_dir":"%s",' "$backup_dir"
  printf '"backup_file_sha256":"%s",' "$backup_file_sha256"
  printf '"backup_patch_sha256":"%s"' "$backup_patch_sha256"
  printf '}\n'
}

if [[ "$MODE" == "preflight" ]]; then
  emit_receipt "dirty_exact_single_path"
  exit 0
fi

require_value EXPECTED_FILE_SHA256
require_value EXPECTED_PATCH_SHA256
require_value EXPECTED_RESIDUE_SET_SHA256
require_value RELEASE_ID

[[ "$EXPECTED_FILE_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_FILE_SHA256"
[[ "$EXPECTED_PATCH_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_PATCH_SHA256"
[[ "$EXPECTED_RESIDUE_SET_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid EXPECTED_RESIDUE_SET_SHA256"
[[ "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]] || fail "invalid RELEASE_ID"
[[ "$file_sha256" == "$EXPECTED_FILE_SHA256" ]] || fail "file SHA mismatch"
[[ "$patch_sha256" == "$EXPECTED_PATCH_SHA256" ]] || fail "patch SHA mismatch"
[[ "$residue_set_sha256" == "$EXPECTED_RESIDUE_SET_SHA256" ]] || fail "residue set SHA mismatch"

git_dir="$(git rev-parse --git-dir)"
if [[ "$git_dir" != /* ]]; then
  git_dir="$APP_DIR/$git_dir"
fi
backup_root="$git_dir/codex-recovery-backups"
backup_dir="$backup_root/$RELEASE_ID"
[[ ! -e "$backup_dir" ]] || fail "backup release already exists"
mkdir -p "$backup_dir"
cp -p "$TARGET_PATH" "$backup_dir/original-page.tsx"
git diff --binary -- "$TARGET_PATH" > "$backup_dir/worktree.patch"

backup_file_sha256="$(sha256_file "$backup_dir/original-page.tsx")"
backup_patch_sha256="$(sha256_file "$backup_dir/worktree.patch")"
[[ "$backup_file_sha256" == "$file_sha256" ]] || fail "backup file verification failed"
[[ "$backup_patch_sha256" == "$patch_sha256" ]] || fail "backup patch verification failed"

git restore --worktree --source=HEAD -- "$TARGET_PATH"
git diff --quiet || fail "tracked worktree remains dirty after restore"
git diff --cached --quiet || fail "index became dirty after restore"

emit_receipt "cleaned_exact_single_path" "$backup_dir" "$backup_file_sha256" "$backup_patch_sha256"
