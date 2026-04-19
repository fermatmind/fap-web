# Final V4 Articles Authority Audit

Status: PR-V4-B2E
Date: 2026-04-19
Repository: `fap-web`

## Scope

This audit covers the articles slice of Final V4 Phase 2:

- article body and publication state.
- article SEO and JSON-LD.
- article covers and responsive image variants.
- article category/tag metadata.
- article list, detail, sitemap, and `llms.txt` enumeration.

It intentionally does not change runtime code and does not touch homepage, `/tests`, `/career`, topics, personality, or media library migration.

## Current Authority

Articles are CMS/API authoritative through `lib/cms/articles.ts`:

- list API: `/v0.5/articles`
- detail API: `/v0.5/articles/{slug}`
- SEO API: `/v0.5/articles/{slug}/seo`
- detail route: `/articles/[slug]`
- index route: `/articles`
- `llms.txt` and `llms-full.txt` enumerate articles through `listCmsArticlesForLlms()`.

The frontend article model receives these backend fields:

- title, slug, excerpt, body markdown, body HTML.
- author, reviewer, reading minutes.
- cover URL, alt, width, height, and variants.
- related test slug, voice, and ordering metadata.
- status, public/indexable flags, published/scheduled/created/updated timestamps.
- category and tags.
- SEO metadata, landing surface, and answer surface.

`ArticleResponsiveImage` consumes CMS-provided image metadata and variants. It does not select local article cover assets.

## Detail Page Behavior

`/articles/[slug]` loads article detail and SEO through CMS APIs. Missing CMS article data returns `notFound()`.

Allowed frontend behavior:

- render CMS HTML or CMS markdown.
- use article excerpt as a metadata/body summary fallback when the CMS SEO endpoint omits a field.
- use CMS cover variants in priority order for responsive rendering.
- render minimal product shell labels such as breadcrumbs and "Keep exploring".

Not allowed:

- local article body fallback.
- local cover image fallback for a publishable article.
- local SEO copy replacing backend Article SEO fields.
- local category/tag or related placement maps.

## Index Page Behavior

`/articles` enumerates CMS articles and renders an empty state when no published articles are returned.

Remaining frontend shell labels:

- article index title/subtitle comes from the shared dictionary.
- empty-state title and description are local product shell copy.
- pagination labels and read-link labels are local product shell copy.

These labels are acceptable as UI shell text, but the article list itself must continue to come from CMS/API. If operations need to change article index hero text, featured placement, or module ordering, that should become a backend-owned landing surface rather than a frontend dictionary edit.

## Existing Test Coverage

`tests/contracts/editorial-articles-cms.contract.test.ts` verifies that backend article image metadata, variants, author/reviewer, reading minutes, category, tags, and SEO image fields map into the frontend article shape.

## Follow-Up Queue

Continue Phase 2 with a separate PR:

- PR-V4-B2F: topics/personality low-risk SEO and section authority audit.

Future article-specific runtime cleanup should be separate from this audit:

- move `/articles` index hero/SEO/featured placement to a backend-owned landing surface if the page becomes operationally edited.
- remove any remaining `allowLocalFallback` option if it is no longer used as a compatibility hook.

## Repository Rule Impact

This PR reinforces the existing Content Authority Rules. It records article content, covers, SEO, category/tag metadata, publication state, and enumeration as CMS/API authoritative, while classifying the remaining frontend text as product shell labels only.
