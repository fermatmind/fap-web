# Core Decision Domain Claim Boundary Overlay v1

Scope: PR-CDD-04. This artifact binds Phase 3 Semantic Claim Boundary guards to the first three Core Decision Domains: `self_understanding`, `career_decision`, and `workstyle_decision`.

Execution mode: artifact / generated JSON / contract tests only. This overlay does not rewrite public copy, change claim runtime, alter result or report surfaces, change recommendation behavior, or expand SEO/GEO exposure.

## Global Rules

- Domain mapping does not create or weaken product claims.
- Domain mapping does not grant recommendation eligibility.
- Domain mapping does not grant profile write permission.
- Domain mapping does not grant SEO/GEO eligibility.
- Public copy remediation requires a separate scoped decision.
- Existing Semantic Claim Boundary artifacts remain the source boundary guards for phrase-level enforcement.

## Domain Overlays

### self_understanding

Boundary:

- no determinism
- no diagnosis
- no destiny framing
- no personality entertainment framing

Allowed framing:

- identity, preference, trait, motivation, and behavior explanation
- self-explanation and next-step exploration

Guard references:

- `docs/claims/generated/public-claim-boundary-matrix.v1.json`
- `docs/claims/generated/semantic-claim-scanner-baseline.v1.json`
- `docs/claims/generated/paywall-sensitive-profile-claim-guards.v1.json`

### career_decision

Boundary:

- no precise recommender
- no best-career prediction
- no success guarantee
- no placement guarantee
- no Big Five/RIASEC career matcher
- no AI planning claim
- no snapshot recommendation equals personalized recommender

Allowed framing:

- career direction support
- career interest direction signal
- snapshot-based direction support
- occupation authority graph and scoring/explainability substrate

Guard references:

- `docs/claims/generated/riasec-bigfive-boundary-guards.v1.json`
- `docs/claims/generated/mbti-recommendation-copy-boundary.v1.json`
- `docs/claims/generated/career-fit-graph-ai-claim-guards.v1.json`
- `docs/assessment/uasp/generated/recommendation-eligibility-guard.v1.json`

### workstyle_decision

Boundary:

- no employment suitability
- no workplace performance prediction
- no HR screening claim
- no Big Five career matching

Allowed framing:

- workstyle preference
- workplace behavior explanation
- collaboration pattern
- stress and action-pattern reflection

Guard references:

- `docs/claims/generated/riasec-bigfive-boundary-guards.v1.json`
- `docs/claims/generated/paywall-sensitive-profile-claim-guards.v1.json`

## Cross-Domain Overlays

SEO/GEO:

- no sitemap/llms/schema as true graph
- no FAQ-only as evidence ready
- no AI answerability as AI planning
- no llms-full as proof of strong citation

Profile:

- no domain mapping implies profile write
- saved careers are not UASP profile memory
- `profile_contribution` remains readiness/blocker only

Recommendation:

- MBTI remains `next_step_only` / snapshot support
- RIASEC remains `candidate_signal`, not recommender
- Big Five remains `explanation_only`, not recommender
- future scale remains `not_eligible` by default

Freemium:

- SKU exists is not `full_loop`
- offer card exists is not `full_loop`
- `backend_ready` is not monetization-ready
- domain bundle remains blocked until parity proof exists

## Non-Goals

- No copy changes.
- No claim runtime changes.
- No result/report changes.
- No recommendation runtime changes.
- No SEO/GEO changes.
- No profile writes.
- No freemium runtime changes.
