# GSC Query×Page Observation Plan

Status: `post_publish_observation_template_only`

## D0 baseline

Before publish or immediately after public smoke, record:

| Field | Value |
|---|---|
| article_id | Unknown until CMS import |
| route | `/zh/articles/gaokao-major-choice-parent-conflict-riasec-course-checklist` |
| upstream page | `/zh/articles/college-major-choice-holland-mbti-career-test` |
| primary CTA target | `/zh/tests/holland-career-interest-test-riasec` |
| P0 RIASEC CTR repair state | Unknown until dry-run/readback evidence |
| sitemap/llms state | held until release workflow |
| schema/hreflang state | held |

## Target queries

- 选专业父母不同意怎么办
- 高考志愿父母不同意
- 高考志愿父母和孩子意见不一致
- 父母让报热门专业怎么办
- 孩子不喜欢父母选的专业怎么办
- 怎么和父母沟通专业

## Wrong-owner / cannibalization watchlist

If this article starts owning these queries, check cannibalization:

- 高考志愿选专业
- 霍兰德职业兴趣测试
- RIASEC 是什么
- MBTI 选专业
- 高考位次出来后怎么选专业

These should be primarily owned by upstream or test/explainer routes.

## Trigger thresholds

| Trigger | Required action |
|---|---|
| target_query_seen=false after D7 | strengthen title/meta/internal links around parent conflict |
| wrong_query_seen=true | repair owner boundary and link generic intent to upstream articles |
| avg_position 5-15 and CTR < 1% | title/meta snippet repair candidate |
| article_to_test_click < 2% | CTA copy/placement/body visual repair |
| no impressions after D7 but page is indexed | internal-link and distribution push, no automatic search submission |
| impressions from money-test queries only | ensure test page remains owner and article routes to CTA |

## Required exports

- GSC Query×Page for the article route, 7d/28d after publish.
- Page performance for upstream route `/zh/articles/college-major-choice-holland-mbti-career-test`.
- Page performance for primary CTA route `/zh/tests/holland-career-interest-test-riasec`.
- Article-to-test click analytics export if available.

Unknown must remain `Unknown`, not zero.
