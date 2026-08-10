# M01 GSC Export — Executive Decision

STATUS: `FERMATMIND_MEASUREMENT_M01_COMPLETE`

UI evidence captured at: `2026-08-10T05:21:48Z`
Combined API evidence extracted at: `2026-08-10T06:06:20Z`
Property: `sc-domain:fermatmind.com`
Search type: `web`

## Decision

- **VERIFIED:** official GSC UI CSV exports were captured for current 28d, previous 28d, and the requested 90d interval.
- **VERIFIED:** safe single-dimension query, page, country, device, and daily datasets are retained after privacy filtering.
- **VERIFIED:** the official Search Analytics API returned the requested ordered `query × page × country × device` grain for all three windows. After conservative privacy filtering, 12,336 rows are retained.
- **VERIFIED:** OAuth execution used only `webmasters.readonly`; the writable scope was disabled. No token, cookie, credential, OAuth URL, account identifier, or raw API response is persisted in the package.
- **VERIFIED:** Page Indexing category evidence was exported at the `2026-08-07` snapshot: 969 indexed and 2,133 not indexed across all known pages.
- **UNKNOWN:** language is not a supported Search Analytics dimension and was not inferred.

## Window summary

| Window | Clicks | Impressions | CTR | Position | Daily rows | Query rows retained | Page rows retained | Combined safe rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| current28 | 228 | 30552 | 0.746269% | 10.791120 | 28 | 973 | 992 | 3863 |
| prev28 | 141 | 40428 | 0.348768% | 10.682685 | 28 | 834 | 831 | 2482 |
| day90 | 384 | 79469 | 0.483207% | 11.779820 | 71 | 946 | 993 | 5991 |

Current versus previous 28d: clicks `+87`, impressions `-9876`, CTR `+0.397501` percentage points. This is descriptive only; no causal attribution is made.

The requested 90d interval contains 71 returned daily rows (`2026-05-31` through `2026-08-09`). GSC omits days without data; the missing 19 dates are not fabricated as zeroes.

The combined API export is suitable for query-to-page ownership and cannibalization analysis within GSC Search Analytics' documented top-row availability boundary. It must not be treated as a guaranteed exhaustive event-level dataset.

No Search Console, CMS, database, production, code, sitemap, llms, indexability, or PR-train write was performed.
