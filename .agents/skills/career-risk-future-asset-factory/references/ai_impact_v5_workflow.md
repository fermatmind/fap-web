# AI Impact v5 Workflow

AI Impact v5 is the canonical FermatMind risk/future-change workflow for task-level AI exposure content.

The proven chain is:

`seed/manifest -> evidence -> synthesis -> asset -> search_projection quarantine -> competitive v5 gate -> batch freeze -> final independent QA -> final repair -> staging preview -> editorial review -> approved -> production import -> post-import live SEO QA`.

## Batch Rhythm

- Use `control_<previous> + new_50` for normal batches.
- The final 1046 batch may use `new_46`.
- Generate only the current `new_50` rows; copy controls from the latest frozen baseline for regression.
- Process each batch in seed ordinal order.
- For each batch, create 10 gold sample rows first, review them for evidence quality, score rationale, locale independence, and reader usefulness, then generate the remaining 40 rows.

## Required Ledgers

Each batch produces:

- `evidence.jsonl`
- `synthesis.jsonl`
- `assets.jsonl`
- `search_projection.jsonl`
- `gold_sample_10_review.csv`
- `score_reopen_report.csv`
- `evidence_reopen_report.csv`
- `competitive_v5_gate.json`
- `competitive_v5_gate.md`
- `ready.csv`
- `repair_required.csv`
- `blocked.csv`
- `sha256_manifest.json`

`search_projection.jsonl` is candidate-only and is not reader content.

## Freeze Rules

A batch can freeze only when the competitive v5 gate returns PASS. Freeze writes the combined control baseline and creates SHA-256 manifests. A PASS content directory is not a reusable baseline until frozen.

The completed 1046 run established these expected final signals:

- batch 021 gate conclusion: `BATCH_021_V5_PASS`
- final frozen baseline conclusion: `AI_IMPACT_V5_1046_FINAL_BASELINE_FROZEN`
- final repaired QA conclusion: `READY_FOR_STAGING_PREVIEW_DESIGN`
- editorial review conclusion: `AI_IMPACT_V5_EDITORIAL_REVIEW_PASS`
- post-import live QA conclusion: `POST_IMPORT_SEO_SAFE`

Use these as workflow evidence, not as hardcoded future SHA requirements.

## Stop Conditions

Stop immediately if:

- evidence becomes template-like and cannot be repaired from real workflow evidence
- a score appears unsupported and needs `score_reopen`
- `search_projection` leaks into reader asset or reader API
- production import is requested without an exact approved artifact SHA
- a high-risk occupation lacks a concrete responsibility scene
