# GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-IMPLEMENTATION-01

## Executive Summary

This implementation removes the frontend hard blocks that kept the five published Wave 1 English content pages out of sitemap, llms, and footer navigation after CMS indexability was approved.

The frontend continues to use backend CMS authority. It does not add page body copy, fallback editorial content, CMS mutation, Search Channel action, URL submission, external search API calls, env/DNS/nginx edits, or deploy.

## Target Pages

- `/en/brand`
- `/en/charter`
- `/en/foundation`
- `/en/careers`
- `/en/policies`

## Blockers Addressed

- `frontend_sitemap_denylist`
- `frontend_llms_denylist`
- `footer_nav_eligibility_false`

## Backend Authority Boundary

CMS remains the indexability authority. The content page renderer still renders robots metadata from `page.isIndexable`; this PR does not override that logic.

The sitemap and llms routes include the five pages only when the CMS/public API reports the pages as public and indexable.

## Safety Boundary

- No CMS content rewrite.
- No frontend fallback body content.
- No deploy.
- No Search Channel action.
- No URL submission.
- No external search API call.
- No staging authority.

## Next Step

Deploy readiness for the fap-web merge commit, then post-deploy smoke for robots, sitemap, llms, and footer exposure.
