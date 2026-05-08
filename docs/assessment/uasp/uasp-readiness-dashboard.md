# UASP Readiness Dashboard

Scope: PR-UASP-06

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

This dashboard is the Universal Assessment Signal Platform v1 onboarding checkpoint. It consolidates the signal contract schema, first-batch scale mapping, decision domain registry, eligibility guards, and profile/sensitivity policy into one readiness matrix. It does not onboard future scales, change public catalog behavior, change SEO/GEO exposure, change freemium runtime, change recommendation runtime, or change profile runtime.

## Source Artifacts

- `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`
- `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- `docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json`
- `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`
- `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`

## Readiness Dimensions

- `signal_contract_ready`
- `decision_domain_ready`
- `claim_boundary_ready`
- `evidence_ready`
- `report_value_ready`
- `profile_policy_ready`
- `recommendation_eligibility_ready`
- `seo_geo_eligibility_ready`
- `freemium_ready`
- `runtime_authority_ready`
- `fallback_policy_ready`

Allowed readiness statuses:

- `ready`
- `partial`
- `blocked`
- `not_applicable`
- `requires_human_decision`
- `unknown`

## First-Batch Status

| Scale | Overall | Signal | Recommendation | SEO/GEO | Freemium | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `MBTI` | `ready` | identity/type | next-step only | llms eligible | full loop | Directional support only; no career-success prediction. |
| `BIG5_OCEAN` | `partial` | trait/facet vector | explanation only | GEO candidate | frontend partial | Workplace behavior signal, not career recommender. |
| `RIASEC` | `partial` | interest/vector | candidate signal | GEO candidate | frontend partial | Career interest signal, not precise best-career recommender. |
| `ENNEAGRAM` | `partial` | motivation/type | explanation only | SEO only | backend ready | Sensitive summary-only profile policy. |

## Blocked / Non-MVP Examples

| Scale | Overall | Reason |
| --- | --- | --- |
| `SDS20` | `blocked` | Mental-health-sensitive example only; not onboarded. |
| `CLINICAL_COMBO_68` | `blocked` | Mental-health-sensitive example only; not onboarded. |
| `EQ_60` | `requires_human_decision` | Known placeholder requires approved UASP mapping before readiness. |
| `IQ_RAVEN` | `partial` | Ability-sensitive example only; not first-batch and not monetization-ready. |
| `FUTURE_SCALE_PLACEHOLDER` | `blocked` | Future scales remain blocked until every UASP onboarding gate has evidence. |

## Future Scale Onboarding Gates

Every future scale must pass:

- signal gate
- decision domain gate
- claim boundary gate
- evidence gate
- report value gate
- profile contribution gate
- graph edge gate
- SEO/GEO gate
- sensitivity gate
- runtime authority gate
- fallback policy gate
- freemium parity gate

## Locked Rules

- Future scales cannot be marked `ready` without all required gate evidence.
- Future scales cannot be monetization-ready without freemium parity proof.
- Offer card existence is not proof of a full commerce loop.
- Backend SKU existence is not proof of public funnel readiness.
- Big Five must not be marked as a career recommender.
- RIASEC must not be marked as a precise career recommender.
- `career_decision` domain mapping does not grant recommendation eligibility.
- Frontend fallback cannot become scale authority.

## No Runtime Change Statement

This PR is a dashboard/report artifact only. It does not onboard future scales, change runtime, change catalog, change SEO/GEO, change freemium, or change recommendation behavior.
