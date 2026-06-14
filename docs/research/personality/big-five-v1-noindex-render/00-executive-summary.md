# Big Five V1 Noindex Render Executive Summary

## Scope

PR ID: `PERSONALITY-BIG5-V1-NOINDEX-RENDER-01`

Date: 2026-06-14

This fap-web PR adds a frontend consumer and dynamic noindex render surface for the fap-api `PersonalityPublicContentAsset` Big Five V1 contract. It does not publish indexable SEO pages, does not add sitemap or `llms.txt` entries, and does not modify MBTI, Enneagram, scoring, Big Five result pages, share/PDF/history flows, or fap-api.

## Result

- Renderable route candidates: 34 total, 17 per locale.
- Supported locales: `en`, `zh`.
- Supported page classes: Big Five hub, 5 domains, 10 high/low polarity pages, and facet hub.
- Explicitly unsupported: 30 facet detail routes, 32 OCEAN profile routes, Enneagram 54 wing x instinct, Tritype.
- Content source: fap-api public content asset API only.
- API failure mode: fail closed with `notFound()` for page body and noindex metadata fallback.
- Indexability: noindex only; no sitemap or llms inclusion.

## Evidence

- Code evidence: `app/(localized)/[locale]/personality/big-five/[[...slug]]/page.tsx`
- Code evidence: `lib/cms/personality-public-content-assets.ts`
- Code evidence: `lib/personality/bigFivePublicRoutes.ts`
- Code evidence: `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
- Live API evidence: production fap-api read-only smoke on 2026-06-14 returned zero list items for Big Five public content assets and 404 for the `big-five` hub code lookup.

## Decision

GO for fap-web noindex consumer implementation once local checks pass.

NO-GO for publish/indexability gate. Backend production import/deploy must expose the expected content-ready assets before live route smoke can verify real production rendering. Sitemap and llms inclusion must remain blocked until a separate explicit indexability PR.
