#!/usr/bin/env bash
set -euo pipefail

BASE_URL_INPUT="${BASE_URL:-${1:-}}"
LEGACY_MODE_INPUT="${LEGACY_MODE_EXPECTATION:-${2:-redirect}}"
CURL_TIMEOUT_SEC="${CURL_TIMEOUT_SEC:-15}"
CANONICAL_BASE_URL_INPUT="${CANONICAL_BASE_URL:-https://fermatmind.com}"
FIXED_ACCEPT_LANGUAGE="${FIXED_ACCEPT_LANGUAGE:-zh-CN,zh;q=0.9,en;q=0.8}"
ANON_COOKIE_NAME="fap_anonymous_id_v1"

usage() {
  cat <<'EOF'
Usage:
  BASE_URL="https://staging.example.com" LEGACY_MODE_EXPECTATION="redirect" bash scripts/http_boundary_smoke.sh
  bash scripts/http_boundary_smoke.sh "https://canary.example.com" "gone"

Required:
  BASE_URL                   Target origin, for example https://staging.example.com
Optional:
  LEGACY_MODE_EXPECTATION    redirect | gone (default: redirect)
  CURL_TIMEOUT_SEC           curl timeout in seconds (default: 15)
  CANONICAL_BASE_URL         Apex canonical origin when BASE_URL is production www (default: https://fermatmind.com)
  FIXED_ACCEPT_LANGUAGE      accept-language for root content redirects
EOF
}

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '[http_boundary_smoke] %s %s\n' "$(timestamp)" "$*"
}

fail() {
  log "FAIL $*"
  FAILURES=$((FAILURES + 1))
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf '[http_boundary_smoke] missing dependency: %s\n' "$1" >&2
    exit 2
  fi
}

trim_trailing_slash() {
  printf '%s' "$1" | sed 's#/*$##'
}

extract_status() {
  awk 'toupper($1) ~ /^HTTP/ { code = $2 } END { print code }' "$1"
}

extract_header_first() {
  local file="$1"
  local name="$2"
  awk -v name="$name" '
    index(tolower($0), tolower(name) ":") == 1 {
      sub(/^[^:]+:[[:space:]]*/, "", $0)
      sub(/\r$/, "", $0)
      print
      exit
    }
  ' "$file"
}

extract_header_all() {
  local file="$1"
  local name="$2"
  awk -v name="$name" '
    index(tolower($0), tolower(name) ":") == 1 {
      sub(/^[^:]+:[[:space:]]*/, "", $0)
      sub(/\r$/, "", $0)
      print
    }
  ' "$file"
}

collapse_lines() {
  paste -sd ';' - | sed 's/;/; /g'
}

log_response() {
  local path="$1"
  local location_log="${LAST_LOCATION:-<none>}"
  local robots_log="${LAST_X_ROBOTS_TAG:-<none>}"
  local cookie_log="${LAST_SET_COOKIE_COMPACT:-<none>}"
  log "path=${path} status=${LAST_STATUS:-<none>} location=${location_log} x-robots-tag=${robots_log} set-cookie=${cookie_log}"
}

run_request() {
  local path="$1"
  shift

  REQUEST_COUNTER=$((REQUEST_COUNTER + 1))
  local headers_file="$TMP_DIR/headers-${REQUEST_COUNTER}.txt"
  local body_file="$TMP_DIR/body-${REQUEST_COUNTER}.txt"

  if ! curl -sS -D "$headers_file" -o "$body_file" --max-time "$CURL_TIMEOUT_SEC" "$@" "${BASE_URL}${path}"; then
    fail "curl request failed path=${path}"
    return 1
  fi

  LAST_STATUS="$(extract_status "$headers_file")"
  LAST_LOCATION="$(extract_header_first "$headers_file" "Location")"
  LAST_X_ROBOTS_TAG="$(extract_header_first "$headers_file" "X-Robots-Tag")"
  LAST_SET_COOKIE="$(extract_header_all "$headers_file" "Set-Cookie")"
  LAST_SET_COOKIE_COMPACT="$(printf '%s\n' "$LAST_SET_COOKIE" | sed '/^$/d' | collapse_lines)"
  LAST_HEADERS_FILE="$headers_file"
  LAST_BODY_FILE="$body_file"

  log_response "$path"
  return 0
}

assert_status() {
  local expected="$1"
  local label="$2"
  if [[ "${LAST_STATUS:-}" != "$expected" ]]; then
    fail "${label}: expected status=${expected}, got=${LAST_STATUS:-<none>}"
  fi
}

assert_location_contains() {
  local expected="$1"
  local label="$2"
  if [[ "${LAST_LOCATION:-}" != *"$expected"* ]]; then
    fail "${label}: expected location to contain '${expected}', got='${LAST_LOCATION:-<none>}'"
  fi
}

