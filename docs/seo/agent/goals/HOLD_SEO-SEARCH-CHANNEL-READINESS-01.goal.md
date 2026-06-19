# HOLD /goal SEO-SEARCH-CHANNEL-READINESS-01

Status: HOLD_SEARCH_PROVIDER_SAFETY

Do not execute this PR now.

## Why Held

Search Channel readiness is adjacent to external provider side effects. Even readiness/preflight should wait for GSC quality, runtime QA evidence, exact URL/channel scope, and explicit authorization.

## Unhold Requirements

- `SEO-GSC-DATA-QUALITY-01` passes.
- `SEO-RUNTIME-QA-AGENT-01` produces acceptable public runtime evidence.
- User authorizes exact readiness/preflight scope.
- Queue write, approval, and live submission remain separately blocked.

## Future Allowed Scope

- `backend/app/Services/SeoIntel/SearchChannelQueue/**`
- `backend/app/Console/Commands/SeoIntelSearchChannelQueueCommand.php`
- `backend/tests/Feature/SeoIntel/**SearchChannel**`
- `backend/docs/seo/**`

## Still Forbidden

- Provider credential/env edits.
- Queue writes without exact approval.
- Approval or live submission.
- Private/noindex/claim-unsafe/non-backend-authoritative URLs.
- Unbounded batch submission.

## Future Checks

- `php artisan test --filter=SeoIntelSearchChannelQueue`
- `php artisan test --filter=SeoIntelSearchChannelLiveReadinessScanTest`
- `php artisan test --filter=SeoIntelSearchChannelLivePreflightTest`
- `php artisan seo-intel:search-channel-queue --dry-run --no-write --json --channel=<channel> --canonical-url=<url>`
- `git diff --check`

