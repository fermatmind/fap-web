# DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_REPAIR-01

## Executive Summary

Day1 production observation showed the 1046 Career detail rollout was stable at the page, API, sitemap, and `llms.txt` layers, but `/llms-full.txt` could alternate between a complete artifact and a small 200 response with zero Career detail URLs.

This repair makes `llms-full.txt` artifact/cache behavior quality-gated and shared across local Node/PM2 workers.

## Root Cause

`llms-full.txt` used an in-process cache. Each PM2 worker could independently build and cache a response. If a worker hit a bounded source timeout while building the full response, it could cache a small generated artifact that was still HTTP 200 but lacked the 2092 approved Career detail URLs.

## Implementation

- Add a shared last-known-good artifact cache under `FERMATMIND_LLMS_FULL_CACHE_DIR` or the OS temp directory.
- Cache only full `llms-full` artifacts that pass a Career cohort quality gate.
- Require at least 2092 unique EN/ZH Career detail URLs in the full artifact.
- Require representative 1046 rollout slugs to be present in EN and ZH.
- Reject artifacts that contain excluded slugs, staging URLs, or private flow URLs.
- Preserve explicit degraded responses when no full artifact is available.

## Safety Boundaries

- No backend DB mutation.
- No CMS mutation.
- No career cohort mutation.
- No deploy.
- No Search Channel action.
- No URL submission.
- No external search API calls.
- No frontend fallback content.

## Validation

Focused contract coverage verifies:

- Incomplete `llms-full` responses are not cached.
- A complete 2092-URL artifact is cached and reused.
- A second module instance can read the shared last-known-good artifact even when live source enumeration is empty.
- Excluded Career slugs remain absent.

## Repository Rule Impact

This is a discoverability artifact cache implementation change. It does not change content authority or widen the URL set. `llms-full.txt` continues to enumerate from backend/CMS/public API authority.

## Next Task

Deploy readiness for the frontend after PR merge, followed by production smoke:

`POST-DEPLOY-DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_SMOKE-01`
