# PR Train Sidecar Issues

## PR-CAREER-KG-AGENT-01: full contract suite timeout/hang outside current scope

- repo: `fap-web`
- PR id / branch: `PR-CAREER-KG-AGENT-01` / `codex/pr-career-kg-agent-01-contract-schema`
- blocker type: local required check could not complete cleanly
- evidence:
  - `pnpm exec vitest run tests/contracts/career-kg-agent-package-schema.contract.test.ts` passed: 1 file, 5 tests.
  - `pnpm typecheck` passed.
  - `NEXT_PUBLIC_SITE_URL=https://fermatmind.com NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build` passed.
  - First `pnpm test:contract` run failed only in `tests/contracts/detail-ready-1046-llms-full-artifact-consistency-repair-01.contract.test.ts` with two 5000ms timeouts.
  - Focused rerun of that file with `--testTimeout=30000` passed: 1 file, 6 tests.
  - Second `pnpm test:contract` and `CI=1 pnpm test:contract` printed complete passing test lists but did not exit cleanly before manual interruption.
  - Latest rerun of exact `pnpm test:contract` printed passing output through the tail of `tests/contracts`, including `career-kg-agent-package-schema.contract.test.ts`, but still did not emit a final summary or exit after about six minutes.
  - Process evidence before interruption showed `node /usr/local/bin/pnpm test:contract`, `node (vitest)`, and multiple `node (vitest N)` workers still alive; the run was interrupted with Ctrl-C and exited 130.
  - Continuation rerun from a clean process state reproduced the same blocker: exact `pnpm test:contract` reached the last visible contract output (`site-chrome-rules.contract.test.ts`) but did not emit final summary or exit.
  - Process evidence after about four and a half minutes showed `node /usr/local/bin/pnpm test:contract`, `node (vitest)`, and seven `node (vitest N)` workers still alive; the run was interrupted with Ctrl-C and exited 130.
- why not current PR scope:
  - The failing/hanging file is not in PR-CAREER-KG-AGENT-01 allowed paths.
  - PR1 changed only career KG agent contracts/schemas/runbook, one focused contract, scope helper, and PR-train metadata.
- whether required checks are affected:
  - Local required `pnpm test:contract` is affected and blocks opening/merging under repository rules.
  - GitHub required checks were not reached because no PR was opened.
- recommended follow-up:
  - Stabilize the full contract suite teardown or raise timeout for the llms-full artifact consistency contract outside this PR scope.
  - Re-run PR-CAREER-KG-AGENT-01 after `pnpm test:contract` can complete cleanly.
