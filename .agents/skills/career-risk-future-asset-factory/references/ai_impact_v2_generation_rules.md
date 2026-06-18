# AI Impact v2 Generation Rules

Use these rules for `career-risk-future.ai_impact` assets. They supersede the v1 batch-001 draft shape.

## Evidence First

- Do not infer AI impact from the occupation title alone.
- Every score must be justified by:
  - occupation-specific O*NET, BLS, or official task/profile evidence
  - at least one external AI task-exposure methodology source
  - the FermatMind internal rubric as a bounded scoring lens
- Internal rubric evidence is never sufficient by itself.
- Reader-facing text cannot be treated as evidence.

## Source Objects

`external_calibration_sources` must contain full source objects, not string IDs.

Each source object must include:

- `source_id`
- `name`
- `publisher`
- `url`
- `source_type`
- `used_for`
- `evidence_scope`
- `citation_boundary`
- `captured_at`

## Workflow Evidence

Each occupation must have at least four `workflow_evidence_items`.

Each item must describe a concrete occupational workflow such as data reconciliation, model validation, bedside escalation, route planning, rehearsal preparation, adjudication record review, machine setup, quality inspection, or safety handoff.

Disallowed generic labels unless rewritten with occupation-specific workflow detail:

- `Document and record summarization`
- `Pattern and exception screening`
- `Draft communication`
- `Planning support`
- `On-site judgment`
- `Safety and accountability`

## Score Rationale

Every synthesis and asset row must include `score_rationale`.

The rationale must explain:

- why the score is not higher
- why the score is not lower
- at least three task exposure drivers
- at least two human judgment anchors
- confidence reason
- evidence IDs and external calibration source IDs used
- unresolved manual review flags

## Confidence Rules

`confidence = high` is allowed only when all are true:

- official task/profile mapping is exact or strong
- at least four occupation-specific workflow evidence items exist
- external calibration source objects exist
- score rationale explains why not higher and why not lower
- no major title/SOC ambiguity
- `manual_review_flag = false`

Otherwise confidence must be `medium` or `low`.

## Score Sanity Rules

- Information-heavy analytical occupations require manual review before a low score.
- Physical, safety-critical, clinical, or direct-care roles require manual review before a high score.
- Project, creative, and performance roles require a variable-exposure boundary.
- Military-only roles require a military-context boundary.
- Automation-heavy machine operation must distinguish industrial automation from AI task exposure.

Known batch-001 manual review seeds:

- `actuaries`: likely higher than `4/10` unless evidence proves otherwise.
- `administrative-law-judges-adjudicators-and-hearing-officers`: review legal-document, evidence-record, and adjudication writing exposure.
- `adhesive-bonding-machine-operators-and-tenders`: review automation-vs-AI distinction.
- `air-traffic-controllers`: preserve safety-critical human accountability boundary.
- `airline-and-commercial-pilots`
- `airline-pilots-copilots-and-flight-engineers`
- medical roles, including allergists, anesthesiologists, anesthesiologist assistants, acute-care nurses, and advanced practice psychiatric nurses.

## Locale Rules

- `zh-CN` must be written for mainland China readers.
- `en` must be written primarily for US/UK/EU English-market readers.
- Do not translate Chinese text into English as the English asset.
- English rows should use US/UK/EU workflow and accountability framing when evidence supports it.
- China-only terms, regulatory labels, or examples must not leak into the English market row unless explicitly framed as a China boundary.

## Search Projection Rules

Search projection is candidate-only.

- `projection_status` must be `candidate_only_not_runtime_seo`.
- It must not contain instructions to update runtime metadata, JSON-LD, canonical, noindex, sitemap, or llms.
- `citation_snippets` must cite source IDs that exist in evidence.
- Search projection can support future SEO/GEO review only after Codex/backend projection audit.

## Reader Safety

Never claim or imply:

- AI will replace the occupation
- the score is unemployment risk
- the score is wage risk
- the occupation is safe from AI
- a personal career outcome is predicted
- an unsupported percentage, source year, tool, or regulatory label is factual
