# UASP SEO/GEO Eligibility Guard v1

Scope: PR-UASP2B-03

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

This guard makes `seo_geo_eligible` enforceable as a non-widening contract. It prevents future scales from entering sitemap, `llms.txt`, `llms-full.txt`, JSON-LD, FAQPage, or public metadata by default.

This PR is contract-only. It does not change sitemap output, llms output, llms-full output, JSON-LD output, metadata output, canonical/hreflang behavior, or public route behavior.

## Guard Rules

- `not_eligible` cannot be treated as SEO/GEO-ready.
- `private_noindex` cannot enter sitemap, llms, or llms-full.
- `llms_full_eligible` requires visible evidence, claim boundary, source authority, and discoverability authority.
- Sensitive and mental-health-sensitive scales cannot be `llms_full_eligible` by default.
- Future scales default to `not_eligible`.
- Sitemap, llms, schema, or JSON-LD exposure does not prove a true graph.
- UASP eligibility must not silently widen public discoverability.

## Runtime Output Boundary

The current runtime output remains owned by existing discoverability contracts:

- Sitemap: `app/sitemap.xml/route.ts`, `tests/contracts/fixtures/seo/public-sitemap-snapshot.xml`, `docs/seo/generated/discoverability-authority-matrix.v1.json`
- llms: `app/llms.txt/route.ts`
- llms-full: `app/llms-full.txt/route.ts`
- JSON-LD/FAQ: visible content and structured-data contracts
- Private flow exclusion: `tests/contracts/private-noindex.contract.test.ts`

## First Batch SEO/GEO Guard Status

| Scale | UASP `seo_geo_eligible` | Guard status | Runtime exposure change |
|---|---|---|---|
| `MBTI` | `llms_eligible` | `existing_allowed_no_expansion` | `none` |
| `BIG5_OCEAN` | `geo_candidate` | `candidate_only_no_llms_full` | `none` |
| `RIASEC` | `geo_candidate` | `candidate_only_no_llms_full` | `none` |
| `ENNEAGRAM` | `seo_only` | `seo_only_no_llms_full` | `none` |
| `FUTURE_SCALE_PLACEHOLDER` | `not_eligible` | `blocked_until_proof` | `none` |

## Proof Requirements

`llms_full_eligible` requires all proof categories:

- visible evidence
- claim boundary
- source authority
- discoverability authority

Missing any category means the scale is not llms-full eligible.

## No Runtime Change Statement

This PR adds SEO/GEO eligibility guard artifacts and tests only. It does not change sitemap URL sets, llms URL sets, llms-full URL sets, JSON-LD, FAQPage, metadata, canonical/hreflang, route behavior, or public copy.
