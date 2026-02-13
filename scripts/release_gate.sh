#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

errors=()
CHECK_WORKTREE="${RELEASE_GATE_CHECK_WORKTREE:-1}"
ALLOW_LOCAL_ENV="${RELEASE_GATE_ALLOW_LOCAL_ENV:-0}"

add_error() {
  errors+=("$1")
}

collect_tracked_matches() {
  local -a patterns=("$@")
  git ls-files -z -- "${patterns[@]}" | tr '\0' '\n' | sed '/^$/d' | sort -u
}

if [[ ! -f pnpm-lock.yaml ]]; then
  add_error "Missing required lockfile: pnpm-lock.yaml"
fi

if [[ -f package-lock.json ]]; then
  add_error "Found forbidden lockfile: package-lock.json"
fi

if [[ -f yarn.lock ]]; then
  add_error "Found forbidden lockfile: yarn.lock"
fi

if [[ -f pnpm-lock.yaml && -f package-lock.json ]]; then
  add_error "Conflicting lockfiles detected: pnpm-lock.yaml and package-lock.json"
fi

env_matches="$(collect_tracked_matches '.env' '.env.*' ':!.env.example')"
if [[ -n "$env_matches" ]]; then
  add_error "Tracked environment files are forbidden:\n$env_matches"
fi

dir_matches="$(collect_tracked_matches '.next/**' 'node_modules/**' 'coverage/**' 'dist/**')"
if [[ -n "$dir_matches" ]]; then
  add_error "Tracked build/sensitive directories are forbidden:\n$dir_matches"
fi

log_matches="$(collect_tracked_matches '*.log')"
if [[ -n "$log_matches" ]]; then
  add_error "Tracked log files are forbidden:\n$log_matches"
fi

if [[ "$CHECK_WORKTREE" == "1" ]]; then
  shopt -s nullglob dotglob

  check_worktree_matches() {
    local pattern="$1"
    local skip_in_ci="${2:-0}"

    local -a matches=()
    matches=($pattern)
    if (( ${#matches[@]} == 0 )); then
      return
    fi

    for item in "${matches[@]}"; do
      if [[ ! -e "$item" ]]; then
        continue
      fi

      if [[ "$item" == ".env.example" ]]; then
        continue
      fi

      if [[ "$ALLOW_LOCAL_ENV" == "1" && ( "$item" == ".env" || "$item" == .env.* ) ]]; then
        continue
      fi

      if [[ "${CI:-}" == "true" && "$skip_in_ci" == "1" ]]; then
        continue
      fi

      add_error "Forbidden item exists in working tree: $item"
    done
  }

  check_worktree_matches ".env"
  check_worktree_matches ".env.*"
  check_worktree_matches ".next" 1
  check_worktree_matches "node_modules" 1
  check_worktree_matches "coverage" 1
  check_worktree_matches "dist" 1
  check_worktree_matches "*.log"
fi

if (( ${#errors[@]} > 0 )); then
  echo "[release:gate] FAILED"
  echo
  for err in "${errors[@]}"; do
    echo "- $err"
  done
  echo
  cat <<'MSG'
Fix guidance:
- Keep only pnpm lockfile:
  rm -f package-lock.json yarn.lock
- Remove accidentally tracked build artifacts/sensitive files:
  git rm -r --cached .next node_modules coverage dist
  git rm --cached .env .env.* '*.log'
- Restore a clean source tree and rerun:
  pnpm release:gate
MSG
  exit 1
fi

echo "[release:gate] PASS - release source is clean."
