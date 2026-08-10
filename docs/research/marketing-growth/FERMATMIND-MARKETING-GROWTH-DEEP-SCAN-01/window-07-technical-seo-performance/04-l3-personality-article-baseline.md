# L3 Personality and Article baseline

## Sampling

Personality samples include MBTI base, variant and comparisons; Big Five dimension/pole/facet; and Enneagram type/wing/subtype. Article samples cover current traffic, near-winner, authority, conversion, refresh and long-body intents in EN/ZH. Where current GSC/GA4 evidence was absent, portfolio labels remain HISTORICAL or UNKNOWN.

| Metric | L3 | Evidence |
| --- | --- | --- |
| Rows | 42: 42 success / 0 errors | LAB_ONLY |
| TTFB | median 157.6 ms; p75 328.4 ms; p95 2177.2 ms | LAB_ONLY |
| FCP p75 | 656 ms | LAB_ONLY |
| LCP p75 | 1700 ms | LAB_ONLY |
| CLS p75 | 0.45 | LAB_ONLY; high on sampled article templates |
| Transferred p75 | 381852 B | LAB_ONLY |
| Field CWV | UNKNOWN | No readable field source |

## Full lightweight scan

All 525 frozen non-Career URLs returned HTTP 200 under serial GET. Four IQ/EQ EN/ZH assessment landings lacked canonical and `og:url`; every other scanned URL exposed a self canonical.

## Article diagnostics

- Selected article latency varied materially, including one authority sample with high TTFB.
- One `zh/articles/big-five-tool-guide` run transferred about 1.67 MB.
- CMS media requests were observed, but API/render/cache/media contributions are not isolated.
- A single large sample or short-window delay is not a persistent outage/root-cause proof.

## Capacity boundary

L3 repairs may not add global preload, API calls, JS or rendering pressure to L1. Article content and mutable media remain backend CMS/Media Library authoritative.

## GSC/GA4 cohort evidence

The frozen non-Career registry supplies two eligible L3 cohorts: 253 `L3_PERSONALITY_NON_BIG_FIVE` URLs and 113 `L3_ARTICLES` URLs. The read-only M01 GSC export contains partial exact page-row availability diagnostics: personality 109 / 48 / 109 and articles 58 / 49 / 59 for current 28-day / previous 28-day / current 90-day windows respectively. These counts describe retained top rows only; they are not rankings, traffic totals or exhaustive coverage.

The required prior 90-day GSC window and both GA4 90-day windows are unavailable. No Top 20, Top 10, median, clicks, impressions, CTR, position, sessions, users or conversions are inferred. The fixed-schema cohort artifact therefore contains zero data rows and explicitly records `INSUFFICIENT_DATA_ZERO_ROWS`; L3 search and analytics outcomes remain `UNKNOWN` pending privacy-safe source evidence.
