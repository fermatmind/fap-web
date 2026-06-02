# FermatMind UX Safe PR Plan

Date: 2026-06-02

This plan records the PR-UX sequence and the scope boundaries for the UX conversion work. The PR-UX-00 manifest/state registration is included only after explicit user authorization; future PR-UX-01 through PR-UX-06 manifest/state updates still require explicit authorization before implementation.

## PR Train Authorization Needed

Exact manifest/state entries to authorize before execution:

```yaml
- id: PR-UX-00
  title: "PR-UX-00: Conversion Surface Map And Implementation Readiness"
  scope:
    include:
      - docs/ux/fermatmind-ux-conversion-surface-map.md
      - docs/ux/fermatmind-ux-component-inventory.md
      - docs/ux/fermatmind-ux-safe-pr-plan.md
      - docs/codex/pr-train.yaml
      - docs/codex/pr-train-state.json
    exclude:
      - app/**
      - components/**
      - lib/**
      - public/**
  depends_on: []
  local_checks:
    - git diff --check
  merge_policy:
    github_checks_required: repo_default
    note: "Docs-only PR; no extra custom runtime checks beyond repository defaults."
```

```json
{
  "id": "PR-UX-00",
  "status": "planned_docs_only",
  "commit_sha": null,
  "pr_url": null,
  "checks": {
    "git diff --check": "pending"
  },
  "failure_reason": null,
  "merged_at": null,
  "remote_branch_deleted": false,
  "local_cleanup_executed": false
}
```

Follow-up execution prompt:

```text
Authorize adding PR-UX-01 through PR-UX-06 to docs/codex/pr-train.yaml and docs/codex/pr-train-state.json using the scopes in docs/ux/fermatmind-ux-safe-pr-plan.md, then implement PR-UX-01 only.
```

## PR-UX-01: Homepage And Tests Hub Conversion Layout

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-01` |
| Proposed title | `PR-UX-01: Homepage And Tests Hub Conversion Layout` |
| Scope | Rework homepage and tests hub rendering into higher-density discovery surfaces using existing CMS/backend content. |
| Files likely touched | `components/marketing/HomePageExperience.tsx`, `components/marketing/tests/TestsHubExperience.tsx`, `lib/marketing/homepageContent.ts`, `lib/marketing/testsHubContent.ts` only if schema normalization is needed. |
| Non-goals | No CMS mutation, no local copy fallback, no static assets, no new claims/schema, no clinical amplification, no IQ expansion. |
| Data/CMS dependency | Module order, category labels, featured tests, trust text, and related guides must come from `landing_surfaces`/`page_blocks` or scale catalog. |
| Risks | Current hardcoded social proof may be tempting to reuse; it must be removed or authority-backed. CMS gaps must render omitted sections or minimal shell, not frontend editorial copy. |
| Validation commands | `pnpm typecheck`; route smoke for `/`, `/zh`, `/zh/tests`; `git diff --check`. |
| Acceptance criteria | Homepage/test hub render dense, low-friction test discovery; no unverified claims; no clinical/depression exposure; CMS empty response still minimal shell/error, not full local copy. |
| Rollback plan | Revert HomePageExperience/TestsHubExperience rendering changes. |

Dependency assumptions:

- CMS already contains enough landing surface payload for existing sections.
- Any new module ordering/labels are provided by CMS before launch.

## PR-UX-02: Test Landing Page Template

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-02` |
| Proposed title | `PR-UX-02: Test Landing Page Template For MBTI Big Five RIASEC` |
| Scope | Extract/render a shared landing template for the three first-phase tests: above fold, what-you-get, preview, who-for, method/boundary, FAQ, related tests. |
| Files likely touched | `app/(localized)/[locale]/tests/[slug]/page.tsx`, `components/marketing/tests/*`, `components/mbti/MbtiLandingSurfaceSections.tsx`, `components/riasec/RiasecLandingSurfaceSections.tsx`, new render-only components under `components/marketing/tests/`. |
| Non-goals | No frontend editorial copy fallback, no schema expansion, no review/rating claims, no clinical/IQ expansion, no result/paywall changes. |
| Data/CMS dependency | Required fields must be present in `ScaleRegistry.content_i18n_json`, `report_summary_i18n_json`, `landing_surface_v1`, or CMS page blocks. |
| Risks | Existing route has many rollout/safety gates; extraction could accidentally weaken IQ/clinical guards. |
| Validation commands | `pnpm typecheck`; route smoke for MBTI/Big Five/RIASEC/clinical/IQ; `git diff --check`. |
| Acceptance criteria | The three first-phase landing pages share layout; start CTA remains low friction; FAQ/source copy is backend/CMS/i18n-backed; clinical stays hidden/noindex; IQ claims unchanged. |
| Rollback plan | Revert template extraction and return to current dynamic route rendering. |

