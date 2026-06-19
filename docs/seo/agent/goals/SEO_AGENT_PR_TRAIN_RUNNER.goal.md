# /goal SEO_AGENT_PR_TRAIN_RUNNER

Purpose: execute READY FermatMind SEO Agent goal files one PR at a time.

Default `MAX_PRS_THIS_RUN=1` unless the user provides a lower or higher explicit value.

## Required Inputs

Read first:

- `docs/seo/agent/SEO_AGENT_PR_DECOMPOSITION_2026-06-20.md`
- `docs/seo/agent/evidence/pr_decomposition.json`
- The selected `docs/seo/agent/goals/*.goal.md`

## Execution Rules

1. Start from synced `main`.
2. Execute only `READY_NOW` or `READY_AFTER_CONTROL_PACKET` goals.
3. Skip `HOLD_*` stubs.
4. Use one clean branch and one PR per goal.
5. Implement only the current goal scope.
6. Run the goal's local checks.
7. Validate changed-file scope before staging.
8. Stage only current-scope files, commit, push, and create a PR.
9. Poll GitHub checks.
10. Inspect failed checks and fix only if the fix is inside the current PR scope.
11. Do not fix unrelated failures.
12. Merge only if branch protection and repo policy allow it.
13. Never bypass required review, force merge, or use admin override.
14. Sync `main` after merge.
15. Continue to the next READY goal only after merge, cleanup, and post-merge validation.
16. Stop after `MAX_PRS_THIS_RUN` completed PRs.

## Hard Stops

Stop immediately on:

- HOLD goal encountered.
- Dirty worktree unrelated to the current PR.
- GitHub CLI unavailable or unauthenticated.
- Branch protection requires human approval.
- Checks fail outside current PR scope.
- Implementation would touch CMS/search/provider/production state.
- Implementation would require secrets, PII, or private data.
- Implementation would run write-capable Artisan commands.
- Implementation would submit, publish, approve, import, deploy, revalidate, request indexing, or mutate Search Channel Queue.

## Final Report

Report selected goal, branch, PR URL, checks, scope validation, merge status, cleanup status, and the next safe `/goal` command.

