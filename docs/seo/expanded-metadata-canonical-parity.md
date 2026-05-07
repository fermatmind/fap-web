# Expanded Metadata / Canonical / Hreflang / JSON-LD Parity Matrix

PR-SEOF-04 expands SEO Foundation parity coverage without changing runtime
metadata, canonical, hreflang, JSON-LD, sitemap, llms, or public page output.

## Scope

The expanded matrix covers these route families:

- home
- tests hub
- test detail
- topic detail
- article detail
- career job detail
- career family
- career recommendation
- personality detail
- help detail

The fixture is stored at:

- `tests/contracts/fixtures/seo-foundation/expanded-metadata-canonical-parity.v1.json`

The contract is stored at:

- `tests/contracts/expanded-metadata-canonical-parity.contract.test.ts`

## Governance Rules

- Required CI validation is generated-fixture only.
- Live HTML sampling is optional and must be explicitly enabled with `--live`.
- Optional live checks may skip samples marked `liveOptional: false`.
- Private flows remain negative samples and must never appear in public samples.
- The matrix is a governance surface only; it does not authorize new sitemap,
  llms, Topic Graph, Career pSEO, or GEO expansion.

## Private Flow Coverage

The expanded private-flow negative set includes:

- `/tests/*/take`
- `/result/*`
- `/results/*`
- `/orders/*`
- `/share/*`
- `/pay/*`
- `/payment/*`

## Intentionally Deferred

- No metadata rendering changes.
- No title or description changes.
- No canonical routing changes.
- No sitemap or llms URL-set changes.
- No Article JSON-LD fallback removal.
- No Topic Graph rollout.
