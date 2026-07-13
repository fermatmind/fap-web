# BIG5-AUTHORITY-V2-BENCHMARK-01 — FermatMind versus Truity

- Decision: `PASS_BIG5_AUTHORITY_V2_BENCHMARK_LOCKED`
- Evidence captured: `2026-07-13T16:25:54.347Z`
- Canonical inventory: 127 = 114 personality + 9 articles + 2 tests + 2 topics.
- Redirect-only inventory: 10 zh legacy aliases, excluded from the canonical total.
- Boundary: read-only benchmark; no CMS write, runtime change, indexability change, deploy, or search submission.

## Ownership lock

| Page family | Count | Primary content owner |
| --- | ---: | --- |
| Personality hub | 2 | BIG5-AUTHORITY-V2-HUB-07 |
| Domains | 10 | BIG5-AUTHORITY-V2-DOMAINS-08 |
| Facet hubs | 2 | BIG5-AUTHORITY-V2-FACET-HUBS-09 |
| Ranges and EN legacy canonicals | 40 | BIG5-AUTHORITY-V2-RANGE-*-10..14 |
| Facet details | 60 | BIG5-AUTHORITY-V2-FACETS-*-15..19 |
| Test landings | 2 | BIG5-AUTHORITY-V2-TEST-LANDING-20 |
| Existing articles and topic hubs | 11 | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 |

The artifact JSON locks all 37 downstream PR02–38 ownership rows. Cross-cutting contract, source, QA, media, link-graph, SEO/GEO, release-gate, and runtime-closeout ownership remains separate from each page's primary content owner.

## Current observed integrity signals

- HTTP 200 canonicals: 127/127.
- Duplicate brand titles: 17 pages.
- Visible internal operational terms: 6 pages.
- Pages linking to the five named guide targets: 30; PR02 must resolve and validate final targets before repair.
- Pages with private-path links: 0.
- Pages with visible reviewer signals: 1; visible source/external-evidence signals: 32.

These are snapshot observations, not publication eligibility decisions. PR02 owns integrity repairs; PR03–06 own the evidence contract and editorial gates.

## Truity structural benchmark

Truity is used only for public page-family, intent, depth, evidence, trust, media, internal-link, freshness, SEO/GEO, and conversion structure. Its wording and marketing claims are not FermatMind evidence and must not be copied or paraphrased.

| Family | URL | HTTP | Visible words | Reviewer signal | External evidence links | Internal links |
| --- | --- | ---: | ---: | --- | ---: | ---: |
| test_landing | https://www.truity.com/test/big-five-personality-test | 200 | 1559 | yes | 0 | 12 |
| test_directory | https://www.truity.com/view/tests/big-five-personality | 200 | 626 | no | 0 | 5 |
| model_hub | https://www.truity.com/blog/page/big-five-personality-traits | 200 | 1894 | yes | 7 | 14 |
| domain | https://www.truity.com/blog/page/openness-dimension-personality | 200 | 2339 | no | 8 | 14 |
| domain | https://www.truity.com/blog/page/conscientiousness-dimension-personality | 200 | 1935 | no | 7 | 14 |
| domain | https://www.truity.com/blog/page/extraversion-dimension-personality | 200 | 1873 | no | 6 | 15 |
| domain | https://www.truity.com/blog/page/agreeableness-dimension-personality | 200 | 1705 | no | 11 | 14 |
| domain | https://www.truity.com/blog/page/neuroticism-dimension-personality | 200 | 1787 | no | 9 | 14 |
| topic_hub | https://www.truity.com/blog/topic/big-five | 200 | 249 | no | 0 | 20 |
| facet_test | https://www.truity.com/test/30-trait-personality-test | 200 | 380 | no | 0 | 0 |
| business_conversion | https://www.truity.com/truity-at-work/product/big-five | 200 | 426 | no | 0 | 10 |

Observed reusable architecture patterns are a test landing with explanatory copy and FAQ, a Big Five test directory, a model hub, five domain explainers, a topic stream, a 30-trait test path, technical documentation, a sample report, and a business conversion path. FermatMind must reproduce only appropriate information architecture through backend/CMS authority; Truity claims, reviewer facts, counts, phrasing, and conversion promises are not transferable evidence.

