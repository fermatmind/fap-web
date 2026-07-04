# MBTI-GSC-11 Query Evidence Export

Generated at: 2026-07-04T20:20:00.000Z

## Decision

- Final decision: PASS_MBTI_GSC_11_QUERY_EVIDENCE_EXPORT_READY
- Captured query rows: 3
- Pending manual/API export rows: 10
- Operator seed rows requiring confirmation: 6

## Rules

- Captured query rows may inform later title, FAQ, and answer-block review.
- Pending rows must not drive SERP copy rewrites until imported from a filtered GSC page/query export.
- Operator seed queries are tracking hints until confirmed with metrics.
- Missing query rows are not treated as zero demand.
- No GSC API call, Search Console mutation, CMS write, frontend runtime change, sitemap change, llms change, or deploy was attempted.

## Rows

| Path | Query | Status | Impressions | Position | Next action |
| --- | --- | --- | ---: | ---: | --- |
| `/en/personality/enfj-a` | `enfj-a` | captured_query_row | 1 | 4 | eligible_for_title_faq_answer_block_review |
| `/zh/personality/intp-a` | `intp-a` | captured_query_row | 3 | 10.3 | eligible_for_title_faq_answer_block_review |
| `/zh/personality/esfp-a` | `esfp-a` | captured_query_row | 1 | 7 | eligible_for_title_faq_answer_block_review |
| `/en/personality/esfj-t` | _pending_ | pending_manual_or_api_query_export | 15 | 26.7 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/enfp-a` | _pending_ | pending_manual_or_api_query_export | 10 | 38.4 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/zh/personality/istp-a` | _pending_ | pending_manual_or_api_query_export | 7 | 7.3 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/zh/personality/intp-a-vs-intp-t` | _pending_ | pending_manual_or_api_query_export | 2 | 11 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/esfj-a` | _pending_ | pending_manual_or_api_query_export | 3 | 26.7 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/zh/personality/esfj-a` | _pending_ | pending_manual_or_api_query_export | 1 | 8 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/intp-a` | _pending_ | pending_manual_or_api_query_export | 1 | 9 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/istp-a` | _pending_ | pending_manual_or_api_query_export | 1 | 11 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/entj-a` | _pending_ | pending_manual_or_api_query_export | 2 | 25 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/en/personality/estp-t` | _pending_ | pending_manual_or_api_query_export | 2 | 46.5 | export_filtered_page_query_rows_before_serp_copy_rewrite |
| `/zh/tests/mbti-personality-test-16-personality-types` | `mbti测试` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |
| `/zh/tests/mbti-personality-test-16-personality-types` | `mbti免费测试` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |
| `/zh/tests/mbti-personality-test-16-personality-types` | `16型人格测试` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |
| `/zh/personality/istp-a` | `istp-a` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |
| `/zh/personality/intp-a` | `intp a` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |
| `/zh/personality/istj-a` | `istj-a人格` | operator_seed_requires_gsc_confirmation |  |  | confirm_query_metrics_in_next_manual_csv_or_api_export |

## Import Template

- Use the JSON `import_template.rows` or CSV rows as the handoff shape for a future manual/API GSC query import.
- Leave pending rows untouched until the operator provides query/click/impression/CTR/position metrics.
