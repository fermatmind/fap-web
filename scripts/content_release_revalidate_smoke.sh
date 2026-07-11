#!/usr/bin/env bash
set -euo pipefail

REVALIDATE_URL="${CONTENT_RELEASE_REVALIDATE_URL:-${PUBLIC_BASE_URL:-https://fermatmind.com}/api/content-release/revalidate}"
REVALIDATE_SECRET="${CONTENT_RELEASE_REVALIDATE_SECRET:-}"
REVALIDATE_LOCALE="${CONTENT_RELEASE_REVALIDATE_LOCALE:-zh-CN}"
REVALIDATE_TYPE="${CONTENT_RELEASE_REVALIDATE_TYPE:-content_page}"
REVALIDATE_SLUG="${CONTENT_RELEASE_REVALIDATE_SLUG:-help-privacy}"
REVALIDATE_PATHS="${CONTENT_RELEASE_REVALIDATE_PATHS:-/help/privacy,/support}"

log() {
  printf '[content_release_revalidate_smoke] %s\n' "$*"
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing dependency: $1"
    exit 1
  fi
}

require_bin curl
require_bin node
require_bin openssl

if [[ -z "$REVALIDATE_SECRET" ]]; then
  log "CONTENT_RELEASE_REVALIDATE_SECRET is required"
  exit 1
fi

log "probe frontend content-release revalidation consumer"
log "url=${REVALIDATE_URL}"
log "locale=${REVALIDATE_LOCALE}"
log "type=${REVALIDATE_TYPE}"
log "slug=${REVALIDATE_SLUG}"
log "paths=${REVALIDATE_PATHS}"

payload="$(
  REVALIDATE_LOCALE="$REVALIDATE_LOCALE" \
  REVALIDATE_TYPE="$REVALIDATE_TYPE" \
  REVALIDATE_SLUG="$REVALIDATE_SLUG" \
  REVALIDATE_PATHS="$REVALIDATE_PATHS" \
  node <<'NODE'
const paths = String(process.env.REVALIDATE_PATHS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const payload = {
  event: "content_release_publish",
  source: "content_release_revalidate_smoke",
  content: {
    type: String(process.env.REVALIDATE_TYPE ?? "content_page"),
    slug: String(process.env.REVALIDATE_SLUG ?? "help-privacy"),
    locale: String(process.env.REVALIDATE_LOCALE ?? "zh-CN"),
  },
  cache_signal: {
    paths,
    urls: paths,
  },
};

process.stdout.write(JSON.stringify(payload));
NODE
)"
timestamp="$(date +%s)"
nonce="$(openssl rand -hex 16)"
signature="$(printf '%s' "${timestamp}.${nonce}.${payload}" | openssl dgst -sha256 -hmac "$REVALIDATE_SECRET" | awk '{print $NF}')"

curl_header_config="$(mktemp "${TMPDIR:-/tmp}/content-release-revalidate-curl.XXXXXX")"
cleanup_header_config() {
  rm -f "$curl_header_config"
}
trap cleanup_header_config EXIT
chmod 600 "$curl_header_config"
printf '%s\n' \
  'header = "Content-Type: application/json"' \
  "header = \"x-fm-content-release-timestamp: ${timestamp}\"" \
  "header = \"x-fm-content-release-nonce: ${nonce}\"" \
  "header = \"x-fm-content-release-signature: sha256=${signature}\"" \
  >"$curl_header_config"

response="$(curl -fsS -X POST "$REVALIDATE_URL" \
  --config "$curl_header_config" \
  --data "$payload")"

log "validate response payload"
REVALIDATE_RESPONSE="$response" \
REVALIDATE_PATHS="$REVALIDATE_PATHS" \
node <<'NODE'
const response = JSON.parse(String(process.env.REVALIDATE_RESPONSE ?? "{}"));
const expected = String(process.env.REVALIDATE_PATHS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((path) => path.startsWith("/zh/") || path.startsWith("/en/") ? path : `/zh${path}`);

if (response.ok !== true) {
  throw new Error(`unexpected response.ok: ${JSON.stringify(response)}`);
}

const actual = Array.isArray(response.revalidated_paths) ? response.revalidated_paths : [];
for (const path of expected) {
  if (!actual.includes(path)) {
    throw new Error(`missing revalidated path: ${path}`);
  }
}
NODE

log "content release revalidation smoke passed"