Dependency assumptions:

- No backend field migration is included unless explicitly authorized.
- Missing CMS fields render omitted sections, not local fallback content.

## PR-UX-03: Result Privacy Cleanup

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-03` |
| Proposed title | `PR-UX-03: Result Privacy Cleanup` |
| Scope | Remove visible `Order`/`Attempt` identifiers and prevent raw `orderNo`, `attemptId`, and `reportId` from appearing in DOM or analytics. |
| Files likely touched | `components/commerce/UnlockCTA.tsx`, `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`, `components/result/mbti/MbtiResultShell.tsx`, `components/result/big5/Big5ResultShell.tsx`, `components/result/riasec/RiasecResultShell.tsx`, `lib/tracking/events.ts`, `lib/tracking/privacy.ts` if required for redaction. |
| Non-goals | No new paywall UI, no unlock grid, no payment provider/checkout changes, no clinical/IQ paid flow, no public result route. |
| Data/CMS dependency | None for removing identifier exposure. |
| Risks | Existing tracking whitelist permits raw identifiers; cleanup must not break legitimate order recovery or private result access. |
| Validation commands | `pnpm typecheck`; targeted result/commerce tests if present; `git diff --check`; DOM inspection for no raw order/attempt/report IDs in visible result/unlock UI. |
| Acceptance criteria | Raw order/attempt/report identifiers are absent from visible UI, debug text, data attributes, and new analytics payloads; result route remains noindex/private; payment state behavior is unchanged. |
| Rollback plan | Revert privacy cleanup only; restore existing result/payment behavior without changing backend state. |

Dependency assumptions:

- Existing private identifiers may still be used internally for API calls and recovery, but not exposed to the user, DOM, or analytics.

## PR-UX-04: Result Shell And Unlock Grid Shell

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-04` |
| Proposed title | `PR-UX-04: Result Shell And Unlock Grid Shell` |
| Scope | Build a reusable result shell and unlock grid shell for MBTI, Big Five, and RIASEC using only backend-defined modules. |
| Files likely touched | `components/result/RichResultReport.tsx`, `components/result/big5/Big5ResultShell.tsx`, `components/result/riasec/RiasecResultShell.tsx`, `components/result/mbti/MbtiResultShell.tsx`, `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`, possibly new render-only result components. |
| Non-goals | No clinical/depression paywall, no IQ result guide/certificate, no invented report modules, no payment provider changes, no raw identifier exposure, no public result route. |
| Data/CMS dependency | Backend must confirm `modules_allowed`, `modules_offered`, `modules_preview`, `offers`, `upgrade_sku`, `cta`, SKU labels, and price/payment state for MBTI/Big Five/RIASEC. |
| Risks | Unlock grid may overpromise if module labels are inferred client-side. Payment CTA must not render unless verified SKU/payment state exists. |
| Validation commands | `pnpm typecheck`; targeted result shell tests if present; `git diff --check`; smoke for MBTI/Big Five/RIASEC result pages. |
| Acceptance criteria | Free summary and locked grid are separated; grid renders only backend-defined modules; payment CTA appears only with verified SKU/payment state; clinical and IQ paths unchanged; no unsupported module is displayed. |
| Rollback plan | Revert result shell/unlock grid shell changes; keep PR-UX-03 privacy cleanup intact unless separately reverted. |

