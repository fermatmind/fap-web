---
name: career-salary-asset-factory
description: FermatMind career salary content-asset production workflow for 1046 career jobs. Use when Codex needs to create, repair, audit, freeze, promote, or report salary evidence ledgers, estimate ledgers, salary asset JSONL, batch manifests, or gated batch pipeline artifacts for career job pages.
---

# Career Salary Asset Factory

Use this skill for FermatMind career salary asset production. The pipeline is evidence-first and gate-driven:

`baseline -> batch manifest -> evidence ledger -> evidence audit -> trust audit -> estimate ledger -> estimate audit -> salary asset -> asset audit -> promote/freeze`.

## Non-Negotiable Rules

- Generate salary content only from a PASS evidence ledger plus a PASS estimate ledger.
- Do not invent salary values, sample counts, percentiles, source years, job outlook, annual openings, or source URLs.
- China salary data is recruitment-market reference only. Never describe it as China official single-occupation wage, official median wage, nationwide occupational wage, or personal income prediction.
- US official data must come from BLS OOH/OEWS, CareerOneStop, My Next Move, O*NET, or BLS Employment Projections with explicit boundaries.
- Treat BLS Employment Projections as outlook/openings context, not a wage source label.
- UK evidence must try a UK National Careers direct profile first, then an audited adjacent profile. `typical_hours` must be `string|null`.
- EU evidence is macro context by default. Do not state EU-wide occupation median salary unless a specific occupation-level EU source is captured.
- Trust audit must PASS before estimates are computed. Schema-valid evidence is not enough.
- Generated China salary snippets, generic O*NET fallback wages, and generic UK adjacent profiles must not pass trust audit.
- Browser, Chrome, and Computer Use are fallback tools for dynamic pages, logged-in pages, or source capture that static scripts cannot fetch.
- Failure stops the pipeline. Do not continue to estimate or asset stages while any current batch row is blocked.

## Before Running

1. Read `references/batch_gate_rules.md`.
2. Read the relevant market rules:
   - CN: `references/cn_recruitment_evidence_rules.md`
   - US: `references/us_official_source_rules.md`
   - UK: `references/uk_mapping_rules.md`
   - EU: `references/eu_context_rules.md`
3. Read `references/trust_audit_rules.md`.
4. Check source labels in `references/source_registry.json`.
5. Use examples only as PASS baseline examples; do not mutate them.

## Pipeline Commands

Create a batch manifest:

```bash
python .agents/skills/career-salary-asset-factory/scripts/make_batch_manifest.py \
  --seed generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json \
  --baseline-manifest generated/career-salary-batch-300/career_salary_batch_300_manifest.json \
  --output generated/career-salary-next-batch/manifest.json \
  --batch-size 50
```

Validate and audit evidence:

```bash
python .agents/skills/career-salary-asset-factory/scripts/validate_evidence_schema.py \
  --input batch_evidence.jsonl \
  --schema .agents/skills/career-salary-asset-factory/schemas/career_salary_evidence_v3_6.schema.json \
  --output validation.json

python .agents/skills/career-salary-asset-factory/scripts/audit_evidence.py \
  --input batch_evidence.jsonl \
  --manifest batch_manifest.json \
  --seed generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json \
  --output-dir batch_evidence_audit

python .agents/skills/career-salary-asset-factory/scripts/audit_trust.py \
  --input batch_evidence.jsonl \
  --manifest batch_manifest.json \
  --control-baseline trusted_baseline_evidence.jsonl \
  --output-dir batch_trust_audit
```

Run a stage gate:

```bash
python .agents/skills/career-salary-asset-factory/scripts/run_pipeline.py \
  --baseline-dir generated/career-salary-v3-5-100-pass-baseline \
  --seed generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json \
  --batch-size 50 \
  --max-repair-loops 3 \
  --start-after-baseline \
  --mode evidence
```

## Stage Rules

- `evidence` mode may create batch manifests, collection plans, validation, and audit reports.
- `trust` audit must run after evidence audit and before estimate generation.
- `estimate` mode may run only after the evidence audit and trust audit are both PASS.
- `asset` mode may run only after evidence and estimate audits are PASS.
- `full` mode must stop at the first failed gate.
- Repair loops are capped, default 3. If still blocked, stop and report; do not fabricate content.

## Scripts

- `run_pipeline.py`: orchestrates gated modes and stops on blocked state.
- `make_batch_manifest.py`: creates the next batch manifest from seed and baseline controls.
- `freeze_baseline.py`: archives PASS artifacts and SHA-256 manifests.
- `collect_*_evidence.py`: creates source collection plans or transforms captured source snippets into evidence rows.
- `browser_collection_plan.py`: produces Browser/Chrome fallback checklists for dynamic pages.
- `normalize_source_names.py`: fixes source category labels without changing evidence facts.
- `validate_*` and `audit_*`: strict validation and report generation.
- `audit_trust.py`: blocks generated CN salary text, generic O*NET fallback wages, generic UK adjacent profiles, and unchanged-control regressions before estimates.
- `compute_estimates.py`: computes estimate ledger only after evidence audit and trust audit both PASS.
- `generate_salary_assets.py`: writes reader-facing asset JSONL only from PASS evidence and PASS estimates.
- `promote_batch.py`: freezes/promotes a PASS batch.

## Examples

The `examples/` folder contains the frozen 100 PASS baseline copies and an audit summary. Use these for regression comparison and schema examples only.

## Shared Orchestrator Contract

This block inherits the shared orchestrator contract from `career-content-asset-factory`.

- The shared orchestrator owns global state, batch progression, freeze readiness, staging/import readiness, and next-goal planning.
- This block's source rules, trust rules, and block-specific gates remain authoritative for its own evidence, synthesis, and asset outputs.
- Staging, import, release, exact-SHA approval, post-import QA, and no-frontend-fallback rules are inherited from the shared orchestrator contract.
- Candidate `search_projection` or SEO/GEO/schema data must stay quarantined outside reader assets when this block produces it.
- This block must not self-declare PASS. PASS requires audited gate artifacts, frozen baseline outputs, and SHA manifests.
