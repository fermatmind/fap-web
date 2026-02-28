#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

errors=()
CHECK_WORKTREE="${RELEASE_GATE_CHECK_WORKTREE:-1}"
ALLOW_LOCAL_ENV="${RELEASE_GATE_ALLOW_LOCAL_ENV:-0}"
CHECK_SITE_URL="${RELEASE_GATE_CHECK_SITE_URL:-1}"
CHECK_TRANSLATIONS="${RELEASE_GATE_CHECK_TRANSLATIONS:-1}"

add_error() {
  errors+=("$1")
}

resolve_site_url_candidate() {
  if [[ -n "${NEXT_PUBLIC_SITE_URL:-}" ]]; then
    echo "${NEXT_PUBLIC_SITE_URL}"
    return
  fi

  if [[ -f ".env.production.local" ]]; then
    local line
    line="$(grep -E '^NEXT_PUBLIC_SITE_URL=' .env.production.local | tail -n 1 || true)"
    if [[ -n "$line" ]]; then
      echo "${line#NEXT_PUBLIC_SITE_URL=}"
      return
    fi
  fi

  echo ""
}

validate_site_url() {
  if [[ "$CHECK_SITE_URL" != "1" ]]; then
    return
  fi

  local raw
  raw="$(resolve_site_url_candidate)"
  local site_url
  site_url="$(echo "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's#/$##')"

  if [[ -z "$site_url" ]]; then
    add_error "NEXT_PUBLIC_SITE_URL is required for release gate (set env var or .env.production.local)."
    return
  fi

  if [[ ! "$site_url" =~ ^https?:// ]]; then
    add_error "NEXT_PUBLIC_SITE_URL must be an absolute URL. Got: $site_url"
    return
  fi

  if [[ "$site_url" =~ localhost|127\.0\.0\.1|example\.com ]]; then
    add_error "NEXT_PUBLIC_SITE_URL must not point to localhost/example domain. Got: $site_url"
  fi
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

validate_site_url

if [[ "$CHECK_TRANSLATIONS" == "1" && -f "scripts/content/check-translations.mjs" ]]; then
  if ! pnpm -s velite build >/dev/null 2>&1; then
    add_error "Failed to build Velite content before translation gate."
  else
    translation_output="$(node scripts/content/check-translations.mjs 2>&1 || true)"
    if [[ "$translation_output" == *"translation check failed"* ]]; then
      add_error "Translation gate failed:\n$translation_output"
    fi
  fi
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
