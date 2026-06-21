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

## Approval And Production

Move to `editorial_review`, then `approved`, then `production_imported`. Production import requires exact artifact SHA approval from the user and a rollback plan.

Before production import, run the full editorial quality audit or attach a human editorial acceptance manifest that explicitly accepts remaining findings. Editorial gates must not modify sitemap, `llms.txt`, canonical, noindex, robots, JSON-LD, or other SEO runtime surfaces.
