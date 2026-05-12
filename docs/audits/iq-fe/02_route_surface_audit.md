# IQ Frontend Route Surface Audit

## Route Candidates

| Route path | File path | Route type | Dynamic | Localized | Reusable for IQ | Risk notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/[locale]/tests/[slug]` | `app/(localized)/[locale]/tests/[slug]/page.tsx` | test detail / landing | yes | yes | yes | IQ already lands here via canonical slug. |
| `/[locale]/tests/[slug]/take` | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` | take page | yes | yes | yes | Already noindex and currently dispatches into IQ-capable client. |
| `/[locale]/test/[slug]` | `app/(localized)/[locale]/test/[slug]/page.tsx` | legacy alias redirect | yes | yes | yes | Should remain legacy redirect for `/test/iq-raven-demo` semantics. |
| `/[locale]/test/[slug]/take` | `app/(localized)/[locale]/test/[slug]/take/page.tsx` | legacy alias redirect | yes | yes | yes | Redirect-only, no implementation needed. |
| `/[locale]/result/[id]` | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | result entry | yes | yes | yes | Current shared result surface, but not yet explicit IQ schema renderer. |
| `/[locale]/attempts/[attemptId]/report` | `app/(localized)/[locale]/attempts/[attemptId]/report/page.tsx` | report page | yes | yes | partial | Currently hardwired to `ClinicalReportClient`; cannot serve IQ as-is. |
| `/[locale]/results/lookup` | route exists via redirects/support flows | result lookup | no | yes | partial | Useful for recovery, not IQ take/result primary path. |
| `/[locale]/orders/lookup` | `app/(localized)/[locale]/orders/lookup/page.tsx` | order/report recovery | no | yes | scan only | Commerce-related; IQ should avoid depending on this before commerce PR. |

## Routing / SEO Observations

| Topic | Finding | Evidence | IQ implication |
| --- | --- | --- | --- |
| Take page noindex | `X-Robots-Tag: noindex, nofollow, noarchive` for `/tests/:slug/take` | `next.config.mjs` | correct for IQ take page |
| Result page noindex | same header policy for `/result/:path*` | `next.config.mjs` | correct for IQ result page |
| Attempt report noindex | page metadata uses `NOINDEX_ROBOTS` | `app/(localized)/[locale]/attempts/[attemptId]/report/page.tsx` | correct for IQ report page |
| Legacy alias redirect | `/test/:path* -> /en/tests/:path*` plus localized redirect pages | `next.config.mjs`, `app/(localized)/[locale]/test/*` | aligns with legacy/noindex semantics |
| Canonical detail route | `localizedPath(/tests/${slug})` | `tests/[slug]/page.tsx` | IQ canonical public URL already matches backend slug |
| Sitemap exposure | IQ detail path appears in generated sitemap | `public/sitemap.xml` | landing page is already public/indexable |

## IQ-Specific Route Notes

| Finding | Evidence | Impact |
| --- | --- | --- |
| Canonical public slug already exists on frontend | `/en/tests/iq-test-intelligence-quotient-assessment`, `/zh/tests/iq-test-intelligence-quotient-assessment` in `public/sitemap.xml` | good base for IQ-FE train |
| Frontend still models canonical IQ slug under legacy scale key | `SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN` | requires IQ-FE-1 cleanup |
| Result page path is generic, not scale-specific | `/result/[id]` shared shell | acceptable, but renderer must become IQ-aware |
| Separate report route is not IQ-ready | `ClinicalReportClient` bound to `/attempts/[attemptId]/report` | needs dedicated IQ report module later |

