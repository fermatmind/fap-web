# RIASEC Standard Funnel Events

## Scope

`SEO-OPS-03` adds canonical funnel tracking for the RIASEC standard test flow only:

- `start_attempt`
- `submit_attempt`
- `view_result`

Existing RIASEC-specific events remain secondary analytics signals. They do not replace the canonical SEO funnel taxonomy.

## Event Policy

RIASEC start and submit events use safe metadata only:

- `scale_code: RIASEC`
- `form_code`
- `test_slug`
- `attempt_id`
- `answered_count` and duration for submit
- safe SEO attribution from `SEO-OPS-02` when available

RIASEC result view emits `view_result` after the visible result shell renders, then preserves `riasec_result_view` as the RIASEC-specific secondary event.

## Privacy And Ads Boundary

The RIASEC funnel events must not include email, auth tokens, answer payloads, payment data, checkout URLs, or report URLs.

Google Ads purchase conversion remains restricted to `purchase_success` and the legacy `pay_success` alias. `start_attempt`, `submit_attempt`, and `view_result` must never trigger Ads purchase conversion.

## SEO-OPS-03B Live Network Observability

`SEO-OPS-03B` keeps the default analytics consent boundary intact for general `trackClientEvent` calls. For the RIASEC free-result pilot only, canonical non-commercial funnel events (`start_attempt`, `submit_attempt`, `view_result`) also use a network-observable `/api/track` dispatch so live browser QA can verify the standard event chain. Without analytics consent, this path sends only the sanitized `/api/track` payload and does not dispatch GA4, Baidu, or Google Ads browser analytics calls.

## Commercial Limitation

RIASEC currently has no opened unlock/order commercial path in this PR. `click_unlock`, `create_order`, and `purchase_success` live acceptance remains separate from this RIASEC standard funnel event patch.
