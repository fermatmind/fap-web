# RESULT-P0-POST-DEPLOY-SMOKE-RERUN-WITH-UPLOADED-PDFS-AND-LIVE-URLS-01

Date: 2026-06-13 Asia/Shanghai

Mode: production read-only smoke plus uploaded PDF evidence scan. No application code, backend code, CMS data, database state, deployment, route, sitemap, robots, llms, schema, header, or footer changes were made.

Final decision: `blocked_browser_print_private_url_footer_still_present`

## Summary

The rerun does not pass. The three uploaded PDFs were treated as current post-deploy evidence, and each uploaded PDF contains a private redacted result route in extracted PDF text once per PDF page. That is consistent with a browser print URL footer leak.

Additional uploaded-PDF failures were also observed:

- `global_footer_print_leak`: all three PDFs contain global footer column labels such as `公司`, `条款与政策`, `博客`, `研究报告`, `测评科学`, `信度效度`, and `数据说明`.
- `internal_debug_text_leak`: the Big Five PDF contains debug/implementation text classes including `payload`, `facet glossary`, `precision anomaly rules`, `sentence-level modifier`, and `scenario action rule`.
- `internal_debug_text_leak`: the RIASEC/Holland PDF contains `BUTTON LABEL`.

The live production routes extracted from those PDFs returned HTTP 200 with the expected privacy headers, and the checked IDs were absent from sitemap, `llms.txt`, and `llms-full.txt`. However, all three live routes rendered `attempt not found.`, so live result HTML and live result print/PDF output could not be validated as real result samples.

## Uploaded PDF Evidence

| Scale | Uploaded PDF evidence status | Failing issue classes | Notes |
| --- | --- | --- | --- |
| Big Five | Fail | `browser_print_url_footer_leak`, `global_footer_print_leak`, `internal_debug_text_leak` | Private redacted result route appears 6 times across a 6-page PDF. Internal classes found: `payload`, `facet glossary`, `precision anomaly rules`, `sentence-level modifier`, `scenario action rule`. |
| RIASEC / Holland | Fail | `browser_print_url_footer_leak`, `global_footer_print_leak`, `internal_debug_text_leak` | Private redacted result route appears 7 times across a 7-page PDF. Internal label found: `BUTTON LABEL`. |
| Enneagram | Fail | `browser_print_url_footer_leak`, `global_footer_print_leak` | Private redacted result route appears 5 times across a 5-page PDF. No `analyzer_close_call` or `[object Object]` text was detected in extracted PDF text. |

The report intentionally does not include raw result IDs or full private result URLs. Redacted route form used for this smoke: `/zh/result/[REDACTED]`.

## Live Route Privacy Checks

| Scale | HTTP status | `X-Robots-Tag` | Robots meta | Canonical | Hreflang | JSON-LD | Sitemap | `llms.txt` | `llms-full.txt` | Live route status |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Big Five | 200 | Pass: `noindex, nofollow, noarchive, nocache` | Pass | Absent | Absent | Absent | Absent | Absent | Absent | `blocked_missing_live_result_sample_for_that_scale` |
| RIASEC / Holland | 200 | Pass: `noindex, nofollow, noarchive, nocache` | Pass | Absent | Absent | Absent | Absent | Absent | Absent | `blocked_missing_live_result_sample_for_that_scale` |
| Enneagram | 200 | Pass: `noindex, nofollow, noarchive, nocache` | Pass | Absent | Absent | Absent | Absent | Absent | Absent | `blocked_missing_live_result_sample_for_that_scale` |

All three routes rendered the same error-shell content: `attempt not found.`

## Live HTML And Generated PDF Status

| Scale | Live HTML status | Generated PDF status | Final per-scale decision |
| --- | --- | --- | --- |
| Big Five | Not evaluable as a real result page because the route rendered `attempt not found.` The error shell includes global header/footer text, but it is not the private result print root. | Not evaluated as a real result PDF. A temporary error-shell PDF was generated under `/tmp` only and was not committed. | Blocked by uploaded PDF `browser_print_url_footer_leak`, `global_footer_print_leak`, and Big Five `internal_debug_text_leak`; live sample missing. |
| RIASEC / Holland | Not evaluable as a real result page because the route rendered `attempt not found.` The error shell includes global header/footer text, but it is not the private result print root. | Not evaluated as a real result PDF. A temporary error-shell PDF was generated under `/tmp` only and was not committed. | Blocked by uploaded PDF `browser_print_url_footer_leak`, `global_footer_print_leak`, and RIASEC `internal_debug_text_leak`; live sample missing. |
| Enneagram | Not evaluable as a real result page because the route rendered `attempt not found.` The error shell includes global header/footer text, but it is not the private result print root. | Not evaluated as a real result PDF. A temporary error-shell PDF was generated under `/tmp` only and was not committed. | Blocked by uploaded PDF `browser_print_url_footer_leak` and `global_footer_print_leak`; live sample missing. |

The Enneagram uploaded PDF did not show the specific `object_render_leak` tokens requested for this rerun. The overall rerun still fails because the uploaded PDF evidence contains private-route print footer leakage and global footer leakage.

## Regression PR Verification

GitHub reports the required PRs as merged, and each merge commit is contained in `origin/main`.

| PR | Title | State | Merge commit in `origin/main` |
| --- | --- | --- | --- |
| #1113 | `RESULT-PDF-PRINT-PRIVATE-URL-GUARD-01` | MERGED | Yes |
| #1114 | `RESULT-DEBUG-FIELD-SUPPRESSION-01` | MERGED | Yes |
| #1116 | `RESULT-OBJECT-RENDER-GUARD-01` | MERGED | Yes |
| #1117 | `RESULT-PRIVATE-PRINT-STYLES-AND-FOOTER-GATE-01` | MERGED | Yes |
| #1118 | `RESULT-LEAK-CONTRACT-TESTS-01` | MERGED | Yes |

Merged PR status was not treated as proof of production cleanliness. The final decision is based on observed uploaded PDF evidence and production route behavior.

## Validation Notes

- Uploaded PDFs were not committed.
- Generated PDFs were written only under `/tmp/fm-result-p0-smoke-rerun/` and were not committed.
- Generated screenshots were written only under `/tmp/fm-result-p0-smoke-rerun/` and were not committed.
- Raw result IDs and raw private URLs are not included in this report.
- Poppler tools were unavailable locally, so the PDF evidence decision is based on text extraction with `pypdf`. Visual review was not needed to classify the explicit private-route and debug-text failures.

## Recommended Next Scoped Fix PRs

1. Result PDF print footer hardening: prevent browser-generated private route URL footers from entering exported/printed PDFs.
2. Private result print chrome gate repair: suppress global header/footer navigation and social/footer columns in private result print output.
3. Big Five and RIASEC PDF text suppression follow-up: remove remaining debug/implementation labels from result PDF output.
4. Result sample availability follow-up: provide or create production-safe live result samples so live HTML and generated PDF behavior can be revalidated after the fix.

Final decision: `blocked_browser_print_private_url_footer_still_present`
