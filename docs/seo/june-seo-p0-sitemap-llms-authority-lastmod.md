# June SEO P0 Sitemap / llms Authority Lastmod Gate

Scope: PR-SEO-JUNE-05

Runtime behavior changed: no.

URL set changed: no.

`llms.txt` exposure changed: no.

`llms-full.txt` exposure changed: no.

This PR hardens sitemap timestamp governance without expanding public
discoverability. The only runtime-facing sitemap behavior change is that
frontend/static sitemap entries without a real backend or CMS timestamp omit
`lastmod` instead of using build time.

## Lastmod Policy

`lastmod` must represent a real content update timestamp. Build time is not a
content update timestamp.

Allowed timestamp sources:

- backend sitemap-source `lastmod` when provided by the authority payload
- CMS `updated_at`
- CMS `updatedAt`
- CMS `published_at` only when it is the real content timestamp for that entry

When no authoritative timestamp is available, the sitemap entry must omit
`lastmod`.

## What Changed

- `next-sitemap.config.js` sets `autoLastmod: false`.
- `next-sitemap.config.js` no longer emits `lastmod: new Date().toISOString()`
  from `transform`.
- `additionalPaths` remains URL-set compatible and does not add `lastmod` unless
  a future PR introduces a real backend/CMS timestamp mapper.

## Authority Boundaries

| Surface | Authority |
| --- | --- |
| sitemap static shells | frontend route allow-list, without synthetic lastmod |
| sitemap CMS details | CMS/public API enumeration |
| sitemap career jobs | backend `/api/v0.5/seo/sitemap-source` plus career job `seo.surface.v1` gate |
| sitemap personality variants | backend `/api/v0.5/seo/sitemap-source` |
| `llms.txt` | CMS/public API constrained by shared discoverability deny policy |
| `llms-full.txt` | CMS/public API constrained by shared discoverability deny policy |
| topic fallback | compatibility fallback only, not broad topic expansion |

## Hard Gates

- no build-time `new Date()` as sitemap `lastmod`
- no sitemap URL expansion
- no `llms.txt` or `llms-full.txt` exposure expansion
- private take/result/order/share/pay/payment/history flows remain excluded
- topic fallback remains constrained to the compatibility set

## Repository Rule Impact

Content authority changed: no.

SEO/GEO enumeration changed: no.

Runtime behavior changed: no.

This PR changes timestamp governance only. It does not add pages, content,
schema, recommendation behavior, scoring behavior, payment behavior, or llms
coverage.
