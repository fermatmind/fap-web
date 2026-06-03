# URL Inventory Governance

Version: `url_truth.inventory.v1`

This document defines the PR-UG-01 inventory baseline for URL Truth & SEO Governance. The inventory generator is read-only. It does not change routing, sitemap generation, llms generation, canonical rendering, metadata, JSON-LD, or Evidence Container behavior.

## Generator

```bash
node scripts/seo/generate-url-inventory.mjs --pretty
node scripts/seo/generate-url-inventory.mjs --output docs/seo/generated/url-inventory.v1.json --csv docs/seo/generated/url-inventory.v1.csv
node scripts/seo/generate-url-inventory.mjs --live --pretty
node scripts/seo/generate-url-inventory.mjs --sitemap=https://fermatmind.com/sitemap.xml --site-url=https://fermatmind.com --json
```

Default mode reads the checked-in `public/sitemap.xml` and produces a deterministic offline inventory. Live mode additionally reads production `llms.txt` and `llms-full.txt` to mark current machine-readable exposure.

For `SEO-SITEMAP-P0-05`, the generated artifacts in `docs/seo/generated/url-inventory.v1.json` and `.csv` are intentionally generated from `https://fermatmind.com/sitemap.xml`, not from the checked-in local sitemap artifact. This locks the current production sitemap URL truth for review while preserving the generator as a read-only measurement tool.

## Source Hierarchy

Use this order when resolving sitemap URL truth:

1. Production `https://fermatmind.com/sitemap.xml` for the current public URL set.
2. Backend/CMS public authority APIs that feed sitemap generation.
3. `next-sitemap.config.js` as the adapter contract.
4. Checked-in local `public/sitemap.xml` as a local artifact only.
5. Generated inventory docs as review artifacts only.

The current 2270 vs 261 difference is not a runtime defect by itself. It means production sitemap generation has access to production backend/CMS data, while the checked-in local `public/sitemap.xml` is smaller and should not be treated as production URL truth.

## Current P0 Decisions

- Keep `/zh` out of sitemap while it redirects/canonicalizes through the root strategy.
- Keep `/en/career/jobs` and `/zh/career/jobs` out of sitemap while career jobs index pages remain launch-quarantined from sitemap promotion.
- Keep backend-gated career job detail URLs in sitemap only when the backend public API marks them indexable.
- Keep private, draft, noindex, tokenized, payment, result, order, share, and history URLs out of sitemap and machine-readable promotion surfaces.

## Inventory Fields

- `url`
- `path`
- `locale`
- `routeFamily`
- `inSitemap`
- `inLlms`
- `inLlmsFull`
- `expectedLlmsState`
- `exposureClassification`
- `canonicalState`
- `robotsIndexState`
- `hreflangState`
- `jsonLdFamily`
- `evidenceContainerReadiness`

## Governance Boundary

The inventory is a measurement surface, not a source of SEO truth. Backend `seo.surface.v1`, backend sitemap-source, and existing discoverability contracts remain authoritative.

Do not use this generator to widen sitemap or llms exposure. Do not use it to create Topic Graph pages, SEO Intelligence Stack features, Recommendation systems, Behavior Graph, Long-term Profile, B2B, or AI-generated SEO content.

Future `seo_intel`, CMS issue summary, or SEO dashboard integrations must consume the public sitemap/API truth boundary. They must not derive a separate frontend-only sitemap truth from generated inventory files.
