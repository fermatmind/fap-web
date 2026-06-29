# Search Discovery Pipeline

Run after public URLs, sitemap, llms, and llms-full are converged.

Run `references/article_identity_lock.md` before URL Truth refresh, queue readiness/enqueue, provider dry-runs, GSC readiness, or Baidu readiness.

Search discovery is normally a batch lane. A daily article release may stop at `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD` and continue with the next article when public/discoverability state is safe.

## Stages

1. URL Truth refresh.
2. Search Channel readiness.
3. Search Channel Queue enqueue.
4. Operator review, or full-chain preauthorized queue review when the Authorization Profile lists the target URLs/channels.
5. Search Channel approve with explicit queue item IDs created by this run.
6. IndexNow bounded submission.
7. Baidu bounded readiness/live path when separately approved or full-chain preauthorized.
8. GSC manual readiness and Request Indexing when separately approved or full-chain preauthorized.
9. final channel matrix.

## Rules

- URL Truth refresh requires `allow_url_truth_refresh=true`.
- Queue enqueue requires `allow_search_channel_enqueue=true`.
- Queue item live submission must use the official flow: queue readiness, queue enqueue, queue review, `search-channel-approve`, then `search-channel-submit-approved`.
- Submit only specified queue item IDs that are `approval_state=approved` and whose dry-run passed.
- Do not submit queue items whose `execution_state=submitted`.
- IndexNow may run only if bounded, channel-specific, and `allow_indexnow_bounded_submission=true`.
- Baidu may run only if bounded, channel-specific, and `allow_baidu_bounded_submission=true`; `site init fail` is `platform_action_required`, and HTTP 400 `over quota` is `provider_quota_exhausted`. Neither is an automatic retry condition.
- GSC must not be included in Search Channel executor commands. Request Indexing may run only when `allow_gsc_manual_request_indexing=true` and the inspected URL exactly matches one of the preauthorized target canonical URLs, or when separately approved.
- In `authorization_mode=full_chain_preapproved`, do not stop for another operator phrase between enqueue, approve, IndexNow submit, Baidu submit, and GSC Request Indexing when the queue items/URLs/channels are generated from the same target package and all dry-runs pass.
- 360, Sogou, and Shenma hold by default.
- Do not mix channels in one live submit command.
- Do not use `--channels=all`.
- Do not temporarily open global production live gates.
- Do not call IndexNow or Baidu provider APIs directly outside the official queue executor.
- Do not print tokens or secrets.

## Baidu Quota Retry Rule

If Baidu returns HTTP 400 `over quota`:

- classify as `provider_quota_exhausted`;
- mark the affected queue items as retry-held;
- do not retry automatically;
- retry only failed queue item IDs after quota reset;
- do not retry already submitted items;
- run submit-approved dry-run before retry;
- require a new exact live approval phrase for the failed IDs only.

For the six-pillar 2026-06 batch, failed Baidu queue IDs were `49,51,53,55`; submitted IDs `47,48` must not be retried.

## Output

Final channel matrix must include URL Truth, queue readiness, enqueue state, approval state, IndexNow provider response, GSC indexed/not indexed/requested state, Baidu provider response, 360, Sogou, Shenma, unauthorized submissions, schema hold, hreflang hold, and final reconciliation status.
