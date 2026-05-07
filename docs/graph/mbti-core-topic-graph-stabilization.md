# MBTI Core Topic Graph Stabilization

PR-TG-03 stabilizes the existing MBTI graph foundation as a contract-backed
readiness layer. It does not create pages, widen sitemap or llms exposure,
generate content, or move graph truth into frontend code.

## Scope

The MBTI graph foundation covers:

- topic to test
- topic to personality type
- personality type to career next step
- personality type to FAQ block
- personality type to CTA

The source fixture is:

`tests/contracts/fixtures/graph/mbti-core-topic-graph.v1.json`

The readiness checker is:

`scripts/seo/check-mbti-core-topic-graph.mjs`

Generated artifacts:

- `docs/graph/generated/mbti-core-topic-graph-readiness.v1.json`
- `docs/graph/generated/mbti-core-topic-graph-readiness.v1.csv`

## Authority Boundary

The fixture declares `backend_cms` as graph source authority and keeps the
frontend role as deterministic rendering only. This PR does not wire runtime
rendering to the fixture. The fixture is a contract for future CMS/public API
graph delivery.

## Current Baseline

The Core Topic Graph inventory currently reports static MBTI graph weaknesses:

- MBTI topic and personality entities are public inventory, but static source
  graph analysis still classifies many of them as true orphans.
- MBTI test and personality routes already exist and are not expanded here.

The MBTI readiness checker expands the governed contract over the 32 MBTI
variant entities and both locales. It verifies that the governed graph covers
topic/test/type/career/FAQ/CTA edges while keeping runtime exposure unchanged.

## Validation

Run:

```bash
node scripts/seo/check-mbti-core-topic-graph.mjs --output docs/graph/generated/mbti-core-topic-graph-readiness.v1.json --csv docs/graph/generated/mbti-core-topic-graph-readiness.v1.csv --pretty
pnpm exec vitest run tests/contracts/mbti-core-topic-graph.contract.test.ts
```

## Deferred

- No RIASEC topic rollout.
- No Big Five trait public rollout.
- No Recommendation Engine.
- No Behavior Graph.
- No Long-term Profile.
- No Career pSEO expansion.
