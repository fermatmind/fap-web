# Daily Pipeline Search Batch Separation

Use this reference when daily SEO article release work could otherwise drift into search-provider execution.

## Principle

Daily content production and search submission are separate lanes.

A daily SEO article release may end at:

- `DRAFT_CREATED_PUBLIC_RELEASE_HELD`
- `CONTENT_RELEASED_SEARCH_BATCH_HELD`
- `PUBLISHED_DISCOVERABILITY_HELD`
- `DISCOVERABILITY_RECONCILED_SEARCH_BATCH_HELD`
- `D1_D7_D14_OBSERVATION_QUEUED`

These are valid end states when public content, identity, claim, preview/publish, and discoverability evidence are safe.

## Daily Lane

The daily lane may include, when authorized:

1. package QA.
2. image bundle dry-run.
3. Media Library import/register.
4. resolved package write/backfill.
5. CMS draft/import/update.
6. authenticated preview QA.
7. publish metadata autofill.
8. publish rehearsal.
9. controlled publish or existing-article promote.
10. public smoke.
11. discoverability check/reconciliation.
12. D1/D7/D14 observation queue.

The daily lane must not wait on Baidu, GSC, or IndexNow live execution before starting the next article once content and discoverability are safely held or reconciled.

## Search Batch Lane

Search batch work starts after one or more public URLs are converged in sitemap, llms, llms-full, and URL Truth or are explicitly queued for reconciliation.

Search batch sequence:

1. Search Channel readiness.
2. Search Channel Queue enqueue/write when explicitly authorized.
3. Operator review.
4. Approve exact queue item IDs.
5. Run `search-channel-submit-approved` dry-run.
6. Execute live only with exact live approval phrase.
7. Split IndexNow and Baidu by channel.
8. Record provider response and queue state.

## Search Batch Hard Rules

- Use Search Channel Queue only.
- No direct IndexNow provider API calls.
- No direct Baidu provider API calls.
- No `--channels=all`.
- Do not mix IndexNow and Baidu in one live command.
- Do not include GSC in Search Channel executor.
- Do not re-submit queue items already in `execution_state=submitted`.
- Queue IDs are generated after enqueue; later approvals must reference exact generated IDs.

## Baidu Quota

HTTP 400 `over quota` is `provider_quota_exhausted`.

Rules:

- not a content blocker;
- no automatic retry;
- retry only failed queue item IDs after quota reset;
- do not retry submitted items;
- dry-run before retry;
- new exact authorization phrase required for failed IDs only.

For the six-pillar 2026-06 batch, failed Baidu IDs were `49,51,53,55`; submitted IDs `47,48` must not be retried.

## GSC Manual Lane

GSC Live Test and URL Inspection are inspection evidence.

Request Indexing is an external action and remains exact-authorization only. A successful Live Test does not authorize Request Indexing.

Stored crawl reports may be stale; report live test state and stored crawl state separately.

## Schema And Hreflang Lanes

Schema and hreflang are not part of normal daily article release. Use separate tasks:

- `SEO-OPS-ARTICLE-SCHEMA-ELIGIBILITY-REVIEW-00`.
- `SEO-OPS-BILINGUAL-HREFLANG-ROLLOUT-REVIEW-00`.

FAQ schema remains held unless visible FAQ parity and claim gate pass.

Hreflang requires reciprocal locale identity, self-canonical, sitemap consistency, and no wrong-language/private route.
