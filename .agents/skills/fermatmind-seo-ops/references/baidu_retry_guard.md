# Baidu Retry Guard

Use this workflow before any Baidu push retry after a failed or ambiguous Baidu provider response.

## Inputs

- queue item ID.
- URL.
- latest provider response.
- production endpoint/site/token readiness evidence with secrets redacted.
- Baidu platform UI evidence if operator provides it.
- live gate state evidence.

## Required checks

| Check | Requirement |
|---|---|
| Endpoint | `http://data.zz.baidu.com/urls` unless Baidu platform shows a different generated endpoint. |
| Site parameter | Must match Baidu platform-generated site parameter exactly. |
| Token ownership | Must be verified without printing token; hash equality or operator confirmation only. |
| Live gates | Disabled before and after readiness/retry tasks unless bounded approval says otherwise. |
| Platform status | Verification, filing/ICP, API submit availability, quota, and abnormal site state checked if accessible. |
| Prior `site init fail` | Treat as provider/platform blocker, not a normal retryable transport error. |

## Decisions

- `GO_FOR_BAIDU_DRY_RUN_REQUEUE_ONLY`.
- `GO_FOR_EXACT_BAIDU_LIVE_APPROVAL_TEXT`.
- `NO_GO_RETRY_UNTIL_PLATFORM_RESOLUTION`.
- `ACCESS_REQUIRED`.

## Stop conditions

Stop on:

- provider message `site init fail` without new platform-side resolution evidence.
- missing token/site/endpoint.
- token/site mismatch.
- live gates already open unexpectedly.
- request to print or store token.

## Output

Use `assets/baidu_retry_guard_template.md`.

## Hard gates

Do not submit Baidu push, change secrets, rotate token, enable live gates, requeue, or reset queue items unless separately authorized.
