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

## W9-directed producer rework-06

- Blocked frozen package SHA: `8ec89c41e90c07388044606f5b4a795aa89266413bbce98775cbd5a6b709178d`.
- Independent W9 BLOCKED report SHA: `5bbf58ab78c680ab42d8416d0203616a24fd2ea3de898d00944d1ce760dd07e2`.
- Independent 17-row evidence SHA: `0ed8d0c6b5df9281c0e506879e516d46def5f4fe7406368329cb9164c49285a1`.
- Repaired row: W3-ARTICLE-59 only.
- The other 16 rows remain reader-content-identical because independent W9 passed them.
- The repair addresses only W9's recorded subject-verb agreement finding by changing `Field related to AI often require greater tolerance` to `Fields related to AI often require greater tolerance`.
- The rebuilt package requires a fresh independent W9 window; no prior QA verdict carries forward.

## Deferred gates

- Producer review is not W9. Naturalness, source equivalence, claims, assets, field leakage, links, media policy, and applicable page/API alignment still require fresh independent W9 review against the exact frozen SHA.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and restarts producer/QA lineage.
