# IQ Result / Report Renderer Audit

## Current Surface Inventory

| Surface | Exists | Files | IQ reuse |
| --- | --- | --- | --- |
| Result route shell | yes | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | yes |
| Result client orchestration | yes | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` | yes |
| Generic rich report renderer | yes | `components/result/RichResultReport.tsx` | partial |
| Generic summary card | yes | `components/result/ResultSummary.tsx` | partial |
| Generic dimension bars | yes | `components/result/DimensionBars.tsx` | partial |
| Locked teaser | yes | `components/report/LockedInsightTeaser.tsx` | yes |
| Dedicated IQ result shell | not found | not found | no |
| Dedicated IQ report page client | not found | not found | no |

## IQ Schema Readiness vs Backend Contract

Required backend IQ fields:

- `scale_code`
- `attempt_id`
- `unlock.stage`
- `summary.raw_score`
- `summary.iq_estimate`
- `summary.percentile`
- `summary.confidence_interval`
- `dimensions.visual_spatial_insight`
- `dimensions.visual_spatial_pattern_reasoning`
- `dimensions.numerical_pattern_reasoning`
- `quality.level`
- `quality.flags`
- `stability.status`

| Field / area | Explicit support found | Evidence | Gap |
| --- | --- | --- | --- |
| `scale_code` | partial | result/report logic still recognizes `IQ_RAVEN` | add canonical `IQ_INTELLIGENCE_QUOTIENT` view-model handling |
| `attempt_id` | yes | shared result/report shells pass attempt id | no major gap |
| `unlock.stage` | partial | shared access model uses `unlockStage` = `locked/partial/full` | map to deferred-commerce-safe IQ UI |
| `summary.raw_score` | not found | no explicit IQ summary rendering found | add IQ summary card |
| `summary.iq_estimate` | not found | same | add IQ summary card |
| `summary.percentile` | not found | same | add IQ summary card |
| `summary.confidence_interval` | not found | same | add IQ summary card |
| three IQ dimensions | not found | no explicit `visual_spatial_*` mapping found | add VSPR/VSI/NPR cards |
| `quality.level` | partial | shared report systems render some quality concepts for other scales | no explicit IQ quality block |
| `quality.flags` | not found | not found | add explicit list/flags renderer |
| `stability.status` | not found | not found | add explicit stability badge/copy |

## Important Existing Behavior

| Finding | Evidence | Impact |
| --- | --- | --- |
| Result page already polls `report-access`, `report`, and `result` | `ResultClient.tsx` | good base for IQ lifecycle |
| Generic rich report allows IQ under legacy scale code | `RichResultReport.tsx` includes `IQ_RAVEN` | good base, but canonicalization gap remains |
| Current attempt report page is clinical-only | `/attempts/[attemptId]/report` uses `ClinicalReportClient` | high gap for standalone IQ report page |
| IQ e2e currently validates only generic report summary visibility | `tests/e2e/iq-eq-result-regression.spec.ts` expects `"IQ report summary"` | future PRs need schema-specific assertions |

## Reuse Assessment

| Area | Reusable | Reason |
| --- | --- | --- |
| Result route shell | yes | already generic and localized |
| Result client polling/auth/error handling | yes | already battle-tested |
| Generic summary card | partial | too simple for IQ summary metrics |
| Generic dimension bars | partial | can render bars, but lacks IQ semantic labels/cards |
| Generic rich report renderer | partial | can host sections/highlights, but no explicit IQ three-dimension contract |
| Locked teaser | yes | suitable for deferred-commerce / locked placeholders |

## Recommendation

The frontend should not try to force the backend IQ schema into the current generic shell without a thin IQ adapter. Recommended future structure:

| Future component | Purpose |
| --- | --- |
| `IqResultSummaryCard` | raw score / IQ estimate / percentile / confidence interval |
| `IqDimensionCards` | `visual_spatial_insight`, `visual_spatial_pattern_reasoning`, `numerical_pattern_reasoning` |
| `IqQualityStabilityPanel` | `quality.level`, `quality.flags`, `stability.status` |
| `IqReportModuleShell` | render locked vs unlocked report blocks without payment coupling |

## Readiness Verdict

| Area | Readiness |
| --- | --- |
| Existing result UI reusable | yes, partial |
| Existing report UI reusable | yes, partial |
| Missing IQ dimension support | yes |
| Missing stability/quality rendering | yes |
| Deferred-commerce safe locked state handling | partial; shared locked UI exists but must suppress purchase CTA copy for IQ |

