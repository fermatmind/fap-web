# Final V4 Career Guides and Jobs Authority Audit

Status: PR-V4-B2D
Date: 2026-04-19
Repository: `fap-web`

## Scope

This audit covers the low-risk career content slice of Final V4 Phase 2:

- career guides
- career jobs
- career guide/job SEO adapters
- career guide/job list and detail route authority

It intentionally does not change runtime code and does not touch the high-traffic `/career` hub.

## Current Authority

Career guide detail pages are CMS/API authoritative through `lib/cms/career-guides.ts`:

- list API: `/v0.5/career-guides`
- detail API: `/v0.5/career-guides/{slug}`
- SEO API: `/v0.5/career-guides/{slug}/seo`
- detail route: `/career/guides/[slug]`
- alias route: `/career/[slug]` redirects to the canonical guide route when the CMS guide exists.

Career job detail pages are API authoritative through `lib/cms/career-jobs.ts` and the backend career bundle readers:

- list API: `/v0.5/career-jobs`
- detail API: `/v0.5/career-jobs/{slug}`
- SEO API: `/v0.5/career-jobs/{slug}/seo`
- detail route: `/career/jobs/[slug]`
- alias route: `/career/[slug]` redirects to the canonical job route when the CMS job exists.

Career guide and job adapters normalize backend fields for rendering and SEO. They do not contain local article bodies, local guide bodies, or local job profile bodies.

## Frontend Shell Copy

The career guide index still owns local grouping/navigation shell data:

- guide group labels and summaries.
- featured guide slug ordering.
- category fallback grouping.
- index metadata title/description.

This is not a body fallback for guide detail pages, but it is operational content-like surface copy. It should move behind a backend-owned landing surface or index configuration before Phase 2 is considered fully closed for career guides.

Career jobs index uses backend dataset/job-index APIs plus local product shell labels for the browse UI. Its source of truth for occupation membership and detail availability is backend data, not local job body copy. Existing static occupation member data remains a display fallback for legacy dataset hub responses and should not be expanded into editorial job profiles.

## Runtime Fallback Classification

Allowed:

- empty CMS/API guide list renders a reduced index because there are no guide cards to show.
- missing guide/job detail returns `notFound()`.
- backend claim/render-state gates can render conservative empty or limited states for incomplete career data.
- UI shell labels can remain in product code while backend does not expose equivalent labels.

Not allowed:

- adding local guide bodies, job bodies, SEO descriptions, or cover/media assets in frontend files.
- expanding static occupation member data into publishable career profiles.
- using frontend guide groups as the long-term operational authority for ordering or featured placement.

## Follow-Up Queue

Continue Phase 2 with separate PRs:

- Move `/career/guides` index title, intro, grouping, featured placement, and SEO to a backend-owned landing surface or career guide index API contract.
- Audit articles as PR-V4-B2E.
- Audit topics/personality SEO and low-risk sections as PR-V4-B2F.

Do not use this audit to change `/career` hub behavior. The high-traffic career hub remains Phase 4 and must wait for Phase 3 last-known-good cache strategy.

## Repository Rule Impact

This PR reinforces the existing Content Authority Rules. It records career guide/job detail content and SEO as backend/API authoritative, while flagging the career guide index as a remaining frontend shell surface that needs backend-owned ordering/copy before the broader career content slice is fully closed.
