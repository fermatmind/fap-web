---
name: career-risk-future-asset-factory
description: FermatMind career risk and future-change content-asset workflow for AI impact, automation boundaries, cyclical risk, contract/project risk, safety, and regulatory change. Use when Codex needs to create, audit, repair, or freeze career risk assets.
---

# Career Risk Future Asset Factory

Use this skill for occupational risks and future-change signals.

Pipeline:

`manifest -> risk evidence -> evidence audit -> trust audit -> risk synthesis -> synthesis audit -> risk asset -> asset audit -> freeze`.

## Non-Negotiable Rules

- Depend on PASS identity and work-activities blocks.
- Treat AI impact as task-level exposure, not a prediction that a career will disappear.
- AI impact scores such as `8/10` must be derived from task evidence plus external calibration sources. They cannot be based only on the FermatMind internal rubric.
- AI impact scores describe exposure to automation or augmentation of tasks, not unemployment risk, wage loss, career disappearance, or individual outcome prediction.
- Locale assets must be market-specific, not translations of the same paragraph. `zh-CN` should be written for mainland China reader context and source boundaries. `en` should be written primarily for US/UK/EU English-market reader context and source boundaries.
- Separate automation exposure, regulatory risk, safety risk, market cyclicality, contract/project volatility, and credential risk.
- Do not make employment guarantees, doom claims, investment advice, or personal outcome predictions.
- If evidence is weak or macro-only, state that boundary.

## Outputs

- AI/task impact summary
- AI exposure score with `exposure_type`, `score_1_to_10`, confidence, calibration sources, and reader boundary
- near-term and long-term risk cues
- contract/project risk
- safety/regulatory boundaries
- mitigation or reality-check guidance

## Required References

Read:

1. `references/source_rules.md`
2. `references/ai_source_rules.md`
3. `references/ai_exposure_rubric.md`
4. `references/trust_rules.md`
5. `references/writing_rules.md`
6. `references/ai_impact_v2_generation_rules.md` when working on AI impact assets.
7. `../career-content-asset-factory/references/shared_pipeline_contract.md`

## AI Impact v2 Gate

Use the v2 schemas and scripts for AI impact batch work:

- `schemas/career_ai_impact_evidence_v2.schema.json`
- `schemas/career_ai_impact_synthesis_v2.schema.json`
- `schemas/career_ai_impact_asset_v2.schema.json`
- `schemas/career_ai_impact_search_projection_v2.schema.json`
- `scripts/audit_ai_impact_evidence_v2.py`
- `scripts/audit_ai_impact_synthesis_v2.py`
- `scripts/audit_ai_impact_assets_v2.py`
- `scripts/audit_ai_impact_template_reuse_v2.py`
- `scripts/audit_ai_impact_score_rationale_v2.py`
- `scripts/audit_ai_impact_search_projection_v2.py`

Rejected v1 AI impact files must not be patched. Regenerate a v2 batch from evidence first using `templates/ai_impact_batch_001_v2_regeneration_prompt.md`.
