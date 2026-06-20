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
