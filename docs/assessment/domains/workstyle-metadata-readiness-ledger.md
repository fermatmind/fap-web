# Workstyle Metadata Readiness Ledger

Scope: `PR-4B-05`

Train: `domain-runtime-metadata-integration-train`

Runtime behavior changed: no.

## Purpose

This ledger defines metadata readiness for `workstyle_decision` as a contract-only domain. It does not create a workstyle public page, route, visible copy, CTA, recommendation trigger, profile write, freemium bundle, report entitlement change, SEO/GEO exposure, checkout/payment change, or scoring change.

## Runtime Position

`workstyle_decision` remains `artifact_only`. Phase 4B recommends `data_attribute_only` readiness, but all data attributes remain deferred until a backend/CMS payload-backed metadata source exists. This PR is metadata readiness only and contract-only.

## Signal Roles

| Signal | Workstyle role | Boundary |
| --- | --- | --- |
| `BIG5_OCEAN` | `primary` | Trait/workstyle explanation only; not employment suitability. |
| `MBTI` | `secondary` | Identity/preference explanation only; not workplace performance. |
| `ENNEAGRAM` | `supporting` | Motivation/team-pattern explanation only; not HR screening. |
| `RIASEC` | `blocked` | Cannot enter workstyle_decision. |
| `future_DISC` | `future` | Future only; not ready for metadata or runtime. |
| `future_EQ` | `future` | Future only; not ready for metadata or runtime. |
| `future_career_values` | `blocked` | Cannot enter workstyle_decision. |
| `future_ability_tests` | `blocked` | Cannot enter workstyle_decision. |

## Deferred Data Attributes

These attributes are reserved for future payload-backed integration only:

- `data-domain-id`
- `data-domain-role`
- `data-domain-envelope-state`

They must not be added from frontend artifact inference. They may only be rendered when a backend/CMS/runtime payload carries the domain envelope.

## Existing Surface Candidates

There is no existing workstyle public module, page, or route. Workstyle-domain metadata may only be recognized passively on existing result/report surfaces where Big Five, MBTI, or Enneagram payloads already exist. No visible workstyle copy or badge may be added.

## Guard Rules

- No workstyle public module.
- No workstyle public page.
- No workstyle public route.
- No `/decision/*` or `/domains/*` route.
- No visible workstyle copy.
- No visible workstyle badge.
- No workplace performance prediction.
- No employment suitability claim.
- No HR screening claim.
- No Big Five career matching.
- No new CTA.
- No CTA copy change.
- No SEO/GEO expansion.
- No sitemap, llms, or llms-full URL set change.
- No result/report layout change.
- No recommendation trigger.
- No profile write.
- No freemium domain bundle.
- No report entitlement change.
- No checkout/payment change.
- No scoring change.
- Data attributes deferred until payload-backed metadata exists.
- Frontend fallback must not become domain authority.

## Claim Boundaries

- No employment suitability.
- No workplace performance prediction.
- No HR screening claim.
- No Big Five career matching.
- No precise workplace recommendation.
- No team placement guarantee.
- No leadership prediction.
- No communication style diagnosis.

## No Runtime Change Statement

This PR is contract-only. It does not modify result/report runtime, personality surfaces, test surfaces, career surfaces, CTA runtime, recommendation runtime, profile runtime, freemium runtime, checkout/payment, entitlement, SEO/GEO output, sitemap/llms generation, or scoring logic.
