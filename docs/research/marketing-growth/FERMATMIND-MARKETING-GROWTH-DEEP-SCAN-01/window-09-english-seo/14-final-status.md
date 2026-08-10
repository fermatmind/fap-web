# Final Status

- `GSC_EXACT_EXPORT_BLOCKED`: four current `/en/` UI export windows are verified, normalized, and SHA-bound, but exact query×page×country×device joint rows are absent.
- `GSC_UI_WINDOWS_RECOVERED`: recent 7 complete days, recent 28 complete days, previous 28 complete days, and recent 90-day request.
- `GSC_SEARCH_APPEARANCE_UNKNOWN`: all four search-appearance CSVs were present but empty; this is not recorded as zero.
- `GSC_PRIOR_YEAR_UNKNOWN`: the 90-day request starts 2026-05-11 but the first returned daily row is 2026-05-31, so no prior-year comparison is available.
- `WINDOW_09_ACCEPTANCE_REPAIR_COMPLETE_BUT_EVIDENCE_GAPS_REMAIN`: prior acceptance-repair status remains valid.
- `E03_PAGE_LEVEL_AUDIT_INCOMPLETE`: the retained personality ledger is not a complete page-level audit.
- `E04_ARTICLE_LEDGER_COMPLETE_MARKET_SPLIT_PARTIAL`: 40 Article decisions exist, but exact market page splits do not.
- `EN_CAREER_SELECTION_WAITING_ON_C06_C07`: active.
- `EN_CAREER_CANDIDATES_READY_FOR_OPERATOR_CONFIRMATION`: five research candidates only.
- `W3_ARTICLE_PACKAGE_READY_NOT_PROMOTED`: Window 9 references the existing authority package; this goal did not touch V2 authority or promotion.
- `CAREER_GUIDE_PACKAGE_WAITING_EXACT_SLUG_CONFIRMATION`: no current formal package generated.
- `STRUCTURAL_ISOLATION_PASS / FORMAL_PACKAGE_ISOLATION_PENDING`: report roots remain separate; formal Career package isolation is still pending.
- `ENGLISH_PILOT_WAITING_28_DAY_WINDOW`: no expand/stop verdict.
- Overall: `GSC_EXACT_EXPORT_BLOCKED`; do not claim the exact split goal complete.

## Acceptance result

PASS for: four requested current windows, exact GLOBAL daily totals, separate query/page/country/device exports, US/UK/OTHER returned-row semantics, independent GLOBAL semantics, verified `/en/` page cohort, branded/non-branded returned-query evidence, mobile returned-device share, top rows, near winners, zero-click high-impression rows, six surface classes, source SHA-256, and explicit UNKNOWN handling.

BLOCKED for: exact query×page×country×device joint rows, non-empty search-appearance evidence, and prior-year comparison.

The pre-existing non-GSC Window 9 blockers also remain: the B03 six-assessment technical-manual evidence inventory was not found; C06/C07 and formal Career eligibility are incomplete; W3 live public state versus registered V2 receipt-chain reconciliation is outside this goal; and no pilot release has a complete 28-day observation window.

## Required handoff

Use `GSC_EXACT_EXPORT_HANDOFF.md` with credentials restricted to `webmasters.readonly`. The official API Explorer attempt was stopped before consent because it requested both write-capable `webmasters` and `webmasters.readonly` scopes.

No product code, CMS/database, generated V2 master, SEO runtime surface, production, sitemap, llms, private result URL, credential, or account identifier was changed or committed.
