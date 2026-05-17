# Search Intelligence Tracking Fields

## Purpose

SEO-DASH-03A adds Search Intelligence-safe attribution fields to the fap-web tracking transport. This is a transport-field change only: it does not create new funnel event names, does not change purchase conversion semantics, and does not make `/api/track` a source of truth.

## Fields Added

The tracking transport may now include:

- `source_engine`
- `consent_state`
- `is_internal`
- `is_qa`
- `is_bot`
- `environment`
- `traffic_quality`

`source_engine` is derived from UTM source/medium/campaign/content, referrer, landing/current path context, and paid click indicators. Produced values are limited to `google`, `baidu`, `bing_indexnow`, `llms`, `direct`, `paid_google`, `paid_baidu`, and `unknown`.

`consent_state` is included only after the existing analytics consent hard-stop allows the browser event to be sent. Denied or missing analytics consent still prevents marketing analytics and `/api/track` transport.

## Source of Truth

`/api/track` remains transport only. Purchase truth remains backend orders, payment events, and benefit grants. GA4 and Baidu Tongji remain behavior telemetry and must not become purchase truth.

## Traffic Quality Labels

The labels support downstream filtering for Search Intelligence:

- `codex_qa`, `controlled_pilot`, or `acceptance` campaign/source context marks QA traffic.
- Recognized crawler user agents mark bot traffic without storing raw user agents.
- Non-production environments are labeled by environment and treated as internal traffic.
- Default production browser traffic is `production_user`.

No frontend raw internal IP list or raw QA email list is introduced.

## PII Boundary

The transport sanitizer continues to forbid or redact sensitive values. Search Intelligence detail must not receive email, raw cookies, raw order numbers, raw attempt IDs, payment IDs, provider event IDs, raw payment payloads, tokens, checkout URLs, or report URLs.

## Funnel and Claim Boundary

Canonical funnel events remain `start_attempt`, `submit_attempt`, `view_result`, `click_unlock`, `create_order`, `payment_confirmed`, and `purchase_success`. `pay_success` remains a legacy alias for `purchase_success`.

RIASEC, Big Five, and Career Decision metrics must not be named or modeled as full career recommender runtime. These fields describe attribution transport only.

## Deferred

SEO-DASH-03B should implement backend attribution and revenue builders against the locked data contract. This PR does not change sitemap, llms, payment, order, report, email, recommendation, scoring, backend, deploy, env, cloud, or production behavior.
