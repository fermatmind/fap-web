# IQ-FE-1 API Contract Notes

## Scope

- Added canonical IQ frontend constants under `lib/iq/constants.ts`.
- Added IQ question / attempt / result / report-access / report contracts under `lib/iq/contracts.ts`.
- Added IQ-specific typed API helpers under `lib/iq/api.ts`.
- Added contract coverage under `tests/contracts/iq-frontend-api-contracts.contract.test.ts`.

## Existing Client Convention Confirmed

- API base resolution remains in `lib/api-base.ts`.
- Shared typed v0.3 transport remains in `lib/api/v0_3.ts`.
- Guest-token retry remains in `lib/auth/authRetry.ts`.
- Scale-code fallback behavior remains in `lib/scaleCodeMode.ts`.
- IQ-FE-1 does not add a new fetch transport or API origin rule.

## Constants Added

- `IQ_CANONICAL_SCALE_CODE = "IQ_INTELLIGENCE_QUOTIENT"`
- `IQ_LEGACY_SCALE_CODE = "IQ_RAVEN"`
- `IQ_PUBLIC_SLUG = "iq-test-intelligence-quotient-assessment"`
- `IQ_CANONICAL_PUBLIC_PATH = "/tests/iq-test-intelligence-quotient-assessment"`
- `IQ_ZH_TAKE_PATH = "/zh/tests/iq-test-intelligence-quotient-assessment/take"`

## Data Contracts Added

- Structured inline SVG question payload support:
  - `IqSvgPath`
  - `IqStructuredSvg`
  - `IqStemPayload`
  - `IqQuestionOption`
  - `IqQuestion`
  - `IqQuestionPayload`
- Attempt lifecycle contracts:
  - `IqStartAttemptPayload`
  - `IqStartAttemptResponse`
  - `IqAttemptAnswer`
  - `IqSubmitAttemptPayload`
  - `IqSubmitResponse`
- Result/report contracts:
  - `IqResultPayload`
  - `IqReportAccessPayload`
  - `IqReportPayload`
- Three-dimension mapping is explicitly captured as:
  - `VSI -> visual_spatial_insight`
  - `VSPR -> visual_spatial_pattern_reasoning`
  - `NPR -> numerical_pattern_reasoning`

## API Helpers Added

- `lookupIqScale()`
- `getIqQuestions()`
- `getIqQuestionsByScaleCode(scaleCode)`
- `startIqAttempt(payload)`
- `submitIqAttempt(payload)`
- `getIqResult(attemptId)`
- `getIqReportAccess(attemptId)`
- `getIqReport(attemptId)`
- `normalizeIqSubmitAnswers(answers)`

## Legacy Alias Behavior

- Frontend API helpers prefer `IQ_INTELLIGENCE_QUOTIENT`.
- `IQ_RAVEN` is retained only as an explicit compatibility alias.
- IQ-FE-1 does not expose `IQ_RAVEN` as user-facing copy.
- IQ-FE-1 does not rewrite global slug authority or route authority yet.

## Commerce-Deferred Behavior

- Types allow backend report-access / report payloads to include offer metadata.
- IQ-FE-1 does not render SKU, checkout, order, unlock CTA, or payment UI.
- IQ-FE-1 does not introduce any frontend checkout helper.

## Why No UI Was Implemented

- This PR is intentionally contract-only.
- It does not modify take pages, result pages, report pages, or question renderer components.
- It does not change production routes or rendering behavior.

## Next PR

- Recommended next PR remains `IQ-FE-2`:
  - `question SVG renderer + answer option grid`
- `IQ-FE-3` should follow once the renderer-facing contract is explicitly wired to the take page shell.