assert_location_equals() {
  local expected="$1"
  local label="$2"
  if [[ "${LAST_LOCATION:-}" != "$expected" ]]; then
    fail "${label}: expected location='${expected}', got='${LAST_LOCATION:-<none>}'"
  fi
}

assert_location_contains_either() {
  local first="$1"
  local second="$2"
  local label="$3"
  if [[ "${LAST_LOCATION:-}" != *"$first"* && "${LAST_LOCATION:-}" != *"$second"* ]]; then
    fail "${label}: expected location to contain '${first}' or '${second}', got='${LAST_LOCATION:-<none>}'"
  fi
}

assert_no_location() {
  local label="$1"
  if [[ -n "${LAST_LOCATION:-}" ]]; then
    fail "${label}: expected no Location header, got='${LAST_LOCATION}'"
  fi
}

assert_x_robots_contains() {
  local expected="$1"
  local label="$2"
  local actual_lower
  actual_lower="$(printf '%s' "${LAST_X_ROBOTS_TAG:-}" | tr '[:upper:]' '[:lower:]')"
  if [[ "$actual_lower" != *"$expected"* ]]; then
    fail "${label}: expected X-Robots-Tag to contain '${expected}', got='${LAST_X_ROBOTS_TAG:-<none>}'"
  fi
}

assert_no_set_cookie() {
  local label="$1"
  if [[ -n "${LAST_SET_COOKIE:-}" ]]; then
    fail "${label}: expected no Set-Cookie, got='${LAST_SET_COOKIE_COMPACT:-<none>}'"
  fi
}

assert_set_cookie_contains() {
  local expected="$1"
  local label="$2"
  if [[ "${LAST_SET_COOKIE:-}" != *"$expected"* ]]; then
    fail "${label}: expected Set-Cookie to contain '${expected}', got='${LAST_SET_COOKIE_COMPACT:-<none>}'"
  fi
}

assert_www_redirect_to_apex() {
  local path="$1"
  local expected_final_status="$2"
  local previous_base_url="$BASE_URL"
  local expected_location="${CANONICAL_BASE_URL}${path}"

  if [[ "$path" == "/" ]]; then
    expected_location="$CANONICAL_BASE_URL"
  fi

  BASE_URL="$WWW_REDIRECT_BASE_URL"
  run_request "$path"
  assert_status "308" "www ${path}"
  assert_location_equals "$expected_location" "www ${path}"
  assert_no_set_cookie "www ${path}"

  BASE_URL="$CANONICAL_BASE_URL"
  run_request "$path"
  assert_status "$expected_final_status" "apex ${path}"

  BASE_URL="$previous_base_url"
}

BASE_URL="$(trim_trailing_slash "$BASE_URL_INPUT")"
CANONICAL_BASE_URL="$(trim_trailing_slash "$CANONICAL_BASE_URL_INPUT")"
LEGACY_MODE_EXPECTATION="$(printf '%s' "$LEGACY_MODE_INPUT" | tr '[:upper:]' '[:lower:]')"

if [[ -z "$BASE_URL" ]]; then
  printf '[http_boundary_smoke] BASE_URL is required.\n' >&2
  usage >&2
  exit 64
fi

if [[ "$LEGACY_MODE_EXPECTATION" != "redirect" && "$LEGACY_MODE_EXPECTATION" != "gone" ]]; then
  printf '[http_boundary_smoke] LEGACY_MODE_EXPECTATION must be redirect or gone.\n' >&2
  usage >&2
  exit 64
fi

require_bin bash
require_bin curl
require_bin grep
require_bin mktemp
require_bin paste
require_bin sed

WWW_REDIRECT_BASE_URL=""
if [[ "$BASE_URL" == "https://www.fermatmind.com" ]]; then
  WWW_REDIRECT_BASE_URL="$BASE_URL"
  BASE_URL="$CANONICAL_BASE_URL"
elif [[ "$BASE_URL" == "$CANONICAL_BASE_URL" ]]; then
  WWW_REDIRECT_BASE_URL="https://www.fermatmind.com"
fi

FAILURES=0
REQUEST_COUNTER=0
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

log "base_url=${BASE_URL} legacy_mode=${LEGACY_MODE_EXPECTATION} accept_language=${FIXED_ACCEPT_LANGUAGE}"

if [[ -n "$WWW_REDIRECT_BASE_URL" ]]; then
  log "www_redirect_base_url=${WWW_REDIRECT_BASE_URL} canonical_base_url=${CANONICAL_BASE_URL}"
  assert_www_redirect_to_apex "/" "200"
  assert_www_redirect_to_apex "/en" "200"
  assert_www_redirect_to_apex "/zh/career/jobs" "200"
  assert_www_redirect_to_apex "/zh/career/tests/riasec" "404"
  assert_www_redirect_to_apex "/zh/career/tests/riasec/result" "404"
