# Article JSON-LD Fallback Authority Contract

Scope: PR-SEOF-02, SEO Foundation Authority Convergence.

This is a governance gate for Article structured data fallback authority. It
now records the schema-hold decoupling change: Article schema output now
requires an explicit schema gate or a documented legacy compatibility allowlist.
It does not change sitemap output, llms output, public URLs, or CMS content.

## Current State

Article detail currently prefers CMS Article SEO JSON-LD:

- `seo?.jsonld`

When that payload is absent, the frontend no longer emits Article JSON-LD by
default. The visible-content fallback remains in source only behind an explicit
schema gate or a documented legacy compatibility allowlist:

- article title
- article excerpt
- publish/update dates
- canonical article path
- fixed author policy

That fallback is acceptable only as temporary compatibility when the schema gate
allows it. It is not final SEO authority.

## Authority States

- `backend_cms_complete`: CMS Article SEO or backend `seo.surface.v1` provides
  complete Article JSON-LD. This is the required final authority before article
  SEO/GEO expansion.
- `frontend_fallback`: frontend can build Article JSON-LD from visible article
  fields only after an explicit schema gate or documented legacy compatibility
  allowlist allows output. This remains temporary compatibility.
- `migration_required`: fallback exists and blocks article SEO/GEO expansion
  until backend/CMS completeness is available.

## Migration Gate

Before article SEO/GEO expansion, Topic Graph article expansion, or large
article rollout, the platform must prove:

- Article JSON-LD source authority is backend/CMS complete.
- canonical URL and JSON-LD `url` / `@id` / `mainEntityOfPage` align.
- Article title, description, dates, and author policy are backed by CMS SEO or
  visible CMS content.
- no hidden FAQ, hidden schema stuffing, `Dataset`, `Quiz`, or unrelated schema
  is emitted by article pages.

## Non-Goals

- No full fallback removal in this PR.
- Article schema output now requires an explicit schema gate.
- No article metadata changes in this PR.
- No article content changes in this PR.
- No Topic Graph rollout in this PR.

## Repository Rule Impact

This PR does not introduce a new content surface. It adds a governance contract
that keeps Article structured data aligned with the repository rule that
articles, article SEO, publication state, and related content authority belong
to backend CMS resources.
