# Public Claim Runtime Boundary Matrix

Train: public-runtime-authority-convergence-train
Scope: PR-PRAC-04
Runtime behavior changed: no

This artifact locks the public claim boundary for PRAC. It does not change public copy, recommendation runtime, report paywall, SEO/GEO output, or page rendering.

## Claim Status Enum

- `allowed`
- `soft_allowed`
- `needs_disclaimer`
- `internal_only`
- `forbidden`

## Baseline Boundary

| Claim area | Claim boundary | Status |
| --- | --- | --- |
| RIASEC claims | RIASEC describes career interest direction. It is not a precise best-career recommender. | `allowed` / `forbidden` |
| Big Five claims | Big Five explains trait and workplace behavior tendencies. It is not a precise career matching engine. | `allowed` / `forbidden` |
| MBTI claims | MBTI describes preference, expression style, and identity language. | `allowed` |
| Career Graph claims | Career Graph may describe occupation structure, tasks, skills, score components, and evidence when backend claim permissions allow it. | `allowed` |
| Career Recommendation claims | MBTI career recommendation is snapshot-based direction support, not a live personalized recommender. | `soft_allowed` / `forbidden` |
| Career Fit claims | Fit scores are decision support and must not be framed as hiring, income, success, or placement guarantees. | `needs_disclaimer` / `forbidden` |
| Report claims | Report value may describe unlocked report surfaces and retained access, but not guaranteed life or career outcomes. | `needs_disclaimer` |
| AI/GEO answer claims | GEO readiness means visible evidence and answerability, not AI-precise career planning. | `allowed` / `forbidden` |
| Paywall / report value claims | Paywall copy must describe access and modules, not outcome guarantees. | `needs_disclaimer` |

## Explicitly Forbidden Claims

- RIASEC 精准推荐最适合职业
- Big Five 精准匹配职业
- AI 精准职业规划
- career fit score 等于录用/成功保证
- snapshot recommendation 等于 personalized recommender
- sitemap/llms/schema 等于真实 graph
- frontend local ranking 等于 recommendation engine

## Allowed With Boundary

- RIASEC describes career interest direction.
- Big Five explains workplace behavior.
- MBTI describes preference, expression, and identity.
- Career Graph uses occupation structure, tasks, skills, and evidence for scoring when backend claim permissions allow it.
- MBTI career recommendation is snapshot-based career direction support, not a live personalized recommender.

## No Runtime Change Statement

This PR creates a governance matrix and contract test only. Existing runtime strings are not edited, generated discoverability output is not widened, and recommendation behavior is unchanged.

## Current Evidence Remediation

`PUBLIC-STABILITY-WEB-09` removed the frontend-authored public test catalog seed. The frozen PR-PRAC-04 JSON remains unchanged as historical evidence, while the current contract maps `riasec_interest_direction` to the backend catalog normalization boundary in `lib/content.ts` and requires the former RIASEC seed copy to stay absent from runtime source.
