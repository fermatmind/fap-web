# Final Reconciliation

Use after the original full-release final summary when any follow-up work changes or verifies schema, hreflang, GSC, Search Channel, IndexNow, Baidu, sitemap/llms, or llms-full state.

Old `FINAL_SUMMARY.md`, `FINAL_DECISION.md`, and generated reports are inputs, not final truth. Prefer current runtime and authority evidence over stale generated summaries.

## Inputs

- Original final summary.
- Article identity lock.
- Follow-up reports.
- Current public runtime evidence if available.
- Current public article API evidence.
- Current public HTML evidence.
- Current sitemap, `llms.txt`, and `llms-full.txt` evidence.
- Current URL Truth evidence.
- Search Channel queue/provider evidence if available.
- GSC/Baidu operator evidence if available.
- Current schema/hreflang counts.

## Checks

Compare the original final summary with latest evidence for:

- published/indexable state.
- sitemap/llms/llms-full inclusion.
- schema state and JSON-LD types.
- FAQ schema count.
- hreflang tags and x-default target.
- GSC indexed/not indexed/requested state.
- Search Channel queue item states.
- IndexNow provider response.
- Baidu provider response.
- unauthorized submissions.
- private URL guard.
- stale generated report fields that conflict with current runtime evidence.

## Decisions

- `FINAL_RECONCILED`: the final summary matches the latest known truth or has a reconciliation appendix.
- `FINAL_SUMMARY_STALE_NEEDS_UPDATE`: the original final summary is stale and must not be treated as final truth.
- `FINAL_SUMMARY_STALE_NEEDS_RECONCILIATION`: current runtime or queue evidence supersedes older generated reports and a new reconciliation report is required.
- `BLOCKED_NEEDS_OPERATOR_INPUT`: required follow-up evidence is missing or contradictory.

## Output

Generate a reconciliation note with:

- current article identity.
- stale fields.
- corrected current truth.
- remaining holds.
- D1/D7/D14 observation updates.
