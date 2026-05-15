# Structured Data Contract

Version: `discoverability.structured_data_contract.v1`

This document is the Discoverability Foundation contract for JSON-LD rendering. It describes current runtime truth; it is not a content expansion plan.

## Authority Rules

- Backend-owned SEO surfaces render backend-provided structured data only when the backend authority declares the schema key.
- Frontend helpers may deterministically render generic page evidence schemas from visible page content: `WebPage`, `BreadcrumbList`, `FAQPage`, `CollectionPage`, `ItemList`, `Article`, `Organization`, and eligible test-detail `SoftwareApplication`.
- `FAQPage` must be derived from visible FAQ or answer-surface content rendered on the page.
- `SoftwareApplication` is allowed only on eligible public test detail pages, using visible test-detail facts or already-consumed backend/CMS/scale lookup fields.
- `Product`, `Offer`, `Review`, and `AggregateRating` are not emitted by the current runtime.
- `Dataset` belongs only on dedicated dataset surfaces or backend-provided career data surfaces that explicitly return it.
- `Quiz` is not emitted by the current runtime. Do not reintroduce `Quiz` schema unless a future PR adds visible quiz evidence and updates this contract.
- Private flows must not render JSON-LD.

## Page Family Matrix

| Page family | Runtime authority | Allowed JSON-LD | Forbidden in this train |
| --- | --- | --- | --- |
| Home | deterministic renderer from visible page sections | `WebPage`, `ItemList`, `Organization` | `Quiz`, `Dataset` |
| Tests hub/category | deterministic renderer from visible catalog sections | `CollectionPage`, `ItemList`, `BreadcrumbList` | `Quiz`, `Dataset` |
| Test detail | deterministic renderer from visible landing/FAQ content | `WebPage`, `BreadcrumbList`, `FAQPage`, eligible `SoftwareApplication` | `Quiz`, `Dataset`, hidden FAQ, `Product`, `Offer`, `Review`, `AggregateRating` |
| Article index/detail | CMS article authority plus visible FAQ blocks | `CollectionPage`, `Article`, `BreadcrumbList`, optional `FAQPage` | hidden FAQ, `Dataset`, `Quiz` |
| Topic index/detail | CMS topic SEO plus visible topic sections | `WebPage`, `BreadcrumbList`, optional `FAQPage`, optional CMS `jsonld` | hidden FAQ, `Quiz` |
| Help/content/support detail | CMS content page authority plus visible FAQ blocks | `WebPage`, `BreadcrumbList`, optional `FAQPage` | hidden FAQ, `Quiz`, `Dataset` |
| Career job detail | backend `seo.surface.v1` and backend job bundle | backend `Occupation`, backend `BreadcrumbList`, optional visible display `FAQPage` | frontend-built `Occupation`, `Dataset`, `Article` |
| Career family hub | backend family hub bundle | backend `CollectionPage`, backend `ItemList`, backend `BreadcrumbList` | frontend-built career schema, `Dataset`, `Article` |
| Dataset hub/method | backend dataset bundles | backend `Dataset`/`BreadcrumbList` for hub, backend `Article`/`BreadcrumbList` for method | job or recommendation schema |
| Private flows | no public SEO authority | none | any JSON-LD |

## Canonical Alignment

- JSON-LD `url`, `@id`, `item`, and `mainEntityOfPage` values must be based on canonical URLs.
- `BreadcrumbList.item` must use canonical paths.
- Backend-owned career JSON-LD must remain aligned with backend canonical paths and `structured_data_keys`.

## Evidence Alignment

- `FAQPage` is allowed only when the questions and answers are visibly rendered.
- Test-detail `SoftwareApplication` is allowed only when the page is public, indexable, has visible name/description, has a canonical URL, and passes the sensitive-scale policy.
- Test-detail `SoftwareApplication` fields must remain limited to schema identity, URL, language, `operatingSystem`, conservative `applicationCategory`, valid visible duration, and visible feature facts.
- Backend career `Occupation` is allowed only when the backend SEO surface declares `Occupation`.
- `Dataset` is allowed only when the page visibly represents a dataset or backend dataset bundle.
- No hidden schema stuffing is allowed.

## Private Flow Exclusion

The following route families must never render JSON-LD:

- `/tests/*/take`
- `/result/*`
- `/orders/*`
- `/share/*`

This contract is enforced by `tests/contracts/structured-data-contract.contract.test.ts` and the fixture at `tests/contracts/fixtures/discoverability-foundation/structured-data-contract.v1.json`.
