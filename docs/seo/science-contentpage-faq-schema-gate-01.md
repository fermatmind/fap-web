# Science ContentPage FAQ Schema Gate 01

Scope: SCIENCE-CONTENTPAGE-FAQ-SCHEMA-GATE-01

Mode: contract-only QA gate.

Runtime behavior changed: no.

## Decision

FAQPage schema for Science ContentPage routes remains blocked until every FAQ item is visibly rendered from CMS/backend-authoritative content and passes the Science ContentPage claim gate.

This document does not enable schema, import content, mutate CMS records, publish content, change sitemap or llms exposure, alter footer/header navigation, or generate publishable FAQ copy.

## Required Inputs

| Field | Requirement |
| --- | --- |
| `source_route` | Public canonical Science ContentPage route only. |
| `source_locale` | Explicit locale. Unknown stays Unknown. |
| `cms_review_state` | Must be operator-approved before schema eligibility. |
| `claim_gate_status` | Must pass SCIENCE-CONTENTPAGE-CLAIM-GATE-01. |
| `visible_faq_blocks` | Must be rendered visibly on the page before FAQPage schema is eligible. |
| `schema_enabled` | Default false until visible FAQ and review gates pass. |
| `publish_allowed` | Default false in this gate. |

## Blocked Sources

- Hidden metadata-only FAQ.
- Draft package FAQ that is not visibly rendered.
- CMS/import fields that are not projected into visible page content.
- Competitor-derived or competitor-imitating FAQ text.
- FAQ that includes diagnostic, career guarantee, official endorsement, unsupported proof, item-bank leakage, or privacy overclaim language.
- Private, tokenized, payment, order, result, share, history, or user-specific routes.

## Eligibility Rules

| Rule | Status |
| --- | --- |
| FAQPage JSON-LD must mirror visible FAQ questions and answers. | Required before runtime enablement. |
| Hidden FAQ schema stuffing is forbidden. | P0 blocked. |
| Draft-only FAQ cannot produce schema. | P0 blocked. |
| FAQ schema cannot be used to compensate for thin visible content. | P0 blocked. |
| Private URL references are forbidden. | P0 blocked. |
| Unknown values must remain Unknown. | Required. |

## Non-Expansion Statement

This PR is not a schema implementation PR. It records the gate for a later implementation decision. It does not create FAQ copy, enable FAQPage schema, publish Science ContentPages, submit URLs, widen discoverability, or amplify DailyGiving.

