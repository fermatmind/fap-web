# Search Batch Status Matrix Template

| article_key | canonical_url | indexnow_queue_id | indexnow_approval_state | indexnow_execution_state | indexnow_provider_result | baidu_queue_id | baidu_approval_state | baidu_execution_state | baidu_provider_result | retry_candidate | gsc_manual_state | notes |
| --- | --- | ---: | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| example | `https://fermatmind.com/...` | 0 | approved | submitted | accepted HTTP 200 | 0 | approved | submit_failed | over quota | yes_failed_only | ready_not_clicked | do not retry submitted items |

## Required Rules

- Include exact queue item IDs.
- Split IndexNow and Baidu.
- Do not include GSC in Search Channel executor.
- Mark submitted items as not retry candidates.
- Mark Baidu HTTP 400 `over quota` as `provider_quota_exhausted`.
- Generate live approval phrases only after submit-approved dry-run passes.
