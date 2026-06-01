# PR-FDN-SEO-01-IMPLEMENTATION

## Executive Summary

Implemented a guarded Foundation Daily Giving SEO/schema/llms integration in fap-web.

The change keeps the backend public Foundation API as authority:

- Daily Giving pages now emit deterministic `WebPage` and `BreadcrumbList` JSON-LD for visible page content.
- `ItemList` JSON-LD is emitted only when the rendered backend public record payload contains records.
- Page indexability is gated by backend public records; empty or unavailable API payloads remain noindex.
- `llms.txt` and `llms-full.txt` can include Foundation Daily Giving URLs only when the backend public months API reports at least one public month with records.

No frontend fallback ledger records were added.

## SEO / Schema Behavior

Allowed schema types:

- `WebPage`
- `BreadcrumbList`
- `ItemList` only when backend public records exist

Forbidden schema and claim surfaces remain absent:

- `DonateAction`
- `Offer`
- `Product`
- `AggregateOffer`
- `Dataset`
- frontend-authored donation records
- frontend-authored donation totals
- Search Channel actions
- URL submission

## llms Behavior

The llms integration is present but gated.

`llms.txt` and `llms-full.txt` will list:

- `/en/foundation/daily-giving`
- `/zh/foundation/daily-giving`
- monthly archive URLs

only after the backend public months API returns public months with `recordCount > 0`.

With the current empty production ledger, no Daily Giving llms URL exposure is expected.

## Runtime Boundary

This PR does not mutate CMS, deploy, enqueue Search Channel items, submit URLs, call external search APIs, or edit env/DNS/nginx.

The direct `api.fermatmind.com` TLS/curl path remains an external OPS sidecar. The same-origin public API path remains the frontend authority path.

## Validation

Required validation:

- `pnpm exec vitest run tests/contracts/pr-fdn-seo-01-implementation.contract.test.ts`
- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build`
- `pnpm test:contract`
- JSON/YAML parsing
- `git diff --check`
- `git diff --cached --check`

## Final Decision

`pr_fdn_seo_01_implementation_completed_ready_for_deploy_readiness`

## Next Task

`FRONTEND-DEPLOY-READINESS`
