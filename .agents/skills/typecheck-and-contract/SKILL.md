---
name: typecheck-and-contract
description: Run TypeScript type checking and the full contract test suite for fap-web. Used before pushing commits or opening PRs to ensure type safety and contract compliance.
---

# TypeCheck and Contract Test

## Purpose
Validate TypeScript type safety and contract test compliance for fap-web. This is the primary local verification suite: `pnpm typecheck` validates type correctness, and `pnpm test:contract` runs all contract tests that guard against runtime contamination, claim boundary violations, and SEO/GEO expansion.

## When to Use
- Before committing any change
- Before opening a PR
- When fixing CI failures reported on a PR
- After adding new contract tests
- When validating that changes don't break existing contracts

## When Not to Use
- For backend fap-api changes — use fap-api CI skills
- For deployment — use `deploy-web` skill
- For SEO surface validation — use `seo-verify` skill
- When only docs/codex files are changed — spot-check with scoped tests instead

## Hard Invariants
- **Do not** push or open a PR if `pnpm typecheck` fails.
- **Do not** push or open a PR if `pnpm test:contract` fails.
- **Do not** modify tests to make them pass; fix the source code.
- **Do not** skip tests with `.skip` or `.only` — all tests must pass.
- **Do not** suppress type errors with `// @ts-ignore` or `as any` without documented justification.

## Standard Workflow

### Step 1 — TypeCheck
```bash
pnpm typecheck
```
This runs `tsc --noEmit` and validates the entire TypeScript project.

### Step 2 — Scoped Contract Tests
```bash
# Run a specific contract test
pnpm exec vitest run tests/contracts/<specific-test>.contract.test.ts

# Run all contract tests in a domain
pnpm exec vitest run tests/contracts/phase-4*
```

### Step 3 — Full Contract Suite
```bash
pnpm test:contract
```
This runs all ~320 contract test files (~1800+ tests).

### Step 4 — SEO Surface Verification
```bash
pnpm seo:check-sitemap
```
Verify sitemap indexability (should show URL count and no errors).

### Step 5 — Whitespace Check
```bash
git diff --check
```

## Acceptance Commands
```bash
pnpm typecheck
pnpm test:contract
pnpm seo:check-sitemap
git diff --check
```

## Output Contract
- `pnpm typecheck`: must complete with zero errors
- `pnpm test:contract`: must show all test files passed, all tests passed
- `pnpm seo:check-sitemap`: must show `sitemap indexability check passed`
- `git diff --check`: must return exit code 0

## Stop Conditions
- TypeScript compilation errors
- Any contract test failure
- Sitemap indexability check failure
- Git whitespace errors
