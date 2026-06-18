# GPT Prompt: Regenerate Career AI Impact Batch 001 v2

Current batch 001 v1 was rejected. Do not patch v1. Regenerate batch 001 v2 from evidence first.

## Inputs

Use the original batch 001 50-career manifest and seed order.

Use the v2 schemas and rules:

- `career_ai_impact_evidence_v2.schema.json`
- `career_ai_impact_synthesis_v2.schema.json`
- `career_ai_impact_asset_v2.schema.json`
- `career_ai_impact_search_projection_v2.schema.json`
- `ai_impact_v2_generation_rules.md`

Use the rejected v1 only as a failure reference. Do not copy its generic task templates.

## Output Files

Produce:

1. `career_risk_future_ai_impact_batch_001_50_v2_evidence.jsonl`
2. `career_risk_future_ai_impact_batch_001_50_v2_synthesis.jsonl`
3. `career_risk_future_ai_impact_batch_001_50_v2_assets.jsonl`
4. `career_risk_future_ai_impact_batch_001_50_v2_search_projection.csv`
5. `career_risk_future_ai_impact_batch_001_50_v2_sources.csv`
6. `career_risk_future_ai_impact_batch_001_50_v2_validation.json`

## Hard Rules

- Do not generate 1046.
- Do not generate batch 002.
- Do not modify salary assets.
- Do not self-declare PASS.
- Do not write production import artifacts.
- Do not use search projection as runtime SEO.
- Do not allow internal rubric alone to support a score.
- Do not allow generic task templates to pass.
- Do not use unsupported percentages, tool names, source years, or regulatory labels.

## Evidence Rules

Every occupation must have:

- full source objects for O*NET/BLS/official task evidence where available
- full source objects for external calibration sources
- at least four occupation-specific `workflow_evidence_items`
- internal rubric source object used only as bounded scoring support
- reader boundary explaining that AI score is task exposure, not job loss, wage loss, career disappearance, or personal outcome prediction

## Score Rules

Every synthesis and asset row must include `score_rationale` with:

- `score_1_to_10`
- `score_band`
- `exposure_type`
- `confidence`
- at least three occupation-specific `task_exposure_drivers`
- at least two occupation-specific `human_judgment_anchors`
- `why_not_higher`
- `why_not_lower`
- `confidence_reason`
- `evidence_ids_used`
- `external_calibration_source_ids_used`
- `internal_rubric_source_id`
- `manual_review_flag`
- `manual_review_reason`

## Manual Review Seeds

Resolve these before output:

- `actuaries`: v1 `4/10 high confidence` is not credible. Review probability models, reserving, pricing assumptions, scenario testing, regulatory reporting, and stakeholder explanation. Likely exposure should be substantially higher unless evidence proves otherwise.
- `administrative-law-judges-adjudicators-and-hearing-officers`: review legal record analysis, hearing evidence, statutory reasoning, and written decisions.
- `adhesive-bonding-machine-operators-and-tenders`: distinguish industrial automation from AI task exposure.
- `air-traffic-controllers`: preserve safety-critical human accountability.
- `airline-and-commercial-pilots` and `airline-pilots-copilots-and-flight-engineers`: preserve safety-critical human accountability.
- Medical roles: distinguish documentation/decision support from clinical accountability.

## Locale Rules

Write `zh-CN` and `en` independently from the same evidence:

- `zh-CN`: mainland China reader context.
- `en`: US/UK/EU English-market reader context.

The English asset must not be a translation of the Chinese asset.

## Search Projection

Search projection is candidate-only:

- `projection_status = candidate_only_not_runtime_seo`
- include `runtime_use_boundary`
- include `citation_snippets` with evidence source IDs
- no direct JSON-LD, canonical, noindex, sitemap, llms, or metadata runtime instruction

## Final Note

Return files only. Do not claim PASS. Codex will run schema, trust, template, score-rationale, locale, and projection audits.
