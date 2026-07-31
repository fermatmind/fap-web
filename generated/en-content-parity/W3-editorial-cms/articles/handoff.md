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

## W9-directed producer rework-02

- Blocked frozen package SHA: `37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669`.
- Independent W9 BLOCKED report SHA: `c719183f9cba94d50b61bb4064c35754bcb36e8224f9270039267c6dd4d2b0e4`.
- Independent 17-row evidence SHA: `d7d921a87f3ad427193842ef9e2d29e2a870162ead154466e437bae14178198e`.
- Repaired rows: W3-ARTICLE-01, 02, 04, 05, 06, 07, 08, 09, 10, 50, 51, 52, 53, 55, 58, and 59.
- Article 3 remained content-identical because independent W9 passed that row.
- The repair restores omitted source-equivalent tables and checklists, fixes malformed Markdown and reader-visible translation fragments, and removes producer-control leakage.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
