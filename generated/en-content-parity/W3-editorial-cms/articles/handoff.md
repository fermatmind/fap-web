# W3 Article English candidate package

## Scope

This producer package contains exactly 17 English Article candidates bound to the frozen CMS Article ids, translation identities, slugs, and published source revision ids. It proposes only `inventory_frozen → package_in_progress`.

## Completed producer controls

- 17 unique Article identities and 17 candidate title/excerpt/body payloads.
- Zero Han-script leakage in candidate reader-visible fields.
- Source/candidate Markdown heading counts match for all 17 rows.
- Claim-boundary preflight preserves non-diagnostic, non-deterministic language and unknown evidence boundaries.
- China and Gaokao context remains present where material.
- Candidate media references are omitted pending import-contract and Media Library clearance.

## Deferred gates

- This is producer self-review, not W9. Naturalness, claim boundary, asset duplication, field leakage, page/API alignment, and every registered row/field still require independent W9 review.
- Internal-link parity is explicitly pending for rows listed in `source_ledger.json`; no PASS is claimed.
- No CMS dry run, draft import, publication, SEO runtime change, sitemap/llms/indexability change, search submission, staging wait, manual deploy, or production deploy is authorized or performed.
- The master manifest remains unchanged. CONTROL must independently accept the candidate transition.

## Package integrity

`sha256_manifest.json` covers the eight immutable payload files in the repository-defined order. Rebuilding any immutable payload changes the aggregate package SHA and requires the producer/QA sequence to restart.
