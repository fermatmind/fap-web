---
name: career-content-asset-factory
description: FermatMind orchestrator for modular career content asset production across 1046+ career jobs. Use when Codex needs to plan, coordinate, gate, freeze, or report multi-block career content assets such as identity, work activities, fit, skills, risk, adjacent careers, page assembly, salary assets, personality/test-result interfaces, staging/import readiness, and post-import QA.
---

# Career Content Asset Factory

Use this skill as the shared career content orchestrator and state-machine authority for FermatMind career content assets. It does not create reader-facing career facts directly. It coordinates block factories, batch manifests, audit gates, frozen baselines, state files, staging/import readiness, and release boundaries.

Canonical block pipeline:

`seed -> block manifest -> evidence ledger -> evidence schema audit -> trust audit -> synthesis/estimate ledger -> synthesis/estimate audit -> asset JSONL -> asset/editorial audit -> freeze baseline`.

Canonical post-asset chain:

`final independent QA -> repair_batches_50 if needed -> final repaired QA -> staging preview design -> dry-run importer -> staging_preview write -> API/page smoke -> editorial_review -> approved transition -> exact-SHA production import -> post-import live QA/SEO safety`.

## Role And Relationships

- This skill is the orchestrator authority. It owns global state, dependency checks, batch progression, freeze readiness, import state readiness, and next-goal planning.
- Block factories own their block-specific evidence, trust rules, synthesis, asset generation, and quality gates.
- The SEO/GEO agent owns sitemap, `llms.txt`, canonical, noindex, JSON-LD, rich-result, and search-release decisions. This orchestrator may quarantine candidate search projections but must not release them.
- Personality/test-result agents own MBTI, Big Five, Enneagram, RIASEC, and result interpretation assets. This skill may record their state and bridge readiness but must not rewrite their psychometric authority.
- Career-personality bridge assets connect career blocks to tests and public profiles. They require explicit bridge gates and must not infer diagnoses, outcomes, or guaranteed matches.
- Page assembly consumes PASS block assets only. It must not create new occupational facts or frontend fallback content.
- Release guards own production import, deployment, exact-SHA approval, rollback readiness, and post-import live QA.

## Non-Negotiable Rules

- Evidence comes before reader-facing content. No PASS evidence ledger means no synthesis or asset generation.
- Schema-valid evidence is not sufficient. A block-specific trust audit must PASS before synthesis.
- Engineering PASS is not public readiness. Every block must have a block-specific competitive/editorial quality gate.
- PASS is not a reusable baseline until freeze, archive, and SHA manifests are complete.
- Keep salary, identity, work activities, fit, skills/entry, risk/future, adjacent comparison, page assembly, and personality bridges as separate scopes.
- Default batch progression is `control_<previous> + new_50`; the final batch may be smaller than 50. Do not run `new_200` or larger batches unless explicitly approved.
- Do not generate all 1046 or 10000 careers in one step.
- Do not use reader-facing text as evidence. Reader text must trace to evidence and synthesis/estimate ledgers.
- Do not fabricate facts, source URLs, sample counts, salary values, statistics, credentials, regulatory requirements, AI impact claims, assessment interpretations, or employment outcomes.
- Candidate search, SEO, schema, or GEO projection fields must not be embedded in reader assets. Keep them in separate candidate files and require a separate SEO/runtime release gate.
- If a block remains `BLOCKED` after the configured repair loops, stop and produce a repair prompt; do not continue downstream.
- Production import requires explicit human approval naming the exact artifact SHA. This skill may prepare readiness artifacts but must not imply deployment or import permission.
- No frontend fallback content can become content authority. Empty backend/API responses must fail closed or render bounded empty states.
- Page assembly must not invent missing facts.
- No self-declared PASS: a block can only PASS through its audited gate outputs and frozen SHA artifacts.
- Operator mode is dry-run-first. It may plan or perform only autonomous content-production actions and must stop for human approval before schema changes, runtime/SEO/CMS changes, staging writes, approved transitions, or production import.

## Block Skills

- `career-salary-asset-factory`: salary and employment reference assets; mature salary block authority.
- `career-identity-asset-factory`: occupation identity, definitions, official boundaries, title cleanup, and classification mappings.
- `career-work-activities-asset-factory`: responsibilities, tasks, tools, stakeholders, work context, and environment.
- `career-fit-asset-factory`: RIASEC/personality/work-style fit signals and test-conversion decision copy.
- `career-skills-entry-asset-factory`: skills, knowledge, credentials, education, portfolio, and entry-path preparation.
- `career-risk-future-asset-factory`: AI impact, automation boundaries, cyclical risk, contract/project risk, safety, and future-change notes.
- `career-adjacent-comparison-asset-factory`: adjacent occupations, differences, transfer paths, and comparison tables.
- `career-page-assembly-asset-factory`: FAQ, source disclosure, review validity, CTA assembly, and reader-safe projection QA.

## Required References

Before orchestrating a block, read:

1. `references/orchestrator_state_machine.md`
2. `references/block_factory_contract.md`
3. `references/batch_progression_policy.md`
4. `references/human_approval_boundaries.md`
5. `references/search_projection_quarantine.md`
6. `references/staging_import_release_contract.md`
7. `references/post_import_live_qa_contract.md`
8. `references/runtime_leakage_prevention.md`
9. `references/baseline_artifact_registry.md` before restoring, exporting, or consuming previously frozen baselines.
10. For autonomous continuation, read `references/operator_mode.md`, `references/operator_runbook.md`, `references/operator_source_availability_policy.md`, and `references/lexical_false_positive_policy.md`.
11. The target block skill's `SKILL.md` and required block references.

Use legacy shared references as supporting material:

- `references/shared_pipeline_contract.md`
- `references/shared_gate_rules.md`
- `references/import_state_machine.md`
- `references/shared_staging_import_contract.md`
- `references/shared_editorial_quality_gate.md`

## State Files

The orchestrator state path is:

`generated/fermatmind-content-agent-state/`

Expected files:

- `global_content_state.json`
- `career_block_status.json`
- `personality_block_status.json`
- `bridge_asset_status.json`
- `latest_pass_baselines.json`
- `batch_registry.json`
- `open_failures.json`
- `import_state.json`
- `next_goal_recommendation.md`

Validate them with the schemas under `schemas/` before using them to advance a goal.

## Scripts

The scripts in `scripts/` are orchestration and validation helpers only. They must not generate content facts or import production data.

- `detect_latest_baseline.py`
- `build_baseline_artifact_registry.py`
- `restore_baseline_preflight.py`
- `export_baseline_artifact.py`
- `upload_baseline_artifact.py`
- `restore_baseline.py`
- `create_next_batch_manifest.py`
- `update_agent_state.py`
- `validate_agent_state.py`
- `audit_block_outputs.py`
- `freeze_block_baseline.py`
- `plan_next_goal.py`
- `check_runtime_leakage_terms.py`
- `validate_search_projection_quarantine.py`
- `validate_page_assembly_no_new_facts.py`
- `run_operator_next.py`
- `run_operator_loop.py`
- `operator_guard.py`
- `select_next_phase.py`
- `evaluate_gate_result.py`
- `check_lexical_false_positive_policy.py`
- `render_next_goal_from_state.py`
- `propose_operator_self_improvement.py`

Block-specific content generation remains in block factories.
