# Cannibalization and Legacy Alias Revalidation

## Material query conflicts

| Locale | Query | Impr. | Runner-up | Severity | Current owner | Intended owner | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| zh-CN | intp a | 91 | 0.230769 | MEDIUM | /zh/personality/intp-a-vs-intp-t | /zh/personality/intp-a | ALIGN_METADATA_AND_INTERNAL_LINKS_TO_INTENDED_OWNER |
| zh-CN | intp-a | 151 | 0.337748 | HIGH | /zh/personality/intp-a-vs-intp-t | /zh/personality/intp-a | ALIGN_METADATA_AND_INTERNAL_LINKS_TO_INTENDED_OWNER |

All other returned multi-page queries are observational/low severity and remain `MONITOR_NO_INDEXABILITY_ACTION`. `site:` diagnostic queries are excluded because their distribution across pages is expected and does not establish content cannibalization.

## Big Five alias residuals

| Alias | Target | current28 impr. | prev28 impr. | 90d impr. | Decision |
| --- | --- | --- | --- | --- | --- |
| /en/personality/big-five/high-conscientiousness | /en/personality/big-five/conscientiousness-high | 40 | 2 | 42 | KEEP_301_MONITOR_GSC_RESIDUAL |
| /en/personality/big-five/low-conscientiousness | /en/personality/big-five/conscientiousness-low | 2 | NOT_RETURNED | 2 | KEEP_301_MONITOR_GSC_RESIDUAL |
| /en/personality/big-five/low-extraversion | /en/personality/big-five/extraversion-low | 6 | 1 | 7 | KEEP_301_MONITOR_GSC_RESIDUAL |
| /en/personality/big-five/low-agreeableness | /en/personality/big-five/agreeableness-low | 43 | 6 | 49 | KEEP_301_MONITOR_GSC_RESIDUAL |

The four observed alias paths remain verified one-hop 301s to existing canonical targets. Residual GSC impressions are monitoring evidence only. They do not authorize restoring alias content, adding aliases to sitemap/llms/hreflang, or changing canonical/indexability behavior.

Page-level indexing remains `UNKNOWN_PAGE_LEVEL` for aliases and targets.
