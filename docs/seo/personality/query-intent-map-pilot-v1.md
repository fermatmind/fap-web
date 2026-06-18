# MBTI64 Query Intent Map 01

## Scope

This is a strategy artifact for the 8-page MBTI/A-T pilot cohort. It is not a publication, sitemap, `llms.txt`, `llms-full.txt`, CMS import, search submission, or frontend rendering change.

Use this map before GPT-5.5 Pro content generation to prevent same-site cannibalization between variant pages, comparison pages, hub pages, and test routes.

## Source Baseline

- Source indexation artifact: `docs/seo/personality/indexation-audit-2026-06-18.json`
- Source cohort artifact: `docs/seo/personality/target-cohort-lock-2026-06-18.json`
- Pages audited in baseline: 96
- Exact sitemap-exposed pages: 32
- Exact `llms.txt`-exposed pages: 96
- Exact `llms-full.txt`-exposed pages: 96
- `/results/lookup` pattern: seen across personality SEO pages
- GSC metrics: `Unknown` in local artifacts

Do not use old #1178 substring-based sitemap counts as exposure truth.

## How GPT-5.5 Pro Should Use This Map

1. Generate the full explicit 8-page pilot queue.
2. Use `primary_query` as the main search target for each page.
3. Treat `excluded_queries` as hard cannibalization boundaries.
4. Do not let variant pages target comparison queries.
5. Do not let comparison pages target standalone meaning/profile queries.
6. Keep `/results/lookup` out of `target_test_route`.
7. Keep content generation separate from publish, sitemap, `llms`, and search-release work.

## Intent Separation Rules

- Comparison pages target difference/comparison intent.
- Variant pages target meaning/profile/work-style intent.
- Chinese pages use native Chinese query intent.
- English pages use English query intent.
- P0/P1 labels are prioritization metadata only; they do not reduce or expand the 8-page queue.

## Pilot Intent Summary

| URL | Primary query | Intent role | Sitemap | llms | llms-full |
| --- | --- | --- | --- | --- | --- |
| `/en/personality/intj-a-vs-intj-t` | `intj-a vs intj-t difference` | INTJ comparison hub | yes | yes | yes |
| `/zh/personality/istj-a` | `ISTJ-A 人格特点` | Chinese ISTJ-A profile | no | yes | yes |
| `/en/personality/intp-a-vs-intp-t` | `intp-a vs intp-t difference` | INTP comparison hub | yes | yes | yes |
| `/zh/personality/infp-t` | `INFP-T 人格特点` | Chinese INFP-T profile | no | yes | yes |
| `/en/personality/intj-a` | `intj-a meaning` | English INTJ-A profile | no | yes | yes |
| `/en/personality/intj-t` | `intj-t meaning` | English INTJ-T profile | no | yes | yes |
| `/zh/personality/intj-a` | `INTJ-A 人格特点` | Chinese INTJ-A profile | no | yes | yes |
| `/zh/personality/intj-t` | `INTJ-T 人格特点` | Chinese INTJ-T profile | no | yes | yes |

## Content Gap Notes

- Comparison pages currently have stronger H2 structure than variant pages.
- English variant pages are thinner than comparison pages.
- Chinese variant pages currently have `H2_count = 0` and FAQ unknown in the baseline.
- `/results/lookup` route exposure must be classified before publish/search release.

## Machine-Readable Artifact

See `docs/seo/personality/query-intent-map-pilot-v1.json`.

## Holds

- Do not edit page content in this strategy PR.
- Do not generate GPT content packages in this strategy PR.
- Do not import CMS revisions.
- Do not publish.
- Do not change sitemap, `llms.txt`, or `llms-full.txt` generation.
- Do not submit URLs to Google, Baidu, IndexNow, or any search channel.
- Do not change scoring, result, order, payment, private report, or user-specific routes.
- Do not fix `/results/lookup` in this PR.
