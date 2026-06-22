# Six-Assessment Hub Parity

Scope: `FA30-WEB-01`

Runtime behavior changed: no.

## Purpose

This PR adds a read-only verifier for the six flagship public test detail hubs:

- MBTI
- Big Five
- Enneagram
- RIASEC
- IQ
- EQ

The verifier checks whether the 12 live public routes stay aligned across page
HTML, canonical, alternate links, sitemap, `llms.txt`, `llms-full.txt`, public
scale lookup, and public sitemap-source endpoints.

## No Expansion Statement

This PR does not change frontend runtime behavior, CMS authority, landing-surface
rendering, take flow, attempt creation, scoring, result rendering, payment,
entitlement, report access, sitemap generation, llms generation, robots, schema,
canonical, hreflang, or search submission behavior.

## Coverage

For each of the following 12 public routes, the verifier checks:

- live page returns `200`
- canonical is self
- page is not noindexed
- self and sibling locale alternates are present
- route appears in live `sitemap.xml`
- route appears in live `llms.txt`
- route appears in live `llms-full.txt`
- `/api/v0.3/scales/lookup` returns `ok=true`
- lookup marks the route `is_indexable=true`
- `/api/v0.3/scales/sitemap-source?locale=...` contains the slug
- sitemap source marks the slug `is_indexable=true`

The six public slugs are:

- `mbti-personality-test-16-personality-types`
- `big-five-personality-test-ocean-model`
- `enneagram-personality-test-nine-types`
- `holland-career-interest-test-riasec`
- `iq-test-intelligence-quotient-assessment`
- `eq-test-emotional-intelligence-assessment`

## Commands

Live read-only verification:

```bash
pnpm seo:check-six-assessment-hub-parity
```

Regenerate the checked-in static plan artifact:

```bash
node scripts/seo/check-six-assessment-hub-parity.mjs --plan --write docs/seo/generated/six-assessment-hub-parity.v1.json
```

## Authority Boundary

- This verifier is observation-only.
- It must fail closed on unexpected hosts.
- It must not mutate sitemap, llms, canonical, hreflang, or indexability.
- It must not write CMS, submit search URLs, or trigger provider calls.

## Evidence

- Script: `scripts/seo/check-six-assessment-hub-parity.mjs`
- Generated plan: `docs/seo/generated/six-assessment-hub-parity.v1.json`
- Contract: `tests/contracts/six-assessment-hub-parity.contract.test.ts`

## Residual Risk

This verifier proves parity expectations and supports future runtime QA, but it
does not itself remediate mismatches. IQ remains tagged
`manual_review_required`, so the verifier can detect drift without treating IQ as
an expansion lane.
