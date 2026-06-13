# GSC Manual Inspection Readiness

Use this workflow when the operator wants to inspect Google Search Console readiness without requesting indexing or submitting sitemaps.

## Inputs

- URL.
- public runtime evidence.
- current robots/canonical/schema/hreflang/sitemap/llms evidence.
- GSC screenshot/export if provided.
- resource/enhancement warning evidence if provided.

## Checks

| Area | Check |
|---|---|
| Public URL | HTTP 200, canonical route, intended robots state. |
| Indexability | Page is indexable only if operator released it. |
| Sitemap | Inclusion matches sitemap eligibility. |
| Schema | JSON-LD presence matches schema gate. |
| Hreflang | alternate/x-default presence matches hreflang gate. |
| Request Indexing | Readiness is read-only unless the URL has separate exact Request Indexing approval. |
| FAQ enhancement | Warning reviewed; do not enable FAQ schema as a reflex. |
| Crawled page resources | Missing resources classified; social image placeholder blocks search readiness. |
| Private URL | No result/order/payment/share/history/take/token/ID leak. |

## Decisions

- `GO_FOR_MANUAL_GSC_INSPECTION`.
- `GO_FOR_GSC_OBSERVATION_ONLY`.
- `NO_GO_GSC_WARNING_BLOCKED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/gsc_manual_inspection_readiness_template.md`.

## Hard gates

Do not request indexing, submit sitemap, click live GSC actions, change CMS, or change runtime behavior. Do not include GSC in IndexNow/Baidu bounded executor tasks.
