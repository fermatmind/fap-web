# HOLD /goal SEO-OPPORTUNITY-QUEUE-READONLY-01

Status: READY_AFTER_GSC_QUALITY

Do not execute this PR now.

## Why Held

The read-only opportunity queue depends on GSC quality, an opportunity queue contract, and the ops read-model bridge. Without those, the queue could be driven by stale, fixture, mock, unknown, or private evidence.

## Unhold Requirements

- `SEO-GSC-DATA-QUALITY-01` passes.
- `SEO-OPPORTUNITY-QUEUE-CONTRACT-01` lands.
- `SEO-OPS-READMODEL-BRIDGE-01` lands.
- fap-api manifest/state entries are explicitly authorized.

## Future Allowed Scope

- `backend/app/Services/SeoIntel/OpsDashboard/**`
- `backend/app/Services/SeoIntel/**Opportunity**`
- `backend/tests/Feature/SeoIntel/**`
- Read-only route only if explicitly authorized

## Still Forbidden

- POST/write routes
- CMS mutation
- Search Channel enqueue/approval/submission
- Raw private URLs, raw queries, payment/order data, provider credentials
- fap-web dashboard display in the same PR

## Future Checks

- `php artisan test --filter=SeoDashApi01ReadOnlyApiContractTest`
- `php artisan test --filter=SeoIntelOpsSeoNativeDashboardReadModelTest`
- `php artisan test --filter=SeoIntelCmsIssueQueueSummaryTest`
- `php artisan route:list`
- `git diff --check`

