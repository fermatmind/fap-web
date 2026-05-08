# RIASEC / Big Five Boundary Guards

Scope: PR-SCB-02

Train: semantic-claim-boundary-enforcement-train

Runtime behavior changed: no

## Goal

PR-SCB-02 makes the RIASEC and Big Five career-claim boundary contract-testable. It prevents both scales from being described as career recommendation engines while preserving bounded, evidence-compatible language:

- RIASEC is a career interest direction signal and may be a `candidate_signal`.
- Big Five is a trait / workplace behavior explanation signal and remains `explanation_only`.

This PR does not rewrite result pages, reports, public copy, recommendation runtime, scoring, SEO/GEO exposure, or content packs.

## Guarded Claims

Forbidden RIASEC claims:

- `RIASEC 精准推荐最适合职业`
- `RIASEC 精准职业推荐`
- `RIASEC 最适合职业`
- `RIASEC 自动匹配最佳工作`
- `RIASEC precise recommender`
- `RIASEC best-career recommendation`

Forbidden Big Five claims:

- `Big Five 精准匹配职业`
- `大五人格 精准匹配职业`
- `Big Five career matcher`
- `Big Five career recommender`
- `Big Five precise career match`

Allowed bounded RIASEC references:

- `career interest direction`
- `职业兴趣方向`
- `职业探索方向`
- `candidate signal`

Allowed bounded Big Five references:

- `trait explanation`
- `workplace behavior`
- `职场行为倾向`
- `人格特质解释`

## Runtime Scan Policy

The guard scans repo-local public/runtime-adjacent source paths for exact forbidden phrases:

- `app/**`
- `components/**`
- `lib/**`
- `docs/seo/**`
- `docs/geo/**`
- `docs/freemium/**`

Fixture and guard files are excluded because they intentionally contain forbidden examples:

- `docs/claims/**`
- `tests/contracts/**`
- `docs/codex/**`

Existing soft language is inventoried, not rewritten in this PR.

## Source Evidence

- `docs/claims/generated/public-claim-boundary-matrix.v1.json`
- `docs/assessment/uasp/generated/recommendation-eligibility-guard.v1.json`
- `docs/claims/generated/semantic-claim-scanner-baseline.v1.json`

## Non-Runtime Guarantees

- RIASEC result/report runtime changed: no
- Big Five result/report runtime changed: no
- Career recommendation runtime changed: no
- SEO/GEO exposure changed: no
- Visible disclaimer/copy added: no
