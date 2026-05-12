---
name: fap-web-career-jobs-performance
description: Use for fap-web career and job surface performance work involving career guides, job detail pages, search, recommendations, caching, rendering cost, and public career API consumption.
---

## Purpose
Improve career and job user experience and performance while preserving backend career authority.

## When to use
- Use for career guide pages, career job detail pages, recommendation displays, search UX, caching, pagination, loading states, and performance budgets.
- Use when a frontend change consumes fap-api career public APIs.

## When not to use
- Do not use to create local career datasets or fallback content.
- Do not use to modify backend recommendation authority from the frontend.

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
- Career guides, jobs, recommendations, profiles, topics, SEO, FAQ, sections, and publication state remain backend-authoritative.

## Standard workflow
1. Identify the career API contract, route, renderer, cache behavior, and performance risk.
2. Reuse shared flagship patterns from MBTI, Big Five, Enneagram, and RIASEC before creating a new stack.
3. Preserve canonical public IA, especially `/tests/holland-career-interest-test-riasec` for RIASEC.
4. Avoid localStorage or frontend inference as formal source of career truth.
5. Run common acceptance commands and focused performance or contract checks when available.

## Acceptance commands
```bash
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm typecheck
cd /Users/rainie/Desktop/GitHub/fap-web && NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build
cd /Users/rainie/Desktop/GitHub/fap-web && pnpm test:contract
cd /Users/rainie/Desktop/GitHub/fap-web && git diff --check
```

## Output contract
- Always report changed files, acceptance commands run, PR URL if a PR was created, CI status, Deploy Application or deploy/runtime status when relevant, merge commit if merged, branch cleanup status when cleanup is requested, revalidation status for security-related work, stop reason when blocked, and confirmation that no unrelated files were touched.
- Report career surface, API contract, performance risk, cache behavior, validation, and deferred backend authority work.

## Stop conditions
- Stop if active Critical/High/Medium appears during Low/Informational work, required checks fail, Deploy Application or deploy/runtime status regresses where relevant, the worktree is dirty in a way that cannot be isolated, scope drift appears, product/runtime behavior is ambiguous, closure would lack source/test evidence, or production deploy/rollback is requested without explicit manual confirmation.
- Stop if backend authority is replaced, performance degradation is unresolved, canonical IA breaks, or shared flagship behavior regresses.
