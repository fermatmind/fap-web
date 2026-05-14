# Tracking Activation Runbook

Scope: PR-TRACK-01, GA4 + Baidu Tongji + Google Ads purchase conversion activation.

## Current State

- GA4 loader: env gated by `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Baidu Tongji loader: env gated by `NEXT_PUBLIC_ANALYTICS_ENABLED=true` and `NEXT_PUBLIC_BAIDU_TONGJI_ID`.
- Google Ads purchase conversion bridge: env gated by `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` and `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL`.
- GTM: not used.
- Baidu Ads: not used.
- Baidu Tongji event tracking keeps the existing `_hmt.push(["_trackEvent", ...])` bridge. This PR does not add Baidu Ads `bp.js` or Baidu marketing conversion tracking.

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

| Internal event | GA4 event | Google Ads purchase conversion |
| --- | --- | --- |
| `start_attempt` | `start_attempt` | no |
| `submit_attempt` | `submit_attempt` | no |
| `view_result` | `view_result` | no |
| `click_unlock` | `click_unlock` | no |
| `create_order` | `begin_checkout` | no |
| `payment_confirmed` | `add_payment_info` | no |
| `purchase_success` | `purchase` | yes |

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

Google Ads purchase conversion payload:

- `send_to`: `${NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}/${NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL}`
- `value`: first finite value from `amount`, `value`, or `price`; omitted when absent.
- `currency`: from `payload.currency`; no default currency is invented by this bridge.
- `transaction_id`: first available value from `order_no`, `orderNo`, `order_id`, or `transaction_id`; omitted when absent.

`create_order` and `payment_confirmed` must never dispatch Google Ads purchase conversion. `pay_success` may remain in older product paths, but it is normalized to `purchase_success` before dispatch. Email and other PII fields are filtered before GA4, Google Ads, Baidu Tongji, `/api/track`, URL query payloads, and public HTML.

## Verification

1. In Chrome Network, confirm `https://www.googletagmanager.com/gtag/js` loads after analytics consent.
2. In Chrome Network, confirm `https://hm.baidu.com/hm.js?<id>` loads after analytics consent when Baidu Tongji is configured.
3. In GA4 Realtime or DebugView, confirm funnel events appear.
4. In Google Ads conversion diagnostics, confirm the Google tag is detected.
5. In Baidu Tongji realtime visitors, confirm a page visit appears.
6. Complete a paid purchase flow and confirm GA4 `purchase` plus Google Ads `conversion` are observable.

## Prohibitions

- Do not commit real GA4, Google Ads, Baidu Tongji, Baidu verification, or conversion label values.
- Do not replace the existing bridge with GTM.
- Do not use Ads conversion tracking for non-purchase events as the primary conversion.
- Do not add Baidu Ads `bp.js`.
- Do not add Facebook, TikTok, or other third-party pixels.
