# Analytics Conversion Setup QA Checklist

Scope: ANALYTICS-SEO-P0-02, amended by ANALYTICS-SEO-P0-11. This document is for GA4, Google Ads, and Baidu Tongji dashboard setup and QA after the frontend conversion event taxonomy is deployed.

Do not paste real IDs, labels, order numbers, transaction IDs, customer data, cookies, access tokens, or screenshots containing account secrets into this repository.

## 1. Business Funnel Source of Truth

GA4 is the primary business-funnel conversion reporting surface.

GA4 Key Events configured for the production property:

- `start_test`
- `complete_test`
- `view_result`
- `click_deep_report`
- `begin_checkout`
- `purchase_success`

Business purchase-success reporting uses `purchase_success`.

GA4 may still show the built-in `purchase` key event, and the dashboard star can be non-removable for that built-in event. Do not add frontend code that also emits `purchase` for the same paid success flow. Treating both `purchase` and `purchase_success` as business purchase success would double count purchases.

| Funnel action | Frontend canonical event | GA4 event / Key Event | Business conversion role | Google Ads conversion |
| --- | --- | --- | --- | --- |
| Start test | `start_attempt` | `start_test` | primary funnel step | no |
| Complete test | `submit_attempt` | `complete_test` | primary funnel step | no |
| View result | `view_result` | `view_result` | primary funnel step | no |
| Click deep report | `click_unlock` | `click_deep_report` | primary funnel step | no |
| Begin checkout | `create_order` | `begin_checkout` | primary funnel step | no |
| Purchase success | `purchase_success` | `purchase_success` | primary purchase success | yes, purchase only |

`payment_confirmed` is tracked as GA4 `add_payment_info`. It is not the primary purchase conversion.

Privacy rule: dashboard reports and exports must not rely on raw `orderNo`, raw result identifiers, email, phone, token, cookie, or full private URLs as dimensions.

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

## 3. GA4 Key Event QA

Dashboard owner:

1. Open GA4 Admin for the production property.
2. Confirm Data Stream uses the production web stream for `fermatmind.com`.
3. Confirm the six GA4 events above exist in Events or Key Events.
4. Confirm each of the six is marked as a Key Event.
5. Confirm `purchase_success` is the business purchase-success reporting metric.
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

## 4. Google Ads Purchase Conversion Setup

Dashboard owner:

1. Use the production Google Ads conversion action for purchase only.
2. Confirm the conversion ID is configured as `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`.
3. Confirm the purchase label is configured as `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL`.
4. Confirm only `purchase_success` sends the Google Ads `conversion` event.
5. Do not configure `start_test`, `complete_test`, `view_result`, `click_deep_report`, or `begin_checkout` as Google Ads purchase conversions.
6. Confirm conversion diagnostics show the Google tag on production public pages after deployment.

QA boundary: do not create a real order or trigger a real payment from this checklist. Use production diagnostics only for passive tag detection unless a separate payment test plan authorizes a sandbox or test transaction.

## 5. Baidu Tongji Current Limits

Baidu Tongji is not the primary private-funnel conversion surface.

Current Baidu Tongji dashboard behavior observed for the production account:

- Basic conversion setup no longer supports adding new `_trackEvent` event conversions after the 2022-04-12 platform change.
- The new event conversion flow supports `预览圈选元素` and `手动添加 ID`.
- Documentation must not promise that operators can configure new Baidu conversion goals by `_hmt.push` category/action.

Baidu Tongji remains useful for:

- PV / UV
- source analysis
- search terms
- entrance pages
- visited pages
- auxiliary click analysis for public-page CTA elements

Baidu Tongji must not be used to track these private or paid-funnel conversions:

- result view
- order lookup
- `purchase_success`
- private share
- deep report unlock
- payment success

## 6. Baidu Public CTA Element Conversion Boundary

If Baidu Tongji element conversion is used through preview selection or manual element ID, configure only public-page CTA elements.

Public CTA candidates:

- homepage MBTI CTA
- homepage Holland CTA
- MBTI test landing start-test CTA
- Holland test landing start-test CTA
- tests hub test-card CTA
- article page test-entry CTA

Do not configure Baidu element conversions on these route families:

- `/result`
- `/orders`
- `/orders/lookup`
- `/share`
- `/pay`
- `/payment`
- `/history`

The prohibition also applies to localized variants such as `/zh/result`, `/zh/orders`, `/zh/share`, `/en/result`, `/en/orders`, and `/en/share`.

## 7. `_hmt.push` Taxonomy Position

The frontend may keep `_hmt.push(["_trackEvent", category, action, label])` as an event-analysis, debug, or legacy event-bridge taxonomy.

Current bridge values:

| GA4 key event | Baidu category | Baidu action |
| --- | --- | --- |
| `start_test` | `test` | `start` |
| `complete_test` | `test` | `complete` |
| `view_result` | `result` | `view` |
| `click_deep_report` | `report` | `click` |
| `begin_checkout` | `checkout` | `begin` |
| `purchase_success` | `purchase` | `success` |

