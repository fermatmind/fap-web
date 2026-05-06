# CMS SEO Completeness Matrix

Version: `discoverability.cms_seo_completeness_matrix.v1`

Scope: PR-DF-06

This matrix defines the minimum backend/CMS SEO authority required before a page family can be treated as Discoverability Foundation ready. It is governance only. It does not migrate content, redesign CMS screens, add frontend fallback SEO, or widen sitemap/llms exposure.

## Authority Rule

Backend-owned `seo.surface.v1`, backend sitemap-source, and CMS/public API payloads own mutable SEO truth. Frontend code may normalize and render that truth, but must not invent canonical URLs, indexability, structured data keys, llms exposure, or Evidence Container readiness for CMS-backed surfaces.

## Required Authority Fields

| Field | Purpose | Owner |
| --- | --- | --- |
| `metadata_contract_version` | Identifies the SEO authority contract. | Backend `seo.surface.v1` |
| `canonical_url` | Canonical URL used by metadata, sitemap, and JSON-LD references. | Backend/CMS SEO authority |
| `title` | Search title. | Backend/CMS SEO authority |
| `description` | Search description. | Backend/CMS SEO authority |
| `robots_policy` | Robots posture. | Backend `seo.surface.v1` |
| `indexability_state` | Index/noindex governance. | Backend `seo.surface.v1` or CMS publication state |
| `sitemap_state` | Sitemap inclusion governance. | Backend sitemap-source/SEO authority |
| `llms_exposure_state` | llms/AI-readable exposure governance. | Backend `seo.surface.v1` |
| `structured_data_keys` | Declares emitted structured data types. | Backend `seo.surface.v1` |
| `alternates` | Locale alternate map. | Backend/CMS SEO authority |
| `answer_surface_v1` | Visible answer/evidence content for GEO readiness. | Backend/CMS content authority |
| `landing_surface_v1` | Landing-page content authority where applicable. | Backend/CMS content authority |

## Forbidden States

- `llms_exposure_state=allow` while `indexability_state` is not indexable.
- `sitemap_state=included` while `robots_policy` contains `noindex`.
- Missing `canonical_url` on an indexable CMS-backed detail page.
- Frontend-only canonical or structured data fallback for CMS-backed pages.
- Hidden schema or FAQ data without visible rendered evidence.
- Private flows marked indexable, sitemap-included, or llms-allowed.

## Page Family Matrix

| Page family | Authority payload | Required fields | Evidence readiness |
| --- | --- | --- | --- |
| Test detail | backend scale catalog/sitemap-source plus deterministic renderer | canonical, title, description, indexability, sitemap, llms, structured data keys | Required before GEO expansion |
| Topic detail | CMS topic detail + `seo_surface_v1` | canonical, title, description, alternates, indexability, llms, answer surface | Required before Topic Graph expansion |
| Personality detail | CMS personality detail + `seo_surface_v1` | canonical, title, description, alternates, indexability, llms, answer surface | Required before personality graph expansion |
| Career job detail | backend job bundle + `seo_surface_v1` | canonical, title, description, robots, indexability, sitemap, llms, `Occupation` key | Required before career pSEO expansion |
| Career guide detail | CMS career guide detail + `seo_surface_v1` | canonical, title, description, alternates, indexability, answer surface | Required before guide cluster expansion |
| Article detail | CMS article detail + `seo_surface_v1` | canonical, title, description, publication state, indexability, answer surface | Required before media-style GEO expansion |
| Landing surface | backend `landing_surface_v1` | slug, locale, title, description, publication/indexability state | Required before paid or SEO landing rollout |
| Content page | backend `content_pages` | slug, locale, title, body, publication/indexability state | Evidence optional unless search-targeted |
| Dataset method | backend dataset bundle | canonical, title, description, `Dataset` key | Required for Dataset JSON-LD |

## Validation

`tests/contracts/cms-seo-completeness-matrix.contract.test.ts` and `scripts/seo/check-cms-seo-completeness-matrix.mjs` validate that this matrix is explicit, source-backed, and still aligned with existing frontend consumers. Future PRs may add live backend completeness reporting, but PR-DF-06 intentionally remains read-only and fixture-based.
