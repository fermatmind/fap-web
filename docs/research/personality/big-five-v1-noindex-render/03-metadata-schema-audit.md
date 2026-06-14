# Big Five V1 Metadata And Schema Audit

## Metadata

The route uses CMS/API metadata where available:

- `seo.title`
- `seo.description`
- `canonical_path`
- `hreflang`
- first accepted media image for Open Graph image

The frontend forces noindex regardless of backend copy because this PR is a noindex render consumer only.

## Robots

The page metadata preserves follow/nofollow semantics from the API `robots` value while forcing index exclusion. Accepted API values include:

- `index,follow`
- `noindex,follow`
- `noindex,nofollow`

The route remains noindex in this PR even if a backend asset is later marked index eligible.

## Structured Data

Allowed JSON-LD output:

- `CollectionPage` for hub and facet hub
- `WebPage` for domain and polarity pages
- `BreadcrumbList`
- `FAQPage` only when API FAQ exists

Explicitly excluded:

- `SoftwareApplication`
- test-result schema
- private result module schema
- local fallback article schema

## Canonical And Hreflang

Canonical and alternate language paths are built from the API when present, with safe route-registry fallback paths for the 34 approved candidates.

## Evidence

- Code evidence: `app/(localized)/[locale]/personality/big-five/[[...slug]]/page.tsx`
- Code evidence: `lib/cms/personality-public-content-assets.ts`
- Contract evidence: route metadata test in `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
