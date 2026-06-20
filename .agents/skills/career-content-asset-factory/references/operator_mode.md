# Operator Mode

Operator mode lets the career content agent continue bounded batch work until the next hard stop. It is an orchestrator guardrail, not a content generator.

Default behavior is read-only dry run:

1. Read `generated/fermatmind-content-agent-state/`.
2. Detect the latest frozen PASS baseline for the active block.
3. Detect the current phase and open failures.
4. Select one next action.
5. Render a next-goal prompt or stop reason.

Operator mode may plan these content-production actions:

- create the next `control_<previous> + new_<N>` manifest
- generate evidence after a manifest is ready
- repair evidence rows after a repairable evidence gate
- generate synthesis and reader assets after evidence/trust PASS
- repair reader-facing assets after a repairable asset gate
- freeze a baseline after all required gates PASS

Operator mode must not silently execute schema changes, runtime changes, SEO changes, CMS writes, staging writes, approved transitions, or production import. Those states require explicit human approval.

For work-activities after batch 001 freeze, the expected dry-run next action is creating the batch 100 manifest using `control_50 + new_50`. The operator must report `execution_performed=false`.
