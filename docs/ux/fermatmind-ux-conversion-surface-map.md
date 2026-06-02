# FermatMind UX Conversion Surface Map

Date: 2026-06-02

Mode: read-only audit plus docs-only implementation readiness. No application code, CMS data, payment flow, routes, sitemap, robots, llms, schema, or result privacy behavior changed.

## Scope

First-phase conversion work is limited to:

- MBTI: `/tests/mbti-personality-test-16-personality-types`
- Big Five: `/tests/big-five-personality-test-ocean-model`
- RIASEC: `/tests/holland-career-interest-test-riasec`
- homepage, tests hub, test landing template, quiz focus mode, result shell, and paywall/unlock grid planning

Out of scope:

- clinical/depression/anxiety SEO expansion, paid report, paid wall, or result guide
- IQ result guide, certificate, authority claim expansion, or new paid claim
- enterprise/team, API, and B2B flows
- new Review, AggregateRating, Product schema unless backed by verifiable source data
- direct frontend editorial fallback content for CMS-backed surfaces

## Public IA And Runtime Surface Map

| Surface | Current web route | Primary fap-web files | Primary backend/API authority | Current conversion role | Safe UX opportunity |
|---|---|---|---|---|---|
| Homepage | `/`, `/en`, `/zh` | `app/(root)/page.tsx`, `app/(localized)/[locale]/page.tsx`, `components/marketing/HomePageExperience.tsx`, `lib/marketing/homepageContent.ts` | `GET /api/v0.5/landing-surfaces/home`, `landing_surfaces.payload_json`, enabled `page_blocks` | Entry point and test discovery | Reorder rendering into hero, category matrix, popular tests, result preview, trust/method boundary. Copy/order must remain CMS/backend-authoritative. |
| Tests hub | `/tests`, `/zh/tests`, `/en/tests` | `app/(localized)/[locale]/tests/page.tsx`, `components/marketing/tests/TestsHubExperience.tsx`, `lib/marketing/testsHubContent.ts` | `GET /api/v0.5/landing-surfaces/tests`, scale catalog metadata | Directory and category selection | Add category density, lower decision cost, clarify MBTI/Big Five/RIASEC priority. Do not add frontend local test copy as fallback. |
| MBTI landing | `/tests/mbti-personality-test-16-personality-types` | `app/(localized)/[locale]/tests/[slug]/page.tsx`, `components/mbti/MbtiLandingSurfaceSections.tsx`, `components/analytics/TrackedEntryCtaLink.tsx` | `GET /api/v0.3/scales/lookup`, `ScaleRegistry.content_i18n_json`, `landing_surface_v1`, `view_policy_json`, `commercial_json` | Start test, explain result boundary | Create shared landing template slots fed by lookup/CMS fields. Keep MBTI-specific sections only where backend contract supports them. |
| Big Five landing | `/tests/big-five-personality-test-ocean-model` | Same dynamic landing route plus Big Five rollout helpers | `GET /api/v0.3/scales/lookup`, Big Five forms/projections/contracts | Start test and explain OCEAN dimensions | Use same template, with OCEAN dimension preview and free/deep report boundary from backend fields. |
| RIASEC landing | `/tests/holland-career-interest-test-riasec` | Same route plus `components/riasec/RiasecLandingSurfaceSections.tsx` | `GET /api/v0.3/scales/lookup`, forms `riasec_60`, `riasec_140`, RIASEC content pack | Career-interest test entry | Keep canonical IA under this slug; present `riasec_60` and `riasec_140` as one flagship scale, not parallel stacks. |
| Quiz take | `/tests/[slug]/take` | `app/(localized)/[locale]/tests/[slug]/take/page.tsx`, `QuizTakeClient.tsx`, `Big5TakeClient.tsx`, `components/quiz/*`, `lib/quiz/store.tsx` | `GET /api/v0.3/scales/{scale_code}/questions`, `POST /api/v0.3/attempts/start`, `POST /api/v0.3/attempts/submit`, progress endpoints | Completion engine | Create Quiz Focus Mode around existing question/scoring flows. Do not change questions, scoring, attempt lifecycle, or answer payload shape. |
| Result shell | `/[locale]/result/[id]` under app group | `app/(localized)/[locale]/(app)/result/[id]/page.tsx`, `ResultClient.tsx`, result shell components | `GET /api/v0.3/attempts/{id}/report-access`, `result`, `report`, `submission` endpoints | Free result consumption, save/recovery, unlock entry | Normalize free summary plus unlock grid for MBTI/Big Five/RIASEC only. Keep result private and noindex. |
| Result lookup | `/results/lookup` | `app/(localized)/[locale]/results/lookup/page.tsx` | `POST /api/v0.3/results/lookup-by-email` | Private recovery | Leave as private support flow. Do not make it a public SEO or acquisition surface. |
| Paywall/unlock | Embedded result components, order routes | `components/commerce/UnlockCTA.tsx`, `components/result/RichResultReport.tsx`, `components/result/big5/Big5ResultShell.tsx`, `components/big5/paywall/OfferCard.tsx`, `app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx` | `POST /api/v0.3/orders/checkout`, `GET /api/v0.3/orders/{order_no}`, `ReportGatekeeper`, SKU catalog | Paid report conversion | Blocked until DOM and analytics identifier exposure is cleaned. Unlock grid must only show backend/CMS-defined modules. |
| Clinical/depression | Hidden/pending slugs | `lib/tests/publicTestEntryVisibility.ts`, clinical take/result components | clinical scale registry and crisis policy | Safety-sensitive pending surface | Do not commercialize, amplify, or add SEO. Keep hidden/noindex behavior intact. |
| IQ | Existing IQ test only | IQ quiz/result components and lookup | IQ scale registry and IQ result builder | Existing public test | Do not add certificate, authority claim, paid result guide, or unreviewed strong claims. |

