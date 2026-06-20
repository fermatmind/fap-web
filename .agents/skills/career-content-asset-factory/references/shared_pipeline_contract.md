# Shared Career Content Pipeline Contract

Every career content block uses the same production shape:

1. `manifest`: selected slug set, locale expectations, control/new role, seed ordinals.
2. `evidence`: source-grounded facts, snippets, boundaries, and source identifiers.
3. `trust audit`: blocks generated facts, weak proxies, wrong-source usage, and overclaims.
4. `synthesis`: normalized block-specific interpretations derived from PASS evidence.
5. `asset`: reader-facing JSONL derived from PASS evidence and PASS synthesis.
6. `editorial/projection QA`: language, safety, role-specificity, raw-enum leakage, and UI projection checks.
7. `freeze`: archived PASS artifacts with SHA-256 and restart markers.

Do not collapse stages. A later-stage PASS cannot repair a failed earlier stage.

After a full baseline freeze, run a separate final independent QA. If it returns `REPAIR_REQUIRED`, repair by `repair_batches_50` and produce a new final repaired bundle; do not edit the frozen baseline in place.

## Required Row Identity

All ledgers must preserve:

- `asset_type` or `ledger_type`
- `asset_version`
- `block_type`
- `slug`
- `locale`
- `occupation`
- `seed_ordinal`
- `batch_role`
- `evidence_used`
- `derived_from_synthesis`
- `audit_fields`

`batch_role` should be pattern-based, for example `control_100` or `new_50`, while audit scripts verify the exact expected manifest roles.

## Protected Fields

Reader repair may not change evidence facts, source URLs, evidence IDs, derivation hashes, source years, numeric facts, official classification codes, or seed identity fields.

## Candidate Data Isolation

Reader assets must not contain search projection, SEO candidate, schema candidate, import-only status, audit labels, source IDs, row hashes, or internal lineage. If a block creates search/GEO/SEO candidates, they must live in a separate file such as `search_projection.jsonl` and remain candidate-only until a separately authorized runtime or SEO release.

## Final QA And Repair

Full-block readiness requires:

- frozen baseline SHA manifest
- final independent QA against the frozen baseline
- repair batch plan when findings remain
- protected-field diff comparing repaired output to the frozen baseline
- final repaired SHA manifest
- explicit conclusion: `READY_FOR_STAGING_PREVIEW_DESIGN`, `REPAIR_REQUIRED`, or `REJECT`

Final repair must preserve source URLs, source IDs, seed identity, official codes, scores/numeric facts, and derivation fields unless the block has a separately approved reopen process that records the diff.
