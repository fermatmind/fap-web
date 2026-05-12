---
name: fermatmind-pr-train
description: Use for one scoped FermatMind PR-train item in fap-web when Codex must verify manifest scope, dependencies, local checks, PR body, merge readiness, and ledger updates without merging prematurely.
---

## Purpose
Run exactly one fap-web PR-train item with strict scope, dependency, verification, and ledger discipline.

## When to use
- Use when the user names a PR-train item, manifest entry, train state update, or PR cleanup workflow for fap-web.
- Use when Codex must decide whether a fap-web train item can proceed, is blocked, or needs a corrective commit.

## When not to use
- Do not use for broad frontend work outside the declared train item.
- Do not use to skip dependency, check, review, deployment, or ledger requirements.

## Hard invariants
- Do not modify unrelated files.
- Do not stage unrelated dirty files.
- Do not process Informational findings unless explicitly requested.
- Do not expose exploit-ready details in public PR titles/bodies.
- Do not merge unless required checks pass and scope is clean.
- Do not close security findings unless source/test evidence proves fixed.
- Stop if active Critical/High/Medium appears during Low/Informational work.
- Do not weaken previously fixed security boundaries.
- Required checks for fap-web are build, contracts, verify-big5-contract-freeze, and verify-enneagram-contract-freeze.
- One PR equals one manifest scope; do not pull future train work forward.
- Frontend must not become the authority for CMS-backed content.

## Standard workflow
1. Confirm the requested PR id exists in the manifest and state ledger.
2. Confirm dependencies are merged into `main`.
3. Confirm the working tree can isolate the declared scope.
4. Start from latest `main` and create or reuse only the matching PR branch.
5. Make only scoped changes and update the ledger for every state transition.
6. Run the required local acceptance commands.
7. Open or update one PR with changed files, reason, validation, deferred items, and repository rule impact.
8. Stop before merge unless checks, deploy status when relevant, reviews, and scope state are all clean.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report PR id, branch, changed files, validation commands, check results, ledger status, PR URL, and merge blockers.
- State whether the change affects CMS authority, SEO/GEO enumeration, contracts, or deploy readiness.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop on missing manifest entry, unmet dependency, dirty scope that cannot be isolated, failed local check, failed required GitHub check, review block, deploy block, or ambiguous ledger state.
