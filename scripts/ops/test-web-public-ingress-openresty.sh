#!/usr/bin/env bash
set -euo pipefail

readonly IMAGE="1panel/openresty@sha256:ee8c5117c291c7384a381c32068e1d9a50adc8bf392f9157c42d14bedbbe018b"
readonly CONFIG="${1:-deploy/openresty/fap-web-public.conf}"

[[ -f "$CONFIG" ]] || { printf 'missing ingress config\n' >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { printf 'docker is required\n' >&2; exit 1; }

config_path="$(cd "$(dirname "$CONFIG")" && pwd)/$(basename "$CONFIG")"
docker run --rm \
  --entrypoint /bin/sh \
  --mount "type=bind,source=${config_path},target=/tmp/source.conf,readonly" \
  "$IMAGE" \
  -euc '
    openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
      -subj "/CN=localhost" -keyout /tmp/test.key -out /tmp/test.crt >/dev/null 2>&1
    sed \
      -e "s#/www/sites/fermatmind.com/ssl/fullchain.pem#/tmp/test.crt#g" \
      -e "s#/www/sites/fermatmind.com/ssl/privkey.pem#/tmp/test.key#g" \
      /tmp/source.conf > /tmp/candidate.conf
    cat > /tmp/nginx.conf <<EOF
events {}
http {
  proxy_cache_path /tmp/fap-web-ingress-cache keys_zone=fermatmind_public:1m;
  include /tmp/candidate.conf;
}
EOF
    openresty -t -c /tmp/nginx.conf
  '
