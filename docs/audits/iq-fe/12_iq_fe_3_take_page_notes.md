# IQ-FE-3 Take Page Notes

## Route

- Reused the existing localized App Router take route at `app/(localized)/[locale]/tests/[slug]/take/page.tsx`.
- No dedicated IQ-only route file was added.
- Canonical IQ take URLs continue to resolve through the generic slug route:
  - `/zh/tests/iq-test-intelligence-quotient-assessment/take`
  - `/en/tests/iq-test-intelligence-quotient-assessment/take`

## Client Lifecycle

- Reused `app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx` as the IQ take shell.
- IQ branch now loads questions through `getIqQuestions()` from `lib/iq/api.ts`.
- IQ branch now starts attempts through `startIqAttempt()` with canonical `IQ_INTELLIGENCE_QUOTIENT`.
- IQ branch now submits through `submitIqAttempt()` with `question_id` or `item_id` plus `option_code`.
- Existing locale-aware redirect behavior remains: successful submit routes to `/{locale}/result/{attemptId}`.

## Renderer / Question Shape

- IQ take flow now normalizes canonical and legacy IQ question payloads through `lib/iq/take.ts`.
- Supported question identity inputs:
  - `question_id`
  - `item_id`
- Supported option identity inputs:
  - `option_code`
  - `code`
  - `id`
- Existing `IqStemSvg` and `IqOptionBoard` from IQ-FE-2 are reused unchanged as the visible renderer layer.

## Answer Payload Safety

- Submitted IQ answers include only:
  - `question_id` or `item_id`
  - `option_code`
  - `question_index`
- The take flow does **not** include:
  - `correct_answer`
  - frontend-computed score fields
  - fake IQ score data

## Commerce-Deferred Behavior

- No payment UI, unlock CTA, checkout wiring, or price copy was added.
- IQ take page remains neutral while backend/frontend commerce stays deferred.

## Files Changed

- `app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx`
- `lib/iq/api.ts`
- `lib/iq/take.ts`
- `tests/contracts/iq-take-lifecycle.contract.test.tsx`

## Next PR

- `IQ-FE-4` result page shell + `VSPR / VSI / NPR` cards
