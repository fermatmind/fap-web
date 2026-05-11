---
name: release-freeze
description: Run the fap-web release freeze verification pipeline. Checks that no forbidden content surfaces, runtime paths, or unauthorized frontend changes have been introduced before a release.
---

# Release Freeze Verification

## Purpose
Run the fap-web release freeze checks to ensure that the current codebase is safe for production release. Validates runtime paths, CMS content contracts, and that no unauthorized frontend changes bypass the release gate.

## When to Use
- Before deploying to production
- Before opening a PR that touches runtime paths
- When verifying that a release candidate meets content authority rules
- After major content or routing changes

## When Not to Use
- For small isolated component changes that don't touch SEO, routing, or CMS content
- When the fap-api backend is unreachable — the checks depend on CMS API contracts
- For local development validation — use `pnpm dev` and `pnpm check:runtime`

## Hard Invariants
- **Do not** release if the release gate fails.
- **Do not** bypass content authority rules (no frontend editorial content, no hardcoded sitemap entries).
- **Do not** skip CMS API health checks.
- **Do not** deploy if runtime check reports unauthorized changes.

## Standard Workflow

### Step 1 — Runtime Check
```bash
pnpm check:runtime
```
Verifies no forbidden patterns in runtime code.

### Step 2 — CMS API Health
```bash
pnpm check:cms-api
```
Verifies CMS API contracts are available and healthy.

### Step 3 — Release Freeze
```bash
pnpm verify:release-freeze
```
Full release freeze verification pipeline.

### Step 4 — Release Gate
```bash
pnpm release:gate
```
Final gate before production release.

### Step 5 — Build Verification
```bash
pnpm build
```
Ensure the production build succeeds.

## Acceptance Commands
```bash
pnpm check:runtime
pnpm check:cms-api
pnpm verify:release-freeze
pnpm release:gate
pnpm build
```

## Output Contract
All commands must return exit code 0. Failures must include:
- Which check failed
- The file or API endpoint that caused the failure
- What rule was violated

## Stop Conditions
- Runtime check reports unauthorized patterns
- CMS API health check fails
- Release freeze verification fails
- Release gate returns non-zero
- Production build fails

## Content Authority Rules (from AGENTS.md)
- Frontend must not add public editorial content directly.
- Sitemap/LLMS must enumerate from CMS/public APIs.
- Career jobs, guides, recommendations must come from backend CMS.
- No frontend fallback content for CMS-backed surfaces.
