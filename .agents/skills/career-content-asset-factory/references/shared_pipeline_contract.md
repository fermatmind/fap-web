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

