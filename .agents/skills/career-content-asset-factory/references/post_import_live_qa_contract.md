# Post-Import Live QA Contract

Post-import QA proves the public surface is safe after production import.

## Required Checks

- Live API rows readable for every approved slug-locale pair.
- Live career pages return 200 where authority expects public pages.
- New block renders from backend-approved asset, not fallback content.
- API 404, flag off, or disallowed status fails closed.
- Raw enums, source IDs, evidence IDs, row hashes, audit labels, and candidate projection fields do not leak.
- `en` pages have no Chinese reader-facing text.
- `zh-CN` pages follow local reader language rules.
- Sitemap, llms, canonical, noindex, robots, and JSON-LD are unchanged unless separately authorized.

## Verdicts

Use block-specific final verdicts such as `POST_IMPORT_SEO_SAFE` or `POST_IMPORT_REPAIR_REQUIRED`.
