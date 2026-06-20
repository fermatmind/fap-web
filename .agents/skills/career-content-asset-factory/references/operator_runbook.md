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
