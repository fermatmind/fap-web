# EN Articles exact ownership, refresh, hold, and stop-new-work audit

Status: `EN_ARTICLE_LEDGER_EXACT_MARKET_SPLIT_COMPLETE_ACTIONS_NOT_APPLIED`

Captured at: `2026-08-10T08:02:26Z`

This E04 scope recomputes the 40 current EN Article identities from the current public API, the exact M01 query×page×country×device export, and the Window 5 Article authority/owner/90-day ledgers. It records follow-up candidates only.

No Article CMS patch, body edit, publication instruction, redirect, consolidation, noindex, unpublish, delete, sitemap/llms change, W3 package edit, W3 promotion, search submission, or deployment is applied.

## Current authority inventory

Exact API source: `https://api.fermatmind.com/api/v0.5/articles?locale=en&per_page=100`, response SHA-256 `6c40be12b867a7757d0cf7000e1244c1dde55b01b503d1b7e5cb79a0162e8759`.

| State | Articles |
|---|---:|
| Public and published | 40 |
| Indexable | 23 |
| Sitemap eligible | 22 |
| llms eligible | 22 |
| W3 exact cohort, public but non-indexable/outside sitemap/llms | 17 |

One indexable Article, `/en/articles/why-mbti-and-holland-code-results-dont-match`, is currently outside sitemap/llms. E04 records that exact state but does not infer a defect or authorize a discoverability change.

Every CSV row binds the current API `Article:{id}`, published revision, source Article identity, slug/canonical, translation group, publication/indexability gates, title/meta, and the Window 5 H1 whose CMS revision identity matches the current API revision.

## Exact data method

Sole GSC source: M01 combined safe joint export, SHA-256 `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`.

Windows:

- `current28`: `2026-07-13/2026-08-09`
- `prev28`: `2026-06-15/2026-07-12`
- `day90`: `2026-05-12/2026-08-09`

For each Article, `en_article_decisions.csv` records full `US`/`UK`/`OTHER`/independent `GLOBAL` × `ALL`/desktop/mobile/tablet metrics for all three windows. Returned cells contain clicks, impressions, CTR, impression-weighted position, and source-row count.

M01 is a privacy-filtered top-row export. `UNKNOWN` means no safe row was returned; it does not mean zero. Country is not language. Impression change is search visibility evidence, not business growth, conversion, or causal impact.

| Window | Articles with returned rows | Impressions | Clicks |
|---|---:|---:|---:|
| current28 | 6 | 592 | 0 |
| prev28 | 9 | 606 | 0 |
| day90 | 11 | 1,368 | 0 |

The Window 5 exact owner decisions and query×page evidence are joined without fuzzy remapping. An Article is called a current owner only when that reviewed contract names it. Observed but unmapped queries remain unknown.

## Decision ledger

| Decision | Articles | Meaning |
|---|---:|---|
| `REFRESH` | 1 | Source/claim-gated informational refresh candidate; separate Article CMS scope required |
| `HOLD` | 27 | 17 W3-isolated rows plus 10 ordinary rows with low, historical, mismatched, or otherwise insufficient current evidence |
| `INSUFFICIENT_DATA` | 12 | No M01 row returned across current28, prev28, or day90 |

No Article qualifies for `CONSOLIDATE_CANDIDATE`, redirect, unpublish, noindex, or deletion in E04. `STOP_NEW_WORK_30D_NOT_DELETE_UNPUBLISH_NOINDEX` applies portfolio-wide and is recorded separately from each Article's row decision.

## Refresh candidate — not applied

Exact page/current owner: `/en/articles/what-is-riasec-holland-code-career-interest-test`.

Exact current28 page evidence: 558 impressions, 0 clicks, 0% CTR, position 42.5125.

Leading exact returned queries:

- `riasec`: 105 impressions, 0 clicks, position 42.4857.
- `riasec test`: 73 impressions, 0 clicks, position 51.4384.
- `holland code riasec`: 20 impressions, 0 clicks, position 43.8000.
- `holland code riasec test`: 20 impressions, 0 clicks, position 53.1000.
- `what is riasec`: 16 impressions, 0 clicks, position 23.1250.