## Ten zh redirect-only aliases

| Alias | HTTP | Observed location | Expected canonical |
| --- | ---: | --- | --- |
| /zh/personality/big-five/high-openness | 301 | /zh/personality/big-five/openness-high | /zh/personality/big-five/openness-high |
| /zh/personality/big-five/low-openness | 301 | /zh/personality/big-five/openness-low | /zh/personality/big-five/openness-low |
| /zh/personality/big-five/high-conscientiousness | 301 | /zh/personality/big-five/conscientiousness-high | /zh/personality/big-five/conscientiousness-high |
| /zh/personality/big-five/low-conscientiousness | 301 | /zh/personality/big-five/conscientiousness-low | /zh/personality/big-five/conscientiousness-low |
| /zh/personality/big-five/high-extraversion | 301 | /zh/personality/big-five/extraversion-high | /zh/personality/big-five/extraversion-high |
| /zh/personality/big-five/low-extraversion | 301 | /zh/personality/big-five/extraversion-low | /zh/personality/big-five/extraversion-low |
| /zh/personality/big-five/high-agreeableness | 301 | /zh/personality/big-five/agreeableness-high | /zh/personality/big-five/agreeableness-high |
| /zh/personality/big-five/low-agreeableness | 301 | /zh/personality/big-five/agreeableness-low | /zh/personality/big-five/agreeableness-low |
| /zh/personality/big-five/high-neuroticism | 301 | /zh/personality/big-five/neuroticism-high | /zh/personality/big-five/neuroticism-high |
| /zh/personality/big-five/emotional-stability | 301 | /zh/personality/big-five/neuroticism-low | /zh/personality/big-five/neuroticism-low |

## Per-page scorecard

Scores are planning signals from 0–3 per dimension (conversion 0–2). They do not prove scientific validity, content correctness, human review, search ranking, or AI citation. Detailed raw metrics and all dimensions are in the JSON and CSV.

