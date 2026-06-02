# PR-UX-01 Homepage Tests Hub Specialized UX Scan

Date: 2026-06-02

Mode: read-only specialized UX scan. No application code, CMS data, backend, routes, sitemap, robots, llms, schema, metadata, canonical, payment, quiz, result, report, checkout, analytics, or private-flow code changed.

Final decision: `pr_ux_01_specialized_scan_completed_ready_for_implementation`

## Scope And Sources

Browser-inspected public surfaces:

- 123test: `https://www.123test.com/`, `https://www.123test.com/all-tests/`, `https://www.123test.com/personality-test/`
- Truity: `https://www.truity.com/`, `https://www.truity.com/view/tests/personality`, `https://www.truity.com/test/big-five-personality-test`
- FermatMind: `https://fermatmind.com/`, `https://fermatmind.com/en`, `https://fermatmind.com/zh/tests`, `https://fermatmind.com/en/tests`

Repository-inspected surfaces:

- `app/(root)/page.tsx`
- `app/(localized)/[locale]/page.tsx`
- `app/(localized)/[locale]/tests/page.tsx`
- `components/marketing/HomePageExperience.tsx`
- `components/marketing/tests/TestsHubExperience.tsx`
- `lib/marketing/homepageContent.ts`
- `lib/marketing/testsHubContent.ts`
- `lib/tests/publicTestEntryVisibility.ts`

## A. Homepage Gap Analysis

### Current Module Order

Observed `/`, `/en`, and source show this current order:

1. Global site chrome with search, language switch, and `Start` link to MBTI.
2. Large centered hero.
3. Three trust cards from `copy.trust.items`.
4. Local `HomepageSocialProofBanner` using `SCENARIO_VALIDATIONS` and `EVIDENCE_LOGS`.
5. Highlighted tests grid from `copy.quickStart.items.slice(0, 6)`.
6. About block with locally-authored labels/body plus links.
7. Recommended articles from CMS article/page-block authority.
8. Footer test/article/company/policy links.

### Current CTA Hierarchy

- Header primary acquisition CTA is `Start`, hard-routed to the MBTI landing page.
- Hero currently has title/subhead only in the rendered component, even though `HomePageContent.hero` contains primary, secondary, and tertiary CTA fields.
- The first test-specific CTAs appear only after trust and social-proof sections, so the user must scroll before seeing the main test-selection grid.
- Test cards use a start/detail label from CMS/local normalization, but the hierarchy does not separate first-phase tests from secondary tests.

### Current Hardcoded/CMS/Backend Split

| Surface element | Current source | Gap |
|---|---|---|
| Hero title/subhead/SEO | CMS landing surface `home` through `getHomePageContent` | CTA fields exist but are not rendered in the hero. |
| Quick-start tests | CMS payload plus `REQUIRED_QUICK_START_ITEMS` completion in `lib/marketing/homepageContent.ts` | Local completion behaves like frontend fallback content; PR-UX-01 should not add more and should prefer omission/minimal shell when CMS is missing. |
| Trust cards | CMS `copy.trust.items` | Safe if CMS-authoritative; do not add new unverified claims. |
| Social proof/use cases | Local `lib/marketing/socialProof.ts` | Risky because verification authority is not established; includes clinical-related evidence log records even if the current carousel only renders quote/author/role. |
| About block labels/body/cards | Local component strings in `HomePageExperience.tsx` | Claim-bearing public copy should move to CMS/backend authority or be omitted. |
| Recommended reading | CMS articles/page blocks through `getHomepageRecommendedArticles` | Safe when empty state omits the section. |
| Structured data | WebPage, Organization, ItemList only | Do not add Review, AggregateRating, or Product schema. |

### Unverified Claims Or Social Proof Risks