fi

run_request "/"
assert_status "200" "/"
assert_no_location "/"

for root_path in articles career topics personality; do
  run_request "/${root_path}?utm=a" -H "Accept-Language: ${FIXED_ACCEPT_LANGUAGE}"
  assert_status "308" "/${root_path}?utm=a"
  assert_location_contains "/zh/${root_path}?utm=a" "/${root_path}?utm=a"
  assert_no_set_cookie "/${root_path}?utm=a"
done

for gone_path in /professions; do
  run_request "${gone_path}"
  assert_status "410" "${gone_path}"
  assert_x_robots_contains "noindex" "${gone_path}"
  assert_no_set_cookie "${gone_path}"
done

run_request "/types"
assert_status "308" "/types"
assert_location_contains "/personality" "/types"
assert_no_set_cookie "/types"

run_request "/test?utm=a"
assert_status "308" "/test?utm=a"
assert_location_contains "/en/tests?utm=a" "/test?utm=a"

run_request "/test/mbti-test?utm=a"
assert_status "308" "/test/mbti-test?utm=a"
assert_location_contains "/en/tests/mbti-test?utm=a" "/test/mbti-test?utm=a"

if [[ "$LEGACY_MODE_EXPECTATION" == "redirect" ]]; then
  run_request "/en/test/mbti-test?utm=a"
  assert_status "308" "/en/test/mbti-test?utm=a"
  assert_location_contains "/en/tests/mbti-personality-test-16-personality-types?utm=a" "/en/test/mbti-test?utm=a"

  run_request "/en/test/mbti-test/take?utm=a"
  assert_status "308" "/en/test/mbti-test/take?utm=a"
  assert_location_contains "/en/tests/mbti-personality-test-16-personality-types/take?utm=a" "/en/test/mbti-test/take?utm=a"

  run_request "/quiz?utm=a"
  assert_status "308" "/quiz?utm=a"
  assert_location_contains "/en/tests?utm=a" "/quiz?utm=a"

  run_request "/quiz/mbti-test?utm=a"
  assert_status "308" "/quiz/mbti-test?utm=a"
  assert_location_contains_either "/en/quiz/mbti-test?utm=a" "/en/tests/mbti-test?utm=a" "/quiz/mbti-test?utm=a"

  run_request "/en/quiz/mbti-test?utm=a"
  assert_status "308" "/en/quiz/mbti-test?utm=a"
  assert_location_contains_either "/en/tests/mbti-personality-test-16-personality-types/take?utm=a" "/en/tests/mbti-personality-test-16-personality-types?utm=a" "/en/quiz/mbti-test?utm=a"
else
  for gone_legacy_path in "/en/test/mbti-test" "/en/test/mbti-test/take" "/quiz/mbti-test" "/en/quiz/mbti-test"; do
    run_request "${gone_legacy_path}"
    assert_status "410" "${gone_legacy_path}"
  done

  run_request "/quiz"
  assert_status "404" "/quiz"
fi

COOKIE_JAR="${TMP_DIR}/anon-cookie.jar"
run_request "/en/tests/mbti-personality-test-16-personality-types/take" -c "$COOKIE_JAR"
assert_status "200" "/en/tests/.../take first request"
assert_no_location "/en/tests/.../take first request"
assert_x_robots_contains "noindex" "/en/tests/.../take first request"
assert_set_cookie_contains "${ANON_COOKIE_NAME}=" "/en/tests/.../take first request"

run_request "/en/tests/mbti-personality-test-16-personality-types/take" -b "$COOKIE_JAR" -c "$COOKIE_JAR"
assert_status "200" "/en/tests/.../take second request"
assert_no_location "/en/tests/.../take second request"
assert_x_robots_contains "noindex" "/en/tests/.../take second request"
assert_no_set_cookie "/en/tests/.../take second request"

for excluded_path in /robots.txt /sitemap.xml /llms.txt /llms-full.txt; do
  run_request "${excluded_path}"
  assert_status "200" "${excluded_path}"
  assert_no_location "${excluded_path}"
  assert_no_set_cookie "${excluded_path}"
done

run_request "/sitemap-en.xml"
assert_status "308" "/sitemap-en.xml"
assert_location_contains "/sitemap.xml" "/sitemap-en.xml"
assert_no_set_cookie "/sitemap-en.xml"

if (( FAILURES > 0 )); then
  log "completed with failures=${FAILURES}"
  exit 1
fi

log "PASS"
