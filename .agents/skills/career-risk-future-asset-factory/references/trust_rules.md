# Career Risk Future Trust Rules

Block career-disappearance predictions, employment guarantees, investment advice, and macro claims presented as occupation-specific certainty.

Trust audit must fail rows with fabricated facts, unsupported proxy use, raw internal metadata, missing source boundaries, or reader-facing claims that exceed the evidence.

## AI Impact Trust Blocks

Trust audit must fail AI impact rows when any of these are true:

- The row says or implies that AI will replace the occupation.
- The row treats `8/10` or any score as unemployment risk, wage-loss risk, layoff probability, or job-disappearance probability.
- The row has `ai_exposure_score.rubric_source = "FermatMind internal AI exposure rubric"` but lacks task evidence and external calibration sources.
- Macro AI research is applied directly to a single occupation without task-level evidence.
- A high score is written as a recommendation to avoid the occupation.
- A low score is written as a guarantee of safety or job security.
- The row lacks a reader boundary explaining that AI score is a task-exposure signal, not an individual outcome prediction.
- The row leaks raw audit labels, evidence IDs, or internal rubric implementation notes into reader-facing text.

## Minimum AI Evidence

An AI impact row can pass only when it has:

- at least one `task_evidence` item tied to the occupation or an explicitly labeled adjacent/aggregate boundary
- at least one `external_calibration_sources` item
- `ai_exposure_score.exposure_type`
- `ai_exposure_score.score_1_to_10`
- `ai_exposure_score.confidence`
- `reader_boundary`