- Current local social-proof data uses verification-like labels, dates, scores, personas, and scenario records without confirmed CMS/backend evidence authority.
- Current local social-proof data contains clinical/depression-related records. Even if not all fields render, it is unsafe to reuse or expand for PR-UX-01.
- Homepage trust can remain only where sourced from published CMS/backend fields; new user counts, media mentions, ratings, expert review, or scientific-validation claims are out of scope.
- IQ appears in homepage quick-start completion and tests hub. PR-UX-01 may preserve existing safe IQ placement but must not expand IQ claims, paid guide framing, certificate framing, or stronger authority language.

### Missing Conversion Modules

- Above-fold dual CTA: start a prioritized test and browse all tests.
- Category matrix: personality, career, ability, emotional/relationship, with clinical/depression omitted or hidden.
- Priority test strip: MBTI, Big Five, and RIASEC as the first-phase conversion set.
- Result preview teaser: free summary structure versus deeper report boundary, only if CMS/backend fields exist.
- Method/privacy boundary: anonymous or low-friction start, privacy handling, non-diagnostic boundary, and no deterministic promise.
- Short "how it works" rhythm: choose, answer, view free result, optionally go deeper.

### Mobile Issues Observed

- Mobile `/en` becomes a very long single-column page before the user reaches test selection.
- Mobile `/en/tests` is a single-column card list with no category jump, priority strip, or compact selector.
- Cookie banner overlaps near the first test-card area on mobile; PR-UX-01 acceptance should include a mobile first-viewport check for CTA visibility and no critical-card occlusion after normal cookie-banner states.

## B. Tests Hub Gap Analysis

### Current Card Hierarchy

The tests hub currently renders:

- centered hero title/body;
- one flattened list of unique cards from `content.families.items.map((family) => family.tests)`;
- each card includes title, description, question count, duration, output label, optional CMS media shell, and one primary detail CTA;
- no separate category matrix, filters, list/tile mode, "choose by question" selector, or first-phase featured rail.

### Category Structure

- `TestsHubContent` already defines `quickStart`, `families`, `howToChoose`, `trust`, `resources`, and `finalCta`.
- `TestsHubExperience` currently renders only `hero` and flattened `families.items[].tests`.
- This means useful CMS-backed category/question data exists in the type contract but is not used in the current UI.

### Clinical/Depression Visibility

- Browser inspection of `/zh/tests` and `/en/tests` did not show clinical/depression cards.
- Source confirms `filterVisiblePublicTestEntries` removes pending clinical/depression slugs through `isClinicalDepressionPendingSlug`.
- PR-UX-01 must preserve this filter everywhere cards, category links, quick-start items, and footer-related test links are rendered.

### MBTI / Big Five / RIASEC Prominence

- MBTI and Big Five are first and second in the observed hub list.
- RIASEC appears after Enneagram and EQ, despite being first-phase priority.
- The hub should make MBTI, Big Five, and RIASEC visually prominent as the first three recommended entry points while preserving Enneagram/EQ/IQ as secondary existing tests.

### Selection Friction Points

- All cards have similar weight, so users must read each card to pick a starting point.
- Primary action is "view dedicated page" rather than a low-friction start/browse pair.
- There is no question-led selector like "I want to understand personality / explore career direction / practice ability".
- Test cards do not expose a clear free-result/deeper-report boundary.
- IQ safe disclaimer is present, but the card still competes equally with first-phase conversion tests.

### Mobile Issues Observed

- Mobile hub is a long list, around six large cards before footer.
- The user sees hero copy before cards but no compact category chips or priority row.
- Card height is high; a three-test priority strip would reduce first-choice scroll cost.

## C. 123test / Truity Mechanics Extraction

