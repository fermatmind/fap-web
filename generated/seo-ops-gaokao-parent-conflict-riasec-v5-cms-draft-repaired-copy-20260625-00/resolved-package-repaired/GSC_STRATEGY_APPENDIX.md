# GSC Strategy Appendix

Status: `planning_evidence_only_not_runtime_truth`

This appendix is added in v5 to connect the article package to current operator-provided GSC screenshots and prior CTR repair reports. It is not a substitute for exported Query×Page evidence.

## Operator-provided GSC screenshot baseline

The screenshots showed useful directional signals:

| Window / tab | Observed signal | How to use |
|---|---|---|
| 24h overview | approximately `5 clicks`, `270 impressions`, `CTR 1.9%`, `avg position 10.7`, with GSC data delayed around `32h` | Do not infer trend from 24h totals. Use only as a rough freshness signal. |
| 24h queries | `mbti免费测试`, `费马测试`, `大五人格测试`, `mbti测试`, `mbti免费` appeared | Confirms money-test terms are surfacing; do not let this article steal money-test intent. |
| 24h pages | `/zh/tests/mbti-personality-test-16-personality-types`, `/zh/tests/big-five-personality-test-ocean-model`, `/zh/articles/college-major-choice-holland-mbti-career-test` appeared | Existing test/article owners are visible; strengthen owner boundaries. |
| 7d overview | approximately `18 clicks`, `6,716 impressions`, `CTR 0.3%`, `avg position 12.1` | Use 7d and 28d exported Query×Page data for decisions, not screenshot trend. |
| 7d pages | `/zh/articles/college-major-choice-holland-mbti-career-test` showed impressions and low CTR; `/zh/articles/riasec-holland-career-interest-test-explained` and `/zh/tests/mbti-personality-test-16-personality-types` also showed visibility | This new page should be downstream scenario support, not replacement owner. |

## Current strategic interpretation

1. The existing Gaokao major-choice article already has visibility and should remain the owner of generic `高考志愿选专业 / 霍兰德、MBTI怎么用` intent.
2. This v5 article owns the narrower scenario: `选专业父母不同意怎么办 / 父母让报热门专业怎么办 / 高考志愿父母和孩子意见不一致 / 怎么沟通专业`.
3. The primary CTA points to `/zh/tests/holland-career-interest-test-riasec`; the P0 CTR repair report shows that the RIASEC test page has rankings/impressions but weak CTR, so P0 RIASEC landing-surface repair should run before or alongside this article publish.
4. This article should receive a downlink from `/zh/articles/college-major-choice-holland-mbti-career-test` after it is public, but it should not cannibalize that upstream page.

## Baseline from prior P0 CTR repair evidence

Prior P0 repair artifacts identify `/zh/tests/holland-career-interest-test-riasec` as a P0 test landing surface candidate. The selected repair direction was:

- selected title: `霍兰德职业兴趣测试：免费 RIASEC 结果`
- selected meta direction: free RIASEC result and career-exploration clues, with no major/admission promise
- claim boundary: results are for directional reference; no professional, admission, job-match, or career-outcome guarantee

## Publish dependency

Before or alongside publishing this article, run or confirm the P0 RIASEC test page CTR repair lane:

1. Backend/CMS dry-run for P0 CTR repair payload.
2. Operator review of title/meta/hero/CTA changes.
3. Gate A landing-surface write for `/zh/tests/holland-career-interest-test-riasec`, if dry-run passes and operator authorizes it.
4. Runtime readback of title/meta/H1/hero/CTA.

This article can still be prepared as a package, but publishing it before fixing the RIASEC landing page may waste some CTA traffic.

## D7 / D14 observation rules for this article

| Condition | Interpretation | Action |
|---|---|---|
| `target_query_seen=false` | Google is not associating the article with parent-conflict queries. | Strengthen title/meta around `父母不同意 / 意见不一致 / 沟通 / 怎么办`; add stronger internal link from upstream article. |
| `wrong_query_seen=true` | Article may be cannibalizing generic Gaokao/RIASEC intent. | Adjust intro/internal links to push generic intent back to upstream pages and test page. |
| `avg_position` between `5` and `15` and `CTR < 1%` | Snippet is visible but not winning clicks. | Test short SEO title candidate and tighter meta. |
| `article_to_test_click < 2%` | Tool page is not moving users toward RIASEC test. | Improve CTA position, CTA copy, and body visual placement. |
| GSC only shows 24h data | Data is delayed/noisy. | Wait for 7d/28d exports before strategy conclusions. |

## Non-goals

- Do not change article title based on `mbti免费测试` or other money-test terms.
- Do not add admission prediction, major matching, employment, salary, or career-success claims.
- Do not submit GSC/IndexNow/Baidu from this package.
- Do not enable schema/hreflang/sitemap/llms here.
