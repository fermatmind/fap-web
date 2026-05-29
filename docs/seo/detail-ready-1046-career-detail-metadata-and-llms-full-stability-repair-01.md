# DETAIL_READY_1046_CAREER_DETAIL_METADATA_AND_LLMS_FULL_STABILITY_REPAIR-01

## Executive Summary

This scoped fap-web repair addresses two post-rollout frontend issues after the 1046 Career detail cohort became backend-authorized and discoverable.

- Career detail metadata drift: some backend-indexable Career detail pages rendered `noindex,nofollow` in frontend HTML because the frontend required an older display-asset reason code.
- `llms-full.txt` stability: the route assembled a large full discoverability document synchronously on public requests, which became fragile after 2092 bilingual Career detail URLs were added.

No backend DB, CMS, cohort, runtime promotion, Search Channel, URL submission, deploy, or excluded slug publication action was performed.

## Root Cause: Career Detail Metadata Drift

The backend Career detail API is the authority for public/indexable Career detail metadata. For newly public runtime shell pages, backend SEO authority can include:

- `index_eligible=true`
- `index_state=indexable`
- `robots_policy=index,follow`
- `runtime_publish_projection`
- `release_gate_pass`
- `runtime_published_navigation_shell`

The frontend metadata helper still required `validated_display_asset_backed_release` as the only runtime-publication reason code that could complete index authority. That was too strict for the 1046 runtime-published shell cohort, so pages like `/en/career/jobs/aerospace-engineers` could return 200 while emitting `noindex,nofollow`.

## Root Cause: llms-full Instability

`llms-full.txt` is a rich discoverability artifact. It lists canonical public surfaces and enriches selected page families with summaries, FAQ, and next-step data. After the Career detail rollout it also needed to preserve 2092 bilingual Career detail URLs.

The route had source budgets, but it still built the full response on the request path. Multiple bounded fanouts can stack close to gateway/runtime limits. The correct behavior is cache-first / artifact-first with a bounded degraded response when no full artifact is ready.

## Implementation

- Career metadata now accepts backend runtime publication authority when `runtime_publish_projection` is paired with one of:
  - `validated_display_asset_backed_release`
  - `release_gate_pass`
  - `runtime_published_navigation_shell`
- Local content, claim, paid, and Occupation JSON-LD gates remain unchanged.
- `llms-full.txt` now uses an in-process last-known-good response cache.
- `llms-full.txt` starts full generation in a bounded background refresh path.
- If no full cache is available before the response deadline, the route returns a bounded degraded 200 response instead of timing out.
- Full healthy mode still preserves approved Career detail URLs.
- The excluded slugs remain denied:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`

## Career Detail Metadata Validation

Focused contract coverage verifies:

- runtime-published shell authority with `runtime_publish_projection`, `release_gate_pass`, and `runtime_published_navigation_shell` emits `index,follow`.
- candidate-only details remain `noindex`.
- the change does not make gated content or Occupation JSON-LD visible by relaxing metadata.

## llms-full Stability Validation

Focused contract coverage verifies:

- the first healthy route read generates `llms-full.txt`.
- repeated reads use cache instead of re-running backend Career URL enumeration.
- approved Career detail URLs remain present.
- excluded Career slugs remain absent.
- private result/take/share/order/pay paths and staging URLs remain absent.

## Excluded Slug Safety

This PR does not release, index, or expose:

- `software-developers`
- `digital-forensics-analysts`
- `computer-occupations-all-other`

## Search Channel / URL Submission Safety

No Search Channel enqueue, URL submission, IndexNow/GSC/Baidu/Bing/360/Sogou/Shenma call, CMS mutation, backend DB mutation, career cohort mutation, runtime promotion, deploy, env edit, DNS edit, or nginx edit was performed.

## Repository Rule Impact

This changes a frontend SEO/GEO surface and keeps the repository authority boundary intact:

- Career metadata continues to consume backend API authority.
- `llms-full.txt` continues to enumerate from backend/CMS/public APIs.
- No frontend editorial fallback content was added.
- Degraded `llms-full.txt` is explicitly a bounded availability mode, not a content authority source.

## Final Decision

`detail_ready_1046_metadata_and_llms_full_repair_completed_ready_for_frontend_deploy_readiness`

## Next Task

`FRONTEND-DEPLOY-READINESS｜Deploy DETAIL_READY_1046 career metadata and llms-full stability repair`
