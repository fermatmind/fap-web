# Big Five V1 API Consumer Contract

## Endpoint

The frontend consumer reads one asset by stable framework, locale, entity type, and code:

`/api/v0.5/personality-content-assets/big_five/{entityType}/{code}?locale={locale}&org_id=0`

This avoids fuzzy slug-only lookup and aligns the route registry with the backend CMS/API authority layer.

## Required Asset Gates

The frontend accepts only assets that match all of the following:

- `framework = big_five`
- `entity_type` equals the route registry entry
- `code` equals the route registry entry
- `locale` equals the requested frontend locale
- `launch_state = content_ready`
- `is_public = true`

If any gate fails, the asset is rejected and the page fails closed.

## Payload Fields Consumed

- identity: `framework`, `entity_type`, `code`, `locale`, `slug`
- content: `title`, `summary`, `sections`, `faq`, `internal_links`
- metadata: `seo`, `canonical_path`, `hreflang`, `robots`
- indexability: `launch_state`, `index_eligible`, `sitemap_eligible`, `llms_eligible`, `is_public`
- rendering support: `media`, `schema`, `method_boundary`, `evidence_notes`

## Fail-Closed Behavior

- 404/422 response: return `null`
- invalid asset state: return `null`
- route page body: `notFound()`
- metadata: noindex fallback only

No local editorial fallback body is used.

## Production Observation

Live API evidence on 2026-06-14:

- `https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en` returned zero items.
- `https://api.fermatmind.com/api/v0.5/personality-content-assets?framework=big_five&locale=en&entity_type=hub` returned zero items.
- `https://api.fermatmind.com/api/v0.5/personality-content-assets/big_five/hub/big-five?locale=en` returned 404.

This blocks live production rendering smoke until fap-api production deploy/import is complete. It does not require frontend fallback content.

## Evidence

- Code evidence: `lib/cms/personality-public-content-assets.ts`
- Contract evidence: `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
- Inference: production API state likely lags merged backend content/import availability.
