# Analytics Conversion Setup QA Checklist

Scope: ANALYTICS-SEO-P0-02, amended by ANALYTICS-SEO-P0-11. This document is for GA4, Google Ads, and Baidu Tongji dashboard setup and QA after the frontend conversion event taxonomy is deployed.

Do not paste real IDs, labels, order numbers, transaction IDs, customer data, cookies, access tokens, or screenshots containing account secrets into this repository.

## 1. Business Funnel Source of Truth

Backend `analytics_funnel_daily` is the primary business-funnel conversion truth for payment, report unlock, and report-ready stages. GA4 is the public-funnel reporting surface.

Public GA4 event names to verify in the production property (this list is a QA target, not proof that the dashboard is configured):

- `test_start`
- `test_complete`
- `result_view`
- `report_click`
- `checkout_begin`

Business purchase-success reporting uses backend/Ops `payment_success`. GA4 `payment_success`, `report_unlock`, and `report_ready` should not be treated as browser-only truth unless a later privacy-safe bridge is explicitly approved.

GA4 may still show the built-in `purchase` key event, and the dashboard star can be non-removable for that built-in event. Do not add frontend code that also emits `purchase` for the same paid success flow. Treating both `purchase` and `purchase_success` as business purchase success would double count purchases.

| Funnel action | Frontend canonical event | GA4 event / Key Event | Business conversion role | Google Ads conversion |
| --- | --- | --- | --- | --- |
| Article CTA click | `article_to_test_click` | `article_to_test_click`; not a Key Event until Ops confirms | article-to-test intent for funnel exploration | no |
| Start test | `start_test` (normalized from `start_attempt`) | `test_start` | public intent/start signal; not a distinct server-attempt denominator | no |
| Complete test | `complete_test` (normalized from `submit_attempt`) | `test_complete` | public submission-success signal; not result visibility | no |
| View result | `view_result` | `result_view` | primary public funnel step | no |
| Click deep report | `click_deep_report` (normalized from `click_unlock`) | `report_click` | public report intent | no |
| Begin checkout/order intent | `begin_checkout` (normalized from `create_order` or `checkout_start`) | `checkout_begin` | public checkout intent; not proof of a persisted order | no |
| Purchase success | `purchase_success` | `payment_success` | backend/Ops truth; browser bridge is auxiliary | yes, purchase only |

`payment_confirmed` is tracked as GA4 `payment_success` only as an auxiliary browser event. It is not the primary purchase conversion truth.

Privacy rule: dashboard reports and exports must not rely on raw `orderNo`, raw result identifiers, email, phone, token, cookie, or full private URLs as dimensions.

`article_to_test_click` must be interpreted separately from `test_start`: article click intent is not proof that the user started a test. Baidu may observe public CTA interaction only as auxiliary traffic analysis and must not be used as a private funnel source.

### IQ start-cohort and current runtime interpretation

The public dispatch chain is `submit_attempt` -> `complete_test` -> GA4 `test_complete`. `test_submit` is a legacy mapping entry; aliases normalize before GA4 dispatch. Do not emit both names or rename production runtime to match an old dashboard note. Verify the actual received event and its star in GA4 Admin > Data display > Events.

`test_start` can include both a landing CTA intent and a successful attempt creation. Its public-event count is not the denominator of a server attempt cohort. The IQ owner-original flow creates an attempt before loading the first question, so a server start does not prove that the first question was visible.

For IQ use the existing read-only `measurement.start-cohort.168h.v3` report for the same distinct persisted attempt IDs, Shanghai start interval, locale, and explicit `iq_owner_original_30` form. Keep unknown-form rows separate and apply the existing QA exclusions. Verify known operator/test attempts separately: existing QA exclusions may not identify every QA start. Keep any remaining QA contribution explicitly labelled and exclude it from natural-use interpretations. Report elapsed-window submit and valid-result-ready counts separately from calendar activity and GA4 event totals. Do not divide successful attempts by start IPs or GA4 sessions.

The current IQ browser request stores `client_platform=web`; the cohort's `device_class=web` does not distinguish mobile browsers from desktop browsers. Keep that split unknown unless the source actually supports it.

A native result-visible observation requires a valid owner receipt, analytics consent, and a visible result heading. Private-route third-party suppression remains in force. Missing observations do not prove an unread result; retain the report's null visible rate and its separately labelled observed lower bound when coverage is incomplete. Do not enable private result pageviews to fill this gap.

A full 168-hour observation period does not finalize the report: `processing_grace_hours` remains null and `finalized=false` until verified ingestion evidence establishes the remaining condition. Record the report's `as_of`, definition version, scope, maturity and coverage. Do not infer a delay bound from a small sample.

