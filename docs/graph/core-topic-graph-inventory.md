# Core Topic Graph Inventory Contract

This contract is a read-only Phase 1 baseline for the FermatMind Core Topic
Graph. It does not create topic pages, add graph links, change sitemap or llms
exposure, or move graph authority into frontend code.

## Scope

The first graph foundation scope is limited to:

- MBTI
- Big Five
- RIASEC

The inventory records these entity families:

- topic
- test
- personality_type
- trait_dimension
- riasec_type
- career_family
- career_job
- article

## Source Inputs

`scripts/seo/generate-core-topic-graph-inventory.mjs` composes existing
governance artifacts:

- `docs/seo/generated/url-inventory.v1.json`
- `docs/seo/generated/internal-link-graph.v1.json`
- `docs/seo/generated/duplicate-seo-entities.v1.json`
- `docs/seo/generated/career-family-authority-audit.v1.json`

The generated artifacts are:

- `docs/graph/generated/core-topic-graph-inventory.v1.json`
- `docs/graph/generated/core-topic-graph-inventory.v1.csv`

## Readiness States

- `ready`: public inventory exists, graph links are not orphaned, and evidence is ready or not required.
- `partial`: public inventory exists and evidence is partial, but no blocking authority risk is detected.
- `weak`: public inventory exists, but the static internal-link graph classifies at least one route as a true orphan.
- `dangerous`: public inventory exists, but P1 duplicate authority or not-ready evidence is present.
- `blocked`: the expected public entity route is missing.

The static internal-link graph does not infer CMS-rendered runtime links. Any
future PR that claims orphan reduction must make graph links observable through
generated or live validation.

## Current Baseline

The current reproducible report classifies:

- MBTI as available but weak because topic and personality entities are mostly orphaned.
- Big Five as partial/blocked because the topic and test exist, while OCEAN trait entities have no public route contract.
- RIASEC as partial/blocked because the test exists, while the topic and six interest-code entities have no public route contract.
- Career family entities as dangerous because P1 family authority ambiguity still exists.

## Governance Rules

- Backend/CMS owns graph truth.
- Frontend deterministic-renders graph data only.
- Missing entities must remain visible as missing or blocked inventory rows; do not paper over gaps with frontend fallback graph authority.
- No hidden FAQ, schema, or graph stuffing.
- No AI-generated topic filler.
- No Topic Graph expansion is authorized by this inventory.

## Validation

Run:

```bash
node scripts/seo/generate-core-topic-graph-inventory.mjs --output docs/graph/generated/core-topic-graph-inventory.v1.json --csv docs/graph/generated/core-topic-graph-inventory.v1.csv --pretty
pnpm exec vitest run tests/contracts/core-topic-graph-inventory.contract.test.ts
```
