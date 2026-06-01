# CAREER-DETAIL-CACHE-BUDGET-REPAIR-01

## Executive Summary

This PR applies the first scoped frontend cache/fetch budget repair for public career detail pages after the 1046 rollout.

The preceding P95 scan found that sampled career detail pages were valid and indexable, but several pages had high tail latency. The two frontend-owned contributors were:

- repeated career bundle loading between `generateMetadata` and the page render path;
- serial detail bundle then SEO authority fetches.

## Implementation

- Wrapped the career detail bundle loader in React `cache()` so the same locale/slug load can be reused within a server render pass.
- Started the SEO authority request before awaiting the main detail bundle when `includeSeoAuthority=true`, reducing serial backend wait time without changing authority semantics.
- Added an explicit 12 second budget for both the detail bundle and SEO authority fetches.

## Safety Boundaries

- Backend/CMS career authority remains the source of truth.
- Held slugs remain excluded through the same backend response and `notFound`/metadata gates.
- No sitemap, llms, Search Channel, URL submission, CMS, DB, or deploy action was performed.
- No frontend fallback career content was added.

## Validation

Required local validation:

- `pnpm exec vitest run tests/contracts/career-detail-cache-budget-repair-01.contract.test.ts`
- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build`
- `pnpm test:contract`
- `git diff --check`
- `git diff --cached --check`

## Next Task

`CAREER-LEGACY-FULL-JOBS-INDEX-CONSUMER-AUDIT-01`