The IQ result uses existing guest/owner authorization and free full-report access, subject to the current result-access and recovery requirements. Saving an email is not the same action as starting, submitting, paying, or making a result visible. TXT/Markdown and PDF each retain their existing readiness and access checks; requesting a download does not prove that the user saved it.

Source: `lib/tracking/events.ts`, `lib/tracking/client.ts`, `lib/iq/api.ts`, `lib/quiz/store.tsx`, `hooks/useResultVisibilityObservation.ts`; backend `MeasurementStartCohortReadModel`, `MeasurementAttributionDimensions`, `AnalyticsTrafficExclusionPolicy`, and `Report/Resolvers/AccessResolver`.

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

1. Open GA4 Admin for the production property. Record the verification date and property reporting timezone. Marking an event as a Key Event affects reporting from that time and does not rewrite historical data; standard reports can take up to 24 hours to reflect it ([Google Analytics Help](https://support.google.com/analytics/answer/13128484?hl=en)).
2. Confirm Data Stream uses the production web stream for `fermatmind.com`.
3. Confirm the five public GA4 events above exist in Events or Key Events.
4. Verify and record each applicable event name and star from the real property. A checklist or runtime mapping alone does not prove the dashboard configuration. For IQ completion, check `test_complete`, not `complete_test` or legacy `test_submit`.
5. Confirm backend/Ops `payment_success`, not Baidu or browser-only GA4, is the business purchase-success reporting metric.
6. Do not configure canonical or legacy alias names as additional copies of the same transported event. They normalize before dispatch; compare the received GA4 name with `lib/tracking/client.ts`.
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
5. Do not configure `test_start`, `test_complete`, `result_view`, `report_click`, or `checkout_begin` as Google Ads purchase conversions.
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

| GA4 public event | Baidu category | Baidu action |
| --- | --- | --- |
| `test_start` | `test` | `start` |
| `test_complete` | `test` | `complete` |
| `result_view` | `result` | `view` |
| `report_click` | `report` | `click` |
| `checkout_begin` | `checkout` | `begin` |

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
3. In GA4 Realtime or DebugView, verify applicable public events, including `test_start` and `test_complete`, for an authorized non-production session. A private result route intentionally suppresses third-party analytics; do not require a GA4 `result_view` from it or bypass that suppression. Use the native owner observation for supported result-visible checks.
4. Confirm browser `payment_success` is treated as auxiliary only, with backend/Ops remaining the business payment truth.
5. Do not complete a real payment for this QA checklist.
6. In Baidu Tongji, verify public CTA elements can be selected or addressed by element ID only on public routes.
7. Confirm private/noindex routes do not load `hm.baidu.com`, `_hmt`, or the Baidu Tongji loader.
8. Verify that browser payloads do not contain raw `orderNo`, email, phone, cookies, tokens, or full private result URLs.

## 10. Dashboard QA

GA4:

- Realtime or DebugView shows applicable public Key Events after an authorized test session; private result visibility uses its existing native observation, not a required GA4 pageview.
- The same action does not produce duplicate Key Events.
- Backend/Ops `payment_success` is the business purchase-success metric.
- `purchase`, `purchase_success`, and browser `payment_success` are not used together as duplicate business purchase success.
- Browser `payment_success`, if observed, includes `currency`, `value`, and a redacted or stable transaction identifier only when available.
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
- Confirm backend/Ops `payment_success` is the purchase-success metric used in reporting notes.
- Confirm Baidu entrance-page and visited-page reports do not contain raw private URLs.

72h:

- Confirm no duplicate purchase-success reporting is caused by mixing `purchase`, `purchase_success`, and browser `payment_success`.
- Confirm Baidu public CTA element conversion data, if configured, is limited to allowed public CTA elements.
- Confirm private/noindex routes still do not load Baidu Tongji scripts.

7d:

- Compare GA4 funnel counts against Baidu PV/UV and public CTA auxiliary clicks without treating Baidu as the private-funnel source of truth.
- Recheck that `orderNo`, raw result/share identifiers, payment identifiers, transaction identifiers, and tokens are absent from Baidu page reports.
- Document any remaining dashboard-only configuration gaps outside the repository.

## 12. Release Checklist

Before marking dashboard setup complete:

- Production environment variables are configured outside the repository.
- Actual received GA4 event names and applicable Key Event stars have been checked in the real property; private-route suppression is preserved.
- Backend/Ops business purchase success is `payment_success`.
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
