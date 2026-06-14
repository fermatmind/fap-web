# Batch Gate Rules

Default batch size: 50.

Scaling:

- Start with 50.
- After 2 consecutive PASS batches, allow 100.
- After 3 consecutive PASS batches, allow 150 or 200.
- Any REJECT returns the next batch size to 50.

Gate order:

1. Build manifest.
2. Collect evidence.
3. Validate evidence schema.
4. Audit evidence.
5. Audit evidence trust quality.
6. Repair evidence and trust issues, max 3 loops by default.
7. Stop if blocked or repair-required rows remain.
8. Compute estimates only after evidence audit and trust audit both PASS.
9. Audit estimates.
10. Generate assets only after estimate PASS.
11. Audit assets.
12. Promote/freeze only after asset PASS and trust audit PASS.

Do not proceed to estimates or assets from REPAIR_REQUIRED or REJECT.

Trust audit is a hard gate. Existing schema/audit PASS is not sufficient when evidence contains generated China salary text, generic O*NET fallback wages, or generic UK adjacent profiles.
