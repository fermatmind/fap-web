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

## Targeted Producer rework-09

- Superseded preflight package SHA: `54fd2184e456f4d1cb465ea058c2860bc498e8ad88b3979116d94453a8c3ee0b`.
- Repaired rows: W3-ARTICLE-01, 02, 07, 08, 09, 10, 52, 55, 58, and 59.
- PASS rows with byte-identical reader-visible fields: W3-ARTICLE-03, 04, 05, 06, 50, 51, and 53.
- Repairs address only the approved reader-visible language, grammar, punctuation, and en-US consistency defects; identities, headings, links, claims, and media omission remain in scope for fresh independent verification.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
