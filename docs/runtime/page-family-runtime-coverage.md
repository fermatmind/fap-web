# Page Family Runtime Contract Coverage

Scope: PR-PRAC-02

Runtime behavior changed: no.

This document inventories current public page-family runtime coverage for FermatMind Public Runtime Authority Convergence. It records route and renderer evidence, backend/CMS contract consumption, JSON-LD/FAQ/CTA authority, fallback state, and public runtime status. It does not change routes, rendering, API clients, SEO output, sitemap output, llms output, or public UX.

## Status Taxonomy

Only the PRAC runtime status enum is used:

```text
production_grade
operational
partial
shallow_asset
frontend_illusion
backend_only
blocked
dangerous
unknown
```

## Coverage Matrix

| Page family | Route / renderer evidence | Backend/CMS authority | Runtime status | Risk note |
|---|---|---|---|---|
| home | `app/(localized)/[locale]/page.tsx` | `landing-surfaces/home` through `lib/marketing/homepageContent.ts` | `partial` | CMS-backed, but local shell fallback remains. |
| tests hub | `app/(localized)/[locale]/tests/page.tsx`, category route | scale catalog and landing surfaces | `partial` | Hub remains mixed product shell plus backend catalog. |
| test detail | `app/(localized)/[locale]/tests/[slug]/page.tsx` | v0.3 scale lookup plus landing/answer surfaces | `operational` | SEO/FAQ/CTA fallback remains tracked risk. |
| test take | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` | scale lookup capabilities and attempt runtime | `operational` | Private/noindex runtime; not a public discoverability surface. |
| result/report | result page and `ResultClient` | report, report-access, invite unlock, result projections | `operational` | Private/noindex runtime. |
| paywall/order/payment | order page, order client, checkout action | SKU, offer, checkout, order, entitlement | `operational` | MBTI loop is strongest; cross-scale funnel remains partial. |
| topic detail | `app/(localized)/[locale]/topics/[slug]/page.tsx` | CMS topic, `seo.surface.v1`, `answer_surface_v1`, landing surface | `partial` | Topic CTA and llms fallback risks remain. |
| personality detail | `app/(localized)/[locale]/personality/[type]/page.tsx` | CMS personality projection and public surfaces | `partial` | Hard fallback is noindex/schema-suppressed but still product-code truth. |
| article detail | `app/(localized)/[locale]/articles/[slug]/page.tsx` | CMS article plus SEO/answer/landing surfaces | `partial` | Article JSON-LD fallback is migration-required. |
| career job detail | `app/(localized)/[locale]/career/jobs/[slug]/page.tsx` | v0.5 career job bundle, SEO authority, explainability | `operational` | Strong backend-rendered career public surface. |
| career recommendation detail | `app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx` | v0.5 MBTI recommendation bundle, explainability, companion links | `operational` | Snapshot-based direction support, not live personalized recommender. |
| career guide detail | `app/(localized)/[locale]/career/guides/[slug]/page.tsx` | CMS career guide plus SEO/answer/landing surfaces | `partial` | CMS-backed guide renderer; evidence/claim gating is less complete than career job detail. |
| profile/history | `app/(localized)/[locale]/(app)/history/*` | `/me/attempts`, report access summaries | `operational` | Account/private runtime, not public SEO surface. |
| share | `app/(localized)/[locale]/share/[id]/page.tsx` | share projection and insight graph contracts | `partial` | Public share renderer exists, but protected-flow exposure rules still govern indexing. |
| help/legal/static | content/support/help/legal renderers | CMS content pages and support surfaces where present | `partial` | Some EN baseline content is thinner than route surface coverage. |

## High-Risk Surfaces

- Test detail: metadata, FAQ, and CTA fallback can become public truth if not locked.
- Topic detail: CTA fallback and llms topic fallback can drift from CMS authority.
- Personality detail: hard frontend fallback is noindex/schema-suppressed but still visible product-code truth.
- Article detail: Article JSON-LD fallback remains `migration_required`.
- Career recommendation detail: must stay framed as deterministic snapshot direction support, not personalized recommendation.
- Freemium: MBTI has a full public loop; other scale funnel coverage remains uneven.
- Share: renderer exists, but `/share/*` remains a protected flow under private-flow exposure policy.

## No Runtime Change Statement

PR-PRAC-02 only adds this coverage inventory, the generated JSON artifact, and a contract test that validates the matrix shape and required page families. It does not alter any page renderer or runtime contract consumer.
