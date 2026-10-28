#!/usr/bin/env bash
set -euo pipefail

readonly IMAGE="1panel/openresty@sha256:ee8c5117c291c7384a381c32068e1d9a50adc8bf392f9157c42d14bedbbe018b"
readonly CONFIG="${1:-deploy/openresty/fap-web-public.conf}"

[[ -f "$CONFIG" ]] || { printf 'missing ingress config\n' >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { printf 'docker is required\n' >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { printf 'curl is required\n' >&2; exit 1; }

config_path="$(cd "$(dirname "$CONFIG")" && pwd)/$(basename "$CONFIG")"
probe_dir="$(mktemp -d)"
container_id=""
cleanup() {
  [[ -z "$container_id" ]] || docker rm -f "$container_id" >/dev/null
  rm -rf "$probe_dir"
}
trap cleanup EXIT
container_id="$(docker run --rm -d -p 127.0.0.1::443 \
  --entrypoint /bin/sh \
  --mount "type=bind,source=${config_path},target=/tmp/source.conf,readonly" \
  --mount "type=bind,source=${probe_dir},target=/tmp/probe" \
  "$IMAGE" \
  -euc '
    openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
      -subj "/CN=fermatmind.com" -addext "subjectAltName=DNS:fermatmind.com" \
      -keyout /tmp/test.key -out /tmp/probe/test.crt >/dev/null 2>&1
    sed \
      -e "s#/www/sites/fermatmind.com/ssl/fullchain.pem#/tmp/probe/test.crt#g" \
      -e "s#/www/sites/fermatmind.com/ssl/privkey.pem#/tmp/test.key#g" \
      /tmp/source.conf > /tmp/candidate.conf
    cat > /tmp/nginx.conf <<EOF
events {}
http {
  proxy_cache_path /tmp/fap-web-ingress-cache keys_zone=fermatmind_public:1m;
  include /tmp/candidate.conf;
  server {
    listen 3000;
    location = /_next/static/healthy.js { return 200 "/* healthy */"; }
    location = /_next/static/partial.js { return 206 "/* partial */"; }
    location = /_next/static/not-modified.js { return 304; }
    location = /_next/static/recovered.js {
      if (!-f /tmp/asset-recovered) { return 502; }
      return 200 "/* recovered */";
    }
    location / { return 404; }
  }
}
EOF
    openresty -t -c /tmp/nginx.conf
    exec openresty -g "daemon off;" -c /tmp/nginx.conf
  ')"
port="$(docker port "$container_id" 443/tcp)"
port="${port##*:}"
probe() {
  curl --silent --show-error --noproxy '*' --connect-timeout 2 --max-time 5 \
    --cacert "$probe_dir/test.crt" --resolve "fermatmind.com:${port}:127.0.0.1" \
    --dump-header "$probe_dir/headers" --output /dev/null --write-out '%{http_code}' \
    "https://fermatmind.com:${port}$1"
}
ready=0
for ((attempt = 0; attempt < 30; attempt++)); do
  if [[ -f "$probe_dir/test.crt" ]] && [[ "$(probe /healthz 2>/dev/null || true)" == 200 ]]; then
    ready=1
    break
  fi
  sleep 0.2
done
[[ "$ready" == 1 ]] || { docker logs "$container_id"; printf 'ingress fixture did not start\n' >&2; exit 1; }
assert_response() {
  local route="$1" expected_status="$2" expected_cache="$3" observed
  observed="$(probe "$route")"
  [[ "$observed" == "$expected_status" ]] || { printf 'unexpected asset status: %s\n' "$observed" >&2; exit 1; }
  tr -d '\r' < "$probe_dir/headers" | grep -Fxi "Cache-Control: $expected_cache" >/dev/null \
    || { printf 'unexpected asset cache policy for %s\n' "$route" >&2; exit 1; }
}
immutable='public, max-age=31536000, immutable'
assert_response /_next/static/healthy.js 200 "$immutable"
assert_response /_next/static/partial.js 206 "$immutable"
assert_response /_next/static/not-modified.js 304 "$immutable"
assert_response /_next/static/missing.js 404 no-store
assert_response /_next/static/recovered.js 502 no-store
docker exec "$container_id" touch /tmp/asset-recovered
assert_response /_next/static/recovered.js 200 "$immutable"
printf 'ingress syntax, verified TLS, static error cache and recovery passed\n'
