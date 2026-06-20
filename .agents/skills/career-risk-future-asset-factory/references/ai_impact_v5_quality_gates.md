# AI Impact v5 Quality Gates

AI Impact v5 must pass content-quality gates in addition to schema and trust checks.

## Required Gates

- `micro_family_gate`: every occupation has a micro-family; `general` is forbidden.
- `generic_workflow_evidence_gate`: every occupation has occupation-specific workflow evidence; generic record/schedule/requirement placeholders fail.
- `repeated_phrase_frequency_gate`: repeated phrases over threshold fail even when exact sentence checks pass.
- `structural_skeleton_similarity_gate`: slot-filled template skeletons fail.
- `score_distribution_calibration_gate`: score concentration must be reviewed; 5/10 and 6/10 rows need task-specific rationale.
- `skill_evidence_usefulness_gate`: preparation advice must include artifacts, toolchains, project/case context, field logs, review records, or deliverables.
- `standalone_geo_citation_quality_gate`: bullets should remain meaningful when excerpted and should preserve occupation context.
- `high_risk_responsibility_scene_gate`: high-risk occupations need concrete responsibility scenes.
- `locale_market_independence_gate`: `zh-CN` and `en` are market-specific, not translations.
- `search_projection_quarantine_gate`: candidate search fields are absent from reader asset and reader projection.

## High-Risk Responsibility Scenes

High-risk groups include:

- medical and clinical roles
- aviation and transportation safety roles
- legal and regulatory roles
- military and command roles
- education and counseling roles
- creative and performance roles
- physical trade and service roles
- engineering, architecture, inspection, and validation roles

The reader asset must explain the human accountability scene for the specific occupation. Generic statements such as "human review is still needed" are not enough.

## Score Rules

AI exposure scores measure task exposure to automation or augmentation. They do not measure job loss, salary loss, career disappearance, personal career outcome, or whether the occupation is safe.

For middle scores:

- 5/10 must explain why the work is neither low-exposure nor high-exposure using actual workflows.
- 6/10 must explain what pushes the role above the midpoint and what keeps human accountability material.
- If evidence contradicts the score, record `score_reopen_required`; do not silently change the score in reader repair.

## Language Rules

`zh-CN` should read like mainland China career guidance without inventing local regulation, licensing, certificate, or market facts. It must not feel like a literal O*NET translation.

`en` should read for US/UK/EU English-market users and should not carry China-only assumptions or translated Chinese phrasing.
