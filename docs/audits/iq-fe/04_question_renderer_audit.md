# IQ Question Renderer Audit

## Current Renderer Inventory

| Renderer capability | Exists | Files | Notes |
| --- | --- | --- | --- |
| IQ stem SVG renderer | yes | `components/quiz/iq/IqStemSvg.tsx` | renders structured vector payload into `<svg>` |
| IQ option grid renderer | yes | `components/quiz/iq/IqOptionBoard.tsx` | dedicated visual option grid |
| IQ take integration | yes | `app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx` | activates for `IQ_RAVEN` and `IQ_INTELLIGENCE_QUOTIENT` |
| Structured question normalization | yes | `lib/quiz/normalizeQuestions.ts` | maps backend stem/option SVG objects into view model |
| Accessibility test | yes | `tests/a11y/iq-option-board.a11y.test.tsx` | keyboard/radiogroup coverage |
| Visual regression test | yes | `tests/e2e/visual/iq-take.visual.spec.ts` | desktop/mobile baselines exist |

## Supported IQ Asset Formats

| Asset format | Supported now | Evidence | Notes |
| --- | --- | --- | --- |
| Structured SVG object with `view_box` + `paths[]` | yes | `IqStemSvg`, `normalizeQuestions`, IQ e2e fixtures | current backend-compatible path |
| Option SVG object | yes | `IqOptionBoard`, IQ e2e fixtures | current backend-compatible path |
| Text prompt + SVG stem | yes | `QuizTakeClient` uses both prompt and `IqStemSvg` | already in use |
| Empty options + anchors fallback | yes | generic quiz normalization and EQ regression test | reusable if IQ ever needs anchors |
| Raw SVG string | not found | no dedicated sanitizer/parser found | requires explicit design if backend ever emits strings |
| Static SVG asset URL | not found | no IQ-specific asset-url renderer found | not required for current backend shape |

## Interaction Capability

| Capability | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Selected option state | yes | `QuizTakeClient` + `IqOptionBoard` | already wired |
| Explicit submit only | yes | IQ e2e asserts submit disabled until selection | aligned with backend IQ flow |
| Keyboard selection | yes | `IqOptionBoard` | arrow/home/end support |
| Responsive/mobile layout | yes | `IqOptionBoard` desktop + mobile test ids | already visually tested |
| 2x3 answer grid | partial | desktop board supports visual grid, 6-option visual fixture exists | exact locking to 2x3 layout should be verified per design |
| Progress bar | yes | generic quiz shell | shared capability |
| Zoom / enlarge modal | not found | no IQ-specific zoom modal found | optional future enhancement |
| Sanitized SVG rendering | partial | safe structured rendering, no raw string sanitizer | safe for current payload, not for future raw markup |
| `dangerouslySetInnerHTML` for IQ SVG | not found | no evidence in IQ renderer path | good |

## Readiness Assessment

| Area | Readiness | Reason |
| --- | --- | --- |
| Render current backend IQ question payload | high | structured SVG object path already implemented and tested |
| Render canonical IQ scale code | medium | renderer supports both scale codes, but surrounding identity is still legacy-biased |
| Support future alternate asset modes | low | raw SVG strings / static asset URLs are not explicitly supported |

## Recommended Design for IQ-FE-2

| Recommended component | Why |
| --- | --- |
| keep `IqStemSvg` as structured-SVG renderer | already safe and aligned with backend showcase payload |
| keep `IqOptionBoard` as answer grid | already accessible and visually tuned |
| add IQ-specific type guards around normalized question data | reduces coupling to generic quiz assumptions |
| do not add raw SVG `innerHTML` rendering unless backend contract explicitly requires it | avoids XSS/sanitization drift |
| add optional zoom/enlarge only as a later enhancement PR | not required to ship first IQ take page |

## Required Future PRs

| PR | Reason |
| --- | --- |
| IQ-FE-1 | stabilize canonical IQ types and endpoint contracts |
| IQ-FE-2 | formalize IQ renderer around current components and typed payload |
| IQ-FE-3 | finish attempt lifecycle shell and edge-state wiring |

