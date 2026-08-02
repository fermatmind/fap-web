# Shared Staging And Import Contract

Each career content block should use an independent asset channel unless a previous block already owns the runtime table/API.

## Dry Run

Dry-run importer must validate:

- row count and slug-locale uniqueness
- source and evidence references
- frozen or final repaired artifact SHA
- career job authority: occupation row, runtime publish projection, public route readiness, and zh/en detail API readiness
- reader-safe projection shape
- no candidate-only search/SEO/schema fields in reader projection

Dry run must not write staging or production rows.

## Staging Preview

`staging_preview` write is allowed only after dry run PASS. Staging preview must:

- write the selected rows only
- preserve status as preview, not approved
- expose preview rows only through preview flags, allowlists, or status gates
- fail closed when API returns 404, flag is off, status is not allowed, or payload is incomplete

Before staging preview, a representative editorial quality sample audit should be run. Full integrated QA proves assembly integrity; editorial quality audit proves public-usefulness readiness.

## Frontend Preview QA

Frontend preview QA must verify:

- target pages render the block from the backend API
- non-preview rows do not show local fallback content
- raw enum, evidence ID, source ID, row hash, internal lineage, and candidate projection fields do not leak
- sitemap, `llms.txt`, canonical, noindex, and JSON-LD do not change unless separately authorized

## V2 Promotion And Production

For new V2 exact packages, move from independent QA to trusted backend promotion dispatch, then dry-run import, readback, publish, and live QA. The exact SHA is verified as integrity, idempotency, audit, and rollback evidence; it is not a user-approval credential.

Before promotion dispatch, run the full independent editorial quality audit. Editorial gates and trusted promotion must not modify sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or other SEO runtime surfaces.
