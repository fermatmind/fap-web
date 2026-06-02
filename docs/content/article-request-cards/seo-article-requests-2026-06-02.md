# SEO Article Request Cards — 2026-06-02

Scope: request cards for GPT-5.5 Pro only. These are not article briefs and do not contain publishable article copy.

## Global Rules

- `topic_direction` is not a title.
- `topic_direction` must not be copied verbatim as article title, H1, SEO title, slug, or meta description.
- Request cards are routing and measurement inputs only.
- Do not create final article titles.
- Do not create H1 text.
- Do not create meta title or meta description text.
- Do not create opening paragraphs.
- Do not create H2/H3 outlines.
- Do not create FAQ copy.
- Do not create body copy.
- Do not create CTA copy.
- Do not create complete article structure.
- CTA targets must be public canonical routes only.
- CTA targets must not point to result, orders, share, pay, payment, history, private test-taking, or user-specific routes.
- No request card authorizes CMS publish, payment flow, order creation, or search submission.

## A. Career Uncertainty Article Request Card

| field | value |
|---|---|
| request_id | SEO-ARTICLE-REQ-2026-06-02-A |
| status | request_only |
| content_owner | GPT-5.5 Pro |
| publish_allowed | false |
| cms_write_allowed | false |
| requires_human_approval | true |
| topic_direction | 职业迷茫类：不知道自己适合什么职业怎么办？ |
| business_goal | Guide career-intent visitors toward a public career-interest assessment journey without making deterministic career claims. |
| target_user_problem | User feels uncertain about suitable career direction and needs a structured self-understanding path. |
| primary_search_intent | Informational and career-decision support. |
| target_page | `/zh/articles/{cms-slug-to-be-created-by-gpt-and-approved-in-cms}` |
| primary_cta_target | `/zh/tests/holland-career-interest-test-riasec` |
| secondary_cta_target | `/zh/career/jobs` after sitemap/canonical strategy is confirmed; otherwise `/zh/tests/big-five-personality-test-ocean-model` |
| required_internal_links | `/zh/tests/holland-career-interest-test-riasec`, `/zh/tests/mbti-personality-test-16-personality-types`, `/zh/tests/big-five-personality-test-ocean-model`, `/zh/career/jobs` when approved |
| forbidden_routes | `/zh/result/**`, `/zh/orders/**`, `/zh/share/**`, `/zh/pay/**`, `/zh/payment/**`, `/zh/history/**`, private or tokenized URLs |
| required_claim_boundaries | Non-diagnostic, non-deterministic, no guaranteed career outcome, no hiring-fit claim, no medical or psychological diagnosis claim |
| required_measurement_events | `article_to_test_click`, `start_test`, `complete_test`, `view_result` |
| CMS fields that GPT must fill later | title, slug proposal, H1, SEO title, SEO description, excerpt, body markdown, FAQ, internal link anchor suggestions, CTA label suggestions, category/tag suggestions |
| publish prerequisites | CMS draft preview verified, draft noindex verified, absent from sitemap, CTA targets verified, claim review approved, publish approval granted |
| 7-day metrics to review | GSC impressions/clicks/index status, Baidu index/search PV if available, landing PV, article_to_test_click, start_test, private_url_seen |
| 14-day metrics to review | Indexing trend, click trend, article-to-test click rate, start-to-complete rate, view_result rate, content update decision |

## B. MBTI Vs Holland Comparison Article Request Card

