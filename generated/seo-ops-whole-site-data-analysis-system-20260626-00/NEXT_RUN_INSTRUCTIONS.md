# Next Whole-Site SEO Data Analysis Run

Decision: `READY_FOR_NEXT_OBSERVATION_RUN`

## Fast D1 Run

Use when checking tomorrow's pickup after Article 55 closeout.

Inputs:

- GSC visible 24h or exported pages/query data.
- GA yesterday overview or exported landing-page data.
- Article 55 closeout evidence:
  `/var/www/fap-api/shared/backend/storage/app/seo-agent/article-closeout/20260626T-article55-indexnow-closeout/seo-agent-article55-indexnow-closeout-20260626T120520Z.json`

Output:

- `generated/seo-ops-article55-d1-observation-YYYYMMDD-00/`
- Include whether Article 55 appears in GSC page rows and query rows.
- If absent, classify `INSUFFICIENT_DATA`, not failed.

No actions:

- no CMS write
- no publish
- no URL Truth write
- no Search Channel enqueue
- no IndexNow/Baidu/GSC submit
- no schema/hreflang
- no sitemap/llms
- no revalidation/deploy/PR

## Weekly Whole-Site Run

Required exports:

1. GSC pages 7d.
2. GSC queries 7d.
3. GSC pages 28d.
4. GSC queries 28d.
5. GSC Query x Page 28d if available.
6. GA landing page by channel.
7. GA events for article/test funnel.
8. Baidu page/source/keyword export if available.
9. Backend closeout inventory for recent releases.

Recommended output:

```text
generated/seo-ops-whole-site-observation-YYYYMMDD-00/
  EXECUTIVE_SUMMARY.md
  WHOLE_SITE_SNAPSHOT.json
  GSC_PAGE_MATRIX.csv
  GSC_QUERY_MATRIX.csv
  QUERY_PAGE_OPPORTUNITY_MATRIX.csv
  GA_ENGAGEMENT_SUMMARY.csv
  COHORT_SCORECARD.csv
  ACTION_QUEUE.md
  HELD_SEARCH_GATES.md
```

Decision outputs:

- `GO_FOR_TITLE_META_REPAIR_QUEUE`
- `GO_FOR_INTERNAL_LINK_QUEUE`
- `GO_FOR_NEXT_DAILY_ARTICLE_BRIEF`
- `HOLD_FOR_MORE_DATA`
- `SEO_AGENT_GATE_REQUIRED`

## Immediate Watchlist From D0

1. `article:55:zh-CN`
   - watch for first GSC impressions/query rows.
   - do not repeat IndexNow.

2. `/zh/articles/college-major-choice-holland-mbti-career-test`
   - visible GSC signal: 57 impressions, rank 5.9, 0 clicks.
   - likely CTR/title opportunity if confirmed by export.

3. `/zh/tests/mbti-personality-test-16-personality-types`
   - visible GSC signal: strongest click/impression page.
   - continue observing CTR and conversion path.

4. `/zh/personality/intp-a-vs-intp-t` and `/zh/personality/intp-a`
   - visible click and rank signal.
   - coordinate with personality content agent, not SEO article body workflow.
