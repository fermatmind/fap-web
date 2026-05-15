# MBTI Funnel and Unlock Observability

## Scope

SEO-OPS-04A makes the MBTI controlled commercial-funnel acceptance path observable in browser Network through `/api/track` for:

- `start_attempt`
- `submit_attempt`
- `view_result`
- `click_unlock`
- `create_order`

The change is limited to event dispatch visibility. It does not change checkout, payment, order creation, report entitlement, pricing, scoring, recommendation, profile, sitemap, or `llms.txt` behavior.

## Event Boundary

MBTI take flow uses the network-observable funnel dispatcher for `start_attempt` and `submit_attempt` while preserving existing safe attribution fields from the article/test entry path.

MBTI result flow uses the same dispatcher for `view_result`, `click_unlock`, and `create_order`. The checkout API call and pending-order persistence remain unchanged.

Safe attribution fields such as `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `source_route_family`, `source_slug`, `cta_id`, `target_test_slug`, `landing_path`, and `referrer` may be carried through the shared tracking payload filter. Arbitrary query params and PII remain blocked.

## Ads Boundary

`create_order` and `click_unlock` are observable funnel events only. They must not trigger Google Ads purchase conversion.

Only `purchase_success` and its legacy alias `pay_success` are allowed to represent purchase conversion. SEO-OPS-04A does not execute or change purchase handling.

## PII Boundary

Event payloads must not include email, phone, name, raw payment identifiers, arbitrary query params, or answer payloads. The shared tracking payload filter remains responsible for redacting attempt/order identifiers and unsafe URL values.

## Live Acceptance Notes

After deployment, SEO-OPS-04 should verify:

- MBTI article/test entry preserves safe UTM/context into the take URL and attempt start metadata.
- `/api/track` is visible for `start_attempt`, `submit_attempt`, `view_result`, `click_unlock`, and `create_order`.
- Checkout/order can be reached and stopped before real payment.
- No Ads purchase conversion fires before `purchase_success` or `pay_success`.
