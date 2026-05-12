# IQ-FE-6 Mobile / Loading / Error Notes

## Files Changed
- `app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx`
- `components/quiz/iq/IqStemSvg.tsx`
- `components/quiz/iq/IqOptionBoard.tsx`
- `components/result/iq/IqResultShell.tsx`
- `components/result/iq/IqReportModule.tsx`
- `tests/contracts/iq-question-renderer.contract.test.tsx`
- `tests/contracts/iq-take-lifecycle.contract.test.tsx`

## Responsive Improvements
- Tightened the IQ take card spacing on small screens and reduced title size before `sm`.
- Increased IQ stem safety for small screens with stronger square bounds and a more stable min-height.
- Reworked the mobile IQ option board into a narrow-safe grid that becomes two columns at `390px+`.
- Stacked the take-page footer actions vertically on mobile and horizontally on larger screens.
- Switched IQ result and report dimension areas from `lg:3-col only` to `md:2-col / xl:3-col` for easier phone and tablet reading.
- Made metric rows wrap into vertical label/value stacks on narrow screens.

## Loading / Error / Empty State Improvements
- Replaced the plain loading sentence with an IQ-friendly shell placeholder and accessible `role="status"`.
- Added structured error and empty-state cards for question load failures and empty IQ banks.
- Added a conservative unsupported-payload state when raw IQ items exist but cannot be normalized for rendering.
- Styled select-hint, attempt-start, and submit errors as inline status blocks instead of loose text.
- Kept null IQ estimate and missing dimension/report states explicit and non-inferential.

## Accessibility Improvements
- Preserved button/radio semantics on option cards.
- Added stronger focus-ring offset treatment to desktop and mobile option cards.
- Preserved disabled-state blocking behavior.
- Kept payment, unlock, and correctness cues absent from all IQ states.

## Tests Added / Updated
- `tests/contracts/iq-question-renderer.contract.test.tsx`
  - mobile narrow-layout selectability
- `tests/contracts/iq-take-lifecycle.contract.test.tsx`
  - loading shell
  - empty-state shell
  - submit loading state without score leakage

## Remaining Frontend Gaps
- No frontend commerce unlock yet
- No PDF / certificate download
- No dedicated visual copy pass beyond scoped polish
- No Beta 50 bank rollout yet

## Recommended Next PR Options
- Visual polish / production-copy pass if frontend feel is the priority
- Backend deferred-commerce implementation if monetization becomes the priority
- Frontend commerce unlock only after backend commerce exists
- Beta50 item bank expansion after backend/product readiness
