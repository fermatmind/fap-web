# MBTI-SEO-07 Discoverability Audit

Generated: 2026-07-04T08:30:00.000Z

## Decision

- Runtime URL expansion: no
- Sitemap URL expansion: no
- llms URL expansion: no
- CMS write/import: no

## Current Authority

- `llms.txt` enumerates personality profiles and comparisons from CMS public personality APIs.
- `llms-full.txt` keeps the MBTI64 cohort at 64 A/T profile URLs plus 32 comparison URLs.
- `sitemap.xml` keeps `/en/personality` and `/zh/personality` as static hub entries; detail URLs must come from backend sitemap-source authority.

## Content Readiness Inputs

- Top profile package assets: 10
- Comparison package assets: 20 total, 16 A/T, 4 hot cross-type

## Required Gates Before Any URL Expansion

- CMS/backend import dry-run succeeds for target personality profiles or comparison pages.
- CMS public API marks each target route public and indexable.
- Backend sitemap-source emits the exact canonical route with sitemap eligibility.
- llms.txt and llms-full.txt include only CMS/API-authoritative public entries.
- No frontend local editorial fallback is added.
- Canonical/noindex and JSON-LD behavior remain owned by the relevant authority layer.

