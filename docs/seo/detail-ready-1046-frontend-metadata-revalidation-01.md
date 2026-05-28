# DETAIL_READY_1046_FRONTEND_METADATA_REVALIDATION-01

## Summary

This scoped frontend repair revalidates career job detail metadata after the backend 1046 career detail rollout.

The backend public career API is the authority for career job publication and indexability. Newly promoted career job details can be public/indexable through backend runtime projection authority while still withholding local strong-claim, salary, fit, outlook, and structured-data surfaces until frontend render/claim gates permit those modules.

## Root Cause

The career job detail page previously required both:

- backend SEO/index authority, and
- local `renderState.canIndexPage` or local claim/trust render permission.

After the 1046 backend rollout, some pages are backend-published and indexable as public occupation overview pages, but their local claim/render gates still block stronger content modules. That caused HTML metadata to emit `noindex,nofollow` even when backend authority reported an indexable runtime projection.

## Implementation

- Keep backend/CMS/API authority as the source of truth.
- Allow career detail metadata to output `index,follow` only when backend indexability is explicit and reason codes include both:
  - `runtime_publish_projection`
  - `validated_display_asset_backed_release`
- Keep local claim/render gates in place for gated content and structured data.
- Keep candidate/review-only career pages noindexed when runtime projection authority is absent.

## Safety Boundaries

- No content body changes.
- No frontend fallback content.
- No sitemap or llms exposure changes.
- No Search Channel action.
- No URL submission.
- No production deploy.
- No fap-api or CMS mutation.

## Validation

Focused contract coverage verifies:

- runtime-published backend career authority can make metadata `index,follow`;
- gated local career content remains hidden;
- Occupation JSON-LD remains blocked while structured-data render gates are closed;
- candidate-only backend SEO signals remain noindexed without runtime projection authority.
