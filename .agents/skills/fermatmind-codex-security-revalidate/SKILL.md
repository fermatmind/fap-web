---
name: fermatmind-codex-security-revalidate
description: Use for fap-web security revalidation when Codex must verify reported findings against source and tests, preserve severity boundaries, and avoid closing issues without evidence.
---

## Purpose
Revalidate fap-web security findings with source-backed and test-backed evidence before proposing remediation or closure.

## When to use
- Use when the user asks to recheck, verify, triage, or close a security finding in fap-web.
- Use when severity, exploitability, auth impact, data exposure, SEO poisoning, or client/server trust boundaries are in question.

## When not to use
- Do not use for non-security refactors or visual polish.
- Do not use to produce exploit walkthroughs or public issue text with attack steps.

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

## Standard workflow
1. Identify the finding, claimed severity, affected route, rendering mode, data source, and expected control.
2. Read only the relevant component, route handler, API adapter, middleware, config, and tests.
3. Determine whether the finding is reproducible, already fixed, not applicable, or needs remediation.
4. If changing code is requested, keep the patch to the vulnerable boundary and add targeted tests when in scope.
5. Redact exploit-ready details from public PR text while preserving enough evidence for reviewers.
6. Run common acceptance commands and any focused security tests required by the touched area.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report finding status, evidence files, tests or checks run, residual risk, and whether closure is supported.
- Keep public wording concise and non-operational.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop when evidence is missing, severity expands beyond scope, a higher severity active issue appears, tests cannot prove the fix, or remediation would cross the declared PR scope.
