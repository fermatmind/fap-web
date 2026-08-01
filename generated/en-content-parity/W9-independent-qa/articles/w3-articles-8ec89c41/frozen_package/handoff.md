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

## W9-directed producer rework-05

- Blocked frozen package SHA: `213736b1d59a862e73dcfeae77b67cae1fe2b092f41469a57c91631cdb052157`.
- Independent W9 BLOCKED report SHA: `ea220b4b2f2496a645cc7ae1602ed2f7290cf354dc56a5d6187cd526db132844`.
- Independent 17-row evidence SHA: `490ac8c1e38ec368894d516302ec71083af061570c17a3046cc7fd0dfe901fcc`.
- Repaired rows: W3-ARTICLE-03, 51, 52, 53, 55, 58, and 59.
- Articles 1, 2, 4, 5, 6, 7, 8, 9, 10, and 50 remain content-identical because independent W9 passed those rows.
- The repair addresses only W9's recorded reader-visible language findings: one Article 3 excerpt construction, inconsistent Article 51 Enneagram naming, duplicated admissions terms in five Gaokao rows, one Article 53 question, two possessives, and one Article 58 curriculum phrase.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