| Mechanic | 123test evidence | Truity evidence | Apply to FermatMind? | Implementation note |
|---|---|---|---|---|
| Low-friction directory entry | Homepage sends users toward a test finder; all-tests page starts with a question selector and dense cards. | Homepage places a test-card grid immediately after the hero. | Yes. | Render a prominent hero CTA plus immediate priority tests/category matrix. |
| Question-led selection | All-tests page offers a dropdown for user intent before listing cards. | Category pages frame entries by use case and sequence. | Yes. | Use `TestsHubContent.quickStart.items` if CMS-backed; omit if missing. |
| Dense card structure | Test cards use title, short purpose, category context, and direct action. | Test cards use compact title/subtitle/image/action patterns. | Yes. | Cards need title, short scenario, question/time/result metadata, and clear CTA; no copied visuals. |
| Category grouping | Directory has personality, career, IQ, assessment, and sidebar category counts. | Navigation and directory pages cluster by personality/career/team use cases. | Yes, partially. | Use personality/career/ability/emotional groupings; keep clinical/depression hidden and do not promote enterprise in phase one. |
| Trust near conversion path | 123test places privacy/free/reliability signals and reviews around the funnel. | Truity places media/testimonial/business proof after test entry. | Use only verified mechanics. | Keep privacy/method-boundary signals; do not add unverifiable reviews, ratings, expert claims, media mentions, or user counts. |
| Direct test-start rhythm | 123test landing includes an early test CTA and embeds the answer flow close to instructions. | Truity Big Five page places the answer flow near the top after short explanation. | Future PR only. | PR-UX-01 can improve entry routing; test landing/quiz changes stay PR-UX-02/05. |
| Free summary to paid depth | 123test mentions optional extended report on some landing/result flows. | Truity describes free overview and optional full report/sample report. | Future PR only. | Homepage may preview result structure only if backend/CMS defines the boundary; unlock grid waits for PR-UX-04. |
| Mobile compression | Both competitor patterns prioritize quick test entry and compact selectable surfaces. | Truity keeps cards visible early in the flow. | Yes. | Mobile should show primary CTA/category chips/priority tests before long narrative sections. |
| Business/team entrance | Both have business/team paths. | Truity homepage has a team/business block. | No for PR-UX-01. | Enterprise/team remains out of first phase. |

## D. PR-UX-01 Implementation Blueprint

### Exact Files Likely Touched

- `components/marketing/HomePageExperience.tsx`
- `components/marketing/tests/TestsHubExperience.tsx`
- `lib/marketing/homepageContent.ts` only if removing local quick-start completion or tightening normalization is explicitly scoped.
- `lib/marketing/testsHubContent.ts` only if rendering existing CMS fields requires validation helpers.

Files to inspect but normally not modify:

- `app/(root)/page.tsx`
- `app/(localized)/[locale]/page.tsx`
- `app/(localized)/[locale]/tests/page.tsx`
- `lib/tests/publicTestEntryVisibility.ts`
- `lib/marketing/socialProof.ts`

### Proposed Homepage Component Structure

| Section | Data source | Add/reorder | Omit if missing |
|---|---|---|---|
| `HomepageConversionHero` | `copy.hero` CTA/title/subhead/trust rail | Add primary/secondary CTA rendering above fold. | If `copy.hero` missing, existing minimal shell remains. |
| `HomepageCategoryMatrix` | `copy.families.items` or CMS category fields | Move immediately after hero or after compact trust rail. | Omit when families/categories are absent. |
| `HomepagePriorityTests` | CMS quick-start/test metadata filtered by public visibility | Feature MBTI, Big Five, RIASEC first. | Omit specific cards not present in CMS/backend authority. |
| `HomepageHowItWorks` | CMS `secondaryExplore`, `results`, or future page block | Add only as structural CMS-backed steps. | Omit rather than hardcode steps. |
| `HomepageResultPreviewTeaser` | `copy.results.previews` | Show free/deeper boundary without fake personal data. | Omit if result preview fields are absent. |
| `HomepageMethodBoundary` | `copy.trust.items` and `copy.trust.methodHref` | Replace local social proof emphasis with privacy/method boundaries. | Omit unsupported claim-bearing items. |
| `HomepageRelatedGuides` | CMS articles/page blocks | Keep existing behavior. | Current component already returns null when empty. |

### Proposed Tests Hub Component Structure

