# Operator Failure Modes

Hard stops:

- `REJECT` or `BLOCKED` gate verdict
- missing canonical seed
- missing frozen baseline for required control rows
- failed schema validation that implies a schema change
- contaminated or SHA-mismatched baseline
- source access requiring login, payment, CAPTCHA, or private credentials
- dirty/unisolated repository scope when a PR is required
- runtime/SEO/CMS/staging/import action request without explicit approval

Soft stops:

- `REPAIR_REQUIRED` after max repair loops
- insufficient evidence for a subset of rows
- unclear block dependency state
- missing agent state files

Every stop must produce a machine-readable report and a user-facing next-goal recommendation.

## Max Repair Loop Classification

Default operator repair loops: `2`. After the limit is reached, the operator must stop and classify the blocked state as one of:

- `gate_policy_review_needed`: the evidence appears legitimate but the gate policy cannot represent the case, such as direct military O*NET profiles with limited duties sections.
- `source_availability_issue`: a required source timed out, disappeared, changed, or requires login/payment/CAPTCHA/private credentials.
- `evidence_insufficient`: the current sources do not support enough occupation-specific evidence.
- `asset_repair_needed`: evidence and synthesis are PASS, but reader-facing wording still fails.
- `schema_change_needed`: the artifact cannot represent required data without an explicit schema change.

The next-goal recommendation must name the exact classification, the affected block/batch/phase, and the smallest safe follow-up task.

## Cache-Only Rerun Stop Boundary

A transient source timeout is not automatically a content failure during asset re-audit. If PASS evidence and synthesis are locally available and traceable, the operator may rerun synthesis/asset gates in cache-only mode. It must still stop if source references are missing, changed, removed, or required for evidence creation/repair.
