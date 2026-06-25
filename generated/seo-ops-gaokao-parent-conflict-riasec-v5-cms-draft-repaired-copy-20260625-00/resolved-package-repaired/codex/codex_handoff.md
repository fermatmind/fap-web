# Codex Handoff v5

This is a GPT-generated v5 Mode C content package, CMS-ready for QA only.

Target route: `/zh/articles/gaokao-major-choice-parent-conflict-riasec-course-checklist`
Slug: `gaokao-major-choice-parent-conflict-riasec-course-checklist`
Operation: `new_article`
Article ID: `unknown_until_cms_import`
Primary CTA: `/zh/tests/holland-career-interest-test-riasec`
Secondary CTA: `/zh/tests/mbti-personality-test-16-personality-types`

Do not write CMS, create draft, publish, enqueue/search-submit, mutate URL Truth, sitemap, llms, schema, hreflang, revalidate, deploy, or create PR without separate exact authorization.

## V5-specific QA

1. Read `GSC_STRATEGY_APPENDIX.md` before CMS dry-run.
2. Confirm this article owns only parent-child major-choice conflict intent.
3. Confirm it does not cannibalize `/zh/articles/college-major-choice-holland-mbti-career-test`.
4. Confirm P0 RIASEC test page CTR repair is either completed, actively dry-run/readback checked, or explicitly held by operator before article publish.
5. Confirm active body links are public 200/indexable or marked for resolution.
6. Confirm body visual source exists and body visual anchor renders after Media Library resolution.
7. Confirm no English runtime headings or duplicate quick-answer module in preview.
8. Confirm observation templates include target/wrong query and CTR thresholds.

Required before preview:

1. Runtime check all active links.
2. Media Library import/register for cover and body visual.
3. CMS dry-run/readback.
4. Operator review.
5. Runtime preview QA: no English headings, no duplicate quick answer card, no default sidebar blocking first screen, body visual renders.

Strategic dependency:
P0 CTR repair for `/zh/tests/holland-career-interest-test-riasec` should run before or alongside publish because this article routes primary CTA traffic to the RIASEC test page.
