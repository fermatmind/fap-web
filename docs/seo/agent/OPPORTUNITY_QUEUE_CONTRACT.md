# SEO Opportunity Queue Contract

Status: MVP0 contract.

This contract defines the read-only input format for a future FermatMind SEO opportunity queue. It does not implement queue generation, ranking execution, CMS draft creation, Search Channel enqueueing, provider submission, sitemap changes, schema changes, hreflang changes, robots changes, or indexability changes.

## Contract Boundary

The opportunity queue may only rank opportunities when every row has evidence-backed inputs:

- `url` and `locale`.
- `page_type`.
- `query_cluster`.
- `evidence_sources` with source class, evidence label, freshness, and artifact pointer.
- `scoring_inputs` with explicit numeric components.
- `score` as the deterministic sum of scoring inputs.
- `recommended_lane` as a non-executing next-step lane.
- `blocked_actions` preserving CMS and search-provider boundaries.

Rows backed by unknown, stale, fixture, mock, or inferred GSC data must stay `HOLD` or `NEEDS_MORE_EVIDENCE`.

## Scoring Components

The MVP0 score is additive and intentionally simple:

- `impression_potential`
- `ctr_gap`
- `position_gap`
- `business_priority`
- `evidence_confidence`
- `implementation_risk`

`implementation_risk` is a negative or zero value. The checker verifies that `score` equals the sum of those components.

## Forbidden Actions

The contract cannot approve:

- CMS save, draft creation, import, publish, or unpublish.
- Search Channel enqueue, approve, or submit.
- Google, Baidu, IndexNow, or other provider submission.
- Sitemap, robots, llms, schema, hreflang, canonical, noindex, redirect, or runtime SEO changes.
- Automation TOML changes.

The first executable consumer must be a later explicitly authorized PR.

