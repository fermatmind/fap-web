# GSC US, UK, OTHER, GLOBAL and Device Split

## Goal status

**`E01_GSC_EXACT_MARKET_SPLIT_REFRESH_COMPLETE`**. M01 provides 12,336 verified privacy-filtered joint rows at `window × query × page × country × device`; E01 revalidated the English canonical cohort and aggregated 4,192 retained rows across 152 pages. This replaces the previous current-fact claim that the joint export was absent.

This completion applies to the retained Search Analytics returned-safe rows only. It does not claim event-level or full long-tail exhaustiveness, and it does not turn privacy-filtered or unavailable rows into zero.

## All-surface market totals

GLOBAL is recomputed directly from all eligible rows for each window. It is not added to US+UK+OTHER as a fourth segment.

| Window | Dates | Segment | Clicks | Impressions | CTR | Weighted position | Queries | Pages | Impression share of GLOBAL |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| current28 | 2026-07-13 → 2026-08-09 | GLOBAL | 4 | 2,450 | 0.1633% | 20.4624 | 512 | 101 | 100.00% |
| current28 | 2026-07-13 → 2026-08-09 | US | 0 | 447 | 0.0000% | 32.3937 | 185 | 64 | 18.24% |
| current28 | 2026-07-13 → 2026-08-09 | UK | 0 | 96 | 0.0000% | 30.1875 | 54 | 22 | 3.92% |
| current28 | 2026-07-13 → 2026-08-09 | OTHER | 4 | 1,907 | 0.2098% | 17.1762 | 398 | 82 | 77.84% |
| prev28 | 2026-06-15 → 2026-07-12 | GLOBAL | 2 | 1,426 | 0.1403% | 27.7160 | 341 | 77 | 100.00% |
| prev28 | 2026-06-15 → 2026-07-12 | US | 0 | 451 | 0.0000% | 24.9623 | 136 | 38 | 31.63% |
| prev28 | 2026-06-15 → 2026-07-12 | UK | 0 | 106 | 0.0000% | 43.9151 | 52 | 13 | 7.43% |
| prev28 | 2026-06-15 → 2026-07-12 | OTHER | 2 | 869 | 0.2301% | 27.1692 | 240 | 57 | 60.94% |
| day90 | 2026-05-12 → 2026-08-09 | GLOBAL | 10 | 4,259 | 0.2348% | 23.3365 | 783 | 152 | 100.00% |
| day90 | 2026-05-12 → 2026-08-09 | US | 1 | 1,014 | 0.0986% | 27.6282 | 292 | 92 | 23.81% |
| day90 | 2026-05-12 → 2026-08-09 | UK | 0 | 206 | 0.0000% | 37.4709 | 90 | 31 | 4.84% |
| day90 | 2026-05-12 → 2026-08-09 | OTHER | 9 | 3,039 | 0.2962% | 20.9464 | 598 | 116 | 71.35% |

Current28 versus prev28 returned-safe evidence: clicks increased from 2 to 4, impressions increased 71.81%, CTR increased from 0.1403% to 0.1633%, and weighted position changed from 27.7160 to 20.4624 (lower is better). These are search-evidence changes, not business-growth claims.

## GLOBAL device split

| Window | Device | Clicks | Impressions | CTR | Weighted position | Impression share | Click share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| current28 | mobile | 2 | 1,012 | 0.1976% | 9.8211 | 41.31% | 50.00% |
| current28 | desktop | 2 | 1,413 | 0.1415% | 28.2831 | 57.67% | 50.00% |
| current28 | tablet | 0 | 25 | 0.0000% | 9.2000 | 1.02% | 0.00% |
| prev28 | mobile | 1 | 326 | 0.3067% | 15.0031 | 22.86% | 50.00% |
| prev28 | desktop | 1 | 1,092 | 0.0916% | 31.5275 | 76.58% | 50.00% |
| prev28 | tablet | 0 | 8 | 0.0000% | 25.5000 | 0.56% | 0.00% |
| day90 | mobile | 3 | 1,428 | 0.2101% | 11.2990 | 33.53% | 30.00% |
| day90 | desktop | 7 | 2,797 | 0.2503% | 29.6067 | 65.67% | 70.00% |
| day90 | tablet | 0 | 34 | 0.0000% | 13.0882 | 0.80% | 0.00% |

`en_gsc_country_device.csv` contains the complete available market × device × surface aggregate matrix, including branded/non-branded query counts and clicks, query/page counts, and denominator-bound country/device shares. Missing combinations are not emitted as verified zero rows.

## GLOBAL surface split

| Surface | current28 clicks / impressions | prev28 clicks / impressions | day90 clicks / impressions |
| --- | ---: | ---: | ---: |
| assessment | 0 / 40 | 0 / 219 | 0 / 276 |
| personality | 4 / 1,717 | 0 / 333 | 4 / 2,095 |
| articles | 0 / 592 | 0 / 606 | 0 / 1,368 |
| career | 0 / 61 | 0 / 228 | 0 / 373 |
| hubs/content pages | 0 / 21 | 0 / 15 | 1 / 91 |
| homepage | 0 / 19 | 2 / 25 | 5 / 56 |

## Query-page evidence

`en_query_page_opportunities.csv` is derived from the same joint rows, not from separate query and page tables. It retains 983 selected query-page market-device aggregates: every aggregate with a click or at least 10 impressions, plus the top ten impressions in each `window × market × device × surface` bucket. Each row carries exact query, page, market, device, metrics, weighted position, brand flag, and selection rule. It is evidence input only and authorizes no CMS or runtime action.

## Remaining limitations and non-actions

- Language remains `UNKNOWN_UNSUPPORTED_GSC_SEARCH_ANALYTICS_DIMENSION`; country, query, and URL path are not language proxies.
- Equivalent joint search-appearance evidence remains `UNKNOWN_UNAVAILABLE_EQUIVALENT_JOINT_EVIDENCE`.
- Search Analytics top-row availability and the conservative privacy filter remain explicit limitations.
- No route, regional content, CMS, metadata, canonical, hreflang, schema, sitemap, llms, indexability, search submission, product-code, or production action is authorized.
