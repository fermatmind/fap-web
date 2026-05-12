# IQ-FE-4 Result Page Notes

## Findings

- The localized result route already exists at `app/(localized)/[locale]/(app)/result/[id]/page.tsx` and renders through `ResultClient`.
- `ResultClient` already performs the right fetch order for result delivery:
  1. `fetchAttemptReportAccess`
  2. `fetchAttemptReport` when the projection is safe to load
  3. fallback `fetchAttemptResult`
- `RichResultReport` is geared toward MBTI / Big Five / Enneagram / RIASEC rich-report flows and can surface commerce-oriented locked states that this IQ PR must not reuse.

## IQ-FE-4 implementation

- Added an IQ-specific result normalization helper in `lib/iq/result.ts`.
- Added an IQ-specific shell in `components/result/iq/IqResultShell.tsx`.
- Wired an IQ branch into `ResultClient` before `RichResultReport`, so:
  - canonical `IQ_INTELLIGENCE_QUOTIENT`
  - legacy alias `IQ_RAVEN`
  both render through the same canonical IQ result shell.

## Rendered fields

- Summary shell renders:
  - IQ title
  - IQ estimate when present
  - raw score when present
  - percentile when present
  - confidence interval when present
  - quality level / quality flags when present
  - stability status / reason when present
- Dimension cards render in this order:
  1. `visual_spatial_insight` / `VSI`
  2. `visual_spatial_pattern_reasoning` / `VSPR`
  3. `numerical_pattern_reasoning` / `NPR`

## Null / blocked behavior

- If `iq_estimate` is null, the UI renders:
  - zh: `当前结果暂未生成完整 IQ 估计值`
  - en: `The IQ estimate is not available for this result yet`
- Missing dimension data renders a per-card missing state.
- No fake scores, fake percentiles, or fake confidence intervals are introduced.

## Deferred-commerce behavior

- If report access is locked, the IQ shell shows neutral non-payment copy only:
  - zh: `完整报告解锁功能暂未开放。当前可查看已生成的基础结果。`
  - en: `Full report unlock is not available yet. You can view the available result summary.`
- Offer payloads, SKUs, prices, checkout links, buy buttons, and unlock CTAs are intentionally not rendered in this PR.

## Tests

- Added dedicated IQ renderer contract tests.
- Added a `ResultClient` contract test to prove the generic result route selects the IQ shell for IQ payloads without regressing the existing non-IQ path.

## Next PR

- `IQ-FE-5 report module shell + deferred-commerce locked state`
