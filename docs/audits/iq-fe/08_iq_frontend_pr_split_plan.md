# IQ Frontend PR Split Plan

Scan basis:

- current worktree already has IQ take-route infrastructure and SVG question renderer
- backend IQ foundation is ready except commerce
- frontend commerce must stay deferred

## Recommended PR Sequence

| PR | Goal | Can proceed before commerce | Requires backend runtime | Notes |
| --- | --- | --- | --- | --- |
| IQ-FE-1 | Frontend API client + IQ data contracts | yes | no for tests, yes for live QA | canonical IQ identity and typed adapters |
| IQ-FE-2 | IQ question SVG renderer + answer option grid hardening | yes | no | mostly formalize existing renderer path |
| IQ-FE-3 | IQ take page shell + attempt lifecycle | yes | optional | use existing route shell, add product-specific lifecycle |
| IQ-FE-4 | IQ result page shell + VSPR/VSI/NPR cards | yes | optional | shared result route, new IQ cards |
| IQ-FE-5 | IQ report module shell + deferred-commerce locked state | yes | optional | no checkout/payment |
| IQ-FE-6 | Mobile/responsive polish + loading/error states | yes | no | hardening / visual polish |
| IQ-FE-7 | Optional frontend commerce unlock | no | yes | only after backend commerce PR exists |

## PR Details

### IQ-FE-1

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-1 API client + IQ data contracts` |
| scope | canonical IQ scale typing, slug/scale cleanup, report/result/question typed adapters |
| likely files | `lib/api/v0_3.ts`, `lib/assessmentSlugMap.ts`, `lib/scaleCodeMode.ts`, `lib/content.ts`, IQ-specific adapter files, tests |
| dependencies | backend PRs #1311 #1312 #1313 |
| forbidden files | payment/checkout/order routes |
| tests | lint, typecheck, targeted contract tests |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, `pnpm test:contract`, `git diff --check` |
| sidecar risks | backend norm table still deferred |
| can proceed before commerce | yes |
| requires backend runtime | no |

### IQ-FE-2

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-2 SVG renderer + answer grid` |
| scope | formalize IQ renderer components, structured SVG guards, responsive option board behavior |
| likely files | `components/quiz/iq/*`, `lib/quiz/normalizeQuestions.ts`, targeted a11y/visual tests |
| dependencies | IQ-FE-1 |
| forbidden files | payment/checkout/order routes |
| tests | lint, typecheck, `pnpm test:a11y`, targeted Playwright/visual |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, `pnpm test:a11y`, targeted `pnpm test:e2e` |
| sidecar risks | raw SVG string support remains out of scope |
| can proceed before commerce | yes |
| requires backend runtime | no |

### IQ-FE-3

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-3 take page shell + attempt lifecycle` |
| scope | IQ-specific take-state copy, attempt start/submit lifecycle, result redirect, loading/error states |
| likely files | `app/(localized)/[locale]/tests/[slug]/take/page.tsx`, `QuizTakeClient.tsx`, IQ helper/view-model files, e2e tests |
| dependencies | IQ-FE-1, IQ-FE-2 |
| forbidden files | payment/checkout/order routes |
| tests | lint, typecheck, contract tests, targeted IQ e2e |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, `pnpm test:contract`, targeted `pnpm test:e2e` |
| sidecar risks | backend runtime not available locally for manual QA |
| can proceed before commerce | yes |
| requires backend runtime | optional |

### IQ-FE-4

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-4 result page shell + VSPR/VSI/NPR cards` |
| scope | explicit IQ result summary and three-dimension cards on shared result route |
| likely files | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`, new `components/result/iq/*`, tests |
| dependencies | IQ-FE-1 |
| forbidden files | payment/checkout/order routes |
| tests | lint, typecheck, targeted result contract tests, targeted e2e |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, `pnpm test:contract`, targeted `pnpm test:e2e` |
| sidecar risks | backend norm table still deferred, so copy must not overclaim |
| can proceed before commerce | yes |
| requires backend runtime | optional |

### IQ-FE-5

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-5 report module shell + deferred-commerce locked state` |
| scope | IQ report module shell, locked/deferred-commerce safe state, no checkout CTA |
| likely files | IQ report components, `RichResultReport.tsx` integration, `ResultClient.tsx`, tests |
| dependencies | IQ-FE-1, IQ-FE-4 |
| forbidden files | checkout/order/payment components and routes |
| tests | lint, typecheck, contract tests, result/report e2e |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, `pnpm test:contract`, targeted `pnpm test:e2e` |
| sidecar risks | PDF/certificate frontend renderer still absent |
| can proceed before commerce | yes |
| requires backend runtime | optional |

### IQ-FE-6

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-6 mobile polish + loading/error states` |
| scope | responsive polish, processing/failure states, visual QA |
| likely files | IQ take/result/report components, visual tests |
| dependencies | IQ-FE-2, IQ-FE-3, IQ-FE-4, IQ-FE-5 |
| forbidden files | payment/checkout/order routes |
| tests | lint, typecheck, visual/e2e |
| acceptance commands | `pnpm lint`, `pnpm typecheck`, targeted visual/e2e, `pnpm build` |
| sidecar risks | none beyond existing external backend blockers |
| can proceed before commerce | yes |
| requires backend runtime | no |

### IQ-FE-7

| Field | Plan |
| --- | --- |
| goal name | `IQ-FE-7 optional frontend commerce unlock` |
| scope | only after backend commerce PR exists |
| likely files | commerce adapters, report-access handling, unlock CTA surfaces |
| dependencies | backend `iq-commerce-unlock-199-500`, IQ-FE-5 |
| forbidden files | none beyond standard scope controls |
| tests | full verify path including checkout-related mocks |
| acceptance commands | to be defined after backend commerce exists |
| sidecar risks | must not proceed while backend commerce is deferred |
| can proceed before commerce | no |
| requires backend runtime | yes |

