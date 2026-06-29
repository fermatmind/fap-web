# IQ Beta Standard Score UI Notes

## Scope

This note documents the frontend display contract for `IQ-BETA-STANDARD-SCORE-UI-1`.

The backend-owned field is `beta_standard_score`, introduced by fap-api PR #2542. The frontend only reads and renders this value when it is present in the IQ result or report payload.

## Expected Backend Fields

The frontend accepts the following optional fields in IQ result/report payloads:

- `beta_standard_score`
- `beta_standard_score_status`
- `beta_standard_score_source`
- `random_baseline_mean`
- `random_baseline_sd`
- `random_baseline_z`
- `above_random_baseline`
- `production_normed`
- `claim_eligible`
- `population_percentile_eligible`
- `source_kind`
- `source_ref`

All fields are optional for backward compatibility. Older IQ payloads remain valid when these fields are absent.

## Display Priority

The IQ result hero uses this order:

1. Formal `iq_estimate`, only when the backend claim policy does not suppress norm claims.
2. Backend-provided `beta_standard_score`.
3. Raw score.
4. Unavailable state.

For Owner 30 Beta payloads, the expected main display is:

- zh: `智商测试标准分（Beta）`
- en: `IQ Test Standard Score (Beta)`

The raw score remains visible nearby as `30题推理得分：x / 30` or `30-item reasoning score: x/30`.

## Claim Boundary

The Beta standard score is not treated as a formal IQ estimate. The UI shows a boundary notice:

- zh: `该分数基于当前 30 题原始得分和随机作答基线生成，仅用于 Beta 阶段结果展示，不代表正式人群常模或认证 IQ。`
- en: `This score is based on the current 30-item raw score and random-response baseline. It is for beta-stage result display only and is not a formal population norm or certified IQ score.`

The UI must not show population percentile or confidence interval claims when the backend sends `production_normed=false`, `claim_eligible=false`, `population_percentile_eligible=false`, or `score_claim_level=raw_score_only`.

## Frontend Non-Authority

The frontend does not calculate `beta_standard_score`.

The frontend does not map `raw_score` to a Beta score.

The frontend does not infer percentile, IQ estimate, norm status, or population rank.

The backend remains the authority for all score values and claim eligibility.

## Fallback Behavior

If `beta_standard_score` is absent and no eligible `iq_estimate` exists, the result page keeps the existing raw-score fallback:

- zh: `30题推理得分：x/30`
- en: `30-item reasoning score: x/30`

If all score fields are absent, the page keeps the existing unavailable state.

## Deferred Work

This PR does not deploy production changes.

The next runtime step is deploying the merged fap-api #2542 backend and this fap-web UI PR to production, then running a read-only smoke test against a real Owner 30 attempt payload.
