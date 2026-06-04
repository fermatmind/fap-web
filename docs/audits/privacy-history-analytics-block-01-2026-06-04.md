# PRIVACY-HISTORY-ANALYTICS-BLOCK-01

Date: 2026-06-04

PR id: `PRIVACY-HISTORY-ANALYTICS-BLOCK-01`

Title: `fix(privacy): block history URLs from analytics payloads`

## Gate Result

| Field | Status |
| --- | --- |
| `private_url_seen` | Unknown until post-deploy live review |
| `GA4_private_url_seen` | Unknown until post-deploy live review |
| `Baidu_private_url_seen` | Unknown until post-deploy live review |
| `public_surface_private_url_seen` | No |
| `repo_guard_status` | PASS locally after contracts |
| `paid_ads_gate` | NO-GO |

Paid ads remain `NO-GO`. This PR fixes the runtime guard that allowed the prior live GA4 `/zh/history/<redacted>` observation, but it does not prove live collector state. `PRIVACY-ORDER-RESULT-LIVE-REVIEW-03` is still required after deployment before any paid ads, freemium launch amplification, checkout/unlock promotion, TEST-LANDING, or CAREER progression.

## Implemented Guard

`lib/tracking/privacy.ts` now treats these analytics route families as private:

- `history`
- `result`
- `orders`
- `share`
- `pay`
- `payment`

Policy:

- `/history/**` is suppressed before GA4, Baidu Tongji, and first-party `/api/track` dispatch.
- `/result/**`, `/orders/**`, `/share/**`, `/pay/**`, and `/payment/**` are redacted to `private_route:<family>` before analytics dispatch and server ingest.
- URL-valued payload fields, including `page_location`, `landing_path`, `current_path`, `referrer`, `source_path`, `destination_path`, and `canonical_url`, are sanitized through the same helper.
- Public paths with sensitive query keys are not suppressed; sensitive query values are redacted.

## Covered Surfaces

| Surface | Local guard result |
| --- | --- |
| GA4 browser event payload | Covered by `trackClientEvent` and `trackNetworkObservableFunnelEvent` pre-dispatch sanitization/suppression |
| Baidu Tongji `_hmt.push` payload | Covered by the same browser pre-dispatch suppression/redaction |
| first-party `/api/track` raw path | Covered by server-side suppression for `history` and marker redaction for other private families |
| attribution `referrer` / `landing_path` / `current_path` | Covered by attribution URL-field sanitization before label derivation and storage |
| dashboard-readable payload fields | Covered by tracking payload URL-field sanitization |

## Contract Coverage

Focused coverage added/updated in `tests/contracts/analytics-payload-privacy.contract.test.ts`:

- `/zh/history/<redacted>`
- `/zh/result/<redacted>`
- `/zh/orders/lookup?orderNo=<redacted>`
- `/zh/orders/<redacted>`
- `/zh/share/<redacted>`
- `/zh/pay/**`
- `/zh/payment/**`
- tokenized public URLs

Focused local result:

```text
pnpm exec vitest run tests/contracts/*privacy* tests/contracts/*tracking* tests/contracts/*analytics* tests/contracts/*private*
13 files passed, 89 tests passed.
```

Full contract result:

```text
pnpm test:contract
441 files passed, 2503 tests passed.
```

## Public Surface Scan

Read-only scan result:

| Surface | HTTP status | Forbidden pattern hits |
| --- | ---: | ---: |
| `https://fermatmind.com/sitemap.xml` | 200 | 0 |
| `https://fermatmind.com/llms.txt` | 200 | 0 |
| `https://fermatmind.com/llms-full.txt` | 200 | 0 |
| `https://fermatmind.com/robots.txt` | 200 | 0 |

Checked patterns: `/result/`, `/orders/`, `/share/`, `/pay/`, `/payment/`, `/history/`, `orderNo`, `resultId`, `attemptId`, `token`, `payment_id`, `transaction_id`.

## Required Follow-Up

1. Deploy the privacy fix after merge if release policy approves.
2. Execute `PRIVACY-ORDER-RESULT-LIVE-REVIEW-03` against live GA4, Baidu Tongji, public surfaces, and repo guards.
3. Keep `paid_ads_gate=NO-GO` unless live review 03 returns `private_url_seen=No`.
