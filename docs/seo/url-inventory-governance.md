# URL Inventory Governance

Version: `url_truth.inventory.v1`

This document defines the PR-UG-01 inventory baseline for URL Truth & SEO Governance. The inventory generator is read-only. It does not change routing, sitemap generation, llms generation, canonical rendering, metadata, JSON-LD, or Evidence Container behavior.

## Generator

```bash
node scripts/seo/generate-url-inventory.mjs --pretty
node scripts/seo/generate-url-inventory.mjs --output docs/seo/generated/url-inventory.v1.json --csv docs/seo/generated/url-inventory.v1.csv
node scripts/seo/generate-url-inventory.mjs --live --pretty
```

Default mode reads the checked-in `public/sitemap.xml` and produces a deterministic offline inventory. Live mode additionally reads production `llms.txt` and `llms-full.txt` to mark current machine-readable exposure.

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
