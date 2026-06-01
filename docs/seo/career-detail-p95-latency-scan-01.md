# CAREER-DETAIL-P95-LATENCY-SCAN-01

## Executive Summary

This read-only scan sampled 100 public Career detail slugs across English and Chinese, for 200 public pages total. All sampled frontend pages and backend detail API calls returned `200`, all sampled frontend pages kept `index, follow`, and no sampled page showed Page Not Found metadata.

The stability problem is therefore not URL Truth or indexability. The observed risk is latency budget. The sampled frontend page latency was:

| Metric | Value |
| --- | ---: |
| Page p50 | 564 ms |
| Page p75 | 716 ms |
| Page p90 | 3025.2 ms |
| Page p95 | 4780 ms |
| Page p99 | 5495.07 ms |
| Page max | 5816 ms |
| API p95 | 3318.45 ms |
| HTML p95 | 174822.25 bytes |

## Outlier Classification

The scan recorded 82 samples above the configured outlier threshold (`page_elapsed_ms >= 3000` or `api_elapsed_ms >= 1500`). The highest page-latency samples were:

| Locale | Slug | Page ms | API ms | HTML bytes |
| --- | --- | ---: | ---: | ---: |
| zh | `biochemists-and-biophysicists` | 5816 | 449 | 177283 |
| zh | `bicycle-repairers` | 5502 | 743 | 171594 |
| zh | `bill-and-account-collectors` | 5495 | 403 | 174787 |
| en | `bill-and-account-collectors` | 5442 | 730 | 158527 |
| zh | `barbers` | 5410 | 605 | 170196 |

## Root Cause Findings

1. **Dynamic HTML is not edge-cacheable today.**
   Sampled production detail pages returned `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`, so crawlers and users pay dynamic render and backend fetch cost.

2. **Career detail rendering has multiple backend dependency paths.**
   `app/(localized)/[locale]/career/jobs/[slug]/page.tsx` loads the career bundle for metadata and page rendering. Legacy detail rendering can additionally load explainability, first-wave next-step links, and runtime config.

3. **The bundle + SEO authority chain is serial.**
   `fetchCareerJobBundle(includeSeoAuthority=true)` fetches `/v0.5/career/jobs/{slug}` and then `/v0.5/career-jobs/{slug}/seo` before returning the bundle.

4. **HTML size is material but not the primary blocker.**
   HTML p95 was roughly 175 KB and max was roughly 190 KB. That is worth watching at 10k scale, but the primary risk is request-time fetch/cache budget.

## What Was Not Done

- No runtime code was changed.
- No backend, CMS, DB, Search Channel, URL submission, or external search API action was performed.
- No career content or frontend fallback authority was added.
- No held slug policy was changed.

## Next Fix Recommendation

Proceed to `CAREER-DETAIL-CACHE-BUDGET-REPAIR-01` with a narrow scope:

- introduce explicit career detail fetch/cache budget and request de-duplication where safe;
- avoid serial metadata/page duplicate backend dependency where the same bundle can be shared or cached;
- audit whether career detail HTML must remain `no-store`; if not, move to bounded public/stale revalidation while preserving held slug and noindex safety;
- keep backend authority as the only content source.

## Final Decision

`career_detail_p95_latency_scan_completed_ready_for_cache_budget_repair`
