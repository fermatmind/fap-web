# Decision Domain Runtime Metadata Envelope v1

Scope: `PR-4B-01`

Train: `domain-runtime-metadata-integration-train`

Runtime behavior changed: no.

## Purpose

`decision_domain_v1` defines a read-only metadata envelope for the first three FermatMind core decision domains:

- `self_understanding`
- `career_decision`
- `workstyle_decision`

The envelope makes domain metadata readable and guardable before any user-visible runtime integration. It does not create a page, route, CTA, recommendation trigger, profile write, SEO/GEO exposure, freemium behavior, report entitlement, checkout flow, or scoring behavior.

## Envelope Fields

- `domain_id`
- `domain_role`
- `user_problem`
- `signal_roles`
- `claim_boundary`
- `evidence_requirement`
- `cta_policy`
- `report_value_status`
- `seo_geo_policy`
- `profile_policy`
- `runtime_recommendation`
- `runtime_status`
- `readiness_status`
- `version`
- `source_authority`
- `frontend_fallback_policy`
- `rollback_policy`

## Runtime Recommendations

| Domain | Runtime readiness | Runtime recommendation | Decision |
| --- | --- | --- | --- |
| `self_understanding` | `partial` | `existing_result_report_only` | First candidate for minimal metadata integration on existing result/report/personality/topic/test surfaces. |
| `career_decision` | `dangerous_if_integrated` | `existing_cta_guard_only` | Guard ledger only; no generalized runtime and no recommender trigger. |
| `workstyle_decision` | `artifact_only` | `data_attribute_only` | Metadata readiness only; no visible module. |

## Read-only Rules

- Metadata only.
- No new domain hub page.
- No new public route.
- No `/decision/*` or `/domains/*` route.
- No visible domain badge.
- No visible copy.
- No runtime CTA.
- No recommendation trigger.
- No profile write.
- No saved careers promotion.
- No SEO/GEO exposure change.
- No sitemap or llms URL set change.
- No freemium, paywall, checkout, report entitlement, or scoring change.
- Frontend artifact must not become runtime truth.

## Source Authority

The envelope is backend/CMS/artifact-governed. Until a backend/CMS runtime source exists, generated artifacts are allowed only as contract fixtures and readiness ledgers. Frontend fallback is forbidden as permanent domain authority.

## Domain Boundaries

### Self-understanding

- No determinism.
- No diagnosis.
- No destiny framing.
- No personality entertainment framing.

### Career Decision

- No precise recommender.
- No best-career prediction.
- No success or placement guarantee.
- No Big Five/RIASEC career matcher.
- No AI planning claim.
- No snapshot recommendation equals personalized recommender.

### Workstyle Decision

- No employment suitability.
- No workplace performance prediction.
- No HR screening claim.
- No Big Five career matching.

## No Runtime Change Statement

This PR is contract-only. It does not import the envelope into `app/`, `components/`, or runtime `lib/` code. It does not add data attributes, routes, pages, copy, CTAs, SEO/GEO output, recommendation behavior, profile writes, freemium behavior, payment behavior, report entitlement, or scoring logic.
