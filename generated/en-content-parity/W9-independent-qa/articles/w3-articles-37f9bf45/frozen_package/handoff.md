# W3 Article English candidate package

## Scope

This producer package contains exactly 17 English Article candidates bound to the frozen CMS Article ids, translation identities, slugs, and published source revision ids. It proposes only `package_in_progress → package_frozen`.

## Completed producer controls

- 17 unique Article identities and 17 candidate title/excerpt/body payloads.
- Zero Han-script leakage in candidate reader-visible fields.
- Source/candidate Markdown heading counts match for all 17 rows.
- Claim-boundary preflight preserves non-diagnostic, non-deterministic language and unknown evidence boundaries.
- China and Gaokao context remains present where material.
- Candidate media references are omitted pending import-contract and Media Library clearance.
- Producer review covers all 17 titles, excerpts, full Markdown bodies, links, claim boundaries, and media-omission decisions.

## W9-directed producer rework

- Prior frozen package SHA: `7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750`.
- Independent W9 BLOCKED report SHA: `3be77c1328b27ced327e269d8df40d33c623649a8ceb2cd1e9707510e40df192`.
- Repaired rows: W3-ARTICLE-01, W3-ARTICLE-02, W3-ARTICLE-04, W3-ARTICLE-05, W3-ARTICLE-06, W3-ARTICLE-08, W3-ARTICLE-09, W3-ARTICLE-51, W3-ARTICLE-52, W3-ARTICLE-53, W3-ARTICLE-55, W3-ARTICLE-59.
- All 17 rows were re-reviewed; PR review residual-language findings in rows 53, 55, and 58 were also repaired before re-freeze, 3 duplicated RIASEC tokens and the remaining Sunshine Gaokao proper-name typo were removed across the package. The rebuilt package requires a fresh independent W9 window and cannot reuse the prior report.

## Deferred gates

- This completed producer review is not W9. Naturalness, claim boundary, asset duplication, field leakage, page/API alignment, and every registered row/field still require independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in the repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and requires the producer/QA sequence to restart.
