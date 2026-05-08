# Article / Personality JSON-LD & Projection Gates

Scope: PR-PRA1B-04, Public Runtime Authority Phase 1B.

Runtime behavior changed: yes, scoped to fallback containment. The change does
not add article content, personality content, schema types, sitemap URLs, llms
URLs, or career/recommendation capability.

## Article JSON-LD Gate

Article detail continues to prefer CMS Article SEO JSON-LD through `seo?.jsonld`.
If that backend/CMS payload is absent, the frontend Article JSON-LD fallback may
render only as a visible-content compatibility wrapper built from CMS article
fields already visible on the page.

That fallback remains non-final authority. It blocks article SEO/GEO expansion
until CMS Article SEO or backend `seo.surface.v1` provides complete structured
data authority.

## Personality Projection Gate

Personality detail continues to prefer CMS personality projection and public
surface data. If the route falls back to `frontend_gateway_fallback`, the
fallback is treated as an emergency product-code projection only.

Fallback projection rules:

- no public JSON-LD
- no FAQPage schema
- no career direction CTA
- no graph or recommendation claim
- no local MBTI content-pack projection
- no scenario deep-dive projection
- must remain `noindex,nofollow`

## Non-Goals

- No article content changes.
- No personality content changes.
- No new schema types.
- No hidden FAQ/schema.
- No sitemap or llms exposure changes.
- No career/recommendation runtime work.

## Evidence

- `app/(localized)/[locale]/articles/[slug]/page.tsx`
- `app/(localized)/[locale]/personality/[type]/page.tsx`
- `lib/seo/articlePersonalityAuthority.ts`
- `docs/seo/generated/article-personality-jsonld-projection-gates.v1.json`
- `tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts`
