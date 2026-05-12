# IQ Frontend Test / Build Strategy

## Available Commands

| Command | Exists | Purpose | Recommended for future IQ PRs |
| --- | --- | --- | --- |
| `pnpm lint` | yes | ESLint | yes |
| `pnpm typecheck` | yes | TS type safety | yes |
| `pnpm build` | yes | Next build + postbuild sitemap generation | yes, but watch generated-file dirtiness |
| `pnpm test:contract` | yes | contract tests | yes |
| `pnpm test:a11y` | yes | a11y tests | yes |
| `pnpm test:e2e` | yes | full Playwright suite | targeted use recommended |
| `pnpm test:e2e:visual` | yes | visual regression | optional for renderer PRs |
| `pnpm verify:pr` | yes | lint + typecheck + build + contract | yes for final frontend IQ PRs |

## Existing IQ-Relevant Test Evidence

| Test file | What it proves |
| --- | --- |
| `tests/a11y/iq-option-board.a11y.test.tsx` | IQ option grid accessibility already covered |
| `tests/e2e/iq-eq-result-regression.spec.ts` | IQ take flow, submit gating, result landing |
| `tests/e2e/visual/iq-take.visual.spec.ts` | desktop/mobile visual baseline for IQ options |
| `tests/contracts/mbti-take-attribution.contract.test.tsx` | generic take shell is mockable and contract-test friendly |

## Strategy for Future IQ-FE PRs

| PR | Minimal test set |
| --- | --- |
| IQ-FE-1 | `pnpm lint`, `pnpm typecheck`, targeted contract tests for API typing/helpers |
| IQ-FE-2 | above + `pnpm test:a11y` + targeted visual/e2e IQ renderer tests |
| IQ-FE-3 | above + targeted IQ take e2e |
| IQ-FE-4 | above + targeted result rendering tests |
| IQ-FE-5 | above + locked/deferred-commerce result/report tests |
| IQ-FE-6 | above + responsive/visual regression checks |

## Mocking Feasibility

| Area | Status | Notes |
| --- | --- | --- |
| Mock backend fetches in unit/contract tests | yes | existing Vitest mocks across quiz/result modules |
| Mock backend in Playwright | yes | current IQ e2e already routes `/api/v0.3/*` |
| Need live backend for scan-only PR | no | local runtime absence is not blocking |

## Notes

| Finding | Implication |
| --- | --- |
| `pnpm build` runs `postbuild` sitemap generation | build may update generated sitemap artifacts; scan PR must keep scope clean |
| `pnpm build` currently depends on local runtime for at least one ops page | current run failed prerendering `/zh/ops/content-pages` because `127.0.0.1:8000` refused connection; treat as external sidecar, not IQ-scan regression |
| No generic `pnpm test` script | use existing specific scripts only |
| No Storybook found | component verification should stay in Vitest + Playwright |
