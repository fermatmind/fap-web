# Result / Report Domain Metadata Guard

Scope: `PR-4B-02`

Train: `domain-runtime-metadata-integration-train`

Runtime behavior changed: no.

## Purpose

This guard defines how result/report surfaces may recognize `decision_domain_v1` metadata without changing user-visible copy, layout, entitlement, recommendation, profile, SEO/GEO, freemium, checkout, payment, or scoring behavior.

## Runtime Payload Status

The current runtime payload does not yet carry a payload-backed `decision_domain_v1` envelope. Therefore this PR is contract-only and all proposed result/report data attributes remain deferred.

## Deferred Data Attributes

These attributes are reserved for future payload-backed integration only:

- `data-domain-id`
- `data-domain-role`
- `data-domain-envelope-state`

They must not be added from frontend artifact inference. They may only be rendered when a backend/CMS/runtime payload carries the domain envelope.

## Covered Surfaces

- Result/report page: `/result/[id]`
- MBTI result/report
- Big Five result/report
- Enneagram result/report
- RIASEC result/report
- Private/noindex result context

## Guard Rules

- No visible signal/domain badge.
- No translated copy.
- No result/report layout change.
- No report prose change.
- No paywall copy change.
- No entitlement change.
- No profile write.
- No recommendation trigger.
- No SEO/GEO exposure change.
- No metadata synthesis from frontend artifacts as runtime authority.

## Domain Scope

| Domain | Result/report status | Runtime recommendation |
| --- | --- | --- |
| `self_understanding` | `partial` | `existing_result_report_only` |
| `career_decision` | `dangerous_if_integrated` | `existing_cta_guard_only` |
| `workstyle_decision` | `artifact_only` | `data_attribute_only` |

## No Runtime Change Statement

This PR does not touch `app/`, `components/`, runtime adapters, payload readers, result shells, report shells, paywall components, PDF components, or API clients.
