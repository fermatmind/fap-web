#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[rollback_smoke] missing dependency: $1" >&2
    exit 1
  fi
}

require_bin curl
require_bin jq

API_BASE_URL="${API_BASE_URL:-${NEXT_PUBLIC_API_URL:-}}"
SCALE_CODE="${SCALE_CODE:-BIG5_OCEAN}"
LOCALE="${LOCALE:-en}"
REGION="${REGION:-GLOBAL}"
CONSENT_VERSION="${CONSENT_VERSION:-ROLLBACK_SMOKE_CONSENT_v1}"
API_AUTH_TOKEN="${API_AUTH_TOKEN:-}"

if [[ -z "$API_BASE_URL" ]]; then
  echo "[rollback_smoke] API_BASE_URL is required." >&2
  exit 1
fi

API_BASE_URL="${API_BASE_URL%/}"
API_LOCALE="$LOCALE"
if [[ "$LOCALE" == "zh" ]]; then
  API_LOCALE="zh-CN"
fi

AUTH_HEADER=()
if [[ -n "$API_AUTH_TOKEN" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer $API_AUTH_TOKEN")
fi

echo "[rollback_smoke] scale=$SCALE_CODE locale=$LOCALE api=$API_BASE_URL"

QUESTIONS_ENDPOINT="$API_BASE_URL/api/v0.3/scales/$SCALE_CODE/questions?locale=$API_LOCALE&region=$REGION"
QUESTIONS_JSON="$(curl -fsS \
  -H "Accept: application/json" \
  -H "X-FAP-Locale: $API_LOCALE" \
  "${AUTH_HEADER[@]}" \
  "$QUESTIONS_ENDPOINT")"

QUESTION_COUNT="$(echo "$QUESTIONS_JSON" | jq '.questions.items | length')"
if [[ "$QUESTION_COUNT" -le 0 ]]; then
  echo "[rollback_smoke] no questions returned" >&2
  exit 1
fi

ANSWERS_JSON="$(echo "$QUESTIONS_JSON" | jq '[.questions.items[] | {
  question_id: (.question_id // ""),
  code: (.options[0].code // "A")
}]')"

START_PAYLOAD="$(jq -n \
  --arg scale "$SCALE_CODE" \
  --arg locale "$API_LOCALE" \
  --arg region "$REGION" \
  --arg consentVersion "$CONSENT_VERSION" \
  '{
    scale_code: $scale,
    locale: $locale,
    region: $region,
    client_platform: "web",
    client_version: "rollback-smoke",
    channel: "web"
  }
  + (if ($scale == "SDS_20" or $scale == "CLINICAL_COMBO_68")
      then {consent: {accepted: true, version: $consentVersion, locale: $locale}}
      else {}
    end)')"

START_JSON="$(curl -fsS \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-FAP-Locale: $API_LOCALE" \
  "${AUTH_HEADER[@]}" \
  -X POST "$API_BASE_URL/api/v0.3/attempts/start" \
  -d "$START_PAYLOAD")"

ATTEMPT_ID="$(echo "$START_JSON" | jq -r '.attempt_id // empty')"
if [[ -z "$ATTEMPT_ID" ]]; then
  echo "[rollback_smoke] start failed: missing attempt_id" >&2
  echo "$START_JSON" >&2
  exit 1
fi

SUBMIT_PAYLOAD="$(jq -n \
  --arg attemptId "$ATTEMPT_ID" \
  --argjson answers "$ANSWERS_JSON" \
  --arg scale "$SCALE_CODE" \
  --arg locale "$API_LOCALE" \
  --arg consentVersion "$CONSENT_VERSION" \
  '{
    attempt_id: $attemptId,
    duration_ms: 30000,
    answers: $answers
  }
  + (if ($scale == "SDS_20" or $scale == "CLINICAL_COMBO_68")
      then {consent: {accepted: true, version: $consentVersion, locale: $locale}}
      else {}
    end)')"

curl -fsS \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-FAP-Locale: $API_LOCALE" \
  "${AUTH_HEADER[@]}" \
  -X POST "$API_BASE_URL/api/v0.3/attempts/submit" \
  -d "$SUBMIT_PAYLOAD" >/dev/null

REPORT_ENDPOINT="$API_BASE_URL/api/v0.3/attempts/$ATTEMPT_ID/report?refresh=1"
REPORT_JSON="$(curl -fsS \
  -H "Accept: application/json" \
  -H "X-FAP-Locale: $API_LOCALE" \
  "${AUTH_HEADER[@]}" \
  "$REPORT_ENDPOINT")"

REPORT_SCALE="$(echo "$REPORT_JSON" | jq -r '.report.scale_code // .meta.scale_code // "UNKNOWN"')"
LOCKED_STATE="$(echo "$REPORT_JSON" | jq -r '.locked // "unknown"')"

echo "[rollback_smoke] PASS attempt_id=$ATTEMPT_ID questions=$QUESTION_COUNT report_scale=$REPORT_SCALE locked=$LOCKED_STATE"

