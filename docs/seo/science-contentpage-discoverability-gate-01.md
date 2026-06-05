# Science ContentPage Discoverability Gate 01

Scope: SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01

Mode: contract-only discoverability eligibility gate.

Runtime behavior changed: no.

## Decision

Science ContentPage routes remain blocked from new sitemap, llms, footer, header, search-submission, or social amplification exposure until the required CMS, review, claim, FAQ schema, route, and private-URL gates all pass.

This PR does not add URLs to sitemap or llms, does not add footer/header links, does not submit search URLs, does not publish content, does not mutate CMS records, and does not generate page copy.

## Required Dependency Gates

| Gate | Required status before discoverability eligibility |
| --- | --- |
| `SCIENCE-CONTENTPAGE-CMS-FIELD-MAPPING-01` | Field mapping/dry-run gate complete. |
| `SCIENCE-CONTENTPAGE-CLAIM-GATE-01` | Passed. |
| `SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01` | Passed when FAQPage schema is requested. |
| CMS review state | Operator-approved. |
| Publish state | Public and publish-approved by CMS/backend authority. |
| Route state | Public canonical route returns a stable 200. |
| Private URL scan | No result/order/share/pay/payment/history/tokenized URL exposure. |

## Eligibility Fields

| Field | Default | Requirement |
| --- | --- | --- |
| `sitemap_eligible` | false | May become true only after all dependency gates pass. |
| `llms_eligible` | false | May become true only after visible content and claim gates pass. |
| `footer_eligible` | false | May become true only after operator approval and public IA approval. |
| `header_eligible` | false | Not part of this gate; requires a separate IA decision. |
| `search_submission_eligible` | false | Not allowed before sitemap eligibility and production smoke pass. |
| `social_distribution_eligible` | false | Not allowed in this gate. |

## Blocked Actions

- Adding Science ContentPage URLs to sitemap or llms from draft packages.
- Adding footer/header links before CMS publication and operator approval.
- Search submission before public canonical production checks pass.
- Using FAQ schema as a reason to expose thin or unreviewed visible content.
- Referencing private, tokenized, payment, order, result, share, history, or user-specific URLs.
- DailyGiving amplification from science content tails.
- Paid ads, batch community posting, fake user voice, or competitor imitation.

## Non-Expansion Statement

This PR is a gate definition only. It preserves current public discoverability state and records the conditions for a later implementation PR. It does not change routes, sitemap generation, llms generation, robots, canonical metadata, schema, footer, header, tracking, CMS, or production deployment.

