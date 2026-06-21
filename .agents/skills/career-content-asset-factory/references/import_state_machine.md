# Career Content Import State Machine

Content production and public import are separate lanes.

Allowed states:

1. `dry_run`
2. `staging_preview`
3. `editorial_review`
4. `approved`
5. `production_imported`

Only `approved` content may transition to `production_imported`.

## Required Import Checks

- row count and slug count match the frozen baseline
- SHA-256 manifest matches approved artifact
- representative editorial quality sample audit completed before staging preview
- full editorial quality audit completed or accepted by human editorial approval before production import
- dry-run authority gate PASS
- staging preview write PASS
- API smoke PASS
- reader-safe projection excludes audit fields, source IDs, evidence IDs, row hashes, internal lineage, and candidate-only search/SEO/schema fields
- page smoke PASS for the preview/approved scope
- editorial QA PASS
- approval manifest SHA matches the final repaired artifact SHA and QA report SHA
- rollback plan present

Do not perform production import without explicit user approval naming the exact artifact SHA.

## Post-Import Checks

After production import, run live API and page QA before declaring release complete:

- production endpoint rows readable for all approved slug-locale pairs
- page rendering uses the new approved block and does not fall back to old/local content
- sitemap, `llms.txt`, canonical, noindex, and JSON-LD stay unchanged unless a separate SEO release authorized them
- raw enum, source ID, evidence ID, row hash, audit label, and candidate projection fields do not leak
- final verdict is block-specific, for example `POST_IMPORT_SEO_SAFE`
