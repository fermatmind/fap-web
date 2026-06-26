# FermatMind Whole-Site SEO Data Analysis Playbook

Decision: `PLAYBOOK_READY_FOR_DAILY_AND_WEEKLY_SEO_OBSERVATION`

Created from:

- Article 55 D0 observation snapshot:
  `generated/seo-ops-article55-d0-observation-20260626-00/`
- Previous whole-site GSC scan scaffold:
  `generated/seo-ops-whole-site-gsc-reality-scan-20260624-00/`
- Previous D1/D7/D14 observation pattern:
  `generated/seo-ops-six-pillar-d1-d7-d14-observation-scan-00/`

This document defines how future SEO data analysis should run across the whole FermatMind site. It is an observation and planning artifact. It does not authorize CMS writes, publish, URL Truth writes, Search Channel enqueue, IndexNow, Baidu, GSC Request Indexing, schema/hreflang, sitemap/llms changes, deploy, revalidation, or PR work.

## 1. Operating Model

Use two layers of evidence:

1. `quick_visible_snapshot`
   - Browser-visible GSC / GA / Baidu / Ops pages.
   - Good for D0/D1 checks, pickup signals, and deciding what to export next.
   - Not a full dataset. Missing rows are `Unknown`, not zero.

2. `formal_export_or_backend_artifact`
   - GSC CSV/API export, GA exploration export, Baidu export, backend URL Truth/Search Channel evidence, runtime readback, closeout evidence.
   - Required for weekly decisions, cohort ranking, and CMS/search gate proposals.

Daily SEO decisions may start from quick snapshots, but write/publish/search gates must use formal evidence.

## 2. Data Sources

| Source | Use | Minimum fields | Owner |
| --- | --- | --- | --- |
| Google Search Console | Query/page visibility, CTR, position, indexing pickup | page, query, clicks, impressions, CTR, avg position, date range, device, country | SEO article / GSC agent |
| Google Analytics 4 | Engagement and article-to-test behavior | active users, sessions, source/medium, landing page, page title, events, conversion events | SEO article / Analytics agent |
| Baidu Tongji | Chinese traffic signal and source split | visits, source, keyword, landing page, geography | SEO article / Baidu ops |
| URL Truth | Canonical and entity truth before search gates | canonical URL, page_entity_type, entity id, lastmod, indexable/public, source authority | SEO agent |
| Search Channel Queue | Search submission state | queue item, channel, approval state, execution state, response status | SEO agent |
| Runtime/Public Pages | Title/meta/H1/CTA/canonical/schema visibility | URL, status, canonical, title, meta, H1, CTA, noindex | Runtime QA / SEO article |
| CMS/Backend Closeout | Release truth | article id, revision id, publish evidence, closeout SHA, side-effect boundaries | SEO agent / backend |

## 3. Cohorts

Every URL should be assigned to one primary cohort and optional secondary tags.

Primary cohorts:

- `test_landing_core`: six test landing pages and high-value test pages.
- `article_seo`: SEO articles, including RIASEC, MBTI, Big Five, Enneagram, IQ, EQ, Gaokao.
- `personality_profile`: public MBTI/personality type pages.
- `career_job`: career/job long-tail pages.
- `career_guide`: career guide and graph pages.
- `trust_methodology`: methodology, science, reliability, privacy, about, support.
- `hub_page`: assessment hub, tests hub, category pages.

Secondary tags:

- `riasec`, `mbti`, `big_five`, `enneagram`, `iq`, `eq`, `gaokao`, `competitor_intent`, `seasonal`, `brand`, `free_test`, `result_page_public`.

## 4. Cadence

### Daily D0/D1

Use browser-visible or lightweight export data.

Record:

- GSC 24h headline metrics.
- Top visible pages and queries.
- Newly published or changed URLs.
- Whether recently submitted URLs appear in page/query rows.
- GA yesterday users, sessions by channel, and key article/test events.
- Any obvious CTR/ranking opportunities.

Do not:

- declare failure because a URL is missing from visible top rows.
- repeat IndexNow for already submitted/accepted queue items.
- perform CMS/search changes from D0 alone.

### Weekly

Use formal exports.

Required GSC exports:

1. Pages, 7 days.
2. Queries, 7 days.
3. Pages, 28 days.
4. Queries, 28 days.
5. Query x Page, 28 days if available.
6. Countries/devices/search appearance when relevant.

Required GA exports:

1. Landing page by channel.
2. Page path/title engagement.
3. Article-to-test click events.
4. Start/complete/view-result events.

Weekly output:

- Cohort scorecard.
- CTR repair queue.
- Internal-link opportunity queue.
- Query expansion queue.
- Search/indexing exception queue.
- Next daily topics.

### D7/D14

For every newly published or materially updated article:

- D7: decide whether there is enough signal to hold, improve title/meta, strengthen internal links, or create a follow-up article.
- D14: decide whether to optimize, merge intent, expand query coverage, or move to another cohort.

