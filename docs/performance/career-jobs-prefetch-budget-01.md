# CAREER-JOBS-PREFETCH-BUDGET-01 browser evidence

Date: 2026-07-18 UTC

## Method

- Used the repository-approved Playwright CLI with Chromium.
- Opened `/zh/career/jobs`, waited six seconds, and did not interact before recording requests.
- The baseline was the read-only production page at `https://fermatmind.com/zh/career/jobs`.
- The candidate was the same route on a local `next build` plus `next start`, using the production public API.
- Counts include document RSC requests reported by Playwright and exclude static resources hidden by the CLI.
- No production, CMS, database, or deployment mutation was performed.

## Result

| Measurement | Production baseline | PR candidate | Change |
| --- | ---: | ---: | ---: |
| Automatic `_rsc` requests after idle | 66 | 4 | -62 (-93.9%) |
| High-cardinality job detail, row-industry, and family-facet `_rsc` requests | 58 | 0 | -58 (-100%) |

The four remaining candidate requests were two duplicated low-cardinality parent-route requests for `/zh/career` and `/`; no Career job detail, row-industry, family-facet, or pagination target was prefetched.

After the idle measurement, Playwright clicked the visible `会计师和审计师` link. Navigation completed at `/zh/career/jobs/accountants-and-auditors` with the title `会计师和审计师 | FermatMind`, confirming that ordinary click navigation remains intact.

The local page emitted one browser console notice that report-only CSP ignores `upgrade-insecure-requests`; it is unrelated to link prefetch behavior and did not affect navigation or validation.
