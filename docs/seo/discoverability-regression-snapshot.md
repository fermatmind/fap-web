# Discoverability Regression Snapshot

`PR-DF-01` establishes a read-only baseline for the Discoverability Foundation Stabilization train.

The snapshot lives at:

- `tests/contracts/fixtures/discoverability-foundation/regression-snapshot.v1.json`

The validator lives at:

- `scripts/seo/check-discoverability-regression-snapshot.mjs`

The contract test lives at:

- `tests/contracts/discoverability-regression-snapshot.contract.test.ts`

## Scope

The snapshot covers:

- `sitemap.xml`
- `llms.txt`
- `llms-full.txt`
- canonical URLs
- metadata authority source files
- JSON-LD sample page families
- robots/noindex private-flow protection
- hreflang sample alternates
- Evidence Container governance source
- URL truth source files
- SEO authority ownership fields

## Non-goals

This snapshot does not change runtime SEO behavior. It does not change sitemap generation, llms generation, canonical routing, JSON-LD rendering, robots output, metadata rendering, route handlers, CMS ownership, or public URLs.

It also does not start Topic Graph, GEO expansion, Recommendation System, Behavior Graph, Long-term Profile, B2B, or AI-generated content work.

## Validation

Run:

```bash
node scripts/seo/check-discoverability-regression-snapshot.mjs
pnpm vitest run tests/contracts/discoverability-regression-snapshot.contract.test.ts
```

The fixture is intentionally conservative. Later PRs may add stricter parity gates, but this baseline must remain read-only and must never widen sitemap or llms exposure by itself.
