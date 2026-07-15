# Post-Import Live QA Contract

Post-import QA proves that the live surface matches the authorized import mode.
It must not assume that a production import was a public release.

## Required Mode

Declare exactly one mode:

- `draft_isolation`: imported primary drafts or working revisions must remain
  absent from the public projection.
- `public_release`: separately authorized published revisions must be visible
  only on the approved public surfaces.

## Required Checks

- Live API rows readable for every approved slug-locale pair.
- Live career pages return 200 where authority expects public pages.
- New block renders from backend-approved asset, not fallback content.
- API 404, flag off, or disallowed status fails closed.
- Revision-managed readers resolve the published public projection; they do not
  select a working/draft revision implicitly.
- In `draft_isolation` mode, published pointers and public fingerprints remain
  unchanged, withheld routes remain absent from sitemap/LLMS, and any HTTP 200
  soft-404 shell is recorded as a finding unless the approved route contract
  explicitly allows it.
- In `public_release` mode, the exact published revision, public fields, route,
  indexability, and discoverability effects match the separate authorization.
- Raw enums, source IDs, evidence IDs, row hashes, audit labels, and candidate projection fields do not leak.
- `en` pages have no Chinese reader-facing text.
- `zh-CN` pages follow local reader language rules.
- Sitemap, llms, canonical, noindex, robots, and JSON-LD are unchanged unless separately authorized.

## Verdicts

Use block-specific final verdicts such as `POST_IMPORT_DRAFT_ISOLATION_SAFE`,
`POST_IMPORT_SEO_SAFE`, or `POST_IMPORT_REPAIR_REQUIRED`.
