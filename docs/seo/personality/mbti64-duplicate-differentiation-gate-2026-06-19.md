# MBTI64 Duplicate Differentiation Gate 01

## Summary

Decision: `PASS_FOR_MEASUREMENT_BASELINE_AND_SERP_CTR_PACKAGE`.

This is an artifact-only duplicate and differentiation audit for the MBTI64 V2.1 8-page pilot content package. It does not write CMS content, change frontend runtime, change sitemap/llms, enqueue Search Queue items, approve search release, or submit URLs.

## Inputs

| Input | Path |
| --- | --- |
| V2.1 package | `docs/seo/personality/content-packages/pilot-v2.1/mbti64-content-package-pilot-v2.1.json` |
| V2.1 QA | `docs/seo/personality/content-package-v21-qa-2026-06-18.json` |
| Trademark/claim gate | `docs/seo/personality/mbti64-trademark-claim-gate-2026-06-19.json` |

## Method

The gate extracts text from `seo`, `content`, and `faq`, excluding route safety metadata, QA flags, and internal-link boilerplate. It tokenizes Latin words and CJK characters, builds 5-gram shingles, and computes Jaccard similarity for page pairs.

| Threshold | Meaning |
| --- | --- |
| `>= 0.15` | blocker |
| `>= 0.10` | review |
| `< 0.10` | pass |

## Coverage

| Metric | Count |
| --- | ---: |
| Pilot rows | 8 |
| Variant rows | 6 |
| Comparison rows | 2 |
| English rows | 4 |
| Chinese rows | 4 |

## Top Similarity Pairs

| Pair | Type | 5-gram Jaccard | Decision |
| --- | --- | ---: | --- |
| `/zh/personality/intj-a` vs `/zh/personality/intj-t` | variant / variant | 0.0679 | pass |
| `/en/personality/intj-a` vs `/en/personality/intj-t` | variant / variant | 0.0356 | pass |
| `/zh/personality/infp-t` vs `/zh/personality/intj-t` | variant / variant | 0.0275 | pass |
| `/zh/personality/istj-a` vs `/zh/personality/intj-a` | variant / variant | 0.0254 | pass |
| `/en/personality/intj-a-vs-intj-t` vs `/en/personality/intp-a-vs-intp-t` | comparison / comparison | 0.0027 | pass |

The highest pair is below the review threshold. No page pair is close to the blocker threshold.

## Differentiation Findings

| URL | Finding |
| --- | --- |
| `/en/personality/intj-a-vs-intj-t` | Architect-specific decision confidence, critique handling, strategic autonomy, and over-review patterns distinguish this from a generic A/T comparison. |
| `/en/personality/intp-a-vs-intp-t` | Logician-specific uncertainty tolerance, model revision, caveat-heavy communication, and prototype-versus-refinement patterns distinguish this from the INTJ comparison. |
| `/en/personality/intj-a` | Decision ownership, confidence calibration, system adoption, and emotional legibility distinguish INTJ-A from INTJ-T. |
| `/en/personality/intj-t` | Risk scanning, self-review, over-review, and pressure refinement distinguish INTJ-T from INTJ-A. |
| `/zh/personality/intj-a` | 战略模型、决策闭合、沟通采纳和中文职场中的独立负责区分 INTJ-A 与 INTJ-T。 |
| `/zh/personality/intj-t` | 高标准、风险扫描、自我审视和防止完美主义阻碍行动的内容区分 INTJ-T 与 INTJ-A。 |
| `/zh/personality/istj-a` | 责任闭环、验收标准、流程稳定性和中文职场沟通场景使 ISTJ-A 与 INTJ/INFP pilot 页面明显区分。 |
| `/zh/personality/infp-t` | 价值感、关系敏感度、自我审视、创作压力和边界问题使 INFP-T 与其他中文 pilot 页面明显区分。 |

## Module Depth

| Page type | Content sections | FAQ items | Decision |
| --- | ---: | ---: | --- |
| Comparison | 7 | 7 | pass |
| Variant | 9 | 7 | pass |

Variant pages intentionally share a common section taxonomy. This is acceptable because the body copy and `information_gain` differ. Future GPT batches should keep measuring body-level similarity, not section-key overlap.

## Warnings

- SERP titles should be handled separately in `MBTI64-SERP-SNIPPET-CTR-PACKAGE-01` because the live closure spot check observed duplicated brand suffixes.
- Keep this similarity gate in future batch runs; do not rely only on template section counts.

## Blockers

None.

## Side Effect Boundary

| Action | Performed by this PR |
| --- | --- |
| CMS write | No |
| Frontend runtime change | No |
| Sitemap change | No |
| `llms` / `llms-full` change | No |
| Search Queue enqueue | No |
| Search approval | No |
| Search submit | No |

## Next

Proceed to `MBTI64-SEO-MEASUREMENT-COHORT-01` and keep `MBTI64-SERP-SNIPPET-CTR-PACKAGE-01` as the follow-up for title/description CTR repair.