Dependency assumptions:

- PR-UX-03 privacy cleanup is complete.
- Backend report-access payload remains the module authority.
- Payment CTA continues using existing checkout flow only when verified state exists.

## PR-UX-05: Quiz Focus Mode

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-05` |
| Proposed title | `PR-UX-05: Quiz Focus Mode` |
| Scope | Improve quiz-taking layout and state feedback for MBTI/RIASEC generic client and Big Five client after public discovery and result privacy surfaces are aligned. |
| Files likely touched | `app/(localized)/[locale]/tests/[slug]/take/page.tsx`, `QuizTakeClient.tsx`, `Big5TakeClient.tsx`, `components/quiz/QuizTakeHeaderV2.tsx`, `components/quiz/QuizShell.tsx`, `components/quiz/immersive/*`, `components/big5/quiz/*`, possibly `lib/quiz/store.tsx`. |
| Non-goals | No scoring changes, no question changes, no attempt API changes, no result/paywall changes, no CMS changes, no clinical/IQ expansion. |
| Data/CMS dependency | None for core focus-mode rendering. i18n keys may be needed for state labels and error labels. |
| Risks | Generic and Big Five clients differ; global localized layout may still show chrome/cookie UI unless handled carefully; new analytics must not include raw answers or private IDs. |
| Validation commands | `pnpm typecheck`; targeted quiz tests if present; `git diff --check`; manual smoke for MBTI, Big Five, RIASEC take pages. |
| Acceptance criteria | Progress visible; answer state clear; mobile tap targets usable; keyboard navigation works; loading/error/recovery states present; completion CTA only enabled when valid; no scoring/API contract changes. |
| Rollback plan | Revert focus-mode components/client layout changes only; keep existing clients and API calls intact. |

Dependency assumptions:

- Existing attempt start/submit/progress APIs remain stable.
- No backend or CMS change is required.
- Privacy-safe analytics taxonomy is not implemented in this PR except avoiding new unsafe events.

## PR-UX-06: Analytics A/B And Production Smoke

| Item | Plan |
|---|---|
| Proposed train id | `PR-UX-06` |
| Proposed title | `PR-UX-06: Analytics A/B And Production Smoke` |
| Scope | Add privacy-safe conversion event taxonomy, A/B flags, production smoke checklist, and dashboard definitions for the new UX funnel. |
| Files likely touched | `lib/tracking/events.ts`, `lib/tracking/privacy.ts`, `lib/tracking/client.ts`, `lib/analytics.ts`, `components/analytics/*`, quiz/result/commerce callers, docs/runbooks or docs/ux dashboard docs. |
| Non-goals | No raw identifier tracking, no raw answers, no user/email/phone identifiers, no payment payload exposure, no implementation changes outside analytics/smoke scope. |
| Data/CMS dependency | Experiment copy/modules still CMS-controlled. Dashboard needs finalized privacy-safe event names. |
| Risks | Existing whitelist permits raw identifiers; changing event filtering may affect current dashboards. Purchase/payment metrics should not become first-week hard goals. |
| Validation commands | `pnpm typecheck`; analytics unit tests if present; event payload snapshot tests; `git diff --check`; smoke script commands if added. |
| Acceptance criteria | New events exist: `homepage_cta_clicked`, `test_card_clicked`, `test_started`, `quiz_question_answered`, `quiz_progress_25/50/75`, `quiz_completed`, `result_viewed`, `save_result_clicked`, `unlock_grid_viewed`, `unlock_cta_clicked`, `checkout_started`, `purchase_success`; forbidden params are omitted, not merely masked; smoke covers homepage, tests hub, three landing pages, result privacy, unlock shell, and no clinical/IQ expansion. |
| Rollback plan | Revert new event names, callers, A/B flags, and smoke docs/scripts; leave existing legacy events intact unless separately approved. |

Dependency assumptions:

- PR-UX-01 through PR-UX-05 are complete or their deferred risks are documented.
- Dashboards can handle a transition period from legacy to new event names.
- Product agrees that raw identifiers are forbidden in UX events.

## A/B Test Plan

| Test | Control | Variant A | Variant B | Success metric | Guardrail metric | Minimum runtime | Stop conditions |
|---|---|---|---|---|---|---|---|
| Homepage discovery | Current homepage/tests cards | Category matrix plus prioritized MBTI/Big Five/RIASEC | Category matrix plus result preview teaser | Test card click and test start | Noindex/hidden slug leakage, load performance | 14 days | Clinical/depression visible, CMS fallback copy appears, performance regression |
| Landing CTA density | Current landing page | Above-fold compact meta and single primary CTA | Above-fold CTA plus result preview anchor | Test start rate | Bounce, scroll depth collapse, clinical/IQ exposure | 14 days | Unverified claim appears, start click rises while completion drops materially |
| Result unlock grid | Current result/paywall rendering | Free summary plus backend-defined unlock grid | Unlock grid plus sample structure preview | Unlock CTA click and checkout start | Refund/support complaints, result page abandonment | 21 days | Raw identifier exposure, payment error increase, unsupported module displayed |
| Quiz Focus Mode | Current quiz shell | Focus header/progress and reduced chrome | Focus shell plus milestone confirmations | Quiz completion rate | Submit failure rate, average time spike, mobile rage taps | 14 days or one full weekly cycle | Any scoring/API regression, submit failure increase, privacy event violation |

## Seven-Day Minimum Conversion Validation Version

Can do immediately:

- PR-UX-01 homepage and tests hub conversion layout using existing CMS/backend-authoritative content.
- PR-UX-02 landing template alignment for MBTI, Big Five, and RIASEC, with missing CMS fields omitted rather than locally filled.
- PR-UX-03 result privacy cleanup to remove visible `Order`/`Attempt` identifiers and prevent raw identifiers in DOM or analytics.
- Define docs/runbook checks for no clinical/IQ expansion.

Must wait:

- Payment and purchase are not first-week hard goals.
- Unlock grid must wait for result privacy cleanup and backend module/offer confirmation.
- Payment CTA must wait for verified SKU/payment state.
- Analytics expansion must wait for privacy-safe event whitelist changes.

## Thirty-Day Productized Version

Can do after dependencies:

- Shared landing template for MBTI/Big Five/RIASEC.
- Backend/CMS-backed homepage and tests hub layout.
- Result free summary plus unlock grid with backend-defined modules.
- Privacy-safe event taxonomy and A/B dashboards.

Must wait:

- Any new report module labels, sample report structure, or trust/methodology text not already in backend/CMS.
- Any payment claim, guarantee, refund, or report value text not confirmed by commerce/legal/CMS authority.

## Ninety-Day Designer/PM Handoff Version

Can do after productization:

- Design system polish across homepage, hub, landing, quiz, result, unlock.
- Conversion dashboard and experiment cadence.
- CMS authoring model for module ordering, landing blocks, FAQs, and trust evidence.
- Product governance checklist for future tests.

Must wait:

- Clinical/IQ review before any clinical paid flow, clinical result guide, IQ paid guide, IQ certificate, or stronger IQ authority claims.

## Absolute No-Go List

- No clinical/depression paid report, paywall, SEO amplification, or commercial result guide.
- No IQ certificate, IQ paid result guide, or new unreviewed authority claims.
- No unverified user counts, expert reviews, media mentions, ratings, Review schema, AggregateRating schema, or Product schema.
- No raw answers, raw attempt id, order number, report id, private result id, email, phone, transaction id, payment token, checkout URL, or recovery token in analytics or visible DOM.
- No frontend fallback content for CMS-backed public content surfaces.
- No parallel RIASEC stack or legacy 36Q local product surface.
