# PR-FDN-01-LLMS-FULL-RECHECK-OR-REPAIR

## Executive Summary

This scoped repair addresses a post-CMS-update `llms-full.txt` stale-summary issue for the foundation content page.

The CMS content and public foundation pages are already clean. `llms.txt` is also clean. The remaining problem is that `llms-full.txt` can continue serving a fresh in-process cached response after a CMS `content_page` update, so old summaries may remain visible until the cache ages out.

## Root Cause

`app/llms-full.txt/route.ts` keeps a bounded in-process response cache for stability. The content release revalidation endpoint can revalidate public paths, but `content_page` release metadata did not derive content-page paths or the llms surfaces. It also had no way to clear the `llms-full` process cache when `/llms-full.txt` is revalidated.

## Implementation

- Moved the `llms-full` response cache state into `lib/seo/llmsFullResponseCache.ts`.
- Added `clearLlmsFullResponseCache()` for targeted cache invalidation.
- Updated `content-release` revalidation so `content_page` releases can derive localized public content-page paths such as `/en/foundation`.
- Added `/llms.txt` and `/llms-full.txt` to derived `content_page` revalidation paths.
- Clears the `llms-full` in-process cache only when `/llms-full.txt` is accepted for revalidation.

## Safety Boundaries

- No CMS mutation was performed.
- No deploy was performed.
- No Search Channel action or URL submission was performed.
- No external search API was called.
- No env, DNS, or nginx edits were made.
- No frontend fallback editorial content was added.
- Page body copy was not changed.

## Repository Rule Impact

This is a cache invalidation and SEO/GEO revalidation repair. CMS/backend remains the content authority. fap-web continues to render and enumerate CMS/public API content and does not become the source of editorial truth.

## Validation Plan

Validation covers the focused revalidation contract, existing content-release contract, typecheck, production API build, full contract suite, JSON/YAML parse, and diff checks.

## Deferred Items

Production deployment and post-deploy runtime recheck are deferred to a separate frontend deploy readiness task.
