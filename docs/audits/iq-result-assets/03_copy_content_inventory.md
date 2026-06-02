# IQ Copy / Content Asset Inventory

Generated: 2026-06-02T17:03:49Z

| Copy asset | Locale | File | Context | Quality | Recommended use | Owner boundary | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 测评结果 / Assessment result | zh/en | `components/result/iq/IqResultShell.tsx` | result summary eyebrow | usable_basic | reuse but redesign hierarchy | frontend label okay; long explanatory copy should be backend/CMS owned | low |
| IQ 估计值 / IQ estimate | zh/en | `components/result/iq/IqResultShell.tsx` | overall score metric label | usable_basic | use in hero score section | frontend label okay; score value backend-owned | must not imply certified IQ without norm authority |
| 当前结果暂未生成完整 IQ 估计值 / The IQ estimate is not available for this result yet | zh/en | `components/result/iq/IqResultShell.tsx` | null iq_estimate state | safe | reuse as norm/scoring unavailable fallback | frontend fallback okay | low |
| 原始分 / Raw score | zh/en | `components/result/iq/IqResultShell.tsx` | summary and dimension metric label | usable | retain but explain relationship to IQ estimate | frontend label okay | raw score can confuse users without scale explanation |
| 百分位 / Percentile | zh/en | `components/result/iq/IqResultShell.tsx` | summary and dimension metric label | usable | pair with CI and norm authority explanation | backend value and eligibility; frontend label | claim gated |
| 置信区间 / Confidence interval | zh/en | `components/result/iq/IqResultShell.tsx` | summary metric label | usable | needs explanation card | backend value; explanatory copy CMS/backend reviewed | claim gated |
| 结果质量 / Quality level; 质量标记 / Quality flags | zh/en | `components/result/iq/IqResultShell.tsx` | quality display | safe but technical | translate into user-readable reliability section | backend flags; frontend explanatory mapping can be product code if fixed | avoid hiding beta/norm pending flags |
| 稳定性状态 / Stability status; 稳定性说明 / Stability note | zh/en | `components/result/iq/IqResultShell.tsx` | stability display | safe but technical | make reliability section | backend status/reason | must not override backend caution |
| 视觉空间洞察 / Visual-Spatial Insight | zh/en | `lib/iq/result.ts` | VSI dimension label | required target dimension | primary dimension deep-dive section | label can stay frontend; dimension interpretation backend/report owned | low |
| 视觉空间模式推理 / Visual-Spatial Pattern Reasoning | zh/en | `lib/iq/result.ts` | VSPR dimension label | required target dimension | primary dimension deep-dive section | label can stay frontend; interpretation backend/report owned | low |
| 数字规律推理 / Numerical Pattern Reasoning | zh/en | `lib/iq/result.ts` | NPR dimension label | required target dimension | primary dimension deep-dive section | label can stay frontend; interpretation backend/report owned | low |
| 本结果是在线认知能力估测，不是临床诊断。请结合置信区间和作答质量理解结果。 / This result is an online cognitive ability estimate, not a clinical diagnosis. Interpret it together with the confidence interval and response quality. | zh/en | `lib/iq/result.ts` | method boundary copy | safe | reuse but move into more visible boundary card | reviewed method-boundary content should eventually be backend/CMS authority | important claim-safety guard |
| 各维度结果描述的是本次测验中的表现结构，不代表全部能力。 / Dimension results describe the structure of performance in this test, not total human ability. | zh/en | `lib/iq/result.ts` | interpretation boundary copy | safe | reuse in reliability/method section | reviewed content should eventually be backend/CMS authority | important claim-safety guard |
| 详细报告内容暂未开放。 / Detailed report content is not available yet. | zh/en | `lib/iq/result.ts` | paid report missing sections | safe placeholder | replace with backend-owned teaser once report content exists | backend/report/CMS should own full narrative | low |
| PDF 报告能力已生成，但当前前端版本暂不支持下载。 / A PDF report payload is available, but this frontend version does not support downloads yet. | zh/en | `lib/iq/result.ts` | PDF placeholder | safe placeholder | retain until download flow PR | backend owns payload; frontend owns download UI after gate | delivery deferred |
| 证书能力已生成，但当前前端版本暂不支持下载。 / A certificate payload is available, but this frontend version does not support downloads yet. | zh/en | `lib/iq/result.ts` | certificate placeholder | safe placeholder | retain until certificate claim policy and delivery PR | backend owns payload/claim eligibility | certificate can overclaim if ungated |

## Content ownership notes

- Short UI labels can stay in frontend product code.
- Long educational explanations, score-distribution copy, dimension interpretation, band definitions, and paid report narratives should be backend/report or CMS authority.
- Frontend must not invent score interpretation, percentile meaning, norm claims, certificate claims, or paid report body copy.
