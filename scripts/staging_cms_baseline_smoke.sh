#!/usr/bin/env bash
set -euo pipefail

API_URL="${CMS_BASELINE_API_URL:-${NEXT_PUBLIC_API_URL:-https://staging-api.fermatmind.com}}"
WEB_URL="${CMS_BASELINE_WEB_URL:-${STAGING_WEB_URL:-https://staging.fermatmind.com}}"

log() {
  printf '[staging_cms_baseline_smoke] %s\n' "$*"
}

log "validate staging CMS baseline"
log "api=${API_URL}"
log "web=${WEB_URL}"

pnpm cms:baseline:staging --api-url "$API_URL" --web-url "$WEB_URL"