| Section | Data source | Add/reorder | Omit if missing |
|---|---|---|---|
| `TestsHubHero` | `content.hero` | Add primary/secondary CTA if content fields exist. | If content missing, minimal shell remains. |
| `TestsHubQuestionSelector` | `content.quickStart.items` | Add question-led selector/chips near top. | Omit when items empty. |
| `TestsHubPriorityStrip` | Filtered cards for MBTI, Big Five, RIASEC | Feature first-phase tests before full grid. | Omit a card if backend/CMS omits it. |
| `TestsHubCategoryMatrix` | `content.families.items` | Restore family/category browsing instead of flatten-only. | Omit empty categories. |
| `TestsHubAllTestsGrid` | Filtered unique cards | Keep full list with improved hierarchy. | Omit hidden clinical/depression entries. |
| `TestsHubHowToChoose` | `content.howToChoose.items` | Add decision support after priority cards. | Omit when absent. |
| `TestsHubTrustBoundary` | `content.trust.items` | Render only privacy/method boundaries. | Omit unverifiable trust claims. |
| `TestsHubResources` | `content.resources.items` | Render CMS-backed guides only. | Omit if no CMS resources. |

### Safety Gates

- All public test entries must pass `filterVisiblePublicTestEntries`.
- Clinical/depression/anxiety slugs remain hidden/noindex/non-commercial.
- RIASEC remains one flagship scale under `/tests/holland-career-interest-test-riasec`.
- IQ remains an existing secondary test with current cautious boundary; no new IQ expansion.
- No Review, AggregateRating, Product schema, star ratings, user counts, media mentions, expert review, or social-proof claims unless verified by backend/CMS authority.
- No frontend fallback copy for CMS-backed public sections.
- No payment, result, checkout, quiz, analytics, route, sitemap, robots, llms, schema, metadata, or canonical changes in PR-UX-01.

### Validation Commands For Implementation PR

- `pnpm typecheck`
- Route smoke for `/`, `/en`, `/zh/tests`, `/en/tests`
- Mobile smoke at 390px width for `/en` and `/en/tests`
- `git diff --check`
- Scope check confirming changed files stay within PR-UX-01 declared files

### Acceptance Criteria

- Homepage shows a clear first-viewport path to start a priority test and browse all tests.
- Homepage test selection appears earlier than current social-proof/about narrative.
- Tests hub shows MBTI, Big Five, and RIASEC as first-phase priority without hiding existing safe tests.
- Tests hub includes question/category support when CMS fields exist.
- Missing CMS fields omit sections or render existing minimal shell; no frontend editorial fallback appears.
- Browser inspection confirms no clinical/depression card or link appears on homepage/test hub surfaces.
- IQ copy and placement do not become stronger than current public boundary.
- No schema, route, sitemap, robots, llms, metadata, canonical, payment, quiz, result, or analytics behavior changes.

### Rollback Plan

Revert only PR-UX-01 rendering changes in `HomePageExperience` and `TestsHubExperience`, plus any explicitly scoped content-normalization edits. Keep PR-UX-00 docs and future PR sequencing intact. Since PR-UX-01 should not mutate CMS/backend/payment/routes/schema, rollback should not require data migration.

## E. No-Go Checks

- No clinical/depression exposure: confirmed as a required PR-UX-01 gate; current tests hub browser scan did not show these cards, and source filtering exists.
- No IQ expansion: PR-UX-01 may keep current IQ card only; no new IQ paid guide, certificate, or authority claim.
- No new hardcoded social proof: current local social-proof use is a risk to reduce, not expand.
- No Review/AggregateRating/Product schema: PR-UX-01 must not add or change schema.
- No CMS fallback copy: new sections must use CMS/backend fields or be omitted.
- No route/schema/sitemap changes: PR-UX-01 scope is render-only for homepage/tests hub.

## PR Train Note

Only `PR-UX-00` is currently registered in `docs/codex/pr-train.yaml` and `docs/codex/pr-train-state.json`. Before implementation, PR-UX-01 through PR-UX-06 still need explicit manifest/state authorization using the order already recorded in `docs/ux/fermatmind-ux-safe-pr-plan.md`.
