# MBTI-CMS-17 Comparison Dry-Run Approval Package

This is a non-production backend/CMS review packet derived from CONTENT-15 comparison assets.

- Final decision: `PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY`
- Comparison records: 5
- A/T comparisons: 1
- Hot cross-type comparisons: 4
- Validation failures: 0

## Scope Boundary

- No CMS write.
- No production import.
- No frontend runtime or editorial fallback change.
- No sitemap, llms, GSC, search submission, or deploy action.

## Approval Queue

| Path | Pair | Kind | Sections | Quick rows | FAQ | Links |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| /zh/personality/intp-a-vs-intp-t | INTP-A vs INTP-T | at_comparison | 6 | 4 | 5 | 5 |
| /zh/personality/intj-vs-intp | INTJ vs INTP | hot_cross_type_comparison | 6 | 4 | 5 | 5 |
| /zh/personality/entj-vs-intj | ENTJ vs INTJ | hot_cross_type_comparison | 6 | 4 | 5 | 5 |
| /zh/personality/infj-vs-infp | INFJ vs INFP | hot_cross_type_comparison | 6 | 4 | 5 | 5 |
| /zh/personality/istj-vs-isfj | ISTJ vs ISFJ | hot_cross_type_comparison | 6 | 4 | 5 | 5 |

## Field Mapping

- `title` -> `seo.title`
- `meta_description` -> `seo.meta_description`
- `h1` -> `display.heading`
- `summary` -> `summary`
- `comparison_pair` -> `comparison.pair`
- `canonical` -> `seo.canonical_url`
- `robots` -> `seo.robots`
- `direct_answer` -> `content_sections.direct_answer`
- `quick_judgment_table` -> `content_sections.quick_judgment_table`
- `easy_misread` -> `content_sections.easy_misread`
- `real_scenario_differences` -> `content_sections.real_scenario_differences`
- `do_not_misjudge` -> `content_sections.do_not_misjudge`
- `next_reading` -> `content_sections.next_reading`
- `faq` -> `faq_items[]`
- `internal_links` -> `related_links[]`
- `method_boundary` -> `safety.method_boundary`
- `schema` -> `seo.structured_data_recommendations`
- `evidence_notes` -> `editorial.evidence_notes`

## Blockers

- None.

## Next Task

MBTI-INDEX-18 sitemap / llms / indexability gate
