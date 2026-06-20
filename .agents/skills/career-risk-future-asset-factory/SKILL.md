---
name: career-risk-future-asset-factory
description: FermatMind career risk and future-change content-asset workflow for AI impact, automation boundaries, cyclical risk, contract/project risk, safety, and regulatory change. Use when Codex needs to create, audit, repair, or freeze career risk assets.
---

# Career Risk Future Asset Factory

Use this skill for occupational risks and future-change signals.

Pipeline:

`manifest -> risk evidence -> evidence audit -> trust audit -> risk synthesis -> synthesis audit -> risk asset -> asset audit -> freeze`.

AI Impact v5 canonical workflow:

`seed/manifest -> evidence -> synthesis -> asset -> search_projection quarantine -> competitive v5 gate -> batch freeze -> final independent QA -> final repair -> staging preview -> editorial review -> approved -> production import -> post-import live SEO QA`.

For AI Impact v5, use `control_<previous> + new_50` batches. The final 1046 batch may use `new_46`. Each content batch must first create 10 gold-sample rows for manual-quality review, then apply the passing pattern to the remaining 40 rows. A batch is not reusable until its competitive v5 gate PASS artifacts are frozen with SHA-256 manifests.

## Non-Negotiable Rules

- Depend on PASS identity and work-activities blocks.
- Treat AI impact as task-level exposure, not a prediction that a career will disappear.
- AI impact scores such as `8/10` must be derived from task evidence plus external calibration sources. They cannot be based only on the FermatMind internal rubric.
- AI impact scores describe exposure to automation or augmentation of tasks, not unemployment risk, wage loss, career disappearance, or individual outcome prediction.
- Locale assets must be market-specific, not translations of the same paragraph. `zh-CN` should be written for mainland China reader context and source boundaries. `en` should be written primarily for US/UK/EU English-market reader context and source boundaries.
- Every AI Impact asset must have a non-`general` micro-family. Broad fallback families are audit failures.
- `search_projection` is candidate-only data. It must remain in a separate ledger and must never enter reader assets, API reader payloads, JSON-LD, sitemap, canonical, noindex, or `llms.txt` decisions.
- Engineering gate PASS is not enough for public readiness. AI Impact needs competitive/editorial gates for repeated phrase frequency, structural skeleton similarity, workflow specificity, score rationale quality, skill evidence usefulness, standalone GEO citation quality, high-risk responsibility scenes, and locale market independence.
- Separate automation exposure, regulatory risk, safety risk, market cyclicality, contract/project volatility, and credential risk.
- Do not make employment guarantees, doom claims, investment advice, or personal outcome predictions.
- If evidence is weak or macro-only, state that boundary.

## AI Impact v5 Repair Boundaries

Final repair may change reader prose, score rationale wording, and approved evidence text for generic workflow evidence findings. It may not change source URLs, source IDs, seed identity, SOC/O*NET, row ordering, or scores. If a score appears wrong, open a separate `score_reopen` record with evidence and SHA diff; do not silently change it during reader repair.

## AI Impact v5 Production Chain

Production release requires a separate path after content PASS:

1. staging preview design
2. dry-run importer with authority gate
3. `staging_preview` write
4. 50/150 page QA and API smoke
5. editorial approval manifest
6. approved transition
7. exact-SHA production import authorization
8. production API/page smoke
9. post-import live SEO QA

No production import is allowed without explicit approval naming the exact final artifact SHA.

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
7. `references/ai_impact_v5_workflow.md` when working on AI Impact v5 assets.
8. `references/ai_impact_v5_quality_gates.md` when auditing AI Impact v5 assets.
9. `references/ai_impact_import_readiness.md` before staging/import planning.
10. `../career-content-asset-factory/references/shared_pipeline_contract.md`

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
