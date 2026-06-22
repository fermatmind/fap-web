# MBTI64 SEO Measurement Cohort GSC Import

Generated at: 2026-06-22T00:46:47.105Z

## Decision

- Status: pass
- Final decision: PASS_GSC_IMPORTED_PRIORITY_READY
- Recommended next task: MBTI64-AGENT-OPTIMIZATION-PRIORITY-SELECTION-01

## Summary

- Cohort URLs: 96
- URLs with imported GSC rows: 16
- URLs pending GSC evidence: 0
- URLs with imported export but no row: 80
- P0 high impressions low CTR: 0
- P1 visible no clicks: 0
- P2 early visibility observe: 16
- P3 no GSC visibility yet: 80

## GSC Source

- Imported CSV: docs/seo/personality/mbti64-gsc-performance-page-snapshot-2026-06-22.csv
- Source kind: gsc_browser_page_table_snapshot
- CSV SHA256: b0182ba26ca17088d620bcc3d460813af7d74db726f434815ca0f77fea907ae4
- CSV rows: 145

Source limitation: this is a GSC page-dimension browser table snapshot, so query-level rows are not available in this artifact.

## Required Export

- Source: Google Search Console Performance > Search results
- Property: sc-domain:fermatmind.com
- Suggested filter: Page contains `/personality/`
- Required fields: page/url, query if available, clicks, impressions, CTR, position.

## Blockers

- None

## Warnings

- GSC_SOURCE_PAGE_TABLE_SNAPSHOT_QUERY_DIMENSION_UNAVAILABLE
- GSC_EXPORT_UNMATCHED_ROWS_129

## Safety Boundary

- Read-only Chrome/GSC table capture was used. No GSC API call, Request Indexing, CMS write, Search Queue mutation, live submit, sitemap/llms mutation, or frontend runtime change was performed.
