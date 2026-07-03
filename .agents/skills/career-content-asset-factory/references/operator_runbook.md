# Operator Runbook

## One-step dry run

```bash
python3 .agents/skills/career-content-asset-factory/scripts/run_operator_next.py \
  --state-dir generated/fermatmind-content-agent-state \
  --block career-work-activities \
  --dry-run \
  --output generated/career-content-agent-operator-mode/dry_run_state_report.json
```

## Continue until hard stop

```bash
python3 .agents/skills/career-content-asset-factory/scripts/run_operator_loop.py \
  --state-dir generated/fermatmind-content-agent-state \
  --block career-work-activities \
  --dry-run \
  --max-steps 10 \
  --output generated/career-content-agent-operator-mode/operator_loop_report.json
```

## Interpret output

- `execution_performed=false` means the operator only planned.
- `content_generated=false` means no evidence, synthesis, asset, or search projection was written.
- `requires_human_approval=true` means stop and ask the user for a scoped goal.

Operator mode must be run from a worktree that contains the relevant generated state and frozen baseline artifacts.

## Cache-only asset audit rerun

When a live source times out during synthesis or asset repair, first determine whether the phase requires source fetching:

1. If evidence is being created, repaired, or trust-audited, stop as `source_availability_issue`.
2. If evidence and synthesis already PASS and are locally available, rerun the asset gate in cache-only mode.
3. Record `source_status=transient_source_timeout`, `cache_status=cache_available`, and `source_not_required_for_asset_reaudit_if_evidence_pass=true`.
4. Stop if any local source reference, evidence hash, or synthesis traceability field is missing.

## Lexical regression smoke

```bash
python3 .agents/skills/career-content-asset-factory/scripts/check_lexical_false_positive_policy.py \
  --output generated/career-content-operator-hard-stop-policy/lexical_false_positive_regression_report.json
```

## Confirmed career KG dry-run handoff

Use this lane only after the operator has already selected the occupations. The
input is a confirmed batch, not raw GSC export data.

Required input:

- `schema_version=fermatmind.career_kg.confirmed_batch.v1`
- `source=operator_confirmed`
- one item per future occupation PR;
- `cms_write_authorized=false`;
- `production_import_authorized=false`;
- `seo_runtime_release_authorized=false`.

Generate dry-run packages:

```bash
python3 .agents/skills/career-content-asset-factory/scripts/generate_career_kg_package.py \
  --batch generated/career-kg-confirmed-batches/<batch>.json \
  --output-root generated
```

Validate each package before any PR train patch is applied:

```bash
python3 .agents/skills/career-content-asset-factory/scripts/validate_career_kg_package.py \
  generated/career-kg-pr-XX-<slug>/<slug>.zh-CN.asset.json

python3 .agents/skills/career-content-asset-factory/scripts/validate_career_kg_claim_boundaries.py \
  generated/career-kg-pr-XX-<slug>/<slug>.zh-CN.asset.json

python3 .agents/skills/career-content-asset-factory/scripts/validate_career_kg_sources.py \
  generated/career-kg-pr-XX-<slug>/<slug>.zh-CN.asset.json
```

Generate PR train patch artifacts:

```bash
python3 .agents/skills/career-content-asset-factory/scripts/generate_career_kg_pr_train_entries.py \
  --batch generated/career-kg-confirmed-batches/<batch>.json
```

The PR train generator writes only:

- `generated/career-kg-agent-run-YYYYMMDD/pr_train_patch.yaml`
- `generated/career-kg-agent-run-YYYYMMDD/pr_train_state_patch.json`
- `generated/career-kg-agent-run-YYYYMMDD/execution_prompt.md`

Do not apply those patches until the operator explicitly authorizes updating
`docs/codex/pr-train.yaml` and `docs/codex/pr-train-state.json`.

Stop and request authorization if the task asks for CMS writes, staging writes,
production import, SEO runtime release, sitemap, `llms.txt`, canonical,
noindex, JSON-LD, secrets, permissions, manual deploy, or production deploy.
