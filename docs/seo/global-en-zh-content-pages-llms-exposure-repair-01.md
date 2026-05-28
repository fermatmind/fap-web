# GLOBAL-EN-ZH-CONTENT-PAGES-LLMS-EXPOSURE-REPAIR-01

## Executive Summary

This scoped repair makes `llms.txt` and `llms-full.txt` include the five already published and indexable Wave 1 English content pages:

- `/en/brand`
- `/en/charter`
- `/en/foundation`
- `/en/careers`
- `/en/policies`

The change does not create page body copy, publish content, mutate CMS, enqueue Search Channel, submit URLs, or deploy.

## Root Cause

The llms routes already had a Wave 1 English content-page allowlist, but the route populated it through `listContentPagesWithLastKnownGood("en")`. That list path depends on the internal content-page list endpoint, which is not available to the public runtime path. Individual public detail endpoints are available and are the correct authority for these already published pages.

## Implementation

The repair adds `listApprovedEnglishContentPagesWithLastKnownGood()` in `lib/cms/content-pages.ts`. It fetches each approved slug through the public detail API via `getContentPageWithLastKnownGood(slug, "en")` and only returns pages that are public, indexable, English, and in the explicit Wave 1 allowlist.

Both `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts` now use this public-detail authority helper for the five Wave 1 English content pages while keeping existing help/content list behavior for other surfaces.

## Target Pages

All five target pages are included only when the backend public detail API returns an authority-backed page with `isPublic=true` and `isIndexable=true`.

## Safety Boundaries

- `/en/support` and `/zh/support` remain excluded.
- Draft, private, fallback-only, noindex, take, result, order, pay, share, and API paths remain excluded.
- Clinical/depression public test slugs are explicitly denied from llms surfaces.
- No frontend editorial fallback content is added.
- No CMS mutation, deploy, Search Channel action, or URL submission was performed.

## Repository Rule Impact

This changes SEO/GEO enumeration only. Content authority remains backend/CMS public API detail responses; fap-web remains the renderer/discoverability consumer and does not become editorial authority.

## Validation Plan

Required validation covers the focused contract, typecheck, production API build, full contract suite, Big Five and Enneagram freeze contracts, JSON/YAML parse, and diff checks.

## Deferred Items

Production deploy and post-deploy smoke are intentionally deferred to `FRONTEND-DEPLOY-READINESS｜Deploy LLMS exposure repair`.
