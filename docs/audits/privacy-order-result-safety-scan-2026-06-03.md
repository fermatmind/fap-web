# Privacy Order Result Safety Scan - 2026-06-03

PR id: `PRIVACY-ORDER-RESULT-SAFETY-SCAN-01`

Mode: docs-only read-only scan. No runtime files, tests, CMS data, search submissions, private URLs, production writes, secrets, or deploy actions were changed or accessed.

## 1. One-Line GO / NO-GO

GO for current repo and public discoverability surfaces: no private order/result/share/payment/history URL exposure was found in metadata, sitemap, llms, llms-full, or checked tracking sanitizers.

NO-GO for paid ads until live GA4/Baidu/private_url_seen operational review is performed from approved dashboards, because this scan did not read authenticated analytics dashboards or production logs.

## 2. Private Route Inventory

| Route family | Files / evidence | Current protection | Confidence |
| --- | --- | --- | --- |
| Result detail | `app/(localized)/[locale]/(app)/result/[id]/page.tsx:8-13` | `NOINDEX_ROBOTS`, `force-dynamic`, `revalidate=0` | High |
| Order detail | `app/(localized)/[locale]/orders/[orderNo]/page.tsx:19-25` | `NOINDEX_ROBOTS`; canonical collapses to `/orders/lookup` and does not include `orderNo` | High |
| Order lookup | `app/(localized)/[locale]/orders/lookup/page.tsx:17-27` | `NOINDEX_ROBOTS`; canonical is `/orders/lookup`; page source does not construct `orderNo=` in metadata | High |
| Pay wait | `app/(localized)/[locale]/pay/wait/page.tsx:25-31` | `NOINDEX_ROBOTS`; canonical is `/pay/wait` without `order_no` or recovery token | High |
| Share detail | `app/(localized)/[locale]/share/[id]/page.tsx:44-76` | canonical path collapses to `/{locale}/share`; `noindex: true`; share id excluded from canonical | High |
| Private response headers | `next.config.mjs:81-85`, `next.config.mjs:109-179` | `X-Robots-Tag: noindex, nofollow, noarchive, nocache`, `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer` for result/orders/history/pay/payment/share | High |

## 3. Canonical / Robots / Sitemap / Llms Exposure Matrix

| Surface | Evidence | Result |
| --- | --- | --- |
| Canonical candidate guard | `tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts:19-40` rejects query/hash/cross-host/private-flow canonical candidates | PASS |
| Private route metadata | `tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts:95-109` checks result/share/order/order lookup metadata and order canonical redaction | PASS |
| Shared discoverability deny policy | `lib/seo/discoverabilityExposurePolicy.cjs:3-25` covers result, results, orders, share, payment, pay, tests take | PASS |
| Indexing policy | `lib/seo/indexingPolicy.ts:19-26`, `lib/seo/indexingPolicy.ts:93-128` denies private paths from noindex/sitemap inclusion | PASS |
| Sitemap route excludes | `next-sitemap.config.js:116-148` includes `PRIVATE_FLOW_ROUTE_EXCLUDES` and `/api/*` | PASS |
| Public sitemap | `https://fermatmind.com/sitemap.xml` status 200; checked sensitive needles all false | PASS |
| Public llms.txt | `https://fermatmind.com/llms.txt` status 200; checked sensitive needles all false | PASS |
| Public llms-full.txt | `https://fermatmind.com/llms-full.txt` status 200; checked sensitive needles all false | PASS |
| Public robots.txt | `https://fermatmind.com/robots.txt` status 200; no sensitive private path/token needles | PASS |

Sensitive public-surface needles checked:

```text
/result/
/orders/
/share/
/pay/
/payment/
/history/
orderNo=
order_no=
payment_recovery_token
access_token=
```

`docs/seo/generated/url-inventory.v1.json` had zero result/orders/share/payment private URL hits. Two `/pay` and two `/history` string hits were career job slug collisions (`payroll-and-timekeeping-clerks`, `history-teachers-postsecondary`), not private route families.

## 4. Analytics Payload Leakage Matrix

