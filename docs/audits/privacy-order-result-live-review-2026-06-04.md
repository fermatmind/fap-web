# Privacy Order Result Live Review

Review date: 2026-06-04
Review mode: docs-only / read-only live review / PR train archive
PR id: `PRIVACY-ORDER-RESULT-LIVE-REVIEW-01`

## One-Line Conclusion

CONDITIONAL: private_url_seen=Unknown

Authenticated GA4 and Baidu Tongji dashboard evidence was not available to Codex through the current tool session without opening new pages or attaching to an existing logged-in Chrome tab. Public discoverability surfaces and code-level guards passed the read-only checks, but those checks cannot prove live analytics absence.

## Scope And Hard Boundaries

This review did not change runtime code, analytics dashboard settings, dashboard data, CMS data, payment/order state, search submission state, or deployment state.

This review did not read, print, store, or expose env values, cookies, tokens, Baidu API tokens, IndexNow keys, GSC credentials, order numbers, result identifiers, attempt identifiers, transaction identifiers, payment identifiers, or private URLs.

This review did not click or visit real private result, order, share, payment, pay, history, admin, ops, preview, or tokenized URLs.

## Production Context

| Component | Production evidence | Status |
| --- | --- | --- |
| Backend | `/var/www/fap-api/current -> releases/backend-main-20260604-d8b619ff`; `REVISION=d8b619ffb75d9443a2b292c2626879c32315b943` | PASS |
| Frontend Node1 | `/opt/apps/fap-web` `HEAD=dbb3130226f5d1e962fb5e0796a3c639748bc8e4`; worktree clean | PASS |
| Commercial events runtime | `ANALYTICS-COMMERCIAL-EVENTS-01` merged as fap-web PR #1027 at merge commit `609f6ad37ac8f0790eb221776803043350539f8d`; included in current deployed frontend lineage | PASS |
| Review timestamp | 2026-06-04T04:33:52Z for public/code evidence collection | PASS |

Checked live dashboard time windows were intended to cover today / last 24 hours, yesterday, and last 7 days. They remain unproven because authenticated dashboard access was not available to Codex in this session.

## GA4 Evidence

| time_window | surface | private_url_family_seen | raw_identifier_seen | examples_redacted | status | confidence |
| --- | --- | --- | --- | --- | --- | --- |
| today / last 24 hours | Pages and screens / page path / page location | Unknown | Unknown | none captured | Codex could not attach to the existing authenticated Chrome GA4 tab. The available browser automation session was unauthenticated, so no reliable dashboard read was captured. | Low |
| yesterday | Landing page / Traffic acquisition | Unknown | Unknown | none captured | Not verified in authenticated GA4 dashboard. | Low |
| last 7 days | Events / checkout and purchase-related event views | Unknown | Unknown | none captured | Not verified in authenticated GA4 dashboard. | Low |

GA4 conclusion: Unknown. No authenticated GA4 table, filter result, or export was captured. This cannot prove `private_url_seen=No`.

## Baidu Tongji Evidence

| time_window | surface | private_url_family_seen | raw_identifier_seen | examples_redacted | status | confidence |
| --- | --- | --- | --- | --- | --- | --- |
| today | Website overview / entry pages / visited pages | Unknown | Unknown | none captured | Codex could not attach to the existing authenticated Chrome Baidu Tongji tab. The available browser automation session was unauthenticated, so no reliable dashboard read was captured. | Low |
| yesterday | Source sites / search terms / event analysis | Unknown | Unknown | none captured | Not verified in authenticated Baidu Tongji dashboard. | Low |
| last 7 days / last 30 days | Entry pages / visited pages / conversion path if available | Unknown | Unknown | none captured | Not verified in authenticated Baidu Tongji dashboard. | Low |

Baidu Tongji conclusion: Unknown. No authenticated Baidu table, filter result, or export was captured. This cannot prove `private_url_seen=No`.

## Public Surface Check

The public surface scan fetched only public URLs and did not fetch real private URLs.

