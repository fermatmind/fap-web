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
- Public analytics scripts use the proxy-generated per-request CSP nonce. Both layout trees read `x-nonce`, the inline `fm-analytics-bootstrap` captures its own nonce synchronously, and every dynamically-created GA/Baidu script inherits that same nonce before insertion. Do not cache nonce-bearing HTML across requests.
- A first consent grant reuses `initAnalytics()` and the existing session-scoped landing-pageview dedupe. Missing or denied consent emits no canonical landing pageview; repeated granted events do not duplicate the same path pageview.

Next.js requires a fresh nonce and dynamic rendering for each request and documents reading the proxy-provided nonce through `headers()`: [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy). The runtime smoke uses Playwright browser-context request routing and aborts telemetry writes before they reach GA, Baidu, or `/api/track`: [Playwright network guide](https://playwright.dev/docs/network).

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
| `article_to_test_click` | `article_to_test_click` | article CTA click intent; funnel exploration only unless Ops later promotes it | no |
| `start_attempt` | `test_start` | primary public funnel step | no |
| `submit_attempt` | `test_submit` | primary public funnel step | no |
| `view_result` | `result_view` | primary public funnel step | no |
| `click_unlock` | `checkout_start` | public checkout intent | no |
| `create_order` | `order_created` | backend order-created reporting | no |
| `payment_confirmed` | `payment_success` | backend/Ops truth only unless a privacy-safe bridge is approved | no |
| `purchase_success` | `payment_success` | backend/Ops truth; browser event remains Google Ads purchase bridge trigger when configured | yes |

Backend `analytics_funnel_daily` is the business-funnel source of truth for payment, report unlock, and report-ready stages. GA4 is a reporting surface for public funnel events, and paid/report truth must not depend on browser-only GA4 events. Do not add a separate frontend `purchase` dispatch for the same paid success flow; using both `purchase` and `payment_success` as business purchase success would double count.

Baidu Tongji event-analysis/debug taxonomy may use `_hmt.push(["_trackEvent", category, action, label])` with:

| GA4 key event | Baidu category | Baidu action |
| --- | --- | --- |
| `test_start` | `test` | `start` |
| `test_submit` | `test` | `complete` |
| `result_view` | `result` | `view` |
| `checkout_start` | `checkout` | `begin` |
| `order_created` | `checkout` | `order` |

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

Structured article CTA clicks use `article_to_test_click` and stay separate from real `start_attempt` test starts. The article click event carries `locale`, `article_slug`, `translation_group_id`, `cta_id`, `cta_priority`, `target_test_slug`, `source_path`, and `destination_path`. Topic/test-detail CTA starts may continue to use existing start semantics. Baidu remains public CTA auxiliary only; do not configure private result, order, share, pay, payment, history, or test-taking routes as Baidu funnel conversions.

Google Ads purchase conversion payload:

- `send_to`: `${NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}/${NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL}`
- `value`: first finite value from `amount`, `value`, or `price`; omitted when absent.
- `currency`: from `payload.currency`; no default currency is invented by this bridge.
- `transaction_id`: not sent by the Google Ads bridge; ordinary analytics payloads use the shared tracking redaction policy before dispatch.

`create_order` and `payment_confirmed` must never dispatch Google Ads purchase conversion. `pay_success` may remain in older product paths, but it is normalized to `purchase_success` before dispatch. Email and other PII fields are filtered before GA4, Google Ads, Baidu Tongji, `/api/track`, URL query payloads, and public HTML.

## Verification

Run the reusable local fixture smoke without producing analytics data:

```bash
node scripts/analytics/runtime-smoke-fixture.mjs --port 4173
pnpm analytics:runtime-smoke -- --base-url http://127.0.0.1:4173 --output /tmp/analytics-runtime-smoke.json
```

For a production-mode local build whose analytics allowlist uses a synthetic hostname, add `--resolve-to 127.0.0.1` and pass that hostname in `--base-url`. The resolver option accepts only an IPv4 address or `::1`; the scheduled/production path does not use host remapping.

The JSON result must report `health_status: "healthy"`, matching header/bootstrap/dynamic nonces, distinct nonces for two HTML requests, all three loader/write attempts, zero CSP script-blocking errors, and private-route suppression. Provider and `/api/track` requests are aborted by the browser probe; the report contains no measurement/site IDs, request bodies, cookies, sensitive query values, or HTML dumps.

The production deploy workflow invokes this same probe only after a separately authorized exact-SHA production deployment. Its presence is not deployment authorization and this runbook must not be used to trigger `workflow_dispatch`.

### Scheduled production monitor

`.github/workflows/analytics-runtime-monitor.yml` runs the same write-aborting browser probe every 15 minutes and supports manual workflow dispatch without URL inputs. Its target is fixed to `https://fermatmind.com`; the loopback-only fixture override exists only for local contract validation.

Before probing, the workflow paginates production environment deployments newest-first, skips successful runs whose workflow path is not `.github/workflows/deploy-production.yml`, and selects the newest successful web deploy. The bounded scan stops as soon as that deploy is found or deployment age exceeds the same 90-day provenance retention window; it does not scan indefinitely. It then reads that run's immutable `analytics-runtime-smoke-<approved-sha>` artifact name to recover the SHA actually approved by the deploy policy. The deploy workflow retains this provenance artifact for 90 days so normal no-deploy periods do not turn a healthy runtime into a recurring unknown alert. This covers manual recovery deploys where the environment deployment ref can differ from `deploy_sha`, while preventing unrelated production-scoped jobs from shadowing or paging out the latest web deploy. The monitor keeps the workflow checkout SHA and deployed production SHA as separate fields. If the web deployment, workflow run, unexpired approved-SHA artifact, or main-ancestry check is unavailable, `production_deployment_sha` remains `unknown`, `sha_reason` explains why, the final health is `unknown`, and the job fails closed. It never substitutes the scheduled workflow's `github.sha` or the unverified environment deployment ref for the deployed SHA. GitHub documents deployments and deployment statuses in the [Deployments REST API](https://docs.github.com/en/rest/deployments/deployments), workflow runs and artifacts in the [Actions REST API](https://docs.github.com/en/rest/actions), and scheduled/manual triggers, permissions, timeouts, and concurrency in [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

The JSON artifact and Step Summary expose only normalized health/provenance fields. Health is `healthy`, `degraded`, `unhealthy`, or `unknown`; any non-healthy result fails the job so GitHub's native workflow-failure notification is the first-stage alert. No issue, Slack, email, webhook, new secret, deployment, or provider Data API call is created by this monitor. The artifact excludes measurement IDs, Baidu site IDs, tokens, cookies, sensitive query values, request bodies, and HTML dumps.

Local wrapper validation reuses the PR1 fixture:

```bash
node scripts/analytics/runtime-smoke-fixture.mjs --port 4173
pnpm analytics:runtime-monitor -- \
  --fixture-base-url http://127.0.0.1:4173 \
  --deployment-metadata /tmp/analytics-production-deployment.json \
  --output /tmp/analytics-runtime-monitor.json
```

The fixture deployment metadata must be synthetic. Do not run the scheduled workflow as part of PR validation and do not wait for its first post-merge cadence.

1. In Chrome Network, confirm `https://www.googletagmanager.com/gtag/js` loads on public production routes after analytics consent.
2. In Chrome Network, confirm `https://hm.baidu.com/hm.js?<id>` loads on public production routes after analytics consent when Baidu Tongji is configured.
3. In GA4 Realtime or DebugView, confirm funnel events appear.
4. In Google Ads conversion diagnostics, confirm the Google tag is detected.
5. In Baidu Tongji realtime visitors, confirm public page visits appear.
6. Confirm public CTA elements can be selected or manually addressed by ID in Baidu Tongji only on allowed public pages.
7. Confirm private/noindex routes do not load `hm.baidu.com`, `_hmt`, or Baidu Tongji automatic pageview scripts.
8. Confirm private/noindex route HTML does not include `fm-analytics-bootstrap` or `data-analytics-bootstrap`.
9. Complete only an authorized paid test flow and confirm backend Ops reports `payment_success`, while the optional Google Ads `conversion` fires only from the configured purchase bridge.

## Prohibitions

- Do not commit real GA4, Google Ads, Baidu Tongji, Baidu verification, or conversion label values.
- Do not replace the existing bridge with GTM.
- Do not use Ads conversion tracking for non-purchase events as the primary conversion.
- Do not emit or report `purchase`, `purchase_success`, and browser `payment_success` as duplicate business purchase success.
- Do not add Baidu Ads `bp.js`.
- Do not document `_trackEvent` category/action as a currently supported new Baidu conversion-goal setup path.
- Do not configure Baidu element conversions on private/noindex route families such as `/result`, `/orders`, `/share`, `/pay`, `/payment`, or `/history`, including `/zh` and `/en` variants.
- Do not rely on frontend route params for fully private identifiers. Next App Router may serialize dynamic pathname params in internal flight scripts; fully private result/order/share identifiers require a server-side lookup or token-exchange route redesign.
- Do not add Facebook, TikTok, or other third-party pixels.
