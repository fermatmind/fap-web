# Big Five V1 Render Smoke Results

## Mocked Contract Smoke

The targeted contract test verifies:

- 17 route candidates per locale
- 34 bilingual route candidates total
- facet detail paths are rejected
- API lookup uses framework, locale, entity type, and code
- noindex/indexability flags are preserved
- content_stub/draft-like assets fail closed
- 404 API responses fail closed
- metadata uses API canonical and hreflang
- sitemap and llms do not include the new routes
- source does not import Big Five private result modules

## Build Smoke

The Next.js build recognizes the new dynamic route:

`ƒ /[locale]/personality/big-five/[[...slug]]`

The route is dynamic and does not create static public pages.

## Production API Smoke

Live fap-api production smoke on 2026-06-14 could not render real content because Big Five public content assets were not visible on production:

- list query returned zero assets
- hub code lookup returned 404

Expected route behavior in this state is no body render and fail-closed `notFound()`.

## Evidence

- Contract evidence: `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
- Code evidence: `app/(localized)/[locale]/personality/big-five/[[...slug]]/page.tsx`
- Live site evidence: production API observation above
