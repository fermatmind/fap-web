# FermatMind UX Component Inventory

Date: 2026-06-02

This inventory maps the exact files and data seams for homepage, tests hub, landing pages, quiz-taking, result shell, and paywall/unlock planning. It is repository-grounded and docs-only.

## Frontend Routes And Shells

| Area | File | Current responsibility | UX implication |
|---|---|---|---|
| Root homepage | `app/(root)/page.tsx` | Chinese canonical homepage, metadata, JSON-LD, `HomePageExperience` or minimal shell | Rendering can be redesigned, but content must come from backend landing surface and verified CMS article feeds. |
| Localized homepage | `app/(localized)/[locale]/page.tsx` | Localized home variants, metadata, JSON-LD | Same rendering contract as root; preserve canonical/alternate behavior. |
| Localized layout | `app/(localized)/[locale]/layout.tsx` | Wraps localized pages with `SiteChrome`, analytics scripts, cookie banner, providers | Quiz Focus Mode may need a route-level immersive layout or shell behavior so global chrome does not reduce completion rate. |
| Tests hub | `app/(localized)/[locale]/tests/page.tsx` | Tests index metadata, collection JSON-LD, `TestsHubExperience` | Hub redesign should consume CMS `tests` landing surface and public test entries only. |
| Test landing | `app/(localized)/[locale]/tests/[slug]/page.tsx` | Scale lookup, metadata, CTA routing, FAQ, related articles, landing sections | Shared landing template can be extracted, but current route contains many safety gates that must stay in place. |
| Quiz take | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` | Dispatches to scale-specific take clients and noindex metadata | UX shell work must preserve dispatch by scale and noindex. |
| Result page | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | Private result route with noindex, renders `ResultClient` | Result conversion work must not make this public or indexable. |
| Result lookup | `app/(localized)/[locale]/results/lookup/page.tsx` | Email-based result recovery | Keep private/recovery-only; not an acquisition page. |
| Order wait/status | `app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx` | Order status, purchase success analytics | Use only after privacy-safe checkout instrumentation is defined. |

## Homepage And Tests Hub Components

| Component/file | Current inputs | Current risks | Safe next use |
|---|---|---|---|
| `components/marketing/HomePageExperience.tsx` | `HomePageContent`, CMS articles, localized paths | Hardcoded trust/about/social proof text and visible claim surfaces | Refactor into render-only sections; replace claim-bearing content with CMS/backend authority fields or remove. |
| `components/marketing/tests/TestsHubExperience.tsx` | `TestsHubContent`, filtered public test entries | Can expose CMS media pending placeholders; category copy/order is CMS-dependent | Increase density and test-card hierarchy without adding local editorial copy. |
| `lib/marketing/homepageContent.ts` | `landing_surfaces.home`, page blocks, public test visibility filter | Completes quick-start items locally for some tests | Future implementation should not add more local fallback content; prefer CMS/API or minimal shell. |
| `lib/marketing/testsHubContent.ts` | `landing_surfaces.tests`, category surfaces | Filters visible entries, but still depends on payload shape | Good source for tests hub layout; add schema validation if CMS fields expand. |
| `lib/marketing/homepageRecommendedArticles.ts` | CMS page block article references | Correctly requires published/public articles | Use as-is for related guides; no frontend article fallback. |
| `lib/marketing/socialProof.ts` | Hardcoded scenario validations and evidence logs | Verification source is not established in this audit | Do not reuse for conversion trust claims until backend/CMS authority is confirmed. |
| `lib/tests/publicTestEntryVisibility.ts` | Hidden slug list and clinical holdlist | Safety-critical filter | Preserve and test when changing homepage/tests hub/related test rendering. |

## Test Landing Components And Contracts

| File/contract | Current responsibility | First-phase use |
|---|---|---|
| `app/(localized)/[locale]/tests/[slug]/page.tsx` | One dynamic landing implementation for MBTI, Big Five, RIASEC, Enneagram, IQ, EQ, clinical | Extract visual template only if safety gates, rollout gates, IQ guards, clinical noindex, and canonical redirects remain intact. |
| `components/analytics/TrackedEntryCtaLink.tsx` | CTA attribution from landing to take flow | Keep, but align new event names with privacy-safe taxonomy. |
| `components/mbti/MbtiLandingSurfaceSections.tsx` | MBTI-specific landing sections | Use only with backend-backed MBTI landing payload; do not copy into Big Five/RIASEC. |
| `components/riasec/RiasecLandingSurfaceSections.tsx` | RIASEC-specific landing sections | Keep under canonical RIASEC scale and forms. |
| fap-api `ScalesLookupController` | Returns scale metadata, `content_i18n_json`, `report_summary_i18n_json`, `landing_surface_v1`, forms, commercial/view policy | Primary backend authority for landing meta and form options. |
| fap-api `ScaleRegistry` and `ScaleRegistrySeeder` | Stores scale metadata and public content fields | Any new landing field should be added/validated here or CMS, not hardcoded in frontend. |

## Quiz Components

| Component/file | Current responsibility | PR-UX-05 note |
|---|---|---|
| `QuizTakeClient.tsx` | Generic MBTI/RIASEC/IQ quiz flow, attempt start, submit, recovery, immersive/non-immersive rendering | Main target for MBTI/RIASEC Focus Mode. Do not alter answer model or submit payload. |
| `Big5TakeClient.tsx` | Big Five-specific quiz flow, consent, milestones, submission | Requires separate UX adaptation; do not assume generic client shape. |
| `components/quiz/QuizTakeHeaderV2.tsx` | Header, progress bar, completed counter, estimated time | Can become Focus Mode header if global layout and mobile behavior are tightened. |
| `components/quiz/QuizShell.tsx` | Card wrapper | Likely replace or reduce framing for focused quiz layout. |
| `components/quiz/immersive/ImmersiveTakeLayout.tsx` | Immersive section wrapper with progress/back/footer | Strong base for Focus Mode. Needs save/recovery states and route-level distraction reduction. |
| `components/quiz/immersive/V2LikertScale.tsx` | Five-point radio scale with arrow-key support | Reuse for Likert; maintain keyboard accessibility. |
| `components/quiz/immersive/AdaptiveOptionGroup.tsx` | Radio group for option sets with arrow-key support | Reuse for single-choice options. |
| `components/quiz/matrix/MatrixQuestionTable.tsx` | Matrix-style question rendering | Include in state/interaction spec if Big Five or future forms use matrix interaction. |
| `lib/quiz/store.tsx` | Client quiz state provider | Use for progress/answer state; no persistence authority change without backend confirmation. |
| `lib/quiz/urlTokenGuard.ts` | Token/query guard for quiz URLs | Preserve privacy behavior. |

## Result And Unlock Components

| Component/file | Current responsibility | Risk/readiness |
|---|---|---|
| `ResultClient.tsx` | Fetches access/report/result/submission, routes to scale shells, handles email gate/recovery | Central result shell target. Several tracking calls include raw attempt identifiers in payload; future analytics must be redacted/forbidden. |
| `components/result/RichResultReport.tsx` | Rich report renderer/gating for multiple scales | Has hardcoded module labels/offers/locked copy for MBTI; unlock grid should instead render backend/CMS module definitions. |
| `components/result/big5/Big5ResultShell.tsx` | Big Five public projection, sections, locked sections, recommended offers | Candidate source for free summary and locked section UX. |
| `components/result/riasec/RiasecResultShell.tsx` | RIASEC trusted/public result shell | Candidate source for free summary; paid expansion must follow backend modules only. |
| `components/result/mbti/MbtiResultShell.tsx` | MBTI result shell, unlock click tracking | Existing conversion events should be privacy-audited before adding new event names. |
| `components/big5/paywall/OfferCard.tsx` | Big Five offer presentation | Displays SKU/module lists; acceptable only if SKU/module codes are intended public metadata. |
| `components/commerce/UnlockCTA.tsx` | Generic unlock card and payment action | Blocks new paywall UI because it visibly renders `Order` and `Attempt` values. |
| `lib/commerce/checkoutAction.ts` | Normalizes checkout response into redirect/order wait actions | Keep payment behavior unchanged. |
| `lib/commerce/pendingOrder.ts` | Session storage for pending order context | Contains order/attempt context for recovery; do not expose in UI or analytics. |
| `lib/commerce/redirectUrls.ts` | Sanitizes first-party/provider redirects | Keep as payment safety boundary. |

## Backend Contracts

| Backend file | Contract | UX dependency |
|---|---|---|
| `backend/routes/api.php` | Public v0.3/v0.5 routes for scale lookup, attempts, reports, commerce, CMS landing surfaces | Source of route truth; frontend docs should not propose new routes for PR-UX-01/02. |
| `backend/app/Http/Controllers/API/V0_3/ScalesLookupController.php` | Lookup payload includes scale codes, forms, SEO, content/report summaries, landing surface | Landing template fields should align here. |
| `backend/app/Http/Controllers/API/V0_5/Cms/LandingSurfaceController.php` | Published public landing surfaces and page blocks | Homepage/tests hub content authority. |
| `backend/app/Http/Controllers/API/V0_3/AttemptWriteController.php` | Start/submit attempt lifecycle | Quiz Focus Mode must preserve request shape. |
| `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Result/report/report-access payloads and public projections | Result shell and unlock grid authority. |
| `backend/app/Services/Report/ReportGatekeeper.php` | Resolves locked state, access level, offers, modules allowed/offered/preview, view policy | Unlock grid must use these fields instead of invented report modules. |
| `backend/app/Services/Report/Resolvers/OfferResolver.php` | Normalizes paywall offer and CTA payload | Required for clean offer labels/prices/modules. |
| `backend/app/Services/Report/Resolvers/AccessResolver.php` | Resolves modules allowed/preview and access level | Required for free vs paid boundary. |
| `backend/app/Services/Commerce/SkuCatalog.php` | SKU source | Required before exposing SKU labels/prices publicly. |
| `backend/app/Http/Controllers/API/V0_3/CommerceController.php` | Checkout/order status/recovery | Payment CTA must only call this through existing frontend adapters. |

