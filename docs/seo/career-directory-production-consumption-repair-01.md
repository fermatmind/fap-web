# CAREER-DIRECTORY-PRODUCTION-CONSUMPTION-REPAIR-01 Report

## Executive Summary

This PR repairs the production same-origin consumption path for the career directory authority endpoint used by `/en/career/jobs` and `/zh/career/jobs`.

The frontend jobs directory already consumes:

- `GET /api/v0.5/career/directory`

The production issue was that the Next.js public API proxy list included career job detail endpoints but omitted the directory endpoint. As a result, same-origin production requests to `/api/v0.5/career/directory` could resolve as a frontend 404, causing the directory page to fail closed and render zero occupations.

## Root Cause

- `lib/career/api/fetchCareerDirectory.ts` correctly requests `/v0.5/career/directory` through the shared API client.
- The API client resolves server-side public API paths through the same-origin `/api` prefix.
- `next.config.mjs` proxied `/api/v0.5/career/jobs` and `/api/v0.5/career/jobs/:slug`, but not `/api/v0.5/career/directory`.
- Job detail pages remained healthy because their proxy entries existed.
- The career jobs index showed zero results because the directory fetch failed and the page rendered the conservative empty state.

## Implementation

- Added `/api/v0.5/career/directory` to the Next.js public v0.5 API proxy source list.
- Added focused contract coverage proving the production same-origin directory endpoint is proxied before the jobs index/detail routes.
- Kept the existing paginated directory fetcher and page rendering behavior unchanged.

## Safety Boundaries

- No sitemap changes.
- No `llms.txt` or `llms-full.txt` changes.
- No career cohort, CMS, DB, Search Channel, URL submission, or deployment action.
- No held slug policy changes.
- No frontend fallback career content was added.

## Expected Runtime Effect

After frontend deployment, `/en/career/jobs` and `/zh/career/jobs` should consume the backend career directory endpoint through the production same-origin proxy, showing the backend authority total of 1046 and the first directory page of 50 occupations.

## Repository Rule Impact

Career directory data remains backend-authoritative. This PR only repairs the frontend API proxy route required to consume the backend authority endpoint in production.

## Final Decision

`career_directory_production_consumption_repair_completed_ready_for_frontend_deploy_readiness`

## Next Task

`FRONTEND-DEPLOY-READINESS | Deploy career directory production consumption repair`