These values are not a promise that the current Baidu Tongji dashboard can create new conversion goals from `_trackEvent` category/action. Treat them as analysis/debug taxonomy only unless Baidu restores or explicitly supports that setup path for the account.

Labels must come from safe test context such as `test_type`, `scale_code`, `form_code`, `test_slug`, or `slug`. Labels must not contain order numbers, raw result IDs, user identifiers, payment identifiers, or tokens.

## 8. P0-10 Private Route Privacy Rule

Private/noindex routes suppress third-party browser analytics scripts. Baidu Tongji automatic pageview collection must not see raw private URLs or sensitive query values.

Sensitive examples that must not reach Baidu automatic pageview reporting:

- raw `orderNo`
- raw `resultId`
- raw `shareId`
- `payment_id`
- `transaction_id`
- `token`

Suppressed route families:

- `/result`
- `/orders`
- `/share`
- `/pay`
- `/payment`
- `/history`

The same rule applies with `/zh` and `/en` locale prefixes.

## 9. Browser QA Without Real Payment

Engineering or QA:

1. Use a non-production analytics account when testing locally, preview, or staging.
2. Confirm `NEXT_PUBLIC_ANALYTICS_ENABLED` is not accidentally pointing local or preview traffic at production measurement IDs.
3. In GA4 Realtime or DebugView, confirm `start_test`, `complete_test`, `view_result`, `click_deep_report`, and `begin_checkout` appear once for one authorized user action.
4. Confirm `purchase_success` is visible only from an authorized paid-success test path.
5. Do not complete a real payment for this QA checklist.
6. In Baidu Tongji, verify public CTA elements can be selected or addressed by element ID only on public routes.
7. Confirm private/noindex routes do not load `hm.baidu.com`, `_hmt`, or the Baidu Tongji loader.
8. Verify that browser payloads do not contain raw `orderNo`, email, phone, cookies, tokens, or full private result URLs.

## 10. Dashboard QA

GA4:

- Realtime or DebugView shows the six Key Events after an authorized test session.
- The same action does not produce duplicate Key Events.
- `purchase_success` is the business purchase-success metric.
- `purchase` and `purchase_success` are not both used as business purchase success.
- `purchase_success` includes `currency`, `value`, and a redacted or stable transaction identifier only when available.
- Private result, order, share, pay, payment, and history URLs do not appear with raw identifiers in page-location based reports.

Baidu Tongji:

- Realtime visitors show production public page visits after deployment.
- Public CTA elements can be selected or configured by ID only on allowed public routes.
- Baidu reports do not show raw `orderNo`, result/share private URLs, payment identifiers, transaction identifiers, or tokens.
- `tongji.baidu.com` is handled through referral exclusion or internal traffic governance, not by adding frontend hardcoded IP rules.

Google Ads:

- Purchase conversion diagnostics detect the Google tag.
- Only authorized purchase success flows are counted as purchase conversions.
- Non-purchase funnel events are not counted as purchase conversions.

## 11. Data Recheck Cadence

24h:

- Confirm GA4 Key Events have started receiving data.
- Confirm `purchase_success` is the purchase-success metric used in reporting notes.
- Confirm Baidu entrance-page and visited-page reports do not contain raw private URLs.

72h:

- Confirm no duplicate purchase-success reporting is caused by mixing `purchase` and `purchase_success`.
- Confirm Baidu public CTA element conversion data, if configured, is limited to allowed public CTA elements.
- Confirm private/noindex routes still do not load Baidu Tongji scripts.

7d:

- Compare GA4 funnel counts against Baidu PV/UV and public CTA auxiliary clicks without treating Baidu as the private-funnel source of truth.
- Recheck that `orderNo`, raw result/share identifiers, payment identifiers, transaction identifiers, and tokens are absent from Baidu page reports.
- Document any remaining dashboard-only configuration gaps outside the repository.

## 12. Release Checklist

Before marking dashboard setup complete:

- Production environment variables are configured outside the repository.
- GA4 Key Events are enabled for all six funnel events.
- GA4 business purchase success is `purchase_success`.
- Google Ads purchase conversion is configured only for `purchase_success`.
- Baidu Tongji is limited to PV/UV, source, search-term, entrance-page, visited-page, and public CTA auxiliary click analysis.
- Baidu Tongji conversion docs do not claim new `_trackEvent` category/action conversion goals are configurable in the current dashboard.
- Local, preview, staging, and team traffic exclusion is either already configured or tracked as a separate follow-up.
- No real secrets, raw IDs, or private user data were written into docs, issues, PR comments, screenshots, or analytics dashboard notes.

## 13. Escalation

Stop and create a follow-up issue if any of these are observed:

- Raw `orderNo`, raw result ID, raw share ID, email, phone, token, or cookie appears in analytics events or page reports.
- Production measurement IDs are used by local, preview, staging, admin, or dashboard traffic.
- Baidu or GA4 reports show `tongji.baidu.com` as an acquisition source after referral governance is configured.
- Baidu Tongji dashboard operators request private route conversion tracking.
- A real payment is required to validate dashboard setup.
