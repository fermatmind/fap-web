#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
EXPECTED_IMAGE_ID="sha256:ee8c5117c291c7384a381c32068e1d9a50adc8bf392f9157c42d14bedbbe018b"

fail() {
  printf 'web-public-ingress: %s\n' "$*" >&2
  exit 1
}

require_value() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "missing required environment variable: ${name}"
}

for name in OPENRESTY_CONTAINER OPENRESTY_CONFIG_ROOT OPENRESTY_MANAGED_FILES OPENRESTY_PRIMARY_FILE OPENRESTY_BACKUP_DIR; do
  require_value "$name"
done

[[ "$MODE" =~ ^(preflight|apply|rollback)$ ]] || fail "mode must be preflight, apply or rollback"
[[ "$OPENRESTY_CONFIG_ROOT" == /* && "$OPENRESTY_BACKUP_DIR" == /* ]] || fail "config and backup roots must be absolute"
[[ "$OPENRESTY_BACKUP_DIR" != "$OPENRESTY_CONFIG_ROOT"/* ]] || fail "backup directory must be outside the live include root"
[[ "$OPENRESTY_PRIMARY_FILE" =~ ^[A-Za-z0-9._-]+$ ]] || fail "primary file must be a basename"

IFS=',' read -r -a managed_files <<< "$OPENRESTY_MANAGED_FILES"
[[ "${#managed_files[@]}" -gt 0 ]] || fail "managed file list is empty"
for file in "${managed_files[@]}"; do
  [[ "$file" =~ ^[A-Za-z0-9._-]+$ ]] || fail "managed files must be basenames"
done
[[ ",${OPENRESTY_MANAGED_FILES}," == *",${OPENRESTY_PRIMARY_FILE},"* ]] || fail "primary file must be managed"

if docker ps >/dev/null 2>&1; then
  DOCKER=(docker)
else
  DOCKER=(sudo -n docker)
fi

container_id="$("${DOCKER[@]}" ps --filter "name=^/${OPENRESTY_CONTAINER}$" --format '{{.ID}}')"
[[ -n "$container_id" && "$container_id" != *$'\n'* ]] || fail "expected exactly one configured OpenResty container"
image_id="$("${DOCKER[@]}" inspect --format '{{.Image}}' "$container_id")"
[[ "$image_id" == "$EXPECTED_IMAGE_ID" ]] || fail "OpenResty image drift"

container_exec() {
  "${DOCKER[@]}" exec "$container_id" "$@"
}

config_set_lines() {
  local file digest
  for file in "${managed_files[@]}"; do
    if container_exec test -f "$OPENRESTY_CONFIG_ROOT/$file"; then
      digest="$(container_exec sha256sum "$OPENRESTY_CONFIG_ROOT/$file" | awk '{print $1}')"
    else
      digest="absent"
    fi
    printf '%s:%s\n' "$file" "$digest"
  done | LC_ALL=C sort
}

config_set_sha() {
  config_set_lines | sha256sum | awk '{print $1}'
}

matching_https_vhosts() {
  container_exec sh -lc '(openresty -T 2>/dev/null || nginx -T 2>/dev/null)' \
    | awk '
      !in_server && /^[[:space:]]*server[[:space:]]*\{/ {
        in_server = 1
        depth = 0
        https = 0
        host = 0
      }
      in_server {
        original = $0
        if (original ~ /listen[[:space:]]+443([[:space:];]|[^;]*ssl)/) https = 1
        if (original ~ /server_name[[:space:]]+([^;]*[[:space:]])?(www\.)?fermatmind\.com([[:space:];])/) host = 1
        opens = gsub(/\{/, "{", original)
        closes = gsub(/\}/, "}", original)
        depth += opens - closes
        if (depth == 0) {
          if (https && host) count += 1
          in_server = 0
        }
      }
      END { print count + 0 }
    '
}

live_backup_count() {
  container_exec find "$OPENRESTY_CONFIG_ROOT" -maxdepth 1 -type f \
    \( -name '*.bak' -o -name '*.backup' -o -name '*.old' -o -name '*~' \) \
    | wc -l | tr -d '[:space:]'
}

current_set_sha="$(config_set_sha)"
current_https_vhosts="$(matching_https_vhosts)"
current_live_backups="$(live_backup_count)"

if [[ "$MODE" == "preflight" ]]; then
  printf 'mode=preflight\n'
  printf 'image_match=true\n'
  printf 'current_config_set_sha256=%s\n' "$current_set_sha"
  printf 'matching_https_vhost_count=%s\n' "$current_https_vhosts"
  printf 'live_backup_count=%s\n' "$current_live_backups"
  exit 0
fi

require_value EXPECTED_CONFIG_SET_SHA256
[[ "$EXPECTED_CONFIG_SET_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid expected config set SHA"
[[ "$current_set_sha" == "$EXPECTED_CONFIG_SET_SHA256" ]] || fail "managed config drift"
[[ "$current_live_backups" == "0" ]] || fail "backup-like files are live in the include root"

if [[ "$MODE" == "apply" ]]; then
  require_value CANDIDATE_CONFIG
  require_value EXPECTED_CANDIDATE_SHA256
  require_value RELEASE_ID
  [[ -f "$CANDIDATE_CONFIG" ]] || fail "candidate config missing"
  candidate_sha="$(sha256sum "$CANDIDATE_CONFIG" | awk '{print $1}')"
  [[ "$candidate_sha" == "$EXPECTED_CANDIDATE_SHA256" ]] || fail "candidate config SHA mismatch"
  [[ "$RELEASE_ID" =~ ^[0-9]+-[0-9a-f]{40}$ ]] || fail "invalid release id"

  remote_candidate="/tmp/fap-web-public-ingress-${RELEASE_ID}.conf"
  "${DOCKER[@]}" cp "$CANDIDATE_CONFIG" "$container_id:$remote_candidate"
  rm -f "$CANDIDATE_CONFIG"
  trap 'container_exec rm -f "$remote_candidate" >/dev/null 2>&1 || true' EXIT
  container_exec chmod 0444 "$remote_candidate"

  # Syntax-check the candidate as a server include before touching the live set.
  # Positional parameters expand inside the container shell.
  # shellcheck disable=SC2016
  container_exec sh -eu -c '
    candidate="$1"
    main="/tmp/fap-web-public-ingress-candidate-main.conf"
    cat > "$main" <<EOF
events {}
http {
  proxy_cache_path /tmp/fap-web-ingress-cache keys_zone=fermatmind_public:1m;
  include $candidate;
}
EOF
    openresty -t -c "$main"
  ' sh "$remote_candidate"

  backup_release_dir="$OPENRESTY_BACKUP_DIR/$RELEASE_ID"
  container_exec mkdir -p "$backup_release_dir"
  restore_originals() {
    container_exec rm -f "$OPENRESTY_CONFIG_ROOT/$OPENRESTY_PRIMARY_FILE"
    for managed_file in "${managed_files[@]}"; do
      if container_exec test -f "$backup_release_dir/$managed_file"; then
        container_exec cp -p "$backup_release_dir/$managed_file" "$OPENRESTY_CONFIG_ROOT/$managed_file"
      fi
    done
  }
  for file in "${managed_files[@]}"; do
    if container_exec test -f "$OPENRESTY_CONFIG_ROOT/$file"; then
      container_exec cp -p "$OPENRESTY_CONFIG_ROOT/$file" "$backup_release_dir/$file"
      container_exec rm "$OPENRESTY_CONFIG_ROOT/$file"
    fi
  done
  container_exec cp "$remote_candidate" "$OPENRESTY_CONFIG_ROOT/$OPENRESTY_PRIMARY_FILE"
  container_exec chmod 0444 "$OPENRESTY_CONFIG_ROOT/$OPENRESTY_PRIMARY_FILE"

  if ! container_exec openresty -t; then
    restore_originals
    fail "live syntax test failed before reload; original files restored"
  fi

  if [[ "$(matching_https_vhosts)" != "1" ]]; then
    restore_originals
    fail "candidate did not converge to one HTTPS web vhost; original files restored"
  fi
  container_exec openresty -s reload
  printf 'mode=apply\n'
  printf 'applied_config_sha256=%s\n' "$candidate_sha"
  printf 'backup_set_sha256=%s\n' "$current_set_sha"
  printf 'matching_https_vhost_count=1\n'
  exit 0
fi

require_value ROLLBACK_RELEASE_ID
require_value EXPECTED_BACKUP_SET_SHA256
[[ "$ROLLBACK_RELEASE_ID" =~ ^[0-9]+-[0-9a-f]{40}$ ]] || fail "invalid rollback release id"
[[ "$EXPECTED_BACKUP_SET_SHA256" =~ ^[0-9a-f]{64}$ ]] || fail "invalid backup set SHA"
backup_release_dir="$OPENRESTY_BACKUP_DIR/$ROLLBACK_RELEASE_ID"
container_exec test -d "$backup_release_dir" || fail "rollback backup missing"

backup_lines="$({
  for file in "${managed_files[@]}"; do
    if container_exec test -f "$backup_release_dir/$file"; then
      digest="$(container_exec sha256sum "$backup_release_dir/$file" | awk '{print $1}')"
    else
      digest="absent"
    fi
    printf '%s:%s\n' "$file" "$digest"
  done
} | LC_ALL=C sort)"
backup_sha="$(printf '%s\n' "$backup_lines" | sha256sum | awk '{print $1}')"
[[ "$backup_sha" == "$EXPECTED_BACKUP_SET_SHA256" ]] || fail "rollback backup SHA mismatch"

for file in "${managed_files[@]}"; do
  container_exec rm -f "$OPENRESTY_CONFIG_ROOT/$file"
  if container_exec test -f "$backup_release_dir/$file"; then
    container_exec cp -p "$backup_release_dir/$file" "$OPENRESTY_CONFIG_ROOT/$file"
  fi
done
container_exec openresty -t
container_exec openresty -s reload
printf 'mode=rollback\n'
printf 'restored_config_set_sha256=%s\n' "$backup_sha"
