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

## W9-directed producer rework-07

- Blocked frozen package SHA: `f1b27eed98b3ca4dbdddea50cc250061232226a04ad1bbc9147ecebaa18aee3b`.
- Independent W9 BLOCKED report SHA: `0633d8253240e61937ebbedb29a64868a6192310603fe6a69038e592655dcb4b`.
- Independent 17-row evidence SHA: `aaecc12006d68f77967b85c31d2af067f36520693357c507b510885c8765d60e`.
- Repaired row: W3-ARTICLE-59 only.
- The other 16 rows remain reader-content-identical because independent W9 passed them.
- The repair addresses only W9's three recorded language-naturalness findings: one sentence, one table header, and one decision question.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
