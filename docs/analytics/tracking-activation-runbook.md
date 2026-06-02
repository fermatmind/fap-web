# Tracking Activation Runbook

Scope: PR-TRACK-01, GA4 + Baidu Tongji + Google Ads purchase conversion activation.

Dashboard setup and operator QA live in [Analytics Conversion Setup QA Checklist](./conversion-setup-qa-checklist.md).
Internal traffic and referral pollution governance lives in [Internal Traffic and Referral Governance](./internal-traffic-referral-governance.md).
UTM channel governance lives in [UTM Channel Governance](./utm-channel-governance.md).

## Current State

- GA4 loader: env gated by `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Baidu Tongji loader: env gated by `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and `NEXT_PUBLIC_BAIDU_TONGJI_ID`.
- Google Ads purchase conversion bridge: env gated by `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` and `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL`.
- GTM: not used.
- Baidu Ads: not used.
- Baidu Tongji event tracking may keep the existing `_hmt.push(["_trackEvent", ...])` bridge for event analysis, debug, and legacy event taxonomy. Current Baidu Tongji dashboard setup no longer supports promising new `_trackEvent` category/action conversion goals; new event conversions are limited to public element selection or manual element ID setup.
- Private/noindex routes suppress third-party browser analytics scripts after ANALYTICS-SEO-P0-10. Baidu Tongji automatic pageview collection must not see raw order, result, share, payment, transaction, or token-bearing URLs.
- Private/noindex routes suppress the server-rendered analytics bootstrap after ANALYTICS-SEO-P0-12. These pages should not contain `fm-analytics-bootstrap`, `data-analytics-bootstrap`, Baidu Tongji, GA, or Google Ads bootstrap tokens in SSR HTML.

## Production Environment

Configure these values only in the production deployment environment. Do not commit real IDs or labels.

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_BAIDU_TONGJI_ID=...
NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=...
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-...
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=...
```

Future-reserved labels remain disabled unless a later PR explicitly activates them:

```env
NEXT_PUBLIC_GOOGLE_ADS_TEST_SUBMIT_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_CONVERSION_LABEL=
```

## Event Mapping

| Internal event | GA4 event | Business conversion role | Google Ads purchase conversion |
| --- | --- | --- | --- |
| `start_attempt` | `start_test` | primary funnel step | no |
| `submit_attempt` | `complete_test` | primary funnel step | no |
| `view_result` | `view_result` | primary funnel step | no |
| `click_unlock` | `click_deep_report` | primary funnel step | no |
| `create_order` | `begin_checkout` | primary funnel step | no |
| `payment_confirmed` | `add_payment_info` | not primary purchase | no |
| `purchase_success` | `purchase_success` | primary purchase success | yes |

GA4 is the business-funnel source of truth. The business purchase-success metric is `purchase_success`. Do not add a separate frontend `purchase` dispatch for the same paid success flow; using both `purchase` and `purchase_success` as business purchase success would double count.

Baidu Tongji event-analysis/debug taxonomy may use `_hmt.push(["_trackEvent", category, action, label])` with:

| GA4 key event | Baidu category | Baidu action |
| --- | --- | --- |
| `start_test` | `test` | `start` |
| `complete_test` | `test` | `complete` |
| `view_result` | `result` | `view` |
| `click_deep_report` | `report` | `click` |
| `begin_checkout` | `checkout` | `begin` |
| `purchase_success` | `purchase` | `success` |

The Baidu label is derived from safe test context such as `test_type`, `scale_code`, `form_code`, `test_slug`, or `slug`.

These Baidu values are not a current-dashboard conversion setup promise. If Baidu event conversion is used, configure only public CTA elements through `预览圈选元素` or `手动添加 ID`; do not configure private result, order, share, pay, payment, or history route elements.

Legacy scale-specific events are accepted only as aliases and are normalized before browser/network dispatch:

| Legacy alias | Canonical event |
| --- | --- |
| `start_click` | `start_attempt` |
| `clinical_start` | `start_attempt` |
| `submit_click` | `submit_attempt` |
| `clinical_submit` | `submit_attempt` |
| `report_view_free` | `view_result` |
| `clinical_report_view` | `view_result` |
| `riasec_result_view` | `view_result` |
| `checkout_start` | `create_order` |
| `clinical_checkout_start` | `create_order` |
| `pay_success` | `purchase_success` |

SEO page CTA attribution uses backend-safe `start_attempt` payloads for existing article/topic/test-detail test-start CTAs. Source context is encoded through `source_page_type`, `entry_surface`, `landing_path`, and `current_path`; target tests use `test_slug`. Generic fields such as `content_id`, `topic_id`, `source_slug`, `cta_id`, and `campaign` remain deferred until backend attribution ingest owns them explicitly.

Google Ads purchase conversion payload:

- `send_to`: `${NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}/${NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL}`
- `value`: first finite value from `amount`, `value`, or `price`; omitted when absent.
- `currency`: from `payload.currency`; no default currency is invented by this bridge.
- `transaction_id`: not sent by the Google Ads bridge; ordinary analytics payloads use the shared tracking redaction policy before dispatch.

`create_order` and `payment_confirmed` must never dispatch Google Ads purchase conversion. `pay_success` may remain in older product paths, but it is normalized to `purchase_success` before dispatch. Email and other PII fields are filtered before GA4, Google Ads, Baidu Tongji, `/api/track`, URL query payloads, and public HTML.

## Verification

1. In Chrome Network, confirm `https://www.googletagmanager.com/gtag/js` loads on public production routes after analytics consent.
2. In Chrome Network, confirm `https://hm.baidu.com/hm.js?<id>` loads on public production routes after analytics consent when Baidu Tongji is configured.
3. In GA4 Realtime or DebugView, confirm funnel events appear.
4. In Google Ads conversion diagnostics, confirm the Google tag is detected.
5. In Baidu Tongji realtime visitors, confirm public page visits appear.
6. Confirm public CTA elements can be selected or manually addressed by ID in Baidu Tongji only on allowed public pages.
7. Confirm private/noindex routes do not load `hm.baidu.com`, `_hmt`, or Baidu Tongji automatic pageview scripts.
8. Confirm private/noindex route HTML does not include `fm-analytics-bootstrap` or `data-analytics-bootstrap`.
9. Complete only an authorized paid test flow and confirm GA4 `purchase_success` plus Google Ads `conversion` are observable.

## Prohibitions

- Do not commit real GA4, Google Ads, Baidu Tongji, Baidu verification, or conversion label values.
- Do not replace the existing bridge with GTM.
- Do not use Ads conversion tracking for non-purchase events as the primary conversion.
- Do not emit both `purchase` and `purchase_success` as business purchase success.
- Do not add Baidu Ads `bp.js`.
- Do not document `_trackEvent` category/action as a currently supported new Baidu conversion-goal setup path.
- Do not configure Baidu element conversions on private/noindex route families such as `/result`, `/orders`, `/share`, `/pay`, `/payment`, or `/history`, including `/zh` and `/en` variants.
- Do not rely on frontend route params for fully private identifiers. Next App Router may serialize dynamic pathname params in internal flight scripts; fully private result/order/share identifiers require a server-side lookup or token-exchange route redesign.
- Do not add Facebook, TikTok, or other third-party pixels.
