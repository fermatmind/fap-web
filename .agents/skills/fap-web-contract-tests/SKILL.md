---
name: fap-web-contract-tests
description: Use for fap-web contract test work involving API fixtures, public contracts, MBTI, Big Five, Enneagram, RIASEC, SEO contract freeze checks, or compatibility validation.
---

## Purpose
Keep fap-web contract tests aligned with backend public APIs and flagship scale compatibility.

## When to use
- Use for `pnpm test:contract`, Big Five freeze, Enneagram freeze, MBTI compatibility, RIASEC public form, fixture, and API contract changes.
- Use when a frontend change depends on backend response shape or public content enumeration.

## When not to use
- Do not use to bless a frontend fallback that diverges from backend authority.
- Do not use to update snapshots without proving the source contract changed intentionally.

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
- Contract updates must reflect backend/public API authority, not consumer-side inference.

## Standard workflow
1. Identify the contract, fixture, endpoint, scale, and expected compatibility guarantee.
2. Verify whether the backend contract intentionally changed before updating expectations.
3. Keep contract tests targeted and avoid masking regressions with broad fixture churn.
4. Preserve MBTI, Big Five, Enneagram, and RIASEC existing behavior unless explicitly changing the shared contract.
5. Run common acceptance commands and focused contract checks.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report contract touched, authority source, fixture changes, validation commands, compatibility risk, and deferred backend work.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop if authority is unclear, snapshots mask a regression, freeze checks fail, or a shared flagship behavior regresses.
