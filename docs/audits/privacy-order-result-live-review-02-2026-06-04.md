# Privacy Order Result Live Review 02

Review date: 2026-06-04
Review timestamp: 2026-06-04T08:57:32Z
PR id: `PRIVACY-ORDER-RESULT-LIVE-REVIEW-02`
Mode: docs-only / read-only live review / no deploy

## Decision

| Gate | Status |
| --- | --- |
| `private_url_seen` | Yes |
| `GA4_private_url_seen` | Yes |
| `Baidu_private_url_seen` | No |
| `public_surface_private_url_seen` | No |
| `repo_guard_status` | FAIL |
| `paid_ads_gate` | NO-GO |

Paid ads remain NO-GO because live GA4 evidence still shows a private route family. Unknown must not be treated as No; in this run the overall state is stronger than Unknown because GA4 returned a positive private URL-family hit.

## Finding

| Source | Date range | Surface | Redacted pattern | Count | Severity | Next fix PR |
| --- | --- | --- | --- | ---: | --- | --- |
| GA4, Events report | 2026-06-04 | Event name with secondary dimension `Landing page + query string` | `/zh/history/<redacted>` | 1 | P0 privacy launch gate | `PRIVACY-HISTORY-ANALYTICS-BLOCK-01` |

The GA4 hit was read from the already-open logged-in Chrome GA4 tab. No raw private URL, query string, token, order number, result id, attempt id, payment id, or transaction id was copied into this report.

## Scope And Boundaries

This review did not change runtime code, analytics dashboard settings, dashboard data, CMS data, payment/order state, search submission state, or deployment state.

This review did not access real result, order, share, payment, pay, history, admin, ops, preview, or tokenized application URLs. Dashboard inspection stayed read-only in the existing logged-in Chrome tabs.

This review did not export analytics reports and did not read or write cookies, localStorage, browser profile data, secrets, tokens, raw order numbers, raw result identifiers, raw attempt identifiers, raw transaction identifiers, raw payment identifiers, or full private URLs.

## Public Surface Evidence

The public scan fetched only the four public discoverability surfaces requested.

| Surface | HTTP status | Forbidden private URL/token matches | Status |
| --- | ---: | --- | --- |
| `https://fermatmind.com/sitemap.xml` | 200 | none for `/result/`, `/orders/`, `/share/`, `/pay/`, `/payment/`, `/history/`, `orderNo`, `resultId`, `attemptId`, `token`, `payment_id`, `transaction_id` | PASS |
| `https://fermatmind.com/llms.txt` | 200 | none for the requested forbidden patterns | PASS |
| `https://fermatmind.com/llms-full.txt` | 200 | none for the requested forbidden patterns | PASS |
| `https://fermatmind.com/robots.txt` | 200 | none for the requested forbidden patterns | PASS |

Public surface conclusion: `public_surface_private_url_seen=No`.

## Repo Guard Evidence

| Guard | Evidence | Status |
| --- | --- | --- |
| URL redaction | `lib/tracking/privacy.ts` redacts sensitive query keys and path values for attempt/order/payment/result/report/token/recovery/secret-like data. | PASS |
| Tracking payload filtering | `lib/tracking/events.ts` filters tracking payloads, masks sensitive identifier fields, and sanitizes URL-valued fields. | PASS |
| `/api/track` sanitizer | `app/api/track/route.ts` applies `sanitizeTrackingUrl` to submitted `path` and filters payload fields before forwarding. | PASS |
| Browser analytics bootstrap | `components/analytics/AnalyticsScripts.tsx` blocks initial third-party analytics script loading on `result`, `orders`, `share`, `pay`, `payment`, and `history` route families. | PASS |
| Shared browser suppression helper | `lib/tracking/browserAnalyticsSuppression.ts` classifies `history` and other private route families as suppressed. | PASS |
| Private route noindex | result, order detail, share, and history-related app routes are noindex/dynamic or excluded from discoverability policy where applicable. | PASS with live caveat |
| Sitemap/llms exclusion | `next-sitemap.config.js`, `lib/seo/discoverabilityExposurePolicy.ts`, and `lib/seo/indexingPolicy.ts` deny private route families from machine-discoverability surfaces. | PASS |
| End-to-end browser analytics suppression | Live GA4 still recorded `/zh/history/<redacted>` as a landing-page dimension for `page_view`. This means repo/browser analytics guards are not sufficient as a live privacy gate. | FAIL |

Repo guard conclusion: `repo_guard_status=FAIL`. Redaction and discoverability exclusion are present, but the live GA4 hit proves private route-family analytics suppression is incomplete.

## GA4 Evidence

All GA4 checks used the already-open logged-in Chrome GA4 tab for property `fermatmind.com`. The visible reports used 100% of available data and date range `2026-06-04`.

