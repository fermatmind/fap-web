# Science ContentPage Discoverability Gate 01

Scope: SCIENCE-CONTENTPAGE-DISCOVERABILITY-GATE-01

Mode: approved footer-exposure runtime gate.

Runtime behavior changed: yes. The global footer now exposes the approved Research & Methods routes.

## Decision

Science ContentPage routes are now approved for footer exposure after explicit operator/user authorization and backend CMS authority work for bilingual published records.

This change restores footer links for `/science`, `/method-boundaries`, `/item-design-notes`, `/reliability-validity`, `/data-privacy`, and `/common-misconceptions`. It does not add header links, submit search URLs, start paid/community distribution, or expose private result/order/payment routes.

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
| `footer_eligible` | true | Approved for the six public Research & Methods routes after CMS/backend authority and operator approval. |
| `header_eligible` | false | Not part of this gate; requires a separate IA decision. |
| `search_submission_eligible` | false | Not allowed before sitemap eligibility and production smoke pass. |
| `social_distribution_eligible` | false | Not allowed in this gate. |

## Footer Eligibility

The footer-eligible Research & Methods routes are:

- `/science`
- `/method-boundaries`
- `/item-design-notes`
- `/reliability-validity`
- `/data-privacy`
- `/common-misconceptions`

These routes remain CMS/backend-authoritative. The frontend footer may link to them, but it must not provide fallback body copy if the API is unavailable.

## Blocked Actions

- Adding Science ContentPage URLs to sitemap or llms from draft packages.
- Adding header links without a separate IA decision.
- Search submission before public canonical production checks pass.
- Using FAQ schema as a reason to expose thin or unreviewed visible content.
- Referencing private, tokenized, payment, order, result, share, history, or user-specific URLs.
- DailyGiving amplification from science content tails.
- Paid ads, batch community posting, fake user voice, or competitor imitation.

## Non-Expansion Statement

This gate now permits footer exposure for the approved Research & Methods route set only. It does not change sitemap generation, llms generation, robots, canonical metadata, header navigation, tracking, search submission, paid distribution, or private-route handling.