## Analytics Inventory

| File | Current behavior | Required UX change |
|---|---|---|
| `lib/analytics.ts` | Consent-gated client events; adds locale/current path/session id | New events should use sanitized taxonomy and avoid private params. |
| `lib/tracking/client.ts` | Maps events to GA4/Baidu/Ads and enriches conversion payload | Rename/add UX events only after taxonomy is finalized. |
| `lib/tracking/events.ts` | Event constants, whitelist, payload filtering | Must remove forbidden raw identifier fields from new conversion events, and preferably deprecate raw fields from existing funnel events. |
| `lib/tracking/privacy.ts` | URL redaction and identifier masking | Masking is not enough for the requested forbidden params; new taxonomy should omit them. |
| `lib/big5/analytics.ts` | Big Five analytics helpers | Align Big Five question/progress events with the shared privacy-safe taxonomy. |

## No-Go Content And Claim Inventory

- Do not create frontend copy for homepage/test hub/test landing modules that should come from `landing_surfaces`, `page_blocks`, `ScaleRegistry`, or CMS articles.
- Do not add local MDX/content JSON/static public images for publishable content.
- Do not add review snippets, star ratings, AggregateRating, Product schema, user counts, expert review claims, media mentions, or scientific validation claims unless the backend/CMS source is verified.
- Do not create paid clinical report, clinical paywall, clinical result guide, IQ result guide, IQ certificate, or new IQ authority claim.
- Do not expose `attemptId`, `orderNo`, `reportId`, private result id, email, phone, transaction id, payment recovery token, checkout URL, raw answers, or answer vectors in UI text, DOM debug text, analytics payloads, or data attributes.
