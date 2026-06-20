---
name: career-content-asset-factory
description: FermatMind orchestrator for modular career content asset production across 1046+ career jobs. Use when Codex needs to plan, coordinate, gate, freeze, or report multi-block career content assets such as identity, work activities, fit, skills, risk, adjacent careers, page assembly, and salary assets.
---

# Career Content Asset Factory

Use this skill as the orchestration layer for FermatMind career content assets. It does not create reader-facing career facts directly. It coordinates block-specific skills, batch manifests, audit gates, frozen baselines, and import/readiness states.

Canonical pipeline:

`seed -> block manifest -> evidence ledger -> evidence schema audit -> trust audit -> synthesis ledger -> synthesis audit -> asset JSONL -> asset/editorial audit -> freeze baseline -> staging preview -> editorial review -> approved -> production import`.

Shared post-asset chain:

`final independent QA -> repair_batches_50 if needed -> final repaired QA -> staging preview design -> dry-run importer -> staging preview write -> API/page smoke -> editorial review -> approved transition -> exact-SHA production import -> post-import live QA/SEO safety`.

## Non-Negotiable Rules

- Evidence comes before reader-facing content. No PASS evidence ledger means no synthesis or asset generation.
- Schema-valid evidence is not sufficient. A block-specific trust audit must PASS before synthesis.
- PASS is not a reusable baseline until freeze, archive, and SHA manifests are complete.
- Keep salary, identity, work activities, fit, skills/entry, risk/future, adjacent comparison, and page assembly as separate block scopes.
- Do not generate all 1046 or 10000 careers in one step. Default to `control_<previous> + new_50`; the final batch may contain fewer new careers.
- Do not use reader-facing text as evidence. Reader text must trace to evidence and synthesis ledgers.
- Do not fabricate facts, source URLs, sample counts, salary values, statistics, credentials, regulatory requirements, AI impact claims, or employment outcomes.
- Candidate search, SEO, schema, or GEO projection fields must not be embedded in reader assets. If a block needs these candidates, keep them in a separate ledger and require a separate runtime/SEO release gate.
- Engineering PASS does not equal public content readiness. Every block needs a competitive/editorial quality gate or an explicit block-specific quality gate after schema/trust checks.
- If a block remains `BLOCKED` after the configured repair loops, stop and produce a repair prompt; do not continue downstream.
- Production import is a separate gate and requires explicit approval. This skill may prepare readiness artifacts but must not imply deployment or import permission.

## Block Skills

- `career-salary-asset-factory`: salary and employment reference assets; already mature and remains the salary block authority.
- `career-identity-asset-factory`: occupation identity, definitions, official boundaries, title cleanup, and classification mappings.
- `career-work-activities-asset-factory`: responsibilities, tasks, tools, stakeholders, work context, and environment.
- `career-fit-asset-factory`: RIASEC/personality/work-style fit signals and test-conversion decision copy.
- `career-skills-entry-asset-factory`: skills, knowledge, credentials, education, portfolio, and entry-path preparation.
- `career-risk-future-asset-factory`: AI impact, automation boundaries, cyclical risk, contract/project risk, and future-change notes.
- `career-adjacent-comparison-asset-factory`: adjacent occupations, differences, transfer paths, and comparison tables.
- `career-page-assembly-asset-factory`: FAQ, source disclosure, review validity, CTA assembly, and reader-safe projection QA.

## Before Running

1. Read `references/shared_pipeline_contract.md`.
2. Read `references/block_dependency_graph.md`.
3. Read `references/shared_gate_rules.md`.
4. Read `references/import_state_machine.md` before any staging/import planning.
5. Read `references/shared_staging_import_contract.md` before preview/import design.
6. Read `references/shared_editorial_quality_gate.md` before declaring public-ready content.
7. For the target content block, read that block skill's `SKILL.md` and its references.

## Operating Defaults

- Batch size: 50 new careers.
- Repair loops: 3 maximum.
- Verdicts: `PASS`, `REPAIR_REQUIRED`, `REJECT`.
- Required report files for each gate: `audit.json`, `audit.md`, `ready.csv`, `repair_required.csv`, `blocked.csv`, `sha256_manifest.json`.
- Required freeze files: frozen evidence/synthesis/asset ledgers, validation reports, audit reports, SHA manifest, and restart marker.

## Scripts

The scripts in this skill are shared orchestration helpers. Block skills may call them but must still enforce their own source and trust rules.

- `run_pipeline.py`: validates requested block/stage sequence and stops on failed gates.
- `make_batch_manifest.py`: creates `control_<previous> + new_<N>` manifests from seed and frozen baseline.
- `freeze_baseline.py`: archives PASS artifacts and writes SHA manifests.
- `block_stage.py`: shared wrapper for block-level stage scripts.
- `make_pipeline_report.py`: writes summary reports from block outputs.
