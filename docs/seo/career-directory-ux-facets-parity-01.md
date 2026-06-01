# CAREER-DIRECTORY-UX-FACETS-PARITY-01

## Executive Summary

This PR keeps the `/career/jobs` directory as a backend-authority, paginated entry point and tightens the user-facing EN/ZH directory experience around the existing `career.directory_authority.v1` API.

No career content, cohort state, sitemap, llms, Search Channel, URL submission, CMS, DB, or backend authority changes were made.

## Implementation

- Removed the desktop-only `nowrap` risk from the directory H1 so long counts and localized copy can wrap safely.
- Added active filter feedback for query/family views with a clear route back to the canonical directory page.
- Added stable test ids for family facets and pagination.
- Added bounded empty-state UX with a clear route, without frontend fallback content.
- Improved mobile readability for occupation row family/status fields.
- Kept query, family, and pagination pages `noindex` with canonical pointing back to `/career/jobs`.

## Authority Boundary

- Backend career directory API remains the source of truth.
- fap-web only renders the directory payload and metadata.
- Held slugs remain unexposed:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`

## Validation

Required focused contract:

```bash
pnpm exec vitest run tests/contracts/career-directory-ux-facets-parity-01.contract.test.tsx tests/contracts/career-query-canonical.contract.test.tsx
```

Common fap-web validation:

```bash
pnpm typecheck
NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build
pnpm test:contract
git diff --check
git diff --cached --check
```

## Final Decision

`career_directory_ux_facets_parity_ready_for_search_channel_readiness_gate`
