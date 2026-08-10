# EN RIASEC exact query/SERP baseline and CMS experiment proposal

Status: `RIASEC_EXACT_BASELINE_AND_CMS_EXPERIMENT_PROPOSAL_READY_NOT_APPLIED`

Captured at: `2026-08-10T07:27:42Z`

Exact GSC source: M01 combined query/page/country/device export, SHA-256 `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`.

This scope is a read-only audit and proposal. It does not write CMS content, change metadata/runtime behavior, create region routes, alter canonical/hreflang/schema/sitemap/llms/indexability, or trigger deployment.

## Authority and product boundary

The canonical public surface is `/en/tests/holland-career-interest-test-riasec`. Backend authority currently exposes one flagship RIASEC assessment with two forms:

| Form | Questions | Approximate time | Verified boundary |
|---|---:|---:|---|
| `riasec_60` | 60 | 8 minutes | Default, shorter form |
| `riasec_140` | 140 | 18 minutes | More contextual; not more accurate |

Both forms measure career-interest dimensions. They do not measure aptitude, ability, personality identity, job fit, hiring suitability, or outcome probability. Cross-form raw scores are not directly comparable, and occupation examples are exploration prompts rather than recommendations. Item lineage, sample/norm details, reliability, validity, independent reviewer identity, and a public changelog remain `UNKNOWN` under B03; no accuracy or validation superlative is permitted.

Read-only live observations at capture time:

- API title: `Holland Career Interest Test (RIASEC)`.
- Rendered HTML title: `Free Holland Career Interest Test | RIASEC Full Report | FermatMind`.
- Rendered H1: `Free Holland Career Interest Test with Full Report`.
- API flags: `paywall_mode=free_only`, public and indexable.

These are observations, not authorization to change the surface. Backend CMS landing surfaces/page blocks remain the content authority.

## Exact-query ownership baseline

`en_riasec_serp.csv` contains 257 rows for 16 exact query strings across `current28`, `prev28`, and `day90`, split by market, device, and current page owner. A missing exact query is recorded as `UNKNOWN_NOT_RETURNED_IN_PRIVACY_FILTERED_TOP_ROWS`, never as zero.

Current 28-day window: `2026-07-13/2026-08-09`.

| Exact query | Current28 returned owner | Impressions | Clicks | Decision |
|---|---|---:|---:|---|
| `riasec` | Existing explainer article | 105 | 0 | Protect informational owner; landing may support but must not override blindly |
| `RIASEC test` | Existing explainer article | 73 | 0 | Direct-test intent candidate for landing metadata/first-fold experiment |
| `what is RIASEC` | Existing explainer article | 16 | 0 | Protect article ownership; article refresh decision belongs to E04 |
| `Holland career test` | Existing explainer article | 5 | 0 | Direct-test intent candidate for landing experiment |
| `"career interest test" holland` | Assessment landing | 4 | 0 | Preserve and measure existing landing ownership |

The required queries `Holland Code test`, `career interest test`, `career aptitude test`, `career personality test`, `RIASEC types`, `RIASEC 60 question test`, and `RIASEC 140 question test` were not returned as exact rows in the M01 privacy-filtered export. Their traffic and ownership are therefore unknown, not zero. The CSV also audits five observed model/name variants so the experiment does not erase the current explainer/landing division.

Country is not language. `US`, `UK`, and `OTHER` indicate GSC country segments only. No regional URL, locale, or country-specific content authority is inferred.

## Current SERP sample

Non-personalized web-search samples were reviewed on 2026-08-10 for the ten required query intents. This is qualitative current research, not exact US/UK/device rank tracking, a complete top ten, or a ranking guarantee.

| Intent group | Observed result mix | FermatMind decision |
|---|---|---|
| `RIASEC test`, `Holland Code test`, `Holland career test` | Direct tests, public career tools, commercial tools, and explainers | Test landing is the candidate direct-intent owner; explainer remains supporting context |
| `career interest test` | Interest inventories, assessment tools, and career-guidance resources | Candidate phrasing only; preserve the interest-only boundary |
| `career aptitude test` | Aptitude/skills quizzes and career-match tools | Do not make the RIASEC landing the primary owner |
| `career personality test` | Personality/career combination tools and commercial match products | Explain interest versus personality; no RIASEC-as-personality claim |
| `what is RIASEC`, `RIASEC types` | Definitions, explainers, university/career resources | Existing explainer is the intended owner |
| `RIASEC 60 question test`, `RIASEC 140 question test` | Product/form-navigation intent; exact 140Q competitor cohort was noisy | Use only verified FermatMind form facts; no equivalence or superiority claim |

External O*NET, CareerOneStop, education, or commercial resources may describe related constructs or instruments. They do not validate FermatMind's forms and must not be presented as an affiliation, endorsement, or instrument-equivalence claim.

## CMS experiment proposal — not applied

Authority owner: fap-api CMS `landing_surfaces` / `page_blocks` and their public API output.

Exact target surface: `/en/tests/holland-career-interest-test-riasec` only.

Experiment unit: one same-canonical metadata and first-fold variant. No new route, regional IA, schema-only claim, hidden copy, local frontend fallback, or article rewrite.

### Proposed variant

