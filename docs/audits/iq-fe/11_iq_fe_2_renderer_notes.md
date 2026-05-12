# IQ-FE-2 Renderer Notes

## Existing Renderer Findings

- `components/quiz/iq/IqStemSvg.tsx` already rendered IQ SVGs as native `<svg>` and `<path>` elements.
- `components/quiz/iq/IqOptionBoard.tsx` already rendered radio-like option cards with keyboard navigation.
- Existing implementation did not use `dangerouslySetInnerHTML`.
- Existing implementation primarily assumed camelCase vector payloads from `lib/quiz/types.ts`.

## Files Changed

- `components/quiz/iq/IqStemSvg.tsx`
- `components/quiz/iq/IqOptionBoard.tsx`
- `lib/iq/renderer.ts`
- `tests/contracts/iq-question-renderer.contract.test.tsx`

## Renderer Input Shape

- Renderer now accepts normalized IQ structured SVG input through `lib/iq/renderer.ts`.
- Supported source forms:
  - IQ-FE-1 `IqStructuredSvg`
  - existing quiz renderer `QuizVectorGraphic`

## Supported SVG Fields

- `view_box`
- `viewBox`
- `paths[]`
- per-path:
  - `d`
  - `fill`
  - `stroke`
  - `stroke_width`
  - `strokeWidth`
  - `fill_rule`
  - `fillRule`
  - `opacity`

## Option Board Behavior

- 6 options render in a desktop grid that resolves to `3` columns and a `2x3` layout.
- 5 legacy options stay supported without reordering.
- selected state is represented by:
  - `aria-checked`
  - `data-state="selected"`
  - selected visual styling
- disabled state now blocks click and keyboard-triggered selection.
- option identity prefers `option_code`, then `code`, then `id`.

## Accessibility Notes

- option cards remain button-based radio controls
- keyboard arrow / Home / End navigation remains available
- SVGs remain native DOM elements with explicit `aria-label`
- no raw SVG HTML injection path was added

## Unsupported Raw SVG String Rationale

- raw SVG string rendering remains intentionally unsupported in IQ-FE-2
- backend IQ payload already provides structured vector data
- adding raw SVG string support would widen XSS / sanitization review scope and should be done only in a separate security-reviewed PR if ever needed

## No Scoring / No Answer Exposure

- renderer normalization does not require `correct_answer`
- renderer normalization does not expose `correct_answer`
- renderer layer does not compute score, correctness, or payment state

## Next PR

- `IQ-FE-3` take page shell + attempt lifecycle
