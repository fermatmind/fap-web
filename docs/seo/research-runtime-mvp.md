# Research Runtime MVP

## Scope

PR-RESEARCH-02 adds the frontend runtime shell for CMS-backed Research Asset detail pages at:

- `/{locale}/research/{slug}`

The page is a deterministic renderer only. Backend/CMS remains the authority for Research Asset publication state, payload fields, claim boundary, references, metadata, and indexability.

## Runtime Contract

- The route fetches only the backend public Research endpoint: `/api/v0.5/research/{slug}`.
- Draft, unapproved, private, noindex, or missing records must resolve to `notFound()`.
- The frontend must not provide local report fallback content.
- The frontend must not hardcode the MBTI Salary & Turnover Report or any other report body.
- The shell renders backend payload sections for executive summary, methodology, sample disclaimer, claim boundary, references, and downloadable-asset placeholder.
- Custom SEO metadata projection is deferred to the Research SEO/GEO/Search Channel contract PR, so this MVP does not add a new metadata-inventory surface.
- Dataset schema is not emitted by this MVP because the downloadable data asset is not yet versioned and published through an explicit backend contract.

## Discoverability Boundary

This PR does not add Research URLs to:

- sitemap generation
- `llms.txt`
- Search Channel Queue
- static fallback manifests

Research discoverability is intentionally deferred to PR-RESEARCH-03, where URL Truth, sitemap, llms, and Search Channel gates are defined together.

## Repository Rule Impact

Research Asset runtime is CMS/backend-authoritative. The fap-web change adds product rendering code and contract tests only. It does not add frontend-owned editorial content, local markdown, static JSON content, sitemap exposure, llms exposure, or publishable media assets.

## Deferred

- Full Research index page.
- Research sitemap and llms inclusion.
- Dataset schema.
- Search Channel Queue insertion.
- Research publish operation.
