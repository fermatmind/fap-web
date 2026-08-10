#!/usr/bin/env bash
set -euo pipefail

role="${FERMATMIND_TLS_ROLE:-}"
lineage="${RENEWED_LINEAGE:-}"

fail() {
  printf 'fermatmind-certbot-hook: %s\n' "$*" >&2
  exit 1
}

[[ -n "$lineage" && -f "$lineage/fullchain.pem" && -f "$lineage/privkey.pem" ]] \
  || fail "RENEWED_LINEAGE does not contain a complete certificate"

install_pair() {
  local target_dir="$1"
  local prefix="$2"
  install -d -m 0755 "$target_dir"
  install -m 0644 "$lineage/fullchain.pem" "$target_dir/${prefix}fullchain.pem.next"
  install -m 0600 "$lineage/privkey.pem" "$target_dir/${prefix}privkey.pem.next"
  mv -f "$target_dir/${prefix}fullchain.pem.next" "$target_dir/${prefix}fullchain.pem"
  mv -f "$target_dir/${prefix}privkey.pem.next" "$target_dir/${prefix}privkey.pem"
}

with_rollback() {
  local target_dir="$1"
  local prefix="$2"
  shift 2
  local backup_dir
  backup_dir="$(mktemp -d "$target_dir/.certbot-backup.XXXXXX")"

  if [[ -f "$target_dir/${prefix}fullchain.pem" ]]; then
    cp -p "$target_dir/${prefix}fullchain.pem" "$backup_dir/fullchain.pem"
  fi
  if [[ -f "$target_dir/${prefix}privkey.pem" ]]; then
    cp -p "$target_dir/${prefix}privkey.pem" "$backup_dir/privkey.pem"
  fi

  install_pair "$target_dir" "$prefix"
  if "$@"; then
    rm -rf -- "$backup_dir"
    return 0
  fi

  if [[ -f "$backup_dir/fullchain.pem" && -f "$backup_dir/privkey.pem" ]]; then
    mv -f "$backup_dir/fullchain.pem" "$target_dir/${prefix}fullchain.pem"
    mv -f "$backup_dir/privkey.pem" "$target_dir/${prefix}privkey.pem"
  else
    rm -f -- "$target_dir/${prefix}fullchain.pem" "$target_dir/${prefix}privkey.pem"
  fi
  rm -rf -- "$backup_dir"
  return 1
}

reload_production_web() {
  local container="$1"
  docker exec "$container" /usr/local/openresty/bin/openresty -t \
    && docker exec "$container" /usr/local/openresty/bin/openresty -s reload
}

reload_staging() {
  /usr/local/nginx/sbin/nginx -t && systemctl reload nginx.service
}

case "$role" in
  production-web)
    readonly container_name="fermatmind-openresty"
    readonly target="/opt/fermatmind/openresty/www/sites/fermatmind.com/ssl"
    with_rollback "$target" "" reload_production_web "$container_name" \
      || fail "renewed production Web certificate failed validation or reload; prior pair restored"
    ;;
  staging)
    readonly target="/etc/fermatmind/tls"
    with_rollback "$target" "staging-" reload_staging \
      || fail "renewed staging certificate failed validation or reload; prior pair restored"
    ;;
  *)
    fail "FERMATMIND_TLS_ROLE must be production-web or staging"
    ;;
esac
