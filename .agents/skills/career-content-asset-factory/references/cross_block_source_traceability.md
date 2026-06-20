# Cross-Block Source Traceability

Every reader-facing claim must trace to a block evidence row, synthesis row, and source object.

## Required Trace Fields

- `source_block`
- `source_artifact_path`
- `source_row_id` or stable row key
- `source_url` when applicable
- `evidence_hash`
- `synthesis_hash` or estimate hash when applicable
- `source_year` or review date when applicable

## Cross-Block Use

- Page assembly may cite PASS block assets but must not create new facts.
- A downstream block may depend on upstream identity/work baselines only if those baselines are frozen or final repaired.
- If traceability is incomplete, mark the row `REPAIR_REQUIRED` or `BLOCKED`.
