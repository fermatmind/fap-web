# LEGACY-SEO-RECONCILIATION-SCAN

## Executive Summary

This read-only reconciliation reviewed the three legacy SEO items that were still being carried as possible future PRs:

- `PR-08-RESULT-PRIVATE-FLOW-ISOLATION`
- `PR-01-NEXT-I18N-ROUTING-CANONICAL-GUARD`
- `PR-07-GEO-SCHEMA-FAQ-EVIDENCE`

The first two are already covered by current source and contract evidence. The third should not be repeated as a broad legacy implementation; it is deferred by page family because the repository already has a visible-evidence-first GEO/schema readiness gate and claim guard baseline.

No runtime code, public content, CMS state, deployment, Search Channel queue, URL submission, external API, env, DNS, nginx, or frontend fallback content was changed.

## PR-08 Result Private Flow Isolation

Decision: `covered`.

Current coverage:

- `PRIVATE_FLOW_ROUTE_EXCLUDES` centralizes result, order, share, payment, history, and test-taking route exclusions.
- Shared indexing policy consumes the same discoverability deny patterns.
- Sitemap authority adapters consume private-flow route exclusions.
- Result/order/share private routes emit noindex metadata or safe redacted canonical behavior.
- Focused contracts verify private-flow routes stay out of sitemap, llms, and indexable metadata.

Evidence:

- `lib/seo/discoverabilityExposurePolicy.ts`
- `lib/seo/indexingPolicy.ts`
- `lib/seo/sitemapAuthorityAdapters.cjs`
- `tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts`
- `tests/contracts/shared-exposure-policy.contract.test.ts`
- `app/(localized)/[locale]/(app)/result/[id]/page.tsx`
- `app/(localized)/[locale]/share/[id]/page.tsx`
- `app/(localized)/[locale]/orders/[orderNo]/page.tsx`
- `app/(localized)/[locale]/orders/lookup/page.tsx`

## PR-01 Next i18n Routing Canonical Guard

Decision: `covered`.

Current coverage:

- Canonical authority accepts only safe owned production hosts and relative same-site paths.
- Query, hash, staging host, cross-host, private-flow, detail homepage fallback, locale mismatch, and non-self detail canonical candidates are rejected.
- Localized canonical and hreflang behavior remains covered by the canonical contract suite.

Evidence:

- `lib/seo/metadata.ts`
- `tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts`

## PR-07 GEO Schema FAQ Evidence

Decision: `deferred_by_page_family`.

Current coverage:

- The evidence container readiness gate requires visible HTML first.
- FAQ JSON-LD must match visible FAQ text.
- FAQ-only pages and hidden schema stuffing are blocked.
- Private flows are not eligible for next steps, related links, llms summaries, or JSON-LD expansion.
- Claim guards prevent overclaiming that sitemap, llms, JSON-LD, hidden schema, or FAQ-only surfaces prove graph strength or AI citation readiness.

Reason for deferral:

The repo has a guard/readiness baseline, not a broad runtime GEO expansion mandate. A broad legacy PR would risk repeating already-set policy and widening schema or FAQ exposure without page-family evidence. Future implementation should be split by page family, such as test detail, article detail, topic detail, personality detail, career guide, career job detail, and mental-health test pages.

Evidence:

- `docs/geo/evidence-container-readiness-gate.md`
- `docs/claims/seo-geo-llms-claim-guards.md`
- `tests/contracts/evidence-container-readiness-gate.contract.test.ts`
- `tests/contracts/seo-geo-llms-claim-guards.contract.test.ts`

## Validation Observed

Targeted pre-report validation passed:

- `pnpm vitest run tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts`
- `pnpm vitest run tests/contracts/shared-exposure-policy.contract.test.ts`
- `pnpm vitest run tests/contracts/evidence-container-readiness-gate.contract.test.ts tests/contracts/seo-geo-llms-claim-guards.contract.test.ts`

The initial exploratory command used a non-existent `vitest.config.mts` path. That was a command-form sidecar; the repo-standard Vitest invocations above passed.

## Safety Boundary

This task did not change runtime behavior, content, deployment state, CMS state, Search Channel state, submitted URLs, external APIs, env, DNS, nginx, or frontend fallback content.

## Final Decision

`legacy_seo_reconciliation_scan_completed_no_broad_legacy_implementation_needed`

## Next Task

`none_legacy_seo_reconciliation_complete`
