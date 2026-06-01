# Analytics Conversion Setup QA Checklist

Scope: ANALYTICS-SEO-P0-02. This document is for GA4, Google Ads, and Baidu Tongji dashboard setup and QA after the frontend conversion event taxonomy is deployed.

Do not paste real IDs, labels, order numbers, transaction IDs, customer data, cookies, access tokens, or screenshots containing account secrets into this repository.

## 1. Code Events vs Dashboard Configuration

The frontend code emits the canonical browser analytics events. Dashboard owners must separately mark or configure those events as conversions.

| Funnel action | Frontend canonical event | GA4 event to mark as Key Event | Baidu Tongji category | Baidu Tongji action | Google Ads conversion |
| --- | --- | --- | --- | --- | --- |
| Start test | `start_attempt` | `start_test` | `test` | `start` | no |
| Complete test | `submit_attempt` | `complete_test` | `test` | `complete` | no |
| View result | `view_result` | `view_result` | `result` | `view` | no |
| Click deep report | `click_unlock` | `click_deep_report` | `report` | `click` | no |
| Begin checkout | `create_order` | `begin_checkout` | `checkout` | `begin` | no |
| Purchase success | `purchase_success` | `purchase_success` | `purchase` | `success` | yes, purchase only |

`payment_confirmed` is tracked as GA4 `add_payment_info`. It is not the primary purchase conversion.

## 2. Required Production Environment

Engineering must confirm the production deployment has analytics enabled and uses production-only public IDs. Operators must not change these values from the analytics dashboard.

```env
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_BAIDU_TONGJI_ID=...
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-...
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL=...
```

Optional or future-reserved values:

```env
NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=...
NEXT_PUBLIC_GOOGLE_ADS_TEST_SUBMIT_CONVERSION_LABEL=
NEXT_PUBLIC_GOOGLE_ADS_BEGIN_CHECKOUT_CONVERSION_LABEL=
```

Do not enable non-purchase Google Ads conversion labels until a later scoped PR explicitly activates them.

## 3. GA4 Key Event Setup

Dashboard owner:

1. Open GA4 Admin for the production property.
2. Confirm Data Stream uses the production web stream for `fermatmind.com`.
3. In Events or Key Events, create or locate these event names:
   - `start_test`
   - `complete_test`
   - `view_result`
   - `click_deep_report`
   - `begin_checkout`
   - `purchase_success`
4. Mark each event as a Key Event.
5. Keep `purchase_success` as the primary paid conversion.
6. Do not mark legacy aliases such as `start_click`, `submit_click`, `checkout_start`, or `pay_success` as separate Key Events. They should normalize before dispatch.
7. Confirm the event parameter allowlist is sufficient for reporting:
   - `test_type`
   - `test_version`
   - `locale`
   - `result_id`
   - `report_type`
   - `currency`
   - `value`
   - `transaction_id`

Privacy rule: dashboard reports and exports must not rely on raw `orderNo`, raw result identifiers, email, phone, token, cookie, or full private URLs as dimensions.

## 4. Google Ads Purchase Conversion Setup

Dashboard owner:

1. Use the production Google Ads conversion action for purchase only.
2. Confirm the conversion ID is configured as `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`.
3. Confirm the purchase label is configured as `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL`.
4. Confirm only `purchase_success` sends the Google Ads `conversion` event.
5. Do not configure `start_test`, `complete_test`, `view_result`, `click_deep_report`, or `begin_checkout` as Google Ads purchase conversions.
6. Confirm conversion diagnostics show the Google tag on production pages after deployment.

QA boundary: do not create a real order or trigger a real payment from this checklist. Use production diagnostics only for passive tag detection unless a separate payment test plan authorizes a sandbox or test transaction.

## 5. Baidu Tongji Conversion Goal Setup

Dashboard owner:

1. Open Baidu Tongji for the production site.
2. Confirm the production script ID is the same value configured in `NEXT_PUBLIC_BAIDU_TONGJI_ID`.
3. Create event goals using `_trackEvent` with these values:

| Goal | Category | Action | Label |
| --- | --- | --- | --- |
| Start test | `test` | `start` | test label such as `mbti`, `holland`, `big_five` |
| Complete test | `test` | `complete` | test label such as `mbti`, `holland`, `big_five` |
| View result | `result` | `view` | test label such as `mbti`, `holland`, `big_five` |
| Click report | `report` | `click` | test label such as `mbti`, `holland`, `big_five` |
| Begin checkout | `checkout` | `begin` | test label such as `mbti`, `holland`, `big_five` |
| Purchase success | `purchase` | `success` | test label such as `mbti`, `holland`, `big_five` |

The label is intentionally broad and should come from safe test context, not order numbers, raw result IDs, user identifiers, or payment identifiers.

## 6. Browser QA Without Real Payment

Engineering or QA:

1. Use a non-production analytics account when testing locally, preview, or staging.
2. Confirm `NEXT_PUBLIC_ANALYTICS_ENABLED` is not accidentally pointing local or preview traffic at production measurement IDs.
3. In the browser console, inspect `window.dataLayer` after starting a test. Confirm `start_test` appears once for one user action.
4. Submit a non-payment test flow and confirm `complete_test` appears once.
5. Visit a result surface and confirm `view_result` appears once.
6. Click a deep-report CTA without completing payment and confirm `click_deep_report` appears once.
7. Start checkout only in an authorized sandbox/test flow and confirm `begin_checkout` appears once.
8. Do not complete a real payment for this QA checklist.
9. For Baidu Tongji, inspect `window._hmt` or the Network panel for `_trackEvent` calls with the expected category/action/label.
10. Verify that browser payloads do not contain raw `orderNo`, email, phone, cookies, tokens, or full private result URLs.

## 7. Dashboard QA

GA4:

- Realtime or DebugView shows the six Key Event candidates after an authorized test session.
- The same action does not produce duplicate Key Events.
- `purchase_success` includes `currency`, `value`, and a redacted or stable transaction identifier only when available.
- Private result, order, and share URLs do not appear with raw identifiers in page-location based reports.

Baidu Tongji:

- Realtime visitors show production page visits after deployment.
- Event goals receive `_trackEvent` category/action/label values matching this checklist.
- `tongji.baidu.com` is handled through referral exclusion or internal traffic governance, not by adding frontend hardcoded IP rules.

Google Ads:

- Purchase conversion diagnostics detect the Google tag.
- Only authorized purchase success flows are counted as purchase conversions.
- Non-purchase funnel events are not counted as purchase conversions.

## 8. Release Checklist

Before marking dashboard setup complete:

- Production environment variables are configured outside the repository.
- GA4 Key Events are enabled for all six funnel events.
- Baidu Tongji event goals are configured for test/result/report/checkout/purchase.
- Google Ads purchase conversion is configured only for `purchase_success`.
- Local, preview, staging, and team traffic exclusion is either already configured or tracked as a separate P0-03 follow-up.
- No real secrets, raw IDs, or private user data were written into docs, issues, PR comments, screenshots, or analytics dashboard notes.

## 9. Escalation

Stop and create a follow-up issue if any of these are observed:

- Raw `orderNo`, raw result ID, email, phone, token, or cookie appears in analytics events.
- Production measurement IDs are used by local, preview, staging, admin, or dashboard traffic.
- Baidu or GA4 reports show `tongji.baidu.com` as an acquisition source after referral governance is configured.
- A real payment is required to validate dashboard setup.
