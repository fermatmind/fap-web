# GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-READINESS-01

## Executive Summary

The five Wave 1 English content pages are publicly reachable after the frontend runtime repair and controlled CMS publish:

- `/en/brand`
- `/en/charter`
- `/en/foundation`
- `/en/careers`
- `/en/policies`

Production runtime returns HTTP 200 for all five pages with exact apex canonicals and no staging canonical. CMS public API records are published and public, but all five records still report `is_indexable=false`, which causes the rendered HTML robots meta to remain `noindex, nofollow, noarchive, nocache`.

Discoverability exposure is not currently active. The pages are absent from `sitemap.xml`, `llms.txt`, `llms-full.txt`, and footer navigation. This is expected for the current containment posture, but it means the pages are not ready for direct URL submission or Search Channel work.

## Current Runtime State

| Page | Runtime | Canonical | Robots | API public | API indexable |
| --- | --- | --- | --- | --- | --- |
| `/en/brand` | 200 | `https://fermatmind.com/en/brand` | noindex/nofollow | true | false |
| `/en/charter` | 200 | `https://fermatmind.com/en/charter` | noindex/nofollow | true | false |
| `/en/foundation` | 200 | `https://fermatmind.com/en/foundation` | noindex/nofollow | true | false |
| `/en/careers` | 200 | `https://fermatmind.com/en/careers` | noindex/nofollow | true | false |
| `/en/policies` | 200 | `https://fermatmind.com/en/policies` | noindex/nofollow | true | false |

## Discoverability Surfaces

The public discoverability surfaces currently do not expose the five pages:

- `sitemap.xml`: zero target URL hits
- `llms.txt`: zero target URL hits
- `llms-full.txt`: zero target URL hits
- `/en` footer/nav HTML: zero target URL hits

## Code Boundary Findings

The current frontend uses backend CMS authority for page rendering and metadata:

- `app/(localized)/[locale]/contentPageRoute.tsx` derives metadata from the CMS content page and uses `noindex: !page.isIndexable`.
- `lib/cms/content-pages.ts` reads `is_public` and `is_indexable` from the backend CMS API.

The current frontend also has explicit deny-list containment for these exact English content pages:

- `lib/seo/sitemapAuthorityAdapters.cjs` excludes `/en/brand`, `/en/careers`, `/en/charter`, `/en/foundation`, and `/en/policies` from sitemap final paths and route excludes.
- `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts` exclude `/en/brand`, `/en/careers`, `/en/charter`, `/en/foundation`, and `/en/policies`.
- `components/layout/SiteFooter.tsx` does not link these five pages in the English footer.

## Readiness Assessment

The pages are stable as public, non-indexable pages. They are not yet discoverability exposed.

Before exposure can proceed, a future scoped task must decide and implement the approved exposure model:

1. Backend/CMS must approve indexability for each target page by changing the authoritative record state.
2. fap-web must remove or replace hard-coded sitemap/llms deny-list containment for the approved pages without creating frontend editorial authority.
3. Footer/nav exposure, if desired, must be handled as an explicit separate exposure decision.
4. Search Channel and URL submission must remain deferred until public runtime is indexable and discoverability surfaces are verified.

## Safety Boundary

This task did not mutate CMS, publish records, deploy, enqueue Search Channel items, submit URLs, call external search APIs, edit env/DNS/nginx, or add frontend fallback content.

## Recommendation

Proceed with a dedicated exposure implementation/preflight task that coordinates backend CMS indexability authority and fap-web discoverability-surface gates. Do not submit these URLs until a post-exposure smoke confirms HTTP 200, exact apex canonical, index/follow robots, sitemap/llms exposure state, footer/nav policy, and no Search Channel anomalies.

Recommended next task:

`GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-IMPLEMENTATION-01`
