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
5. Repair evidence, max 3 loops by default.
6. Stop if blocked remains.
7. Compute estimates only after evidence PASS.
8. Audit estimates.
9. Generate assets only after estimate PASS.
10. Audit assets.
11. Promote/freeze only after asset PASS.

Do not proceed to estimates or assets from REPAIR_REQUIRED or REJECT.
