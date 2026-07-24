# Sitemap family observability

Task: `SEO-10K-SITEMAP-FAMILY-OBSERVABILITY-01`

The canonical `/sitemap.xml` remains a complete URL set sourced from the
backend `/api/v0.5/seo/sitemap-source` authority. This change adds five
observation-only child endpoints:

- `/sitemaps/tests.xml`
- `/sitemaps/articles.xml`
- `/sitemaps/career.xml`
- `/sitemaps/personality.xml`
- `/sitemaps/other.xml`

Each backend-authorized root entry belongs to exactly one family. The
deterministic union of all five child sitemaps equals the root URL set, and no
child endpoint can add a URL that was absent from the root authority payload.
Existing canonicalization, duplicate removal, private-path exclusion, and
indexability gates run before family classification.

Family assignment is an observability taxonomy only:

- localized `/tests` paths are `tests`;
- localized `/articles` paths are `articles`;
- localized `/career` paths are `career`;
- localized `/personality` paths are `personality`;
- every other already-approved public URL is `other`.

An empty individual family remains a valid empty `urlset`, allowing backend
unpublication or indexability changes to converge to removal. An unavailable
or wholly empty backend source fails closed with HTTP 503. Unknown family
names return HTTP 404 without fetching backend authority.

## Boundaries

- No public URL is added or removed.
- The root sitemap remains compatible and keeps the same URL union.
- Backend/CMS remains the publication and indexability authority.
- The frontend does not infer publication or indexability from the path.
- `llms.txt`, `llms-full.txt`, robots, CMS, and Search Channel are unchanged.
- No sitemap is submitted to any search engine in this task.

## Repository rule impact

This is a frontend routing and observability change over the existing
backend-authoritative sitemap payload. It does not change content ownership,
publication, indexability, or frontend fallback rules.
