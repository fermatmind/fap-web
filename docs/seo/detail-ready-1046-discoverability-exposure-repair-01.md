# DETAIL_READY_1046_DISCOVERABILITY_EXPOSURE_REPAIR-01

## Executive Summary

This PR enables frontend discoverability surfaces for the backend-authorized 1046 public Career job detail cohort.

The frontend does not create Career content authority. It enumerates Career job detail URLs from backend public Career jobs index `seo_contract` authority, with backend sitemap-source plus per-detail SEO authority as a fallback path.

## Implementation

- Corrected the Career job SEO authority locale for English detail checks from `en-US` to the backend-supported `en`.
- Switched the primary Career detail fanout to backend public Career jobs index `seo_contract`, avoiding slow per-detail SEO fanout during build and llms route generation.
- Expanded the Career job llms fanout budget to cover 1046 bilingual detail pages.
- Applied a longer bounded llms Career job timeout for the large authority-filtered fanout.
- Added final exposure exclusions for:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`

## Authority Boundary

Career detail URLs are exposed only when backend authority provides:

- Career jobs index `seo_contract`
- fallback sitemap-source canonical path plus per-detail robots policy without `noindex`
- `indexability_state=indexable`
- `sitemap_state=included`
- `llms_exposure_state=allow`

No frontend fallback content, local Career content dataset, or CMS mutation is introduced.

## Safety

This PR does not:

- deploy
- mutate CMS/backend data
- enqueue Search Channel
- submit URLs
- call external search APIs
- change career claims
- expose held/conflict replacement slugs

## Validation

Focused contracts cover the 1046 bilingual llms budget, EN/ZH SEO authority locale mapping, final held/conflict slug exclusion, and sitemap/llms career detail authority routing.

## Next Task

`FRONTEND-DEPLOY-READINESS｜Deploy DETAIL_READY_1046 discoverability exposure repair`
