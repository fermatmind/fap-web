# Repair Loop Policy

Default operator repair loops: `2`.

Repair loops are counted per block, batch, phase, and finding group. A repair loop may only touch rows identified by the latest gate. It may not broaden scope into future batches or adjacent blocks.

Allowed repair targets:

- evidence rows with repairable source or specificity findings
- synthesis rows with traceability or normalization findings
- reader-facing asset rows with language, specificity, leakage, or template findings

Disallowed repair targets without explicit approval:

- frozen baseline files
- seed identity
- source URLs and source IDs
- schema definitions
- runtime projection logic
- SEO/CMS/import state

After the repair-loop limit is reached, write a blocked report and next-goal prompt. Do not continue downstream.

## Required Stop Classes

When max repair loops are exceeded, classify the stop before rendering the next goal:

- `gate_policy_review_needed`
- `source_availability_issue`
- `evidence_insufficient`
- `asset_repair_needed`
- `schema_change_needed`

Use `gate_policy_review_needed` when the content is plausibly source-backed but the gate policy is too rigid for a known source structure. Use `source_availability_issue` only when source access, freshness, or availability blocks the current phase. Use `asset_repair_needed` only when evidence/synthesis are PASS and no new source fetch is required.
