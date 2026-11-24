#!/usr/bin/env bash
# Run on staging with the production OpenResty image and the existing staging
# Next.js service on loopback. The candidate gateway binds only an ephemeral
# loopback port and uses its own paths, TLS certificate and logs.
set -euo pipefail
image="${1:?usage: test-history-ingress-staging.sh <pinned-image> [gateway|final]}"
phase="${2:-final}"
[[ "$phase" == gateway || "$phase" == final ]]
docker_cmd=(docker)
if ! docker ps >/dev/null 2>&1; then docker_cmd=(sudo -n docker); fi
dir="$(mktemp -d)"
container=""
proxy_pid=""
cleanup() {
  if [[ -n "$container" ]]; then "${docker_cmd[@]}" rm -f "$container" >/dev/null; fi
  if [[ -n "$proxy_pid" ]]; then kill "$proxy_pid" 2>/dev/null || true; fi
  rm -rf -- "$dir"
}
trap cleanup EXIT
mkdir -p "$dir/www/sites/fermatmind.com/ssl" "$dir/conf.d" "$dir/cache" "$dir/logs"
ssl="$dir/www/sites/fermatmind.com/ssl"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=fermatmind.com \
  -addext subjectAltName=DNS:fermatmind.com -keyout "$ssl/privkey.pem" -out "$ssl/fullchain.pem" 2>/dev/null
version="$(bash scripts/ops/install-history-avatars.sh public/images/global-history "$dir/www/history-assets")"
read -r port clear < <(python3 - <<'PY'
import socket
with socket.socket() as a, socket.socket() as b:
    a.bind(('127.0.0.1',0))
    b.bind(('127.0.0.1',0))
    print(a.getsockname()[1],b.getsockname()[1])
PY
)
node scripts/ops/test-history-ingress-staging.mjs upstream "$dir/upstream-port" &
proxy_pid=$!
for _ in {1..50}; do [[ -s "$dir/upstream-port" ]] && break; sleep 0.1; done
[[ -s "$dir/upstream-port" ]]
upstream="$(cat "$dir/upstream-port")"
sed -e "s/listen 80;/listen 127.0.0.1:$clear;/" \
    -e "s/listen 443 ssl;/listen 127.0.0.1:$port ssl;/" \
    -e "s@127\.0\.0\.1:3000@127.0.0.1:$upstream@g" \
    deploy/openresty/fap-web-public.conf > "$dir/conf.d/web.conf"

container="$("${docker_cmd[@]}" run -d --network host --ulimit nofile=1024:524288 \
  --mount "type=bind,source=$dir/logs,target=/var/log/nginx" \
  --mount "type=bind,source=$dir/cache,target=/var/cache/nginx" \
  --mount "type=bind,source=$dir/www,target=/www,readonly" \
  --mount "type=bind,source=$dir/conf.d,target=/usr/local/openresty/nginx/conf/conf.d,readonly" \
  --mount "type=bind,source=$(pwd)/deploy/openresty/nginx.conf,target=/usr/local/openresty/nginx/conf/nginx.conf,readonly" \
  --entrypoint /bin/sh "$image" -ec 'openresty -t; exec openresty -g "daemon off;"')"
ready=0
for _ in {1..40}; do
  if curl --noproxy '*' -fsS --max-time 2 --cacert "$ssl/fullchain.pem" \
    --resolve "fermatmind.com:$port:127.0.0.1" "https://fermatmind.com:$port/healthz" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.1
done
if [[ "$ready" != 1 ]]; then "${docker_cmd[@]}" logs "$container"; exit 1; fi
"${docker_cmd[@]}" exec "$container" sh -ec '
  for proc in /proc/[0-9]*; do
    case "$(cat "$proc/comm" 2>/dev/null || true)" in
      nginx|openresty)
        if tr "\000" " " < "$proc/cmdline" | grep -q "worker process"; then
          awk "/Max open files/ {if (\$4 < 8192 || \$5 < 8192) exit 1; print}" "$proc/limits"
        fi
        ;;
    esac
  done
' | awk '/Max open files/ {n++; if ($4 < 8192 || $5 < 8192) exit 1} END {if (!n) exit 1}'
node scripts/ops/test-history-ingress-staging.mjs probe "$port" "$ssl/fullchain.pem" "$upstream" "$version" "$phase"
