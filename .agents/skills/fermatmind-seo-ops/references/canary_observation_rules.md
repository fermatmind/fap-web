# Canary Observation Rules

Purpose: D1, D7, and D14 post-publish/search-channel observation.

Inputs:

- Slug and URL.
- Publish timestamp.
- Search Channel Queue or submission evidence if provided.
- GSC/Baidu/IndexNow evidence if provided.
- Internal event exports if provided.

Record:

- GSC impressions.
- GSC clicks.
- CTR.
- average position.
- visible queries.
- GSC indexed / not indexed / requested state.
- Search Channel Queue item states.
- IndexNow provider response summary.
- Baidu provider response summary.
- schema JSON-LD types.
- FAQ schema count.
- hreflang tags.
- x-default target.
- `article_to_test_click`.
- `start_test`.
- `complete_test`.
- `view_result`.
- `click_deep_report`.
- `begin_checkout`.
- `purchase_success`.
- `private_url_seen`.
- index status.
- cache status.
- notes.

Also record:

- article ID.
- published revision ID.
- canonical URL.
- publish completion timestamp when known.
- discoverability completion timestamp when known.
- IndexNow queue ID and execution state.
- Baidu queue ID, execution state, and provider message.
- GSC manual state and whether Request Indexing was clicked.
- schema state.
- hreflang state.
- D1/D7/D14 due date.
- owner.
- observation status.

Outputs:

- `SEO_CANARY_OBSERVATION_D1_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D7_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D14_<slug>.md`.

No-go: do not resubmit, retry, revalidate, mutate CMS, click GSC Request Indexing, or treat missing data as zero.

Observation is not a search-submission workflow. Provider quota failures remain visible until resolved, but observation must not retry them.

## V1.1 feedback loop

At D1, D7, and D14, create or update `CONTENT_FEEDBACK_QUEUE.md` when observations reveal reusable lessons for future briefs, including:

- title/meta underperformance.
- CTA click or transport gaps.
- private URL or global-link exception policy issues.
- schema/hreflang/sitemap/llms release timing issues.
- Search Channel provider failures.
- social image/resource warnings.
- claim boundary wording that should be reused or avoided.
