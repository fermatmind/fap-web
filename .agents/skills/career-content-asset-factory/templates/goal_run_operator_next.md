# Goal: Run Career Content Operator Next

Use `career-content-asset-factory`.

Run operator mode once in dry-run mode. Read `generated/fermatmind-content-agent-state/`, detect the latest PASS baseline, choose the next safe action, and render the next goal.

Do not generate evidence, synthesis, assets, search projection, staging writes, imports, runtime changes, or SEO changes.

Expected outputs:

- operator next-action report
- next-goal recommendation
- explicit `execution_performed=false`
