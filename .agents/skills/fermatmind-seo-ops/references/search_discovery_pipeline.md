# Search Discovery Pipeline

Run after public URLs, sitemap, llms, and llms-full are converged.

Run `references/article_identity_lock.md` before URL Truth refresh, queue readiness/enqueue, provider dry-runs, GSC readiness, or Baidu readiness.

## Stages

1. URL Truth refresh.
2. Search Channel readiness.
3. Search Channel Queue enqueue.
4. Operator review.
5. Search Channel approve with explicit queue item IDs.
6. IndexNow bounded submission.
7. Baidu bounded readiness/live path when separately approved.
8. GSC manual readiness.
9. final channel matrix.

## Rules

- URL Truth refresh requires `allow_url_truth_refresh=true`.
- Queue enqueue requires `allow_search_channel_enqueue=true`.
- Queue item live submission must use the official flow: queue readiness, queue enqueue, operator review, `search-channel-approve`, then `search-channel-submit-approved`.
- Submit only specified queue item IDs that are `approval_state=approved` and whose dry-run passed.
- IndexNow may run only if bounded, channel-specific, and `allow_indexnow_bounded_submission=true`.
- Baidu may run only if bounded, channel-specific, and separately approved; `site init fail` is `platform_action_required`, not an automatic retry condition.
- GSC is inspection only; do not click Request Indexing without separate exact authorization.
- 360, Sogou, and Shenma hold by default.
- Do not mix channels in one live submit command.
- Do not use `--channels=all`.
- Do not temporarily open global production live gates.
- Do not call IndexNow or Baidu provider APIs directly outside the official queue executor.
- Do not print tokens or secrets.

## Output

Final channel matrix must include URL Truth, queue readiness, enqueue state, approval state, IndexNow provider response, GSC indexed/not indexed/requested state, Baidu provider response, 360, Sogou, Shenma, unauthorized submissions, schema hold, hreflang hold, and final reconciliation status.
