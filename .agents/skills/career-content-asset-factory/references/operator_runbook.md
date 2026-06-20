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