## 5. Metrics

Core GSC metrics:

- clicks
- impressions
- CTR
- average position
- query count
- page count
- country/device split
- search appearance

Core GA metrics:

- active users
- sessions
- organic sessions
- average engagement time
- page views
- scroll
- article_to_test_click
- start_test
- complete_test
- view_result
- checkout/purchase only when relevant

Search gate metrics:

- URL Truth row exists.
- queue item exists.
- approval state.
- execution state.
- provider status.
- HTTP status.
- lastmod/idempotency behavior.

## 6. Classification Rules

Use these classes for every page/opportunity:

| Class | Signal | Action |
| --- | --- | --- |
| `CTR_TITLE_META_OPPORTUNITY` | position 1-12, impressions present, CTR weak | title/meta test or SERP angle repair |
| `POSITION_8_30_INTERNAL_LINK_OPPORTUNITY` | impressions present, rank 8-30 | add/repair internal links and anchors |
| `QUERY_EXPANSION_OPPORTUNITY` | page ranks for adjacent intent | create/update content package |
| `CTA_CONVERSION_OPPORTUNITY` | organic sessions but weak article-to-test behavior | CTA/read path QA |
| `TECHNICAL_DRIFT` | canonical/noindex/runtime/search evidence mismatch | runtime/SEO agent investigation |
| `SEARCH_GATE_BLOCKED` | URL Truth/Search queue/sitemap gap | SEO agent gate |
| `INSUFFICIENT_DATA` | missing export or too early | observe, do not mutate |

## 7. Decision Thresholds

Use conservative thresholds until the site has stable volume.

- Rank `1-8`, impressions `>=20`, CTR `0%`: title/meta candidate.
- Rank `8-30`, impressions `>=20`: internal link candidate.
- Rank `>30`, impressions `>=50`: query expansion or content depth candidate.
- Clicks present but low engagement: CTA/runtime readback candidate.
- Newly published URL missing in first D0 snapshot: `INSUFFICIENT_DATA`, not a blocker.

## 8. Gate Ownership

SEO article window owns:

- topic selection
- content package direction
- editorial quality
- D1/D7/D14 interpretation
- deciding whether a page should enter SEO agent gates

SEO agent owns:

- URL Truth readiness/dry-run/write
- Search Channel queue dry-run
- Search Channel enqueue
- queue approve
- IndexNow/Baidu/GSC submission gates
- closeout evidence

Analytics/GSC agent owns:

- export shaping
- query/page cohort aggregation
- event definitions
- KPI reports

No agent should combine content edits, publish, URL Truth, sitemap/llms, schema/hreflang, and search submission in one approval.

## 9. Standard Output Tree

For each observation run:

```text
generated/seo-ops-whole-site-observation-YYYYMMDD-NN/
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

For one article:

```text
generated/seo-ops-article<id>-d0-observation-YYYYMMDD-NN/
  D0_OBSERVATION_REPORT.md
  D0_OBSERVATION_SNAPSHOT.json
```

## 10. Whole-Site Snapshot Schema

Minimum JSON shape:

```json
{
  "schema_version": "fermatmind-seo-ops-whole-site-observation.v1",
  "generated_at": "ISO-8601",
  "observation_window": "D0|D1|D7|D14|weekly",
  "evidence_level": "quick_visible_snapshot|formal_export_or_backend_artifact",
  "source_freshness": {},
  "sitewide_gsc": {},
  "sitewide_ga4": {},
  "cohorts": [],
  "top_pages": [],
  "top_queries": [],
  "recent_release_watchlist": [],
  "opportunity_queue": [],
  "search_gate_queue": [],
  "held_actions": {}
}
```

## 11. Boundary Rules

Observation documents may:

- summarize GSC/GA/Baidu/Ops visible data
- reference backend evidence paths and SHAs
- recommend next gates
- classify opportunities

Observation documents must not:

- write CMS
- publish/promote
- write URL Truth
- enqueue or submit Search Channel
- click GSC Request Indexing
- submit IndexNow/Baidu
- enable schema/hreflang
- mutate sitemap/llms
- revalidate, deploy, or open PRs

## 12. Current D0 Seed From 2026-06-26

Seed observation:

- `generated/seo-ops-article55-d0-observation-20260626-00/D0_OBSERVATION_SNAPSHOT.json`
- Sitewide GSC last 24h visible headline: 3 clicks, 807 impressions, 0.4% CTR, average position 9.6.
- GA yesterday visible headline: 31 active users, 23 new users, 3 organic sessions.
- Article 55 has IndexNow accepted but is not visible in the GSC top 10 page rows yet.

Immediate interpretation:

- Continue D1/D7/D14 observation for Article 55.
- Do not repeat IndexNow for queue item `263`.
- MBTI test and personality pages have the strongest early visible organic clicks.
- Chinese college-major/RIASEC articles have ranking/impression signals and should be considered in the next weekly CTR/internal-link queue.
