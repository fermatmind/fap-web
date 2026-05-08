# Career Fit / Graph / AI Claim Guards

Scope: PR-SCB-04

Train: semantic-claim-boundary-enforcement-train

Runtime behavior changed: no

## Goal

PR-SCB-04 locks claim boundaries for career fit, confidence, graph language, AI planning language, and the manual-decision phrase `岗位诊断` / `role-fit diagnostics`.

This PR is contract guard plus manual-decision enforcement only. It does not change career scoring, explainability panels, graph runtime, AI/GEO runtime, public copy, or public features.

## Forbidden Claims

Career fit:

- `fit score guarantees success`
- `职业适配分保证成功`
- `录用保证`
- `就业成功保证`
- `placement guarantee`
- `career success guarantee`

Confidence:

- `confidence means certainty`
- `置信度等于保证`
- `置信度保证结果正确`

Graph:

- `sitemap/llms/schema = true graph`
- `完整语义知识图谱`
- `fully proven semantic KG`

AI:

- `AI 精准职业规划`
- `AI 自动规划职业人生`
- `AI guarantees career plan`

## Manual Review Terms

`岗位诊断` and `role-fit diagnostics` are not approved public-primary phrases. If present, they are classified as `needs_disclaimer` or `manual_review`, not auto-remediated in this PR.

Known evidence:

- `lib/marketing/socialProof.ts` contains `role-fit diagnostics` and `岗位诊断`.

Preferred alternatives remain:

- `岗位适配分析`
- `职业方向分析`
- `职业适配参考`
- `岗位匹配参考`
- `职业探索建议`

## Allowed With Boundary

- fit = exploration signal
- confidence = data completeness / trust signal
- graph = backend occupation authority graph / scoring substrate
- AI/GEO = answerability / discoverability surface, not AI planning

## Non-Runtime Guarantees

- Career scoring changed: no
- Explainability panels changed: no
- Graph runtime changed: no
- AI/GEO runtime changed: no
- Public copy changed: no
- AI planning features added: no
