# Existing Scale Signal Mapping v1

Scope: PR-UASP-02

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

## Purpose

This artifact maps the first batch of existing FermatMind scales into the UASP v1 signal contract. It is registry/documentation/contract only. It does not add tests, change public catalog behavior, change scoring, change reports, change freemium behavior, change recommendation behavior, or change SEO/GEO exposure.

## First Batch Scales

Only these scales are mapped as UASP v1 first batch signal sources:

- `MBTI`
- `BIG5_OCEAN`
- `RIASEC`
- `ENNEAGRAM`

## Mapping Summary

| Scale | Signal Type | Result Shape | Claim Level | Recommendation Eligibility | SEO/GEO Eligibility | Freemium Status |
|---|---|---|---|---|---|---|
| `MBTI` | `identity` | `type` | `directional` | `next_step_only` | `llms_eligible` | `full_loop` |
| `BIG5_OCEAN` | `trait` | `facet_vector` | `interpretive` | `explanation_only` | `geo_candidate` | `frontend_partial` |
| `RIASEC` | `interest` | `vector` | `directional` | `candidate_signal` | `geo_candidate` | `frontend_partial` |
| `ENNEAGRAM` | `motivation` | `type` | `interpretive` | `explanation_only` | `seo_only` | `backend_ready` |

## Boundaries

### MBTI

Can describe preference, expression style, identity, and career-direction support.

Cannot predict career success. Cannot claim precise career recommendation.

### Big Five

Can explain behavior and workplace style.

Cannot directly match careers. Cannot claim Big Five precise career recommendation.

### RIASEC

Can describe career interest direction. Can be a candidate signal for career decision support.

Cannot claim full career recommendation runtime. Cannot claim precise best-career recommendation.

### Enneagram

Can explain motivation and relationship/workstyle patterns.

Should not enter career recommendation mainline.

## Optional Non-MVP Examples

Non-MVP examples may be documented as blocked or partial evidence examples only. They are not part of the first batch and are not onboarded by this train:

- SDS / Clinical: mental-health-sensitive state signal, private/noindex, not recommendation eligible.
- IQ / Raven demo: ability-sensitive ability estimate, not a human-worth or employment-suitability claim.

## No Runtime Change Statement

This PR adds UASP v1 signal mapping artifacts for existing scales only. It does not change runtime behavior, public catalog entries, scoring, report entitlement, checkout/payment, profile runtime, recommendation runtime, sitemap/llms output, or SEO/GEO exposure.