| Surface | HTTP status | Forbidden private URL/token matches | Canary slug presence | Status |
| --- | ---: | --- | --- | --- |
| `https://fermatmind.com/sitemap.xml` | 200 | none for `/result/`, `/orders/`, `/orders/lookup`, `/share/`, `/pay/`, `/payment/`, `/history/`, `/admin/`, `/ops/`, `/api/private`, `orderNo`, `resultId`, `attemptId`, `token=`, `checkout_session` | zh and en canary present | PASS |
| `https://fermatmind.com/llms.txt` | 200 | none for the forbidden patterns above | zh and en canary present | PASS |
| `https://fermatmind.com/llms-full.txt` | 200 | none for the forbidden patterns above | zh and en canary present | PASS |
| `https://fermatmind.com/robots.txt` | 200 | none for the forbidden patterns above | not applicable | PASS |
| `https://fermatmind.com/zh/articles/mbti-vs-holland-career-choice` | 200 | no raw private ID or tokenized URL captured; static HTML/JS includes guard field names such as `orderNo`, `resultId`, and `attemptId` | self canonical and `index, follow` observed | PASS with caveat |
| `https://fermatmind.com/en/articles/mbti-vs-holland-code-career-choice` | 200 | no raw private ID or tokenized URL captured; static HTML/JS includes guard field names such as `orderNo`, `resultId`, and `attemptId` | self canonical and `index, follow` observed | PASS with caveat |

Public surface conclusion: no forbidden private URL family or sensitive token was found in sitemap, llms, llms-full, or robots during this read-only scan. The article pages are public and indexable; their HTML shell may include static privacy guard field names from bundled code, but this scan did not capture any raw private ID or tokenized private URL value.

## Code-Level Guard Check

| Guard | Evidence | Status |
| --- | --- | --- |
| Tracking URL sanitizer | `lib/tracking/privacy.ts` redacts sensitive query keys and path values for attempt/order/payment/result/report/token/recovery/secret-like data. | PASS |
| Tracking payload filtering | `lib/tracking/events.ts` filters payload fields through `EVENT_FIELD_WHITELIST`, drops forbidden raw/private/payment payload fields, masks sensitive identifier fields, and sanitizes URL-valued fields. | PASS |
| `/api/track` path sanitization | `app/api/track/route.ts` calls `sanitizeTrackingUrl` for submitted path and derives locale from the sanitized path. | PASS |
| Third-party analytics bootstrap | `components/analytics/AnalyticsScripts.tsx` blocks analytics on `result`, `orders`, `share`, `pay`, `payment`, and `history` route families; blocks sensitive query keys; blocks dashboard referrer pollution from `tongji.baidu.com` and `analytics.google.com`. | PASS |
| Private route noindex/canonical | order lookup, order detail, result, and share routes use `NOINDEX_ROBOTS`, dynamic/no-store behavior where applicable, and canonical paths that avoid raw identifiers. | PASS |
| Sitemap/llms exclusion | public sitemap/llms checks found no private route families or sensitive tokens. | PASS |

Code-level conclusion: repository evidence supports private route and payload guard presence, but code evidence alone cannot prove live dashboard absence.

## Decision

| Gate | Decision | Reason |
| --- | --- | --- |
| `private_url_seen` | Unknown | Authenticated GA4/Baidu dashboard evidence was not captured. Public/code evidence passed, but dashboard absence remains unproven. |
| Paid ads | NO-GO | Unknown cannot be treated as No. |
| `UTM-CHANNEL-GOVERNANCE-01` | blocked | The live privacy gate must be repeated with authenticated dashboard evidence or redacted operator-confirmed readings before channel governance can advance as paid-ads-ready. |
| `FREEMIUM-LOCALE-POLICY-01` | blocked | Locale monetization execution should not advance toward public amplification while private URL dashboard evidence is Unknown. |
| `CHECKOUT-UNLOCK-FUNNEL-SMOKE-01` | blocked | Checkout/unlock smoke remains blocked until privacy dashboard evidence is available and `private_url_seen=No` is confirmed. |

## Required Next Steps

Because the result is Unknown:

- Add or confirm read-only dashboard/report access that lets Codex or an operator inspect GA4 and Baidu Tongji without exposing raw private IDs.
- Repeat `PRIVACY-ORDER-RESULT-LIVE-REVIEW-01` with redacted dashboard evidence for today / last 24 hours, yesterday, and last 7 days.
- Do not start paid ads.
- Do not expand social scaled distribution.
- Do not use dashboard data to claim `private_url_seen=No` until authenticated dashboard evidence supports it.

If a future dashboard review finds private URLs or raw identifiers, switch immediately to a P0 privacy fix path and keep paid ads, search submission expansion, and DailyGiving public amplification blocked.

## Redaction Appendix

No raw private IDs were captured or written in this report.

If future evidence includes examples, record only redacted forms such as:

- `/zh/orders/lookup?orderNo=<redacted>`
- `/zh/result/<redacted>`
- `/zh/share/<redacted>`
- `/zh/pay/<redacted>`
- `/zh/payment/<redacted>`
- `/zh/history/<redacted>`

Do not write full `orderNo`, `resultId`, `attemptId`, `transaction_id`, `payment_id`, token, email, phone, cookie, session, or full private URL values into reports, commits, PR bodies, screenshots, or terminal summaries.
