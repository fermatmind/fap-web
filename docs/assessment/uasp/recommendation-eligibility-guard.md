# UASP Recommendation Eligibility Guard v1

Scope: PR-UASP2B-05

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

This guard makes `recommendation_eligible` enforceable as a contract. It prevents UASP signals from being treated as generalized recommender inputs without explicit evidence, graph, claim, and runtime proof.

This PR is contract-only. It does not change recommendation runtime, career recommendation bundles, scoring, graph edges, companion links, local recommendation logic, visible recommendation copy, or result/report behavior.

## Guard Rules

- `not_eligible` remains the default for future scales.
- `next_step_only` may support bounded next-step direction, not live personalization.
- `explanation_only` may explain a result, but cannot drive recommendation ranking.
- `candidate_signal` is not a recommender.
- `eligible_with_guard` requires explicit visible evidence, graph/backend runtime, claim boundary, explainability, and public runtime consumer proof.
- Frontend local ranking is forbidden as recommendation authority.
- Snapshot recommendation must not be described as live personalized recommendation.

## First Batch Status

| Scale | UASP `recommendation_eligible` | Guard status | Boundary |
|---|---|---|---|
| `MBTI` | `next_step_only` | `snapshot_next_step_support` | MBTI can support snapshot-based career direction, not live personalized recommendation. |
| `BIG5_OCEAN` | `explanation_only` | `not_recommender` | Big Five can explain trait/workplace behavior, not directly match careers. |
| `RIASEC` | `candidate_signal` | `candidate_signal_not_recommender` | RIASEC can describe career interest direction, not precise best-career recommendation. |
| `ENNEAGRAM` | `explanation_only` | `not_recommender` | Enneagram can explain motivation patterns and should not enter career recommendation mainline. |
| `FUTURE_SCALE_PLACEHOLDER` | `not_eligible` | `blocked_until_guard_proof` | Future scales default to no recommendation eligibility. |

## Required Proof For `eligible_with_guard`

A scale cannot be marked `eligible_with_guard` unless every proof is present:

- visible evidence
- graph or backend recommendation runtime
- claim boundary
- explainability
- public runtime consumer
- no forbidden claim
- human approval for sensitive signals

## Evidence

- UASP registry: `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- UASP eligibility guards: `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`
- Public claim boundary matrix: `docs/claims/generated/public-claim-boundary-matrix.v1.json`
- Fallback owner gates: `docs/runtime/generated/fallback-owner-gates.v1.json`
- MBTI career snapshot boundary: `tests/contracts/career-recommendation-index-backend.contract.test.tsx`
- Local recommendation placeholder boundary: `tests/contracts/career-recommendation-engine.contract.test.ts`

## No Runtime Change Statement

This PR adds recommendation eligibility guard artifacts and tests only. It does not change recommendation runtime, career recommendation bundles, scoring, graph edges, companion links, local recommendation logic, visible recommendation copy, result/report behavior, or SEO/GEO exposure.
