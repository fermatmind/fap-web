# SEO Baseline Template — 2026-06-02

Scope: SEO operations ledger template only. This document does not create content, publish CMS records, submit sitemap URLs, call search APIs, or change frontend/backend runtime behavior.

## 1. Daily Baseline Table

| date | page_url | page_type | target_keyword | intent | target_test | in_sitemap | indexed_google | indexed_baidu | canonical | title | description | google_impressions | google_clicks | google_ctr | google_avg_position | baidu_search_pv | baidu_search_query | landing_pv | article_to_test_click | start_test | complete_test | view_result | click_deep_report | begin_checkout | purchase_success | private_url_seen | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| YYYY-MM-DD |  |  |  |  |  | Unknown | Unknown | Unknown |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | No |  |

## 2. Daily Fill Instructions

- Fill one row per monitored public URL per day.
- Use canonical public URLs only.
- Do not record private result, order, payment, share, history, token, or user-specific URLs.
- Mark unavailable dashboard data as `Unknown`, not `0`.
- Use `0` only when the source dashboard explicitly reports zero.
- Keep `private_url_seen` as `No`, `Yes`, or `Unknown`.
- If `private_url_seen=Yes`, open a P0 privacy investigation note before any content publish or URL submission.
- Do not use this table as purchase truth. Purchase truth remains backend orders/payment/benefit records.

## 3. Seven-Day Review Fields

| field | source | expected use |
|---|---|---|
| google_impressions_7d | GSC | Check whether the URL starts receiving search visibility. |
| google_clicks_7d | GSC | Check whether the page attracts organic traffic. |
| google_ctr_7d | GSC | Identify snippet/title mismatch, but do not rewrite without content review. |
| google_avg_position_7d | GSC | Track early ranking trend. |
| indexed_google_7d | GSC / URL Inspection | Confirm index status. |
| indexed_baidu_7d | Baidu Search Resource Platform | Confirm Baidu index status where available. |
| baidu_search_pv_7d | Baidu Tongji | Observe Baidu organic landing volume. |
| landing_pv_7d | GA4 / Baidu Tongji | Confirm public landing traffic. |
| article_to_test_click_7d | GA4 / first-party tracking | Check article-to-test intent transfer. |
| start_test_7d | GA4 / first-party tracking | Check whether article visitors start tests. |
| complete_test_7d | GA4 / first-party tracking | Check completion follow-through. |
| view_result_7d | GA4 / first-party tracking | Check result-page funnel visibility. |
| private_url_seen_7d | Baidu Tongji / GA4 / logs reviewed under approved process | Must remain `No`. |

## 4. Fourteen-Day Review Fields

| field | source | expected use |
|---|---|---|
| indexed_google_14d | GSC | Decide whether indexing issue needs sitemap/canonical/internal-link review. |
| indexed_baidu_14d | Baidu Search Resource Platform | Decide whether Baidu-specific crawl/index issue exists. |
| impressions_trend_14d | GSC | Compare week 1 and week 2 visibility. |
| clicks_trend_14d | GSC | Compare week 1 and week 2 traffic. |
| article_to_test_click_rate_14d | GA4 / first-party tracking | Check article CTA effectiveness. |
| start_to_complete_rate_14d | GA4 / first-party tracking | Check whether landing traffic matches test intent. |
| result_view_rate_14d | GA4 / first-party tracking | Check whether test completion reaches result view. |
| conversion_follow_through_14d | GA4 / backend-reviewed funnel | Observe checkout and purchase trend without treating analytics as purchase truth. |
| content_update_decision_14d | Human review | Decide keep, revise in CMS, add internal links, or pause. |

## 5. Field Source Map

### GA4 / First-Party Tracking

- landing_pv
- article_to_test_click
- start_test
- complete_test
- view_result
- click_deep_report
- begin_checkout
- purchase_success

### Google Search Console

- indexed_google
- google_impressions
- google_clicks
- google_ctr
- google_avg_position

### Baidu Tongji

- baidu_search_pv
- baidu_search_query
- landing_pv as auxiliary public page traffic
- private_url_seen as a privacy anomaly check

### Baidu Search Resource Platform

- indexed_baidu
- crawl/index status
- manual URL inspection or submission state when explicitly approved

### CMS Backend

- page_url
- page_type
- target_keyword
- intent
- target_test
- in_sitemap
- canonical
- title
- description
- publish state
- indexability state
- related_test_slug / CTA target

## 6. Stop Conditions

- A draft, private, noindex, or non-canonical URL appears in sitemap.
- Baidu Tongji or GA4 shows a private result/order/share/payment/history URL.
- Article CTA points to result, orders, share, pay, payment, history, or any user-specific URL.
- The page is published before preview/noindex/canonical/schema checks are complete.
- Dashboard data is missing and someone attempts to infer success or failure from guesswork.
