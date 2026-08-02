# Career Content Import State Machine

Content production and public import are separate lanes.

Allowed states:

1. `dry_run`
2. `staging_preview`
3. `independent_qa_pass`
4. `dry_run_ready`
5. `draft_imported`
6. `readback_pass`
7. `published`
8. `live_qa_pass`

Only a registered V2 exact package with independent QA PASS may transition through the trusted backend promotion workflow.

## Required Import Checks

- row count and slug count match the frozen baseline
- SHA-256 manifest matches approved artifact
- representative editorial quality sample audit completed before staging preview
- full independent editorial quality audit completed before promotion dispatch
- dry-run authority gate PASS
- staging preview write PASS
- API smoke PASS
- reader-safe projection excludes audit fields, source IDs, evidence IDs, row hashes, internal lineage, and candidate-only search/SEO/schema fields
- page smoke PASS for the preview/approved scope
- editorial QA PASS
- approval manifest SHA matches the final repaired artifact SHA and QA report SHA
- rollback plan present

Do not perform a direct production import. Dispatch only the trusted backend promotion workflow for a V2 exact package; its exact SHA is verified for integrity, idempotency, audit, and rollback, not as an approval phrase.

## Post-Import Checks

After production import, run live API and page QA before declaring release complete:

- production endpoint rows readable for all approved slug-locale pairs
- page rendering uses the new approved block and does not fall back to old/local content
- sitemap, `llms.txt`, canonical, noindex, and JSON-LD stay unchanged unless a separate SEO release authorized them
- raw enum, source ID, evidence ID, row hash, audit label, and candidate projection fields do not leak
- final verdict is block-specific, for example `POST_IMPORT_SEO_SAFE`
