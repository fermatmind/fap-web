# W3 Article English candidate package

## Scope

This producer package contains exactly 17 English Article candidates bound to the frozen CMS Article ids, translation identities, slugs, and published source revision ids. It proposes only `package_in_progress → package_frozen`.

## Completed producer controls

- 17 unique Article identities and 17 candidate title/excerpt/body payloads.
- Zero Han-script leakage in candidate reader-visible fields.
- Source/candidate Markdown heading counts match for all 17 rows.
- Claim-boundary preflight preserves non-diagnostic, non-deterministic language and unknown evidence boundaries.
- China and Gaokao context remains present where material.
- Candidate media references remain omitted pending importer-contract and Media Library clearance.

## W9-directed producer rework-03

- Blocked frozen package SHA: `499dffdfccc9a2fd50daf823c345e5a4ed24edb486e2fc505d2a169b419dd27a`.
- Independent W9 BLOCKED report SHA: `5e2dbbafcbb22713fc15b07e38f46ee8c9b0ebbe2737dd4697db89f94b825d61`.
- Independent 17-row evidence SHA: `9f06f241011079840a4a2d51a6e8b9feba662426445a1fe0c4ec7c9a1924ef56`.
- Repaired rows: W3-ARTICLE-01, 02, 03, 04, 05, 08, 09, 10, 50, 51, 52, 53, 55, 58, and 59.
- Articles 6 and 7 remain content-identical because independent W9 passed both rows.
- The repair restores every source table in the 12 matrix-bearing blocked rows, fixes the exact language and source-equivalence findings, and removes reader-visible producer/SEO-control leakage.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
