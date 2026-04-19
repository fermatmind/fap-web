# Final V4 Topics and Personality Authority Audit

Status: PR-V4-B2F
Date: 2026-04-19
Repository: `fap-web`

## Scope

This audit covers the topics and personality slice of Final V4 Phase 2:

- topic profiles, topic SEO, topic sections, and topic entry groups.
- personality profiles, personality SEO, personality sections, and MBTI public projection data.
- hub and detail fallback boundaries.

It intentionally does not change runtime code and does not touch homepage, `/tests`, `/career`, articles, or media asset migration.

## Topic Authority

Topics are CMS/API authoritative through `lib/cms/topics.ts`:

- list API: `/v0.5/topics`
- detail API: `/v0.5/topics/{slug}`
- SEO API: `/v0.5/topics/{slug}/seo`
- index route: `/topics`
- detail route: `/topics/[slug]`

The topic adapter receives backend-owned profile fields, section payloads, entry groups, SEO metadata, landing surface, and answer surface.

Topic detail pages use backend sections and entry groups for publishable page content. Missing topic details return `notFound()`.

Remaining topic frontend shell/fallback surfaces:

- `/topics` metadata, hero title, default hero summary, CTA labels, and empty state remain local product shell text.
- `MbtiSceneEntrySection` can render default MBTI scene blocks when no backend blocks exist. This is MBTI product-entry content and should not be expanded into general topic editorial fallback.

## Personality Authority

Personality profiles are CMS/API authoritative through `lib/cms/personality.ts`:

- list API: `/v0.5/personality`
- detail API: `/v0.5/personality/{slugOrType}`
- SEO API: `/v0.5/personality/{slugOrType}/seo`
- index route: `/personality`
- detail route: `/personality/[type]`

The personality adapter receives backend-owned profile fields, sections, SEO metadata, landing surface, answer surface, and `mbti_public_projection_v1`.

Personality detail pages prefer backend `mbti_public_projection_v1` and backend SEO. The detail page marks fallback routes through projection metadata:

- `authoritySource: "frontend_gateway_fallback"`
- `routeMode: "fallback"`
- `robots: "noindex,nofollow"`

This fallback is a temporary route-preservation shell, not a publishable editorial source. It must not gain rich local personality content.

Remaining personality frontend shell/fallback surfaces:

- `/personality` hub has local group tone tokens, hero labels, CTA labels, and browse-shell text.
- `buildFallbackPersonalityDetail()` still provides minimal noindex detail copy when backend detail/projection loading fails.
- compatibility metadata can use backend profile summary fields when the SEO endpoint omits values, but it should not be treated as frontend editorial authority.

## Runtime Fallback Classification

Allowed:

- missing topic detail or invalid topic returns `notFound()`.
- missing personality detail can render the existing noindex gateway fallback while the backend projection contract is stabilized.
- hub pages may render minimal empty states when CMS/API returns no items.
- UI shell labels, buttons, and browse controls may remain in product code.

Not allowed:

- adding rich local topic or personality profile bodies.
- adding local SEO copy for indexable topic/personality pages.
- expanding `frontend_gateway_fallback` into publishable MBTI type content.
- treating local group tones, scene-entry defaults, or empty states as CMS replacement content.

## Follow-Up Queue

Before Phase 2 can be called fully closed for topics/personality runtime behavior, create separate PRs for:

- moving `/topics` index hero/SEO/CTA copy to a backend landing surface or topic index API contract.
- moving `/personality` hub hero/SEO/CTA/group summaries to a backend landing surface or personality hub API contract.
- replacing `buildFallbackPersonalityDetail()` with a last-known-good/minimal shell strategy once Phase 3 cache helpers exist.

These should not be bundled with Phase 3 cache infrastructure or Phase 4 high-traffic hub changes.

## Repository Rule Impact

This PR reinforces the existing Content Authority Rules. It records topic/personality details and SEO as backend/API authoritative, while explicitly flagging the remaining frontend hub shell labels and noindex personality fallback as temporary/product-shell behavior that must not grow into editorial content.
