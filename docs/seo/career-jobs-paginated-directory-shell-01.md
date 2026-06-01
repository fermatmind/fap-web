# CAREER-JOBS-PAGINATED-DIRECTORY-SHELL-01 Report

## Executive Summary

This PR moves the public career jobs index page from full collection rendering to the backend career directory authority endpoint.

`/en/career/jobs` and `/zh/career/jobs` now request only the current directory page from:

- `GET /api/v0.5/career/directory`

The existing job detail pages remain unchanged. Career content authority remains backend-owned.

## Implementation

- Added a frontend API client for `/v0.5/career/directory`.
- Added an adapter that maps backend directory authority items into the existing occupation directory renderer shape.
- Updated the career jobs page to request only one page of 50 directory items.
- Added query-param pagination while keeping filtered/query pages canonicalized to `/career/jobs` and noindexed.
- Added family filter chips from backend directory facets.
- Updated contract coverage for the directory endpoint and paginated page rendering.

## Safety Boundaries

- No frontend fallback career content was added.
- No sitemap, llms, Search Channel, URL submission, backend DB, CMS, or deploy behavior was changed.
- Held/excluded slugs remain backend-governed and are not exposed by frontend inference.
- Existing `/v0.5/career/jobs` adapter remains available for other consumers during migration.

## Repository Rule Impact

Career jobs remain backend-authoritative. This PR changes only the frontend renderer/API consumption path for the career jobs index page and does not introduce a new content authority layer.

## Final Decision

`career_jobs_paginated_directory_shell_completed_ready_for_llms_authority_alignment`

## Next Task

`CAREER-LLMS-DIRECTORY-SITEMAP-AUTHORITY-01`