| Path | Family | Primary owner | Total | Observed gaps |
| --- | --- | --- | ---: | --- |
| /en/articles/big-five-conscientiousness-low-procrastination-task-plan | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 19 | visible_evidence |
| /en/articles/big-five-emotional-stability-stress-recovery-communication | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 19 | visible_evidence, author_reviewer_dates |
| /en/articles/big-five-personality-test-vs-mbti | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 19 | visible_evidence, author_reviewer_dates |
| /en/personality/big-five | personality_hub | BIG5-AUTHORITY-V2-HUB-07 | 14 | visible_evidence, author_reviewer_dates, media_og, visible_internal_operational_terms |
| /en/personality/big-five/agreeableness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/agreeableness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/agreeableness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/agreeableness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/conscientiousness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/conscientiousness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/conscientiousness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 15 | visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/conscientiousness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/emotional-stability | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/extraversion | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 12 | content_depth, visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/extraversion-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/extraversion-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/extraversion-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/facets | facet_hub | BIG5-AUTHORITY-V2-FACET-HUBS-09 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/facets/achievement-striving | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/actions | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/activity | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/aesthetics | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/altruism | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/anger | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/anxiety | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/assertiveness | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/competence | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/compliance | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/deliberation | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/depression | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/dutifulness | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/excitement-seeking | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/feelings | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/gregariousness | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/ideas | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/imagination | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/impulsiveness | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/modesty | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/order | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/positive-emotions | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/self-consciousness | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/self-discipline | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/straightforwardness | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/tender-mindedness | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/trust | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/values | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/vulnerability | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/facets/warmth | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/high-agreeableness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/high-conscientiousness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/high-extraversion | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/high-neuroticism | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/high-openness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/low-agreeableness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/low-conscientiousness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/low-extraversion | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/low-openness | legacy_en_canonical | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, dead_guide_targets_require_pr02_validation |
| /en/personality/big-five/neuroticism | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/neuroticism-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 16 | visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/neuroticism-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/neuroticism-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/openness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 14 | visible_evidence, author_reviewer_dates, media_og |
| /en/personality/big-five/openness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 15 | visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/openness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/personality/big-five/openness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, duplicate_brand_title |
| /en/tests/big-five-personality-test-ocean-model | test_landing | BIG5-AUTHORITY-V2-TEST-LANDING-20 | 13 | content_depth, visible_evidence, author_reviewer_dates |
| /en/topics/big-five | topic_hub | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 11 | content_depth, visible_evidence, author_reviewer_dates, media_og |
| /zh/articles/big-five-conscientiousness-low-procrastination-task-plan | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 19 | visible_evidence, seo_geo_completeness |
| /zh/articles/big-five-emotional-stability-stress-recovery-communication | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 18 | visible_evidence, seo_geo_completeness |
| /zh/articles/big-five-growth-guide | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 18 | visible_evidence, internal_linking |
| /zh/articles/big-five-narrative-portrait | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 18 | visible_evidence, internal_linking |
| /zh/articles/big-five-personality-test-vs-mbti | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 17 | visible_evidence, seo_geo_completeness |
| /zh/articles/big-five-tool-guide | article | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 22 | visible_evidence, seo_geo_completeness, duplicate_brand_title |
| /zh/personality/big-five | personality_hub | BIG5-AUTHORITY-V2-HUB-07 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/agreeableness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, visible_internal_operational_terms, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/agreeableness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/agreeableness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/agreeableness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-AGREEABLENESS-13 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/conscientiousness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, visible_internal_operational_terms, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/conscientiousness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/conscientiousness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/conscientiousness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-CONSCIENTIOUSNESS-11 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/extraversion | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, visible_internal_operational_terms, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/extraversion-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/extraversion-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/extraversion-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-EXTRAVERSION-12 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/facets | facet_hub | BIG5-AUTHORITY-V2-FACET-HUBS-09 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/achievement-striving | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/actions | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/activity | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/aesthetics | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/altruism | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/anger | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/anxiety | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/assertiveness | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/competence | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/compliance | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/deliberation | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/depression | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/dutifulness | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/excitement-seeking | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/feelings | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/gregariousness | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/ideas | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/imagination | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/impulsiveness | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/modesty | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/order | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/positive-emotions | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/self-consciousness | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/self-discipline | facet_detail | BIG5-AUTHORITY-V2-FACETS-CONSCIENTIOUSNESS-16 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/straightforwardness | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/tender-mindedness | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/trust | facet_detail | BIG5-AUTHORITY-V2-FACETS-AGREEABLENESS-18 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/values | facet_detail | BIG5-AUTHORITY-V2-FACETS-OPENNESS-15 | 15 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/vulnerability | facet_detail | BIG5-AUTHORITY-V2-FACETS-NEUROTICISM-19 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/facets/warmth | facet_detail | BIG5-AUTHORITY-V2-FACETS-EXTRAVERSION-17 | 14 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |
| /zh/personality/big-five/neuroticism | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, visible_internal_operational_terms, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/neuroticism-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/neuroticism-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/neuroticism-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-NEUROTICISM-14 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/openness | domain | BIG5-AUTHORITY-V2-DOMAINS-08 | 13 | visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, visible_internal_operational_terms, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/openness-high | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/openness-low | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/personality/big-five/openness-mid | range_v2 | BIG5-AUTHORITY-V2-RANGE-OPENNESS-10 | 13 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness, dead_guide_targets_require_pr02_validation |
| /zh/tests/big-five-personality-test-ocean-model | test_landing | BIG5-AUTHORITY-V2-TEST-LANDING-20 | 12 | content_depth, visible_evidence, author_reviewer_dates, seo_geo_completeness |
| /zh/topics/big-five | topic_hub | BIG5-AUTHORITY-V2-ARTICLE-REFRESH-22 | 10 | content_depth, visible_evidence, author_reviewer_dates, media_og, seo_geo_completeness |

## Repository rule impact

No authority boundary changes. fap-api remains the CMS/public-content authority; fap-web remains a consumer. This PR adds only read-only evidence, scorecard artifacts, a generator, a focused contract, and exact train bookkeeping.

## Intentionally deferred

- PR02 integrity repairs and live target validation
- PR03 backend visible-evidence public contract
- PR04 fap-web trust renderer
- PR05-37 source, editorial, content, media, graph, authority, and release gates
- separately authorized production deploy/import/SEO mutations
- PR38 production runtime closeout after real readback
