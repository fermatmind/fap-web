# IQ Frontend API Contract Audit

## Existing API Client Pattern

| Topic | Finding | Evidence | IQ reuse |
| --- | --- | --- | --- |
| API base | centralized proxy/base-url builder | `lib/api-base.ts` | yes |
| Main client | typed `lib/api/v0_3.ts` | shared request/response layer | yes |
| Auth retry | automatic guest-token retry on 401 | `lib/auth/authRetry.ts` | yes |
| Scale code fallback | v2 + legacy dual mode supported | `lib/scaleCodeMode.ts` | yes |
| Error model | `ApiError` + classified failures | `lib/api-client`, `lib/observability/httpError` | yes |

## Endpoint Reuse Matrix

| Endpoint | Existing client found | File path | Response typing | Error handling | Can reuse for IQ | Required additions |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v0.3/scales/lookup` | yes | `lib/api/v0_3.ts:getScaleLookup` | typed | `ApiError` + shared fetch helpers | yes | IQ frontend-specific metadata narrowing |
| `GET /api/v0.3/scales/{scale_code}/questions` | yes | `lib/api/v0_3.ts:fetchScaleQuestions` | typed | guest token retry in callers | yes | explicit IQ question payload typing alias |
| `POST /api/v0.3/attempts/start` | yes | `lib/api/v0_3.ts:startAttempt` | typed | shared | yes | IQ attempt lifecycle wrapper |
| `POST /api/v0.3/attempts/submit` | yes | `lib/api/v0_3.ts:submitAttempt` | typed | shared | yes | IQ-specific submit/result redirect contract |
| `GET /api/v0.3/attempts/{id}/result` | yes | `lib/api/v0_3.ts:fetchAttemptResult` | typed | shared | yes | explicit blocked/processing IQ states |
| `GET /api/v0.3/attempts/{id}/report-access` | yes | `lib/api/v0_3.ts:fetchAttemptReportAccess` | typed | shared | yes | frontend normalization for deferred-commerce safe state |
| `GET /api/v0.3/attempts/{id}/report` | yes | `lib/api/v0_3.ts:fetchAttemptReport`, `getAttemptReport` | typed | shared | yes | explicit IQ report schema typing |

## IQ-Specific Client Observations

| Finding | Evidence | Impact |
| --- | --- | --- |
| Questions endpoint already dual-targets canonical and legacy IQ codes in tests | `tests/e2e/iq-eq-result-regression.spec.ts`, `tests/e2e/visual/iq-take.visual.spec.ts` | low risk for backend transition |
| Scale-code mode already maps `IQ_RAVEN -> IQ_INTELLIGENCE_QUOTIENT` | `lib/scaleCodeMode.ts` | good base for canonicalization |
| Frontend slug map still exposes canonical slug under `IQ_RAVEN` key | `lib/assessmentSlugMap.ts` | medium; IQ-FE-1 should normalize type names |
| Fallback public test seed still says `scale_code: IQ_RAVEN` | `lib/content.ts` | medium; detail-card metadata can drift from backend canonical identity |

## Typed Contract Readiness

| Contract area | Status | Notes |
| --- | --- | --- |
| IQ question payload typing | partial | current generic question typing already supports structured stem/option SVG objects |
| IQ start/submit typing | yes | shared attempt types exist |
| IQ result typing | partial | generic result typing exists, but no explicit three-dimension IQ result view model found |
| IQ report typing | partial | generic report typing exists, but no explicit `visual_spatial_*` or `numerical_pattern_reasoning` shaping found |
| IQ report-access typing | partial | unlock state exists as `locked/partial/full`, but future IQ deferred-commerce presentation needs adapter rules |

## Recommendation

IQ-FE-1 should not build new low-level fetch wrappers. It should:

1. add IQ-specific type aliases/view models on top of `lib/api/v0_3.ts`
2. normalize canonical IQ identity around `IQ_INTELLIGENCE_QUOTIENT`
3. preserve dual-code fallback for legacy backend compatibility
4. avoid touching payment/checkout APIs

