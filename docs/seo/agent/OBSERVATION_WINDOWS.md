# SEO Agent Observation Windows

Status: MVP0 contract

Every executed SEO Agent action needs an observation plan before it can expand to similar pages.

## D1 Runtime Verification

Purpose:

- Verify public runtime and discovery surfaces after the action.

Check:

- HTTP status and redirect chain.
- Canonical.
- Robots.
- Title/meta/H1.
- Schema types.
- Hreflang.
- Sitemap inclusion.
- `llms.txt` and `llms-full.txt` inclusion.
- Private URL, token, result, order, payment, attempt, or admin URL absence.

Rollback conditions:

- Public URL becomes 4xx/5xx unexpectedly.
- `noindex` appears unexpectedly.
- Canonical points to wrong locale, private URL, or unrelated page.
- Schema/hreflang appears without explicit approval.
- Sitemap/llms inclusion changes outside the approved lane.

## D7 Early Search / Traffic / Indexability Observation

Purpose:

- Review early visibility and query fit without overreacting to noise.

Check when data is available:

- GSC impressions.
- GSC clicks.
- CTR.
- Average position.
- Visible queries.
- Baidu landing signals.
- Search Channel readiness state.
- `article_to_test_click`, `start_test`, `complete_test`.

Rollback conditions:

- Search queries indicate misleading title/meta intent.
- Indexability or coverage regresses.
- Conversion path breaks.
- Private URL or unsafe claim appears.

## D14 Trend Review

Purpose:

- Decide whether the change is directionally working before repeating it.

Check:

- Search trend vs baseline.
- Query coverage and query type.
- CTR movement.
- Internal click path.
- Test funnel metrics.
- Claim-risk or private URL reports.

Rollback conditions:

- Sustained negative trend with no offsetting evidence.
- Conversion or test-start behavior regresses.
- Claim-risk review fails.
- Search provider or runtime state shows unexpected side effects.

## D28 Keep / Rollback / Expand Decision

Purpose:

- Decide whether to keep, rollback, or expand the action pattern.

Check:

- D28 clicks and impressions.
- CTR and average position.
- Query intent fit.
- Conversion funnel.
- CMS/operator feedback.
- Search Channel/provider state.
- Page-family similarity.

Keep conditions:

- Runtime state is stable.
- Claim and private URL gates remain clean.
- Search and conversion evidence is neutral or positive.

Rollback conditions:

- Material traffic, conversion, or indexability regression.
- Unsupported claim or route/canonical issue.
- Provider state worsens after the action.

Expand conditions:

- D14 and D28 both show stable or positive trend.
- Same page-family has matching authority, intent, and risk profile.
- Required source data is `LIVE_API` and verified.
- Human approval exists for any CMS or provider lane.

## Page-Family Expansion Rules

Do not expand from one page to a family when:

- The original evidence was mock, fixture, unknown, or access-required.
- The target pages have different route authority.
- The target pages need schema/hreflang changes not separately approved.
- The target pages include sensitive/private flows.
- GPT 5.5 Pro reports unresolved claim risk.
