# CAREER-LLMS-TXT-DIRECTORY-URL-EXPOSURE-REPAIR-01

## Executive Summary

Production `llms.txt` was still reading backend sitemap authority for career detail paths, but the route's final generic deny list filtered every `/en|zh/career/jobs/{slug}` path before response rendering. The result was a valid lightweight `llms.txt` with zero career detail URLs, while `sitemap.xml` and `llms-full.txt` exposed the approved 1046 bilingual career detail cohort.

This PR keeps `llms.txt` on backend sitemap authority and adds a dedicated career detail authority filter for the already-approved sitemap career paths. It does not fetch the full career index, does not call per-detail SEO endpoints, does not touch `llms-full.txt`, and does not expose held slugs.

## Authority Source

- Source of truth: backend `/api/v0.5/seo/sitemap-source` via `listBackendSitemapCareerJobPaths`.
- Expected cohort: 1046 public career details across `en` and `zh`, 2092 canonical URLs.
- Held/excluded slugs remain denied:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`

## Implementation

- `app/llms.txt/route.ts`
  - Added `dedupeCareerJobAuthorityPaths`.
  - Kept career hub/recommendation/guide entries on existing generic filtering.
  - Applied career-detail-specific filtering only to backend sitemap authority paths.
  - Preserved private route and held slug exclusions.

## Safety Boundaries

- No frontend career fallback content.
- No `llms-full.txt` changes.
- No sitemap changes.
- No Search Channel enqueue.
- No URL submission.
- No CMS, DB, cohort, or backend mutation.

## Validation

- Focused contract asserts valid backend sitemap career paths appear in `llms.txt`.
- Focused contract asserts held slugs and private paths remain absent.
- Existing fanout/discoverability contracts remain the guard against full-index or per-detail fanout.

## Final Decision

`career_llms_txt_directory_url_exposure_repair_completed_ready_for_frontend_deploy_readiness`

## Next Task

`FRONTEND-DEPLOY-READINESS`
