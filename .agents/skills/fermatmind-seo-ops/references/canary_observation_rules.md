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

Outputs:

- `SEO_CANARY_OBSERVATION_D1_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D7_<slug>.md`.
- `SEO_CANARY_OBSERVATION_D14_<slug>.md`.

No-go: do not resubmit, retry, revalidate, or treat missing data as zero.
