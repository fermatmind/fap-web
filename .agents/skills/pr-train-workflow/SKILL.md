---
name: pr-train-workflow
description: Execute a single scoped PR in the Night PR Train for fap-web. Covers scope verification, branch creation, artifact generation, scoped contract tests, full verification, commit, push, PR creation, CI wait, squash merge, and cleanup.
---

# PR Train Workflow

## Purpose
Execute one PR in the Night PR Train pipeline following the AGENTS.md rules: scope discipline, branch discipline, dependency discipline, verification discipline, PR discipline, merge discipline, and state ledger discipline. Each PR must be isolated to its declared scope with no cross-contamination.

## When to Use
- Executing a Phase PR train item (4B, 4C, 4D, 4E, etc.)
- Adding a new domain artifact, contract test, or governance document
- Creating a scoped metadata-only or badge-only PR
- Following the Night PR Train manifest (`docs/codex/pr-train-*.yaml`)

## When Not to Use
- For backend fap-api changes — use fap-api skills
- For deployment — use `deploy-web` skill
- For SEO validation — use `seo-verify` skill
- When the worktree is dirty and cannot be isolated from the PR scope

## Hard Invariants
- **Do not** start from a dirty main unless unrelated changes are clearly isolated.
- **Do not** push or create a PR if local checks fail.
- **Do not** merge if required GitHub checks fail (build, contracts, verify-big5-contract-freeze, verify-enneagram-contract-freeze).
- **Do not** combine adjacent PR scopes into one PR.
- **Do not** fix future PRs inside the current PR.
- **Do not** commit generated SEO/sitemap drift into the PR.
- **Do not** modify `app/**`, `components/**`, or `lib/**` unless the PR scope explicitly allows it.

## Standard Workflow

### Step 1 — Pre-flight
```bash
git status -sb
git branch --show-current
git log --oneline -5
git diff --name-status
git diff --cached --name-status
```
Confirm: on clean main, aligned with origin/main.

### Step 2 — Branch
```bash
git checkout -b codex/pr-<phase>-<nn>-<short-scope>
```

### Step 3 — Implement
- Create artifacts: `docs/assessment/domains/**.md`, `docs/assessment/domains/generated/**.v1.json`, `tests/contracts/**.contract.test.ts`
- Update train state: `docs/codex/pr-train-<phase>-state.json`
- Only modify files within the declared PR scope

### Step 4 — Scoped Contract Test
```bash
pnpm exec vitest run tests/contracts/<scoped-test>.contract.test.ts
```

### Step 5 — Full Verification
```bash
pnpm typecheck
pnpm test:contract
pnpm seo:generate-sitemap
pnpm seo:check-sitemap
git diff --check
```

### Step 6 — Restore Out-of-Scope Drift
```bash
git diff --name-status  # Check for generated drift
git checkout -- docs/seo/generated/metadata-surface-inventory.* public/sitemap.xml
```

### Step 7 — Commit and Push
```bash
git add <only PR scoped files>
git diff --cached --check
git commit -m "<type>(<scope>): <summary>"
git push -u origin <branch>
```

### Step 8 — Create PR and Wait for CI
```bash
gh pr create --title "..."
# Wait for required checks: build, contracts, verify-big5-contract-freeze, verify-enneagram-contract-freeze
gh pr view <N> --json mergeStateStatus
```

### Step 9 — Merge and Cleanup
```bash
gh pr merge <N> --squash --delete-branch
git checkout main
git pull --ff-only origin main
```

## Acceptance Commands
```bash
pnpm exec vitest run tests/contracts/<scoped-test>.contract.test.ts
pnpm typecheck
pnpm test:contract
pnpm seo:generate-sitemap && pnpm seo:check-sitemap
git diff --check
git diff --cached --check
```

## Output Contract
- PR URL
- Files changed (Added vs Modified)
- Contract test results (pass count)
- Full test suite results (pass count)
- SEO sitemap check (URL count)
- GitHub CI check results (all SUCCESS or specific failure)
- Merge status
- Branch cleanup status

## Stop Conditions
- Worktree dirty with changes outside PR scope
- Required dependency PR not merged
- Scoped contract test fails
- `pnpm typecheck` fails
- `pnpm test:contract` fails
- `pnpm seo:check-sitemap` fails
- GitHub required checks fail
- Git diff contains files outside allowed scope
- `mergeStateStatus` is not CLEAN
