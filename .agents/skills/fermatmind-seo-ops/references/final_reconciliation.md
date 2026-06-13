# Final Reconciliation

Use after the original full-release final summary when any follow-up work changes or verifies schema, hreflang, GSC, Search Channel, IndexNow, Baidu, sitemap/llms, or llms-full state.

## Inputs

- Original final summary.
- Article identity lock.
- Follow-up reports.
- Current public runtime evidence if available.
- Search Channel queue/provider evidence if available.
- GSC/Baidu operator evidence if available.

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

## Decisions

- `FINAL_RECONCILED`: the final summary matches the latest known truth or has a reconciliation appendix.
- `FINAL_SUMMARY_STALE_NEEDS_UPDATE`: the original final summary is stale and must not be treated as final truth.
- `BLOCKED_NEEDS_OPERATOR_INPUT`: required follow-up evidence is missing or contradictory.

## Output

Generate a reconciliation note with:

- current article identity.
- stale fields.
- corrected current truth.
- remaining holds.
- D1/D7/D14 observation updates.
