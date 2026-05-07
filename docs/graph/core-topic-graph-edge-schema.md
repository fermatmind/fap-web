# Core Topic Graph Edge Schema

This document defines the Phase 1 edge contract for the FermatMind Core Topic
Graph. It is a governance contract only. It does not generate links, create
public pages, change sitemap or llms exposure, or move graph authority into
frontend code.

## Authority

Graph truth is owned by backend/CMS systems. The frontend may only
deterministically render graph edges that are provided by an approved authority
surface.

Forbidden authority sources:

- frontend-local graph authority
- frontend hardcoded graph expansion
- AI-generated graph filler
- hidden schema or FAQ stuffing

## Edge Types

Phase 1 recognizes these edge types:

- `topic_to_test`
- `topic_to_type`
- `type_to_career`
- `career_to_trait`
- `topic_to_article`
- `topic_to_faq`
- `topic_to_cta`

## Required Governance Fields

Every edge must include:

- `edge_id`
- `edge_type`
- `source_entity`
- `target_entity`
- `source_authority`
- `owner`
- `review_state`
- `visibility_state`
- `confidence`
- `evidence_requirement`
- `rendered_visibility`

Public edges must be grounded in visible content. Candidate edges may exist in
fixtures or CMS review workflows, but they must not be rendered as public graph
links until the source and target entities are reviewed and visible evidence is
available.

## Current Fixture

The contract fixture lives at:

`tests/contracts/fixtures/graph/core-topic-graph-edge-schema.v1.json`

The fixture intentionally includes:

- approved MBTI topic-to-test and topic-to-CTA examples
- candidate MBTI topic-to-type and type-to-career examples
- candidate article, FAQ, and career-to-trait examples
- blocked examples for RIASEC type and Big Five trait expansion

These examples establish shape and governance rules. They do not authorize
runtime graph rendering or public Topic Graph expansion.

## Validation

Run:

```bash
pnpm exec vitest run tests/contracts/core-topic-graph-edge-schema.contract.test.ts
```
