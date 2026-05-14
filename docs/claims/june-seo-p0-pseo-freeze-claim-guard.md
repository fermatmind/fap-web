# June SEO P0 pSEO Freeze + Claim Guard

Scope: PR-SEO-JUNE-06
Train: seo-june-p0-fix-train

Runtime behavior changed: no
Public copy changed: no
Route set changed: no
Sitemap exposure changed: no
llms exposure changed: no
pSEO expansion allowed: no

## Purpose

PR-SEO-JUNE-06 makes the June SEO pSEO freeze and high-risk claim boundary contract-testable before daily SEO operations. It does not add pages, generate programmatic SEO surfaces, rewrite public copy, or change recommendation/runtime logic.

## Frozen pSEO Dimensions

These dimensions remain frozen until backend/CMS authority, visible evidence requirements, manual review, claim inheritance, and sitemap/llms eligibility gates exist:

- MBTI x career pSEO.
- Big Five trait x career pSEO.
- RIASEC code x career pSEO.
- Trait x problem pSEO.
- Career recommendation pSEO.

## Blocked Claim Categories

The following public claim categories remain blocked for SEO, GEO, schema, CTA, paywall, and runtime copy unless a future approved authority contract explicitly unblocks them:

- Precise career recommendation.
- Best career.
- Guaranteed career success.
- Career success prediction.
- AI career planning.
- Big Five career matching.
- RIASEC recommender.
- MBTI personalized recommender.
- Hiring suitability.
- Diagnosis.
- Personality diagnosis.

## Allowed Boundary Language

Allowed language remains limited to bounded explanation and exploration:

- Career direction reference.
- Exploration suggestion.
- Interest signal.
- Workplace behavior tendency.
- Snapshot-based support.
- Evidence-backed explanation.

## Manual Review Queue

These phrases are inventoried for manual review only. This PR does not rewrite them because no exact approved replacements were provided:

| Phrase | Default handling |
| --- | --- |
| 岗位诊断 | manual review only |
| role-fit diagnostics | manual review only |
| 职业适配度 | manual review only |
| best career | manual review only |
| precise recommendation | manual review only |
| guarantee | manual review only |
| AI planning | manual review only |
| hiring suitability | manual review only |

## No Runtime Change Statement

This PR does not change runtime UI, content authority, public routes, sitemap enumeration, llms enumeration, scoring, profile/memory, recommendation, checkout/payment, report entitlement, or public copy. It only adds a governed artifact and contract tests that keep pSEO expansion frozen and claim-risk phrases in review.

## Repository Rule Impact

No repository rule change is required. This PR reinforces existing content authority and SEO/GEO boundaries: frontend must not create publishable content, programmatic SEO pages, recommendation claims, or sitemap/llms exposure without backend/CMS authority and explicit review gates.