## Current Data Sources

| Data need | Current source | Files/contracts | Readiness |
|---|---|---|---|
| Homepage module order, hero copy, quick start, families, trust/resource blocks | CMS landing surface `home` | `lib/cms/landing-surfaces.ts`, `lib/marketing/homepageContent.ts`, backend `LandingSurfaceController` | Partially ready. Frontend still completes some quick-start items locally; future UX PR should render only authority-backed payload or minimal shell. |
| Tests hub module order and categories | CMS landing surface `tests` | `lib/marketing/testsHubContent.ts`, backend `LandingSurfaceController` | Partially ready. Existing hub filters hidden clinical slugs correctly. |
| Test landing title/description/meta/FAQ | Scale lookup response | fap-web landing route, backend `ScalesLookupController`, `ScaleRegistry` | Ready for rendering, but FAQ fallback and rating display need authority cleanup before stronger trust modules. |
| Related articles | CMS articles via page blocks and related-test API | `lib/marketing/homepageRecommendedArticles.ts`, landing route CMS article fetch | Ready only for CMS-published articles. No local related-copy fallback. |
| Quiz questions and attempt lifecycle | Backend public API | `fetchScaleQuestions`, `startAttempt`, `submitAttempt`, backend `AttemptWriteController` | Ready. UX work must not change scoring or raw answer storage. |
| Result free summary | Report and projection APIs | `ResultClient.tsx`, backend `AttemptReadController`, `ReportGatekeeper`, public projections | Ready for display, with separate implementations by scale. |
| Paid modules/offers | Report gate and commerce APIs | `ReportGatekeeper`, `OfferResolver`, `SkuCatalog`, `createCheckoutOrOrder` | Structurally present, but frontend privacy cleanup required before new unlock grid. |
| Analytics | Browser tracking client and whitelist | `lib/analytics.ts`, `lib/tracking/client.ts`, `lib/tracking/events.ts`, `lib/tracking/privacy.ts` | Needs event taxonomy and identifier-redaction PR before adding new conversion events. |

## UX Surface Readiness

| Surface | Ready now | Blocked by CMS/backend/payment | Blocked by safety/privacy |
|---|---|---|---|
| Homepage layout rendering | Yes, as rendering-only CMS block reordering/components | New claims, copy, module ordering, featured items must come from CMS | Hardcoded social proof in current code must not be expanded without verification. |
| Tests hub density | Yes, if it renders existing CMS/test metadata | New category copy/order should be CMS fields | Clinical/depression must stay hidden/pending. |
| MBTI landing template | Yes, if existing lookup fields are used | New sample report/module copy needs backend/CMS fields | Do not add review/schema claims. |
| Big Five landing template | Yes, if existing lookup/projection fields are used | Deep report module labels need backend/CMS definition | Do not overstate predictive/career certainty. |
| RIASEC landing template | Yes, if `riasec_60`/`riasec_140` are treated as one scale | New career outcome copy needs CMS/review | Do not reintroduce legacy 36Q stack or deterministic career claims. |
| Quiz Focus Mode | Yes for MBTI/RIASEC generic client and separately Big Five | None for visual shell; progress recovery APIs already exist | Analytics payloads must not add raw answers or private IDs. |
| Result free summary | Yes for scale-specific shells | Unlock module grid needs backend-defined module names/order | Result route must remain private/noindex. |
| Paywall/unlock grid | Not until identifiers are removed from DOM/tracking | Need confirmation of offer/module fields per scale | Current `UnlockCTA` renders order/attempt identifiers; tracking whitelist permits raw identifier keys. |

## High-Risk Blockers

1. `components/commerce/UnlockCTA.tsx` renders `SKU`, `Order`, and `Attempt` values in visible DOM. New unlock UI must not ship while raw `orderNo` or `attemptId` can be exposed.
2. `lib/tracking/events.ts` allows fields including `attempt_id`, `order_no`, `orderNo`, `order_id`, and `transaction_id` for several events. `lib/tracking/privacy.ts` masks some identifiers, but the requested new event taxonomy forbids these params entirely.
3. Existing `components/marketing/HomePageExperience.tsx` imports hardcoded social proof from `lib/marketing/socialProof.ts`. These should be removed from conversion claims unless backed by CMS/backend-verifiable evidence.
4. Landing page rating/star rendering currently depends on scale metadata such as `highlight.rating`. This must not become Review/AggregateRating/Product schema or stronger trust copy without verified data.
5. Clinical/depression slugs are correctly hidden by `lib/tests/publicTestEntryVisibility.ts`; any homepage, tests hub, related-test, sitemap, or paywall work must preserve this.
6. RIASEC must remain one flagship scale with `riasec_60` and `riasec_140`; do not create a separate IA, storage fallback, CMS stack, or result stack.

## Recommended First Implementation PR

Recommended first PR: `PR-UX-01: Homepage + Tests Hub Conversion Layout`.

Reason: the current product priority is to align the homepage UI, tests hub layout, three priority test landing pages, and result-page privacy/UI before changing the answer-taking experience. Homepage and tests hub work is the first visible conversion surface and can improve test discovery while staying render-only against existing CMS/backend authority.

Quiz Focus Mode remains important, but it moves to a later implementation PR after the public discovery, landing, and result privacy surfaces are aligned.

Required guardrails:

- render homepage/tests hub from CMS/backend-authoritative fields or minimal shell only
- do not add frontend fallback content for CMS-backed public surfaces
- no Review, AggregateRating, Product schema, or unverified trust/social proof claims
- keep clinical/depression hidden, noindex, and non-commercial
- do not expand IQ claims, paid guides, or certificates
- keep RIASEC as one flagship scale with `riasec_60` and `riasec_140`
