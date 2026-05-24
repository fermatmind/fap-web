# DISCOVERABILITY-STAGING-DEINDEX-FIX-01

## Purpose

Contain the staging domain after public search results showed `staging.fermatmind.com` as a discoverable host. This fix makes staging non-indexable, prevents staging machine-readable surfaces from listing staging URLs, and keeps production discoverability behavior unchanged.

## Behavior

- Staging responses receive `X-Robots-Tag: noindex, nofollow, noarchive`.
- Staging HTML metadata renders `noindex,nofollow`.
- Staging canonical generation converges to the production apex host instead of self-canonicalizing to staging.
- Staging `robots.txt` disallows crawling and does not advertise a staging sitemap.
- Staging `sitemap.xml`, locale sitemaps, `llms.txt`, and `llms-full.txt` fail closed with non-authoritative responses.
- Production apex remains indexable with production sitemap and llms routes preserved.

## Boundaries

No Search Channel submission, Baidu console mutation, DNS edit, deploy, CMS mutation, sitemap authority change, or backend URL Truth write was performed in this PR. Staging remains explicitly non-authoritative and must not be used as URL Truth.

## Next Task

FRONTEND-DEPLOY-READINESS｜Deploy staging deindex fix
