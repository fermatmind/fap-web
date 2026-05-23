# Semantic Claim Scanner Baseline

Scope: `PR-SCB-01`
Train: `semantic-claim-boundary-enforcement-train`
Runtime behavior changed: no

This artifact establishes the Phase 3 scanner baseline for Semantic Claim Boundary Enforcement. It records phrase fixtures, scanner categories, scan scope, manual decision inputs, and external evidence policy. It does not rewrite public copy, change runtime behavior, change SEO/GEO exposure, change scoring, change recommendations, change report entitlement, change checkout/payment, or write profile/memory.

## Manual Decision Source

The scanner baseline encodes the approved decisions from:

- `<external-evidence>/semantic_claim_boundary_manual_decisions_v1.md`
- `<external-evidence>/semantic_claim_boundary_manual_decisions_v1.json`

The source files stay outside the repository. The repository-local canonical artifact is:

- `docs/claims/generated/semantic-claim-scanner-baseline.v1.json`

## Scanner Categories

Only these scanner categories are allowed:

- `forbidden`
- `soft_boundary`
- `needs_disclaimer`
- `allowed_reference`
- `manual_review`

If a phrase or finding does not fit these categories, it must be recorded as `manual_review`. Do not invent new scanner categories.

## Claim Status Enum

Only these claim statuses are allowed:

- `allowed`
- `soft_allowed`
- `needs_disclaimer`
- `internal_only`
- `forbidden`
- `unknown`

## Scan Scope

Repository-local scanner scope:

- `app/**`
- `components/**`
- `lib/**`
- `docs/seo/**`
- `docs/geo/**`
- `docs/freemium/**`

Optional/external evidence scope when present locally:

- `<workspace>/fap-api/content_packages/**`
- `<workspace>/fap-api/backend/content_packs/**`
- `<workspace>/fap-api/backend/content_baselines/**`

External paths are evidence-only. CI must not fail because a sibling `fap-api` checkout is absent.

## Ignored / Generated File Policy

The scanner baseline may inventory generated files, but contracts must avoid treating scanner fixture files themselves as public claim sources. The scanner should not fail on:

- `docs/claims/**`
- `tests/contracts/**`
- `docs/codex/**`
- generated artifacts that exist only to encode forbidden examples

Runtime/public source scans must focus on claim-bearing product surfaces and CMS/content baselines, not the guard files that intentionally contain forbidden examples.

## Manual Decisions Encoded

### `岗位诊断`

Public primary usage is not allowed by default. Public usage is `needs_disclaimer` unless explicitly bounded as exploratory / structured reference. If paired with `精准`, `成功`, `保证`, `录用`, `诊断证明`, or `AI 精准`, it is `forbidden`.

Preferred alternatives:

- `岗位适配分析`
- `职业方向分析`
- `职业适配参考`
- `岗位匹配参考`
- `职业探索建议`

### `职业匹配`

`职业匹配` is `soft_allowed` only when it means reference, exploration, or direction. `精准职业匹配`, `最适合职业匹配`, and `职业成功匹配` are `forbidden`.

### `match best` / `高匹配方向`

`match best`, `best career`, `最佳职业`, and `最适合职业` are `forbidden` unless clearly internal/non-public. `高匹配方向` is `needs_disclaimer` and requires a boundary such as: `这是方向参考，不代表职业成功预测。`

### `guarantee` / `保证` / `保障`

Guarantee language is allowed only for access, delivery, continuity, or payment fulfillment. It is forbidden for outcome, accuracy, career success, report conclusions, placement, or recommendation certainty.

## No Runtime Change Statement

PR-SCB-01 is scanner/fixture/contract only. Existing soft-boundary phrases are inventoried, not remediated. Runtime copy, CMS content, scoring, recommendation, report entitlement, checkout/payment, profile/memory, sitemap, `llms.txt`, `llms-full.txt`, and JSON-LD output are unchanged.
