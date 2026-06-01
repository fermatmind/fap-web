# PR-FDN-SEO-01-READINESS

## Executive Summary

Foundation Daily Giving is ready for a guarded SEO/schema/llms implementation PR, but not for unconditional discoverability exposure.

Read-only production checks on 2026-06-01 confirmed:

- Daily Giving index and monthly archive pages return HTTP 200.
- Canonicals are exact apex URLs.
- No staging canonical is present.
- Pages remain `noindex, nofollow, noarchive, nocache`.
- Current pages emit no JSON-LD.
- Daily Giving URLs have zero hits in sitemap, `llms.txt`, and `llms-full.txt`.
- Same-origin Foundation public API is healthy.
- The public ledger currently has zero public records and zero public months.

The implementation should therefore be backend-authoritative and gated: schema and llms/sitemap exposure must depend on public API/CMS authority, not frontend fallback content.

## Runtime Evidence

Checked URLs:

- `https://fermatmind.com/en/foundation/daily-giving`
- `https://fermatmind.com/zh/foundation/daily-giving`
- `https://fermatmind.com/en/foundation/daily-giving/2026-06`
- `https://fermatmind.com/zh/foundation/daily-giving/2026-06`

All four return HTTP 200 with exact canonical URLs. Each currently remains non-indexable.

## API Evidence

Checked same-origin API:

- `https://fermatmind.com/api/v0.5/foundation/giving-records`
- `https://fermatmind.com/api/v0.5/foundation/giving-records/months`

Both return HTTP 200. The current public payload is empty:

- public record count: 0
- public month count: 0

## Current SEO / Schema State

Current frontend runtime emits no JSON-LD for the Daily Giving pages.

Recommended future implementation boundaries:

- Add only deterministic, page-visible schema.
- Use `WebPage` and `BreadcrumbList` for the index and archive pages.
- Add `ItemList` only when backend public records exist for the rendered page/month.
- Do not synthesize donation records in frontend code.
- Do not introduce `DonateAction`, `Offer`, `Product`, `AggregateOffer`, `Dataset`, or medical/charity/legal-entity claims.

## Discoverability Readiness

Daily Giving pages are currently not exposed in:

- sitemap
- `llms.txt`
- `llms-full.txt`
- footer/nav
- Search Channel

Future exposure should stay separate from this readiness task and should be explicitly gated by:

- public runtime 200
- exact apex canonical
- no staging canonical
- no guarded foundation phrase regression
- backend public API authority
- at least one public ledger record before `ItemList` or month archive discoverability is promoted

## Sidecar Issues

The direct `api.fermatmind.com` curl/TLS path remains an external OPS sidecar. Same-origin API reads are healthy and sufficient for the frontend runtime and future guarded SEO implementation.

## What Was Not Done

- No runtime code was changed.
- No JSON-LD was added.
- No sitemap, llms, footer, or nav exposure was enabled.
- No CMS data was mutated.
- No deploy was performed.
- No Search Channel action was performed.
- No URL was submitted.
- No external search or social API was called.
- No env, DNS, or nginx changes were made.

## Final Decision

`pr_fdn_seo_01_readiness_completed_ready_for_guarded_implementation`

## Next Task

`PR-FDN-SEO-01-IMPLEMENTATION`
