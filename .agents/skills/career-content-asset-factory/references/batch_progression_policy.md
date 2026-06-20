# Batch Progression Policy

Default progression is `control_<previous> + new_50`.

## Rules

- Batch 001 may be a pilot or first new_50 depending on block maturity.
- Every later batch includes all previously frozen controls plus the next seed-ordered new rows.
- The final batch may contain fewer than 50 new rows.
- Do not skip seed slugs, reorder ordinals, or deduplicate by changing order.
- Do not run `new_200`, `new_300`, or full 1046 generation unless explicitly approved and justified by prior stable PASS batches.
- Control rows must be regression controls and must not be rewritten during the new batch.

## Required Manifest Fields

- `batch_index`
- `batch_role`
- `seed_ordinal`
- `slug`
- `title_en`
- `title_zh` or `title_zh_seed`
- `soc_code_seed`
- `onet_code_seed`
- `expected_locales`

## Validation

Validate total rows, control count, new count, duplicates, seed existence, control order, new ordinal order, and no content generation during manifest-only tasks.
