#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-}"
EXPECTED_IMAGE_REPO_DIGEST="1panel/openresty@sha256:ee8c5117c291c7384a381c32068e1d9a50adc8bf392f9157c42d14bedbbe018b"

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
while [[ "$OPENRESTY_CONFIG_ROOT" == */ ]]; do OPENRESTY_CONFIG_ROOT="${OPENRESTY_CONFIG_ROOT%/}"; done
while [[ "$OPENRESTY_BACKUP_DIR" == */ ]]; do OPENRESTY_BACKUP_DIR="${OPENRESTY_BACKUP_DIR%/}"; done
[[ -n "$OPENRESTY_CONFIG_ROOT" && -n "$OPENRESTY_BACKUP_DIR" ]] || fail "filesystem root cannot be a managed config or backup root"
[[ "$OPENRESTY_BACKUP_DIR" != "$OPENRESTY_CONFIG_ROOT" ]] || fail "backup directory must differ from the live include root"
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
image_repo_digests="$("${DOCKER[@]}" image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$image_id")"
grep -Fqx "$EXPECTED_IMAGE_REPO_DIGEST" <<< "$image_repo_digests" || fail "OpenResty image drift"

container_exec() {
  "${DOCKER[@]}" exec "$container_id" "$@"
}

mounted_host_path() {
  local destination="$1"
  local source
  source="$("${DOCKER[@]}" inspect --format '{{range .Mounts}}{{printf "%s %s\n" .Destination .Source}}{{end}}' "$container_id" \
    | awk -v destination="$destination" '$1 == destination { print $2 }')"
  [[ "$source" == /* && "$source" != *$'\n'* ]] || fail "expected one host bind mount for $destination"
  printf '%s\n' "$source"
}

restore_history_ingress() {
  local backup="$1"
  if container_exec test -f "$backup/history-main.conf"; then
    local main
    main="$(mounted_host_path /usr/local/openresty/nginx/conf/nginx.conf)"
    container_exec cat "$backup/history-main.conf" | sudo -n tee "$main" >/dev/null || return 1
  fi
  if container_exec test -f "$backup/history-assets-link"; then
    local assets previous
    assets="$(mounted_host_path /www)/history-assets"
    previous="$(container_exec cat "$backup/history-assets-link")"
    if [[ "$previous" == absent ]]; then
      sudo -n rm -f -- "$assets/current" || return 1
    else
      [[ "$previous" =~ ^releases/\.candidate\.[a-zA-Z0-9]+$ ]] || return 1
      sudo -n test -d "$assets/$previous" || return 1
      sudo -n ln -s -- "$previous" "$assets/.rollback-$RELEASE_BACKUP_ID" || return 1
      sudo -n mv -Tf -- "$assets/.rollback-$RELEASE_BACKUP_ID" "$assets/current" || return 1
    fi
  fi
}

active_history_release() {
  local expected_sha="$1" pid cwd
  while read -r pid; do
    cwd="$(readlink -f "/proc/$pid/cwd" 2>/dev/null)" || continue
    [[ -f "$cwd/REVISION" && "$(<"$cwd/REVISION")" == "$expected_sha" ]] || continue
    [[ -f "$cwd/RELEASE_MANIFEST.json" && -f "$cwd/SHA256SUMS" ]] || continue
    printf '%s\n' "$cwd"
  done < <(pgrep -f '^next-server' || true) | LC_ALL=C sort -u
}

prepare_history_ingress() {
  local release main assets previous connections files limit
  release="$(active_history_release "${RELEASE_ID#*-}")"
  [[ "$release" == /* && "$release" != *$'\n'* ]] || fail "expected one active Next.js release for the ingress SHA"
  local bundle_dir="$release/.next/history-ingress"
  local avatar_source="$release/public/images/global-history"
  # The release installer verifies the complete artifact. Recheck the two
  # files used by the privileged ingress change before reading them.
  (
    cd "$release"
    awk '$2 == ".next/history-ingress/nginx.conf" || $2 == ".next/history-ingress/install-history-avatars.sh" {print}' SHA256SUMS \
      | { mapfile -t sums; [[ "${#sums[@]}" == 2 ]] && printf '%s\n' "${sums[@]}" | sha256sum --quiet -c -; }
  ) || fail "history ingress files did not match the installed release"
  main="$(mounted_host_path /usr/local/openresty/nginx/conf/nginx.conf)"
  assets="$(mounted_host_path /www)/history-assets"
  connections="$(awk '$1 == "worker_connections" {gsub(/;/, "", $2); print $2}' "$bundle_dir/nginx.conf")"
  files="$(awk '$1 == "worker_rlimit_nofile" {gsub(/;/, "", $2); print $2}' "$bundle_dir/nginx.conf")"
  [[ "$connections" =~ ^[1-9][0-9]*$ && "$files" =~ ^[1-9][0-9]*$ ]] || fail "invalid worker limits"
  (( files >= 2 * connections )) || fail "worker file descriptor limit is too small"
  limit="$(systemctl show docker.service -p LimitNOFILE --value)"
  [[ "$limit" == infinity || "$limit" =~ ^[1-9][0-9]*$ && "$limit" -ge "$files" ]] || fail "Docker service hard file descriptor limit is too small"
  # The live main config is a read-only file bind. Keep its inode so the
  # running container sees the validated candidate at the next reload.
  if ! cmp -s "$main" "$bundle_dir/nginx.conf"; then
    container_exec cp -p /usr/local/openresty/nginx/conf/nginx.conf "$backup_release_dir/history-main.conf"
    sudo -n tee "$main" < "$bundle_dir/nginx.conf" >/dev/null
  fi
  previous="$(sudo -n readlink "$assets/current" || printf absent)"
  printf '%s\n' "$previous" | "${DOCKER[@]}" exec -i "$container_id" sh -c 'cat > "$1"' sh "$backup_release_dir/history-assets-link"
  sudo -n bash "$bundle_dir/install-history-avatars.sh" "$avatar_source" "$assets"
}

verify_history_ingress() {
  local avatar_headers poster_headers
  for _ in {1..10}; do
    sleep 0.2
    avatar_headers="$(curl --noproxy '*' --connect-timeout 2 --max-time 4 -fsSI \
      --resolve fermatmind.com:443:127.0.0.1 https://fermatmind.com/images/global-history/wu-zetian.jpg | tr -d '\r')" || continue
    grep -Fixq 'Cache-Control: public, max-age=86400' <<< "$avatar_headers" || continue
    grep -Fixq 'Access-Control-Allow-Origin: *' <<< "$avatar_headers" || continue
    if grep -Fq 'location = /og/fun/global-history-quiz {' "$CANDIDATE_CONFIG"; then
      poster_headers="$(curl --noproxy '*' --connect-timeout 2 --max-time 4 -fsSI \
        --resolve fermatmind.com:443:127.0.0.1 \
        'https://fermatmind.com/og/fun/global-history-quiz?locale=en&portrait=wu-zetian&format=poster&download=1' | tr -d '\r')" || continue
      grep -Fixq 'Content-Type: image/jpeg' <<< "$poster_headers" || continue
      grep -Fixq 'X-Robots-Tag: noindex, nofollow, noarchive, nocache' <<< "$poster_headers" || continue
      if grep -iq '^Content-Disposition:' <<< "$poster_headers"; then continue; fi
    fi
    return 0
  done
  return 1
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
        if (original ~ /listen[[:space:]]+([^;[:space:]]*:)?443([^;]*[[:space:]])ssl([[:space:];])/) https = 1
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
  trap 'container_exec rm -f "$remote_candidate" >/dev/null 2>&1 || true; rm -f -- "$CANDIDATE_CONFIG"' EXIT
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
  RELEASE_BACKUP_ID="$RELEASE_ID"
  container_exec mkdir -p "$backup_release_dir"
  restore_originals() {
    local restore_status=0
    for managed_file in "${managed_files[@]}"; do
      container_exec rm -f "$OPENRESTY_CONFIG_ROOT/$managed_file" || restore_status=1
      if container_exec test -f "$backup_release_dir/$managed_file"; then
        container_exec cp -p "$backup_release_dir/$managed_file" "$OPENRESTY_CONFIG_ROOT/$managed_file" || restore_status=1
      fi
    done
    restore_history_ingress "$backup_release_dir" || restore_status=1
    return "$restore_status"
  }
  restore_required=false
  reload_sent=false
  # shellcheck disable=SC2329 # invoked indirectly by the ERR trap
  restore_on_apply_error() {
    local exit_status="$?"
    trap - ERR
    if [[ "$restore_required" == "true" ]]; then
      if ! restore_originals; then
        printf 'web-public-ingress: failed to fully restore original files after apply error\n' >&2
      elif [[ "$reload_sent" == "true" ]]; then
        if ! container_exec openresty -t || ! container_exec openresty -s reload; then
          printf 'web-public-ingress: failed to reload restored configuration after apply error\n' >&2
        fi
      fi
    fi
    exit "$exit_status"
  }
  trap restore_on_apply_error ERR

  # Finish the complete backup set before mutating any live include file.
  for file in "${managed_files[@]}"; do
    if container_exec test -f "$OPENRESTY_CONFIG_ROOT/$file"; then
      container_exec cp -p "$OPENRESTY_CONFIG_ROOT/$file" "$backup_release_dir/$file"
    fi
  done
  restore_required=true
  if grep -Fq '/www/history-assets/current' "$CANDIDATE_CONFIG"; then
    prepare_history_ingress
  fi
  for file in "${managed_files[@]}"; do
    container_exec rm -f "$OPENRESTY_CONFIG_ROOT/$file"
  done
  container_exec cp "$remote_candidate" "$OPENRESTY_CONFIG_ROOT/$OPENRESTY_PRIMARY_FILE"
  container_exec chmod 0444 "$OPENRESTY_CONFIG_ROOT/$OPENRESTY_PRIMARY_FILE"

  if ! container_exec openresty -t; then
    trap - ERR
    restore_originals || fail "live syntax test failed and original files could not be fully restored"
    restore_required=false
    fail "live syntax test failed before reload; original files restored"
  fi

  if [[ "$(matching_https_vhosts)" != "1" ]]; then
    trap - ERR
    restore_originals || fail "HTTPS vhost convergence failed and original files could not be fully restored"
    restore_required=false
    fail "candidate did not converge to one HTTPS web vhost; original files restored"
  fi
  container_exec openresty -s reload
  reload_sent=true
  if grep -Fq '/www/history-assets/current' "$CANDIDATE_CONFIG"; then
    verify_history_ingress
  fi
  restore_required=false
  trap - ERR
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
RELEASE_BACKUP_ID="$ROLLBACK_RELEASE_ID"
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
restore_history_ingress "$backup_release_dir"
container_exec openresty -t
container_exec openresty -s reload
printf 'mode=rollback\n'
printf 'restored_config_set_sha256=%s\n' "$backup_sha"
