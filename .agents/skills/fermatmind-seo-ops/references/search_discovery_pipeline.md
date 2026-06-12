# Search Discovery Pipeline

Run after public URLs, sitemap, llms, and llms-full are converged.

## Stages

1. URL Truth refresh.
2. Search Channel readiness.
3. Search Channel Queue enqueue.
4. Operator review.
5. IndexNow bounded submission.
6. GSC manual readiness.
7. Baidu readiness.
8. final channel matrix.

## Rules

- URL Truth refresh requires `allow_url_truth_refresh=true`.
- Queue enqueue requires `allow_search_channel_enqueue=true`.
- IndexNow may run only if bounded and `allow_indexnow_bounded_submission=true`.
- GSC is inspection only; do not click Request Indexing.
- Baidu is readiness only unless exact separate approval exists.
- 360, Sogou, and Shenma hold by default.
- Do not mix channels in one live submit command.
- Do not print tokens or secrets.

## Output

Final channel matrix must include URL Truth, queue readiness, enqueue state, IndexNow, GSC, Baidu, 360, Sogou, Shenma, unauthorized submissions, schema hold, and hreflang hold.
