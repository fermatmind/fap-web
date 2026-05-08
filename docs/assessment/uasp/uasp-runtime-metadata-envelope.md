# UASP Runtime Metadata Envelope v1

Scope: PR-UASP2B-01

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

`uasp_signal_v1` is the read-only runtime metadata envelope for FermatMind Universal Assessment Signal Platform v1. It defines the minimum metadata shape that result/report/runtime adapters may recognize in later PRs.

This PR is contract-only. It does not inject UASP metadata into runtime payloads, change result/report UI, change API clients, change backend code, change scoring, change report entitlement, trigger SEO/GEO exposure, trigger freemium/checkout behavior, trigger recommendations, or write profile memory.

## Envelope Name

The canonical envelope key is:

`uasp_signal_v1`

## Envelope Fields

Every `uasp_signal_v1` envelope must include exactly the UASP v1 contract fields:

- `scale_code`
- `scale_slug`
- `form_code`
- `signal_type`
- `result_shape`
- `stability`
- `sensitivity`
- `decision_domains`
- `claim_level`
- `profile_contribution`
- `recommendation_eligible`
- `report_eligible`
- `seo_geo_eligible`
- `freemium_status`
- `evidence_required`
- `disclaimer_required`
- `runtime_authority_owner`
- `frontend_fallback_policy`
- `version`
- `locale_support`
- `source_authority`
- `rollback_policy`

## Read-only Rules

- The envelope is metadata only.
- The envelope must not affect scoring.
- The envelope must not affect report entitlement.
- The envelope must not trigger checkout, payment, unlock, SKU, offer card, or commerce behavior.
- The envelope must not trigger recommendation runtime.
- The envelope must not trigger sitemap, llms, llms-full, JSON-LD, FAQPage, or SEO/GEO exposure.
- The envelope must not write profile memory.
- The envelope must not persist sensitive signals.
- The envelope must not turn frontend fallback into scale authority.
- Backend/CMS authority is preferred when runtime ownership exists.
- Frontend generated artifacts are allowed only as temporary contract fixtures and must not become permanent source of truth.

## Defaults

Future, new, or unknown scale envelopes must fail closed:

- `recommendation_eligible = not_eligible`
- `seo_geo_eligible = not_eligible`
- `profile_contribution = none`
- `freemium_status = blocked`
- `claim_level = descriptive`
- `stability = unknown`
- `report_eligible = false`
- `evidence_required = true`
- `disclaimer_required = false`
- `frontend_fallback_policy = forbidden_for_new_surface`

## First Batch References

The contract references only the approved first-batch scales from `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`:

| Scale | Envelope Status | Runtime Injection |
|---|---|---|
| `MBTI` | `reference_only` | `not_injected_by_this_pr` |
| `BIG5_OCEAN` | `reference_only` | `not_injected_by_this_pr` |
| `RIASEC` | `reference_only` | `not_injected_by_this_pr` |
| `ENNEAGRAM` | `reference_only` | `not_injected_by_this_pr` |

## Boundary

This envelope makes UASP metadata readable as a contract. It does not make any scale recommendation-ready, SEO/GEO-ready, monetization-ready, or profile-memory-ready.

## Evidence

- Schema: `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`
- Existing scale registry: `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- Runtime readiness report: `docs/assessment/uasp/generated/uasp-runtime-integration-readiness-report.v1.json`
- Train state: `docs/codex/pr-train-uasp2b-state.json`

## No Runtime Change Statement

This PR adds a read-only envelope contract and tests only. It does not change application runtime, public routes, result/report payloads, visible copy, sitemap/llms output, JSON-LD output, scoring, report entitlement, checkout/payment, profile runtime, recommendation runtime, or SEO/GEO exposure.
