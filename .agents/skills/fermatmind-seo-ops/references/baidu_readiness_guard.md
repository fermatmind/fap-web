# Baidu Readiness Guard

Use for Baidu readiness, dry-run, and retry safety.

## Rules

- No automatic retry on `site init fail` or HTTP 400 `over quota`.
- Do not print tokens.
- Do not enable live gates without exact approval.
- Baidu live push is separate from GSC and IndexNow.
- Baidu live push must use the official queue approval and bounded executor path when available.
- Platform-side blockers and provider quota exhaustion must stop the live pipeline without blocking content production.
- If live push is requested, verify endpoint, site, token presence, queue item IDs, URL Truth, public/indexable/sitemap/llms state, and prior provider response.

## Provider Error Taxonomy

| Provider result | Classification | Required action |
|---|---|---|
| `site init fail` | `platform_action_required` | Stop; verify Baidu platform site initialization/verification/API-submit state. Do not auto retry. |
| HTTP 400 `over quota` | `provider_quota_exhausted` | Stop; do not retry automatically. Retry only failed queue item IDs after quota reset and fresh bounded approval. |
| token/site/endpoint missing | `configuration_required` | Stop; verify without printing token. |
| quota or permission blocked | `platform_action_required` | Stop; operator resolves in Baidu platform. |
| transport timeout with verified config | `retryable_after_review` | Dry-run/requeue only after bounded approval. |

Provider response must be redacted and audited. Never print Baidu token or full secret-bearing endpoint.

## Decisions

- `BAIDU_READINESS_PASSED_HELD`.
- `BAIDU_LIVE_PUSH_NEEDS_EXACT_APPROVAL`.
- `BAIDU_PLATFORM_BLOCKED`.
- `BAIDU_PLATFORM_ACTION_REQUIRED`.
- `BAIDU_PROVIDER_QUOTA_EXHAUSTED`.
- `NO_GO_BAIDU_RETRY`.

## Retry-Hold Rule

When Baidu quota is exhausted, record accepted queue IDs separately from failed queue IDs. Do not include submitted queue items in a later retry. A retry must use the official queue executor, dry-run first, and an exact live approval phrase for the failed IDs only.
