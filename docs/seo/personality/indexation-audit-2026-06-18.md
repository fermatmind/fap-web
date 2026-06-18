# Personality SEO Post-Deploy Indexation Audit 01

## Scope

Read-only baseline for 64 MBTI A/T variant pages and 32 A-vs-T comparison pages. This artifact captures facts only. It does not repair sitemap, llms, llms-full, canonical, hreflang, schema, page content, CMS, scoring, or result-page behavior.

This revision hardens exposure detection by replacing substring membership with exact normalized URL-set matching:

- sitemap exposure uses exact normalized `<loc>` URLs.
- `llms.txt` and `llms-full.txt` exposure use exact normalized URLs parsed from each file.
- fuzzy match fields are diagnostic only and do not affect the main yes/no exposure fields.

## Summary

- Run date: 2026-06-18
- Total pages audited: 96
- Variant pages: 64
- Comparison pages: 32
- HTTP 200: 96
- Index directive = index: 96
- Follow directive = follow: 96
- Self-canonical pages: 96
- Hreflang present: 96
- In sitemap: 32
- In llms: 96
- In llms-full: 96
- Private/user-specific URL patterns detected: 96

## Count Changes From PR #1178

| Field | PR #1178 baseline | Exact-match audit | Note |
| --- | ---: | ---: | --- |
| total_pages | 96 | 96 | unchanged |
| variant_pages | 64 | 64 | unchanged |
| comparison_pages | 32 | 32 | unchanged |
| http_200 | 96 | 96 | unchanged |
| index_directive_index | 96 | 96 | unchanged |
| follow_directive_follow | 96 | 96 | unchanged |
| self_canonical_yes | 96 | 96 | unchanged |
| hreflang_present_yes | 96 | 96 | unchanged |
| in_sitemap_yes | 64 | 32 | changed after exact URL matching replaced substring matching |
| in_llms_yes | 96 | 96 | unchanged |
| in_llms_full_yes | 96 | 96 | unchanged |
| outbound_private_url_seen_yes | 96 | 96 | unchanged |

## External Data

GSC data was not accessed from the local audit environment. All GSC metric fields are recorded as `Unknown`, not `0`.

## Notable Rows

| Path | Type | HTTP | Index | Sitemap | llms | llms-full | Private URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en/personality/intj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/intj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/intj-a-vs-intj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/intp-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/intp-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/intp-a-vs-intp-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/entj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/entj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/entj-a-vs-entj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/entp-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/entp-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/entp-a-vs-entp-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/infj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/infj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/infj-a-vs-infj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/infp-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/infp-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/infp-a-vs-infp-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/enfj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/enfj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/enfj-a-vs-enfj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/enfp-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/enfp-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/enfp-a-vs-enfp-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/istj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/istj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/istj-a-vs-istj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/isfj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/isfj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/isfj-a-vs-isfj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/estj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/estj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/estj-a-vs-estj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/esfj-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/esfj-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/esfj-a-vs-esfj-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/istp-a | variant | 200 | index | no | yes | yes | yes |
| /en/personality/istp-t | variant | 200 | index | no | yes | yes | yes |
| /en/personality/istp-a-vs-istp-t | comparison | 200 | index | yes | yes | yes | yes |
| /en/personality/isfp-a | variant | 200 | index | no | yes | yes | yes |

## Machine-Readable Artifact

See `indexation-audit-2026-06-18.json`.
