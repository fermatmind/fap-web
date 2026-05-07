# Sitemap Authority Adapter Split

PR-SEOF-05 splits low-risk sitemap authority helpers out of
`next-sitemap.config.js` without changing sitemap output.

## Extracted Surface

The shared adapter lives at:

- `lib/seo/sitemapAuthorityAdapters.cjs`

It owns:

- static public sitemap path seeds
- topic fallback sitemap seeds
- career industry sitemap seeds
- help-page sitemap seeds
- route exclude lists
- final deny patterns
- CMS locale mapping
- sitemap path normalization
- owned canonical site-url normalization

## Still Owned By `next-sitemap.config.js`

The runtime config still owns:

- backend sitemap-source fetching
- CMS API pagination
- career job SEO authority filtering
- personality authority filtering
- transform/additionalPaths composition

## Guardrails

- This PR does not rewrite sitemap generation.
- This PR does not change sitemap URL eligibility.
- This PR does not change private-flow exclusion.
- This PR does not widen sitemap, llms, or Topic Graph exposure.
- Adapter behavior is covered by `tests/contracts/sitemap-authority-adapters.contract.test.ts`.

## Validation Requirement

Before merging future sitemap adapter changes:

- generate sitemap before/after when feasible
- compare normalized URL set
- require 0 added and 0 removed URLs unless explicitly scoped
- run `pnpm seo:check-sitemap`
