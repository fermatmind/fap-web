# GSC Exact Export Handoff

Status: `SUPERSEDED_BY_M01_READ_ONLY_JOINT_EXPORT`

The former handoff is closed by the Window 2 M01 package. The previous UI-only evidence and overbroad API Explorer OAuth observation remain historical context, not the current E01 state.

## Replacement evidence

- objective: `FERMATMIND-MEASUREMENT-M01-GSC-EXPORT-01`
- property: `sc-domain:fermatmind.com`
- search type: `web`
- OAuth scope: `https://www.googleapis.com/auth/webmasters.readonly`
- source: `window-02-measurement/m01-gsc-export/gsc_query_page_country_device.csv`
- source SHA-256: `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`
- manifest SHA-256: `fb1c063528edde64aadca8f6fd9b39231e7a276eb898625a398c5b59cb0b0322`
- safe rows: 12,336
- grain: `window × query × page × country × device`
- windows: `current28`, `prev28`, `day90`
- pagination: completed under the M01 manifest
- Search Console write: false
- production write: false

## Boundaries retained

- Search Analytics returns top rows and does not guarantee every possible row; completed pagination is not event-level or full long-tail proof.
- M01 stores sanitized privacy-filtered projections, not raw API responses or credentials.
- Language remains unsupported and UNKNOWN.
- Equivalent joint search-appearance evidence remains UNKNOWN.
- This handoff closure authorizes no CMS, runtime, canonical, hreflang, schema, sitemap, llms, indexability, search submission, or deployment change.

Current normalized E01 outputs are `en_gsc_country_device.csv`, `en_query_page_opportunities.csv`, and `en_market_segment_spec.json`.
