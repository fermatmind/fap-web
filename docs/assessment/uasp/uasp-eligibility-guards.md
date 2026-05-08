# UASP Eligibility Guards v1

Scope: PR-UASP-04

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

## Purpose

This artifact turns UASP claim, recommendation, SEO/GEO, and freemium eligibility into contract gates. It does not change public copy, runtime claims, recommendation runtime, SEO/GEO output, freemium runtime, payment, or report access.

## Default Guards

- `recommendation_eligible` defaults to `not_eligible`.
- `seo_geo_eligible` defaults to `not_eligible`.
- `freemium_status` defaults to `blocked`.
- `claim_level` defaults to `descriptive`.

## Claim Guards

- Forbidden claims remain forbidden.
- A scale claim level cannot exceed its approved UASP boundary.
- RIASEC precise career recommender remains forbidden.
- Big Five career matching remains forbidden.
- AI precise career planning remains forbidden.

## Recommendation Guards

- `candidate_signal` does not equal recommender.
- `eligible_with_guard` requires evidence, graph, claim, and runtime proof.
- Frontend local ranking is forbidden as recommendation authority.

Plain-language lock: candidate_signal does not equal recommender.

## SEO/GEO Guards

- `llms_full_eligible` requires visible evidence, claim boundary, and source authority.
- Sensitive/private scales cannot be `llms_full_eligible` by default.

## Freemium Guards

- `full_loop` requires freemium parity proof.
- An offer card is not proof of full loop.
- A backend SKU is not proof of public funnel.

## No Runtime Change Statement

This PR adds eligibility guard artifacts and contracts only. It does not change public copy, runtime claims, recommendations, SEO/GEO output, freemium behavior, payment, report access, sitemap, or llms output.
