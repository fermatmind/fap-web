# AI Source Rules

Use source types in this order.

## Primary Sources

- O*NET tasks, Detailed Work Activities, work activities, skills, and work context.
- Official national occupation profiles when O*NET coverage is missing or aggregate.
- Peer-reviewed or institutionally published AI exposure methodologies that map work activities, tasks, or occupations.

## Calibration Sources

Accepted calibration sources include:

- task-level AI exposure studies using O*NET or comparable task taxonomies
- labor-market research from universities, public agencies, international organizations, or reputable research institutes
- FermatMind internal AI exposure rubric, only when paired with task evidence and at least one external calibration source

## Disallowed Source Use

- Do not use generic AI news articles as occupation-level evidence.
- Do not use a macro AI report as if it proves one occupation's score.
- Do not use a model's unsourced judgment as evidence.
- Do not use job-board salary or hiring snippets to infer AI exposure.
- Do not copy competitor career pages as evidence, except to compare product framing during design review.

## Source Item Requirements

Each AI source item must state:

- `source_id`
- `source_name`
- `source_url` or stable citation handle
- `source_type`: `task_taxonomy | external_calibration | internal_rubric | official_profile | macro_context`
- `used_for`
- `captured_fact`
- `boundary`

Rows with `internal_rubric` but no `task_taxonomy` and no `external_calibration` must fail trust audit.