Decision: refresh informational definition/model intent only. Preserve the Window 4/5 owner contract and the E02 direct-test boundary: the Article must not absorb the assessment landing's intended ownership for `riasec test` or become an aptitude, personality, ability, job-fit, recommendation, or outcome-prediction page.

Current source state: the live Article body has no explicit external source reference detected in the Window 5 ledger. A future Article CMS scope must first bind appropriate sources and current RIASEC public-method boundaries, then revalidate title/meta/H1, native English, CTA, and visible claims. The existing Window 5 draft/package does not authorize import or publication here.

Expected measurement: exact query×page GSC metrics by market/device at T+7/T+14/T+28; assessment-landing versus explainer owner share; visible CTA/`article_to_test_click` contract and trusted downstream attribution when available. Current per-Article production attribution remains unknown.

Rollback: restore the exact prior CMS revision if the owner boundary, claims, locale, rendering, CTA routing, or comparable search/funnel signals regress.

`applied=false`.

## Important holds

`/en/articles/big-five-emotional-stability-stress-recovery-communication` has 28 current28 impressions, 0 clicks, and position 8.1071, but most exact impressions reference the quoted third-party phrase “Big Five Emotional Release Bundle,” not the Big Five trait intent. E04 therefore changes the prior apparent near-winner interpretation to `HOLD_QUERY_INTENT_MISMATCH`; FermatMind must not optimize toward or imply affiliation with that unrelated product/entity. The exact trait query `big five emotional stability` has only 2 impressions in current28.

Nine other ordinary Articles have only low or historical returned evidence and remain `HOLD`. Twelve have no returned rows in all three windows and remain `INSUFFICIENT_DATA`. Missing rows do not justify new translation work, a refresh, consolidation, or disposal.

## Query competition and cannibalization

Cannibalization is declared only when Window 5 contains the same normalized current28 query on more than one page. The only included EN Article with reviewed multi-page evidence is the RIASEC explainer:

- `riasec` also appears on the zh Article; the reviewed EN explainer remains the intended EN owner.
- `riasec test` also appears on a legacy/noncanonical route; the current returned owner is the EN explainer while the intended direct-test owner is the assessment landing.

These observations do not authorize consolidation or redirect. All other rows state `NONE_DECLARED_WITHOUT_SAME_QUERY_MULTI_PAGE_EVIDENCE`.

## Current content, parity, sources, and CTA

Each row records current title/meta/H1, primary intent, source-reference state, claim sensitivity, CTA target/visibility, and Article→test event/attribution evidence.

- Full current native-English body quality remains `UNKNOWN` for ordinary Articles; metadata identity is not a body-quality proof.
- Translation groups and source locale are traceable, but translation parity quality remains unknown unless a SHA-bound W3 fact explicitly supports it.
- Source absence is not filled with low-quality translation or unsupported claims.
- CTA presence and the `article_to_test_click` source contract do not prove a per-Article production click or qualified completion; attribution remains unknown where Window 5 says unknown.

## W3 exact-lane isolation

The exact 17 W3 Article identities are bound only to package SHA `d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a`. Their current API titles/excerpts match the frozen package source ledger, and the API exposes them as public but non-indexable and outside sitemap/llms.

E04 does not interpret or reconcile the lane manifest's current status and receipt references. Every W3 row is `HOLD` with `E04_NO_PROMOTION_ACTION`; trusted receipt recovery, monotonic reconciliation, registration, deterministic V2 materialization, and live QA belong exclusively to E06. No Career Guide package enters this scope.

## Window 5 90-day authority and stop-new-work rule

Window 5 remains the sole 90-day disposal authority. All 40 rows retain `NOT_AUTHORIZED_INCOMPLETE_90D`, `NEED_MORE_DATA`, and `execution_authorized=false` from that ledger.

For 30 days: `STOP_NEW_WORK`. This means no bulk new EN Article work while exact owner and conversion evidence mature. It does not mean delete, redirect, noindex, unpublish, archive, or alter sitemap/llms. Those actions remain unavailable until the formal Window 5 review and a separate authorized scope.

## Repository rule impact

None. This PR is a read-only Article evidence/decision audit. It does not change content ownership, CMS models, public APIs, publishing SOP, frontend fallbacks, Article runtime, W3 package bytes, or SEO discoverability surfaces.