| Element | Proposed value |
|---|---|
| Title | `Free Holland Career Interest Test (RIASEC) | FermatMind` |
| Meta description | `Explore six RIASEC career-interest dimensions with a free Holland Code test. Choose 60 questions (about 8 minutes) or 140 questions (about 18 minutes). Interests are not aptitude or guaranteed career fit.` |
| H1 | `Free Holland Career Interest Test (RIASEC)` |
| First-fold boundary | `Explore six career-interest dimensions. This test does not measure aptitude, ability, personality, hiring suitability, or guaranteed career fit.` |
| 60Q CTA | `Start 60-question form (about 8 min)` |
| 60Q helper | `The shorter default form.` |
| 140Q CTA | `Start 140-question form (about 18 min)` |
| 140Q helper | `More contextual, not more accurate. Raw scores are not directly comparable with the 60-question form.` |
| Visible result value | `See your six interest-dimension pattern and use the Holland Code as a starting point for exploration; occupation examples are not recommendations.` |

The phrase `Full Report` should not be the primary value claim until the exact visible result scope and free entitlement are revalidated against the CMS/public API response in the implementation PR. The proposal intentionally uses observable result value instead of implying comprehensive career matching.

### Hypotheses

1. Aligning the title/H1 with direct `RIASEC test` and `Holland career test` intent should improve qualified landing impressions and clicks without displacing the explainer for definition/type intent.
2. Showing both form lengths before the first action should reduce ambiguity and increase `test_start / landing_view` while protecting informed choice.
3. Explicitly stating that 140Q is more contextual, not more accurate, should prevent misleading superiority inference without materially reducing starts.
4. Short, form-specific mobile CTA labels and visible time estimates should reduce first-fold friction on mobile while preserving the same product contract.

These are hypotheses, not observed effects.

## Measurement plan

Baseline pre-period: E01/M01 `current28`, `2026-07-13/2026-08-09`. Preserve the exact pre-period snapshot and candidate CMS revision/commit before implementation. The implementation, if separately authorized, must record the exact publication time and variant identity.

### Search measures

- GSC exact query × page × `US`/`UK`/`OTHER` × device impressions, clicks, CTR, and impression-weighted position.
- Owner share for direct-test queries between the assessment landing and existing explainer.
- Guardrail owner share for `what is RIASEC`, `RIASEC types`, and model/meaning queries.
- Brand/non-brand and query-class rollups only when derived from exact rows; privacy-filtered missing rows remain unknown.

### Product measures

Use existing event contracts only:

- `landing_view`.
- `start_attempt` / GA4 `test_start`, segmented by `form_code`.
- `submit_attempt` / `test_submit` and `complete_test` / `test_complete`, segmented by `form_code`.
- `view_result` / `result_view` plus trusted `riasec_result_view`.
- `questions_load_failure`, `submit_failure`, and `result_load_failure` as safety guardrails.

Derived funnels:

- `test_start / landing_view` by device and form.
- `test_complete / test_start` by device and form.
- trusted `riasec_result_view / test_start` by device and form.
- failure-event rate by device, form, and stage.

Do not add a new event or infer a form when `form_code` is absent. Event availability and deduplication must be verified in the separate implementation scope before any decision is attributed to the variant.

### Readout schedule

| Checkpoint | Purpose | Decision boundary |
|---|---|---|
| T+3 | Confirm publication identity, analytics continuity, CTA/form routing, mobile rendering, and error guardrails | Safety/instrumentation only; no SEO performance conclusion |
| T+7 | Directional query-owner and funnel check | Continue unless a stop condition is met; no expansion |
| T+14 | Interim search/funnel assessment by market and device | Hold if volume is insufficient or owner cannibalization is ambiguous |
| T+28 | Compare with the frozen 28-day pre-period and document decision | Keep, revise, or roll back; never generalize to new IA without a new scope |

No minimum detectable effect or statistical confidence threshold can be claimed from the current sparse baseline. Report absolute counts, rates, segment coverage, and uncertainty; `insufficient data` is a valid T+28 outcome.

## Stop, hold, and rollback

Stop or roll back the candidate CMS revision if any of the following occurs:

- The published copy diverges from the verified 60Q/140Q facts or introduces accuracy, aptitude, personality, recommendation, affiliation, or outcome claims.
- CTA routing, result access, or existing form behavior regresses.
- Failure rates materially increase against the preserved pre-period/adjacent stable period, especially on mobile.
- Mobile `test_start / landing_view` materially declines with stable instrumentation and comparable traffic.
- Direct-intent owner alignment worsens while the explainer loses definition/type ownership.
- Analytics continuity, `form_code`, publication identity, or exact query/page evidence cannot be trusted.

Hold the experiment decision when volume is too small, GSC rows are privacy-filtered, seasonality or another release confounds the period, or the pre/post observation windows are not comparable. Do not manufacture a zero or a positive result.

Rollback method for a separately authorized implementation: restore the exact prior CMS revision for title/meta/H1/first-fold/form chooser, verify public API and rendered readback, and keep the same canonical and indexability state. This audit does not execute that rollback or create the CMS revision.

## Explicit non-actions

- `explicitly_not_applied: true`
- No CMS write, production import, database migration, runtime change, manual deploy, or production deploy.
- No canonical, hreflang, schema, sitemap, llms, noindex, or indexability change.
- No new route, regional IA, pSEO surface, career recommendation surface, or frontend editorial fallback.
- No RIASEC article refresh in E02; article ownership and refresh/hold decisions are E04 scope.
- No claim that the SERP sample is stable ranking data or that the proposed copy will improve performance.

## Repository rule impact

None. This PR records evidence and a future CMS-authority experiment proposal. It does not change content ownership, publishing SOP, backend CMS models, public APIs, frontend fallback behavior, or SEO discoverability surfaces.
