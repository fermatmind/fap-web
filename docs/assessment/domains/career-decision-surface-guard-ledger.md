# Career Decision Existing Surface Guard Ledger

Scope: `PR-4B-04`

Train: `domain-runtime-metadata-integration-train`

Runtime behavior changed: no.

## Purpose

This ledger defines how `career_decision` may be recognized only as an existing-surface guard. It does not create a Career Decision runtime, recommender, page, CTA, graph expansion, SEO/GEO exposure, freemium bundle, profile write, report entitlement change, checkout/payment change, or scoring change.

## Runtime Position

`career_decision` remains `dangerous_if_integrated`. Phase 4B allows only `existing_cta_guard_only` ledger coverage for existing career and result/report surfaces.

## Existing Surface Coverage

| Surface | Route family | Guard policy |
| --- | --- | --- |
| Career job detail | `/career/jobs/[slug]` | Career Graph is evidence substrate only, not a full semantic recommender. |
| MBTI career recommendation | `/career/recommendations/mbti/[type]` | Snapshot-based direction support only, not live personalized recommender. |
| Result/report career-adjacent surfaces | `/result/[id]` | No domain trigger, no recommendation trigger, no visible copy change. |
| RIASEC result/report | `/result/[id]` | RIASEC remains candidate signal, not recommender. |

## Signal Guard Roles

| Signal | Role | Recommendation boundary |
| --- | --- | --- |
| `RIASEC` | `primary` | `candidate_signal`, not recommender. |
| `MBTI` | `supporting` | `next_step_only` / snapshot support. |
| `BIG5_OCEAN` | `supporting` | `explanation_only`, not career matcher. |
| `Career Graph` | `supporting` | Evidence substrate, not full semantic recommender. |

## Guard Rules

- Career Decision does not trigger recommendation runtime.
- RIASEC does not become recommender.
- Big Five does not become career matcher.
- MBTI snapshot does not become personalized recommender.
- Career fit does not guarantee success or placement.
- No AI planning claim.
- No best-career prediction.
- No new Career Decision page.
- No new CTA runtime.
- No graph edge expansion.
- No companion link change.
- No SEO/GEO exposure change.

## No Runtime Change Statement

This PR does not modify career recommendation pages, career job pages, scoring, recommendation bundles, companion links, graph edges, CTA copy, SEO/GEO output, profile, freemium, checkout, payment, entitlement, report, or result runtime.
