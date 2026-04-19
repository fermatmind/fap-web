# Final V4 Content Pages Authority Audit

Status: PR-V4-B2C
Date: 2026-04-19
Repository: `fap-web`

## Scope

This audit closes the first low-risk `content_pages` slice of Final V4 Phase 2 for the frontend repository. It documents the current public route authority after PR-V4-B2A and PR-V4-B2B without changing runtime code.

This PR intentionally does not touch homepage, `/tests`, `/career`, test category pages, career guides/jobs, articles, topics, personality pages, or media asset runtime behavior.

## Current Authority

Company and policy detail pages are CMS/public API authoritative through `renderContentPage()` and `getContentPage()`:

- `/about`
- `/brand`
- `/careers`
- `/charter`
- `/foundation`
- `/policies`
- `/privacy`
- `/terms`

Help detail pages are CMS/public API authoritative through `getContentPage(contentSlug(slug), locale)`:

- `/help/faq`
- `/help/about`
- `/help/team`
- `/help/used-and-mentioned`
- `/help/for-business-and-research`
- `/help/contact`

The `/help` hub is CMS/public-gateway led after PR-V4-B2A:

- metadata uses the help gateway landing surface when present.
- topic cards enumerate `content_pages` with `kind=help`.
- gateway discoverability controls ordering when present.
- absent CMS/public-gateway content renders a minimal shell, not a full frontend editorial fallback.

The ops content page editor exposes `help` kind/template after PR-V4-B2B, so help pages can be managed through the existing CMS workflow.

## Local Route Shells

These routes remain frontend product routing shells, not editorial sources:

- `/support` permanently redirects to `/help`.
- `/refund` permanently redirects to `/policies`.

They do not contain public page copy, SEO content, or local replacement bodies.

## Remaining Frontend Shell Labels

`ContentPageTemplate` still owns a small set of navigation labels for breadcrumbs and related links. These are treated as UI shell labels rather than publishable editorial content because the rendered page title, summary, SEO fields, body, publication state, and indexability come from `content_pages`.

If the product decision is to make related-link placement fully operational, that should become a follow-up PR with a backend-owned relation/order field instead of adding more frontend label maps.

## Phase 2 Result

The `content_pages` portion of low-risk CMS migration is now documented as:

- public content body and SEO: CMS/public API authoritative.
- help hub ordering and cards: CMS/public-gateway/content page authoritative when data exists.
- frontend fallback: minimal shell only.
- remaining local labels: UI navigation shell only, with no new editorial source allowed.

## Follow-Up Queue

Continue Phase 2 as separate PRs:

- PR-V4-B2D: career guides/jobs CMS authority audit and fallback classification.
- PR-V4-B2E: articles CMS authority audit for SEO, covers, category/tag, and related placement.
- PR-V4-B2F: topics/personality low-risk SEO and section authority audit.

Do not start Phase 3 high-traffic last-known-good cache helpers until these low-risk content authority audits are complete and reviewed.

## Repository Rule Impact

This PR reinforces the existing Content Authority Rules. It does not introduce a new content surface. It records that `content_pages` are backend/CMS-authoritative and that frontend route shells must not grow local editorial fallback copy.
