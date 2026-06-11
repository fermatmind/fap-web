# Chinese Overwrite Diff Runner

Purpose: safely handle Chinese legacy page overwrite/diff preview.

Required input:

- Current old CMS body from operator or authorized export.
- New proposed body.
- Existing slug and canonical.
- Slot marker expectations.

Steps:

1. Confirm current CMS body exists.
2. Snapshot current body.
3. Generate current heading tree.
4. Record character count baseline.
5. Detect slot markers.
6. Compare new body to current body.
7. Preserve slug and canonical.
8. Check for wipeout risk.
9. Generate actual diff preview.
10. Generate slot marker insertion patch for operator review.
11. Generate pre-revalidation snapshot.

Outputs:

- `CHINESE_ACTUAL_DIFF_PREVIEW.md`.
- `CHINESE_SLOT_MARKER_INSERTION_PATCH.md`.
- `CHINESE_PRE_REVALIDATION_SNAPSHOT.md`.

No-go:

- Without current CMS body, do not change old page.
- Without operator approval, do not write CMS.
- Without revalidation approval, do not trigger ISR.
- Do not create a new URL for an overwrite task.