| Layer | Evidence | Result |
| --- | --- | --- |
| Browser analytics bootstrap | `components/analytics/AnalyticsScripts.tsx:70-82`, `components/analytics/AnalyticsScripts.tsx:155-169` blocks private route segments and sensitive query keys before loading GA/Baidu scripts | PASS |
| Consent gate | `lib/analytics.ts:46-69`, `lib/analytics.ts:71-94` requires analytics enabled, allowed runtime, and consent before dispatch | PASS |
| URL redaction | `lib/tracking/privacy.ts:3-17`, `lib/tracking/privacy.ts:73-137` redacts sensitive query keys and sensitive path segments | PASS |
| Identifier masking | `lib/tracking/privacy.ts:139-157` masks attempt/order/transaction fields | PASS |
| `/api/track` route | `app/api/track/route.ts:42-52`, `app/api/track/route.ts:56-83` validates event names, filters payload, sanitizes path, and builds forwarded event after filtering | PASS |
| Purchase tracking | `app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx:516-541` uses `maskedOrder` for `payment_confirmed` and `purchase_success` | PASS |
| Result view / unlock funnel | `components/result/mbti/MbtiResultShell.tsx:1261-1271`, `components/result/mbti/MbtiResultShell.tsx:1422-1496` sends `attempt_id` plus masked fields; downstream whitelist/privacy filtering masks sensitive identifiers | PASS with dependency on filtering layer |
| Result client auxiliary events | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx:621-625`, `656-660`, `692-697`, `870-885` include `attempt_id`; downstream whitelist/privacy filtering masks sensitive identifiers | PASS with dependency on filtering layer |

Focused contracts passed:

```text
pnpm exec vitest run tests/contracts/private-noindex.contract.test.ts tests/contracts/analytics-payload-privacy.contract.test.ts tests/contracts/tracking-whitelist.contract.test.ts
```

Result: 3 files passed, 20 tests passed.

## 5. Historical Dashboard-Risk Reconciliation

Historical risk remains operationally relevant: older dashboard screenshots had shown private-like URLs such as `/zh/result/...` and `/zh/orders/lookup?orderNo=...` in analytics surfaces.

Current repo and public-surface scan found protections that should prevent recurrence:

- third-party browser analytics bootstrap blocks result/orders/share/pay/payment/history route families before loading GA/Baidu scripts;
- sensitive query keys such as `orderNo`, `order_no`, `payment_id`, `attemptId`, and `token` block analytics runtime;
- `/api/track` sanitizes paths and payload before forwarding;
- sitemap, llms, llms-full, and URL inventory do not include private URL families.

However, this scan did not read authenticated GA4/Baidu dashboards or production logs. Therefore `private_url_seen` is not proven `No` for the current live reporting window. Treat it as `Unknown` until an approved dashboard/log review confirms no raw private URLs in entrance page, visited page, page_location, or first-party tracking payload records.

## 6. P0 Blockers

No current repo/public discoverability P0 leak was found.

P0 before paid ads:

1. `private_url_seen` must be reviewed from approved live GA4/Baidu/first-party dashboards or logs.
2. If any raw private URL is found, freeze publish, search submission, and paid ads until repair and revalidation pass.
3. The issue queue/dashboard should ingest only sanitized path patterns and evidence summaries, not raw private URLs.

## 7. Exact Follow-Up PR Scope for PRIVACY-ORDER-RESULT-SAFETY-01

Recommended scope if the next repair/hardening PR is authorized:

- Add or update a docs/contract scanner that checks public sitemap, llms, llms-full, generated URL inventory, and selected analytics fixture payloads for private route families and sensitive query keys.
- Add a `private_url_seen` operational evidence adapter contract that accepts `No`, `Yes`, or `Unknown` and forbids treating `Unknown` as `No`.
- Add focused tests for `/pay/wait?order_no=...`, `/orders/lookup?orderNo=...`, `/result/[id]?access_token=...`, and `/share/[id]` to ensure metadata/canonical/noindex and tracking sanitization stay locked.
- Do not modify public content, CMS, search submission, runtime SEO URL sets, payment behavior, or private result/order access flows unless a live leak requires a separately scoped fix.

Allowed likely files:

```text
docs/audits/**
docs/analytics/**
docs/operations/**
tests/contracts/*privacy*
tests/contracts/*analytics*
tests/contracts/*seo*
scripts/seo/**
docs/codex/pr-train.yaml
docs/codex/pr-train-state.json
```

## 8. Stop Conditions

Stop commercial publish/search/ads work if any of these become true:

- `private_url_seen=Yes` in GA4, Baidu, first-party tracking, sitemap, llms, logs, or issue queue evidence.
- raw `orderNo`, `order_no`, `resultId`, `attemptId`, `payment_id`, `transaction_id`, `payment_recovery_token`, or `access_token` appears in public canonical, sitemap, llms, page_location, Baidu visited pages, Search Channel records, or SEO issue URLs.
- `Unknown` is treated as `0` or `No` in daily commercial readiness reporting.
- a CMS/search/ads workflow tries to submit a private/noindex/non-canonical URL.

## 9. Validation Commands

Commands run:

```text
git status --short --branch
git log -n 5 --oneline
rg -n "orderNo|order_no|resultId|attemptId|payment_id|transaction_id|token" app components lib tests -S
rg -n "canonical|robots|noindex|sitemap|llms|page_location|_hmt|gtag|trackEvent" app components lib tests -S
pnpm exec vitest run tests/contracts/private-noindex.contract.test.ts tests/contracts/analytics-payload-privacy.contract.test.ts tests/contracts/tracking-whitelist.contract.test.ts
pnpm typecheck
```

Pending PR validation after this report:

```text
python3 -m json.tool docs/codex/pr-train-state.json >/dev/null
python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('docs/codex/pr-train.yaml').read_text()); print('yaml ok')"
git diff --check -- docs/audits docs/codex
git diff --cached --check
```

## Scope Confirmation

Runtime changed: no.

Tests changed: no.

CMS changed: no.

Search submissions: no.

Private production URL access: no.