| Surface | Evidence | Forbidden private URL-family status |
| --- | --- | --- |
| Home / recommended cards | Visible GA4 home cards for pages/screens and events had no requested forbidden pattern matches. | No visible hit |
| Pages and screens | Detailed report `Pages and screens: Page title and screen class`; current visible table had no requested forbidden pattern matches. | No visible hit |
| Events | Detailed report `Events: Event name`; current visible event-name table had no requested forbidden pattern matches. | No visible hit |
| Event path surface | Detailed `Events` report with secondary dimension `Page path and screen class`; 41 rows visible/available in table; no requested forbidden pattern matches. | No visible hit |
| Landing page surface | Detailed `Events` report with secondary dimension `Landing page + query string`; 34 rows visible/available in table; found `/zh/history/<redacted>` once. | Yes |
| Page location | The standard GA4 dimension picker did not expose a stable readable `Page location` dimension during this tool session. Because a landing-page hit was already found, the GA4 conclusion is Yes rather than Unknown. | Not needed for the Yes decision |

GA4 conclusion: `GA4_private_url_seen=Yes`.

## Baidu Tongji Evidence

All Baidu checks used the already-open logged-in Chrome Baidu Tongji tab for `fermatmind.com`. The review scanned the current visible page text after opening each report inside the same tab.

| Surface | Evidence | Forbidden private URL-family status |
| --- | --- | --- |
| Website overview | Current overview, including Top10 search terms, source sites, entry pages, and visited pages. | No hit |
| Entry pages | `Entrance pages` report. | No hit |
| Visited pages | `Visited pages` report. | No hit |
| All sources | `All sources` report. | No hit |
| Search terms | `Search terms` report. | No hit |
| External links | `External links` report. | No hit |
| Internal sources | `Internal sources` report. | No hit |

Baidu conclusion: `Baidu_private_url_seen=No` for the current readable Baidu Tongji dashboard reports.

## Required Next Fix PR

Proposed PR train id: `PRIVACY-HISTORY-ANALYTICS-BLOCK-01`

Proposed PR title: `fix(privacy): block private history analytics dispatch`

Proposed scope and likely files:

- `lib/tracking/client.ts`
- `lib/tracking/browserAnalyticsSuppression.ts`
- `tests/contracts/analytics-scripts.contract.test.ts`
- `tests/contracts/analytics-payload-privacy.contract.test.ts`
- `tests/contracts/tracking-whitelist.contract.test.ts`
- `docs/codex/pr-train.yaml`
- `docs/codex/pr-train-state.json`

Required local checks:

- `pnpm exec vitest run tests/contracts/analytics-scripts.contract.test.ts tests/contracts/analytics-payload-privacy.contract.test.ts tests/contracts/tracking-whitelist.contract.test.ts`
- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build`
- `python3 -m json.tool docs/codex/pr-train-state.json >/dev/null`
- YAML parse for `docs/codex/pr-train.yaml`
- `git diff --check -- lib/tracking components/analytics tests/contracts docs/codex`

Dependency assumptions:

- `PRIVACY-ORDER-RESULT-LIVE-REVIEW-02` is merged.
- Paid ads, UTM paid-governance, freemium launch amplification, checkout/unlock smoke promotion, and scaled multimedia distribution remain blocked until a repeat live review returns `private_url_seen=No` across GA4, Baidu Tongji, public surfaces, and repo guards.

Manifest/state authorization needed before implementation:

```yaml
- id: PRIVACY-HISTORY-ANALYTICS-BLOCK-01
  repo: fap-web
  branch: codex/privacy-history-analytics-block-01
  base: main
  title: "fix(privacy): block private history analytics dispatch"
  depends_on:
    - PRIVACY-ORDER-RESULT-LIVE-REVIEW-02
  mode: execute
  train_scope: commercial_readiness_privacy_fix
  status: planned
```

```json
{
  "id": "PRIVACY-HISTORY-ANALYTICS-BLOCK-01",
  "repo": "fap-web",
  "branch": "codex/privacy-history-analytics-block-01",
  "base": "main",
  "depends_on": ["PRIVACY-ORDER-RESULT-LIVE-REVIEW-02"],
  "title": "fix(privacy): block private history analytics dispatch",
  "status": "planned",
  "commit_sha": null,
  "pr_url": null,
  "checks": {},
  "failure_reason": null,
  "merged_at": null,
  "remote_branch_deleted": false,
  "local_cleanup_executed": false
}
```

Follow-up execution prompt:

```text
Authorize manifest/state updates and execute PRIVACY-HISTORY-ANALYTICS-BLOCK-01 in fap-web. Keep paid ads NO-GO. Scope is limited to blocking private history/private route-family browser analytics dispatch and adding focused contracts. Do not deploy, do not touch CMS, and do not submit search URLs.
```

## Final Gate

`private_url_seen=Yes`; paid ads remain `NO-GO`.

Do not continue paid ads, paid UTM enablement, freemium launch amplification, checkout/unlock smoke promotion, or scaled multimedia distribution until the proposed fix PR lands and a repeat live review returns `private_url_seen=No`.