| field | value |
|---|---|
| request_id | SEO-ARTICLE-REQ-2026-06-02-B |
| status | request_only |
| content_owner | GPT-5.5 Pro |
| publish_allowed | false |
| cms_write_allowed | false |
| requires_human_approval | true |
| topic_direction | MBTI vs Holland 对比类：MBTI 和霍兰德哪个更适合选职业？ |
| business_goal | Help users choose the right assessment path while clarifying that MBTI and Holland/RIASEC answer different questions. |
| target_user_problem | User is comparing personality-style and career-interest assessments for career decisions. |
| primary_search_intent | Informational comparison and tool selection. |
| target_page | `/zh/articles/{cms-slug-to-be-created-by-gpt-and-approved-in-cms}` |
| primary_cta_target | `/zh/tests/holland-career-interest-test-riasec` |
| secondary_cta_target | `/zh/tests/mbti-personality-test-16-personality-types` |
| required_internal_links | `/zh/tests/holland-career-interest-test-riasec`, `/zh/tests/mbti-personality-test-16-personality-types`, `/zh/tests/big-five-personality-test-ocean-model`, `/zh/personality` |
| forbidden_routes | `/zh/result/**`, `/zh/orders/**`, `/zh/share/**`, `/zh/pay/**`, `/zh/payment/**`, `/zh/history/**`, private or tokenized URLs |
| required_claim_boundaries | Distinguish preference/style from interest/environment fit, avoid saying one test determines career choice, avoid official or diagnostic claims |
| required_measurement_events | `article_to_test_click`, `start_test`, `complete_test`, `view_result` |
| CMS fields that GPT must fill later | title, slug proposal, H1, SEO title, SEO description, excerpt, body markdown, FAQ, internal link anchor suggestions, CTA label suggestions, category/tag suggestions |
| publish prerequisites | CMS draft preview verified, draft noindex verified, absent from sitemap, dual CTA routing verified, claim review approved, publish approval granted |
| 7-day metrics to review | GSC impressions/clicks/index status, landing PV, article_to_test_click split by target test if available, start_test, private_url_seen |
| 14-day metrics to review | Query/page trend, CTA target split, start-to-complete rate, view_result rate, whether comparison intent needs CMS revision |

## C. Holland/RIASEC Explanation Article Request Card

| field | value |
|---|---|
| request_id | SEO-ARTICLE-REQ-2026-06-02-C |
| status | request_only |
| content_owner | GPT-5.5 Pro |
| publish_allowed | false |
| cms_write_allowed | false |
| requires_human_approval | true |
| topic_direction | Holland/RIASEC 解释类：霍兰德职业兴趣测试是什么？RIASEC 六型怎么理解 |
| business_goal | Build a public explanatory entry that leads users to the Holland/RIASEC assessment without overstating career prediction value. |
| target_user_problem | User wants to understand the Holland/RIASEC model before deciding whether to take a career-interest test. |
| primary_search_intent | Informational model explanation and assessment consideration. |
| target_page | `/zh/articles/{cms-slug-to-be-created-by-gpt-and-approved-in-cms}` |
| primary_cta_target | `/zh/tests/holland-career-interest-test-riasec` |
| secondary_cta_target | `/zh/career/jobs` after sitemap/canonical strategy is confirmed; otherwise `/zh/tests/mbti-personality-test-16-personality-types` |
| required_internal_links | `/zh/tests/holland-career-interest-test-riasec`, `/zh/career/jobs` when approved, `/zh/tests/mbti-personality-test-16-personality-types`, `/zh/tests/big-five-personality-test-ocean-model` |
| forbidden_routes | `/zh/result/**`, `/zh/orders/**`, `/zh/share/**`, `/zh/pay/**`, `/zh/payment/**`, `/zh/history/**`, private or tokenized URLs |
| required_claim_boundaries | Explain RIASEC as career-interest/work-environment signal, not personality diagnosis, medical diagnosis, or guaranteed career prediction |
| required_measurement_events | `article_to_test_click`, `start_test`, `complete_test`, `view_result` |
| CMS fields that GPT must fill later | title, slug proposal, H1, SEO title, SEO description, excerpt, body markdown, FAQ, internal link anchor suggestions, CTA label suggestions, category/tag suggestions |
| publish prerequisites | CMS draft preview verified, draft noindex verified, absent from sitemap, RIASEC CTA verified, claim review approved, publish approval granted |
| 7-day metrics to review | GSC impressions/clicks/index status, Baidu index/search PV if available, landing PV, article_to_test_click, start_test, private_url_seen |
| 14-day metrics to review | Query/page trend, RIASEC CTA click rate, start-to-complete rate, view_result rate, decision to expand or revise RIASEC content |
