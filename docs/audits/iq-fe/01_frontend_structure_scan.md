# IQ Frontend Structure Scan

Generated from current `fap-web` source on `main`.

## Summary

| Topic | Finding | Evidence | IQ reuse |
| --- | --- | --- | --- |
| Framework | Next.js App Router | `app/`, `next@16`, route files under `app/(localized)/[locale]` | yes |
| Language | TypeScript | `tsconfig.json`, `.tsx` files across app/components/lib | yes |
| Package manager | pnpm | `packageManager: pnpm@10.28.1` in `package.json` | yes |
| Routing style | Localized app-router paths | `app/(localized)/[locale]/...` | yes |
| Tests entry route | `/[locale]/tests/[slug]` | `app/(localized)/[locale]/tests/[slug]/page.tsx` | yes |
| Take route | `/[locale]/tests/[slug]/take` | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` | yes |
| Result route | `/[locale]/result/[id]` | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | yes |
| Report route | `/[locale]/attempts/[attemptId]/report` | `app/(localized)/[locale]/attempts/[attemptId]/report/page.tsx` | partial |
| API client | Central typed v0.3 client | `lib/api/v0_3.ts` | yes |
| Auth/anon | Guest token + anon id retry | `lib/auth/authRetry.ts`, `lib/anon`, `lib/auth/fmToken` | yes |
| SEO/noindex | Header rules + metadata robots | `next.config.mjs`, `NOINDEX_ROBOTS` use in take/result/report pages | yes |
| Commerce UI | Shared unlock/paywall primitives exist | `components/commerce/UnlockCTA.tsx`, `components/report/LockedInsightTeaser.tsx` | scan only |

## Repository Structure

| Area | Observed pattern | Notes |
| --- | --- | --- |
| App routes | `app/(localized)/[locale]/...` with grouped shells | Locale-aware routing is first-class. |
| Shared components | `components/*` with quiz/result/report/commerce namespaces | IQ can plug into existing quiz and result systems. |
| Client utilities | `lib/*` | API, auth, SEO, slug mapping, scale mode, analytics already centralized. |
| Tests | `tests/contracts`, `tests/a11y`, `tests/e2e`, `tests/e2e/visual` | Existing IQ coverage already present for take flow. |

## i18n Convention

| Topic | Finding | Evidence | IQ implication |
| --- | --- | --- | --- |
| Locale segment | `en` / `zh` path prefixes | `localizedPath(...)`, route folders under `[locale]` | IQ should use `/zh/...` and `/en/...`. |
| Copy loading | Dictionary lookup via `getDictSync` | used in take/result/report files | IQ-specific copy should extend existing dict trees. |
| Legacy path redirect | `/test/...` redirects to `/tests/...` | `app/(localized)/[locale]/test/[slug]/page.tsx` | IQ legacy slug path can stay redirect-only. |

## Existing Assessment Surface Capability

| Capability | Evidence | IQ readiness |
| --- | --- | --- |
| Generic test landing | `app/(localized)/[locale]/tests/[slug]/page.tsx` | yes |
| Generic take shell | `QuizTakeClient.tsx` | yes |
| IQ-specific SVG take components | `components/quiz/iq/IqStemSvg.tsx`, `IqOptionBoard.tsx` | yes |
| Generic result entry | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` | partial |
| Shared report renderer | `components/result/RichResultReport.tsx` | partial |
| Locked teaser | `components/report/LockedInsightTeaser.tsx` | yes |
| Payment CTA | `components/commerce/UnlockCTA.tsx` | exists, must stay disabled for IQ until commerce PR |

## Build / Validation Surface

| Script | Exists | Notes |
| --- | --- | --- |
| `pnpm lint` | yes | `eslint` |
| `pnpm typecheck` | yes | `tsc --noEmit` |
| `pnpm build` | yes | runs `next build` then `postbuild` sitemap generation |
| `pnpm test:contract` | yes | `vitest run tests/contracts` |
| `pnpm test:a11y` | yes | `vitest run tests/a11y` |
| `pnpm test:e2e` | yes | `playwright test` |
| `pnpm verify:pr` | yes | lint + typecheck + build + contract |

## Key IQ-Specific Findings

| Finding | Evidence | Risk |
| --- | --- | --- |
| IQ take route already exists | `/tests/iq-test-intelligence-quotient-assessment/take` is covered by generic tests route | low |
| IQ renderer already exists | `QuizTakeClient.tsx` switches into `IqStemSvg` + `IqOptionBoard` for `IQ_RAVEN` and `IQ_INTELLIGENCE_QUOTIENT` | low |
| Frontend still uses legacy IQ code in several places | `lib/content.ts`, `lib/assessmentSlugMap.ts`, `components/result/RichResultReport.tsx` still key on `IQ_RAVEN` | medium |
| Result/report path exists but not IQ-specific yet | shared result shell and rich report renderer exist, but no explicit three-dimension IQ contract mapping found | medium |
| Attempt report page is clinical-specific today | `/attempts/[attemptId]/report` renders `ClinicalReportClient` | high for future IQ report route |

## Initial Conclusion

The frontend is not missing an IQ surface. It already has:

- localized IQ landing and take routes
- typed v0.3 API client calls
- IQ SVG stem and option renderers
- existing result/report and locked-state infrastructure
- Playwright and a11y coverage touching IQ take flow

What is missing is product-specific alignment:

- canonical IQ identity cleanup on the frontend
- explicit IQ data typing for the new backend contract
- explicit IQ result/report rendering for `VSPR / VSI / NPR`
- safe deferred-commerce behavior that suppresses payment-specific IQ UI until commerce is implemented

