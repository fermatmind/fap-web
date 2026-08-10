# Sources and English-Market Boundary

## E01 evidence state

**`E01_GSC_EXACT_MARKET_SPLIT_REFRESH_COMPLETE`** for the retained M01 privacy-filtered returned-safe dataset.

The Window 2 M01 package now supplies the previously missing joint Search Analytics evidence:

- source: `window-02-measurement/m01-gsc-export/gsc_query_page_country_device.csv`
- source SHA-256: `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`
- manifest SHA-256: `fb1c063528edde64aadca8f6fd9b39231e7a276eb898625a398c5b59cb0b0322`
- source safe rows: 12,336
- source grain: `window × query × page × country × device`
- windows: `current28`, `prev28`, and `day90`
- authorization: `https://www.googleapis.com/auth/webmasters.readonly`; no Search Console or production write

E01 retains 4,192 rows across 152 verified English canonicals after applying the current route contract. It excludes four observed Big Five `high-*` / `low-*` redirect-only aliases, the legacy uppercase MBTI slug, and the non-canonical `__unknown__` Career family. The current sitemap was read as discoverability evidence, not treated as the sole content-authority source; backend/repository route contracts remain authoritative for canonical eligibility.

## Authority order

1. Backend/CMS public APIs and route contracts define current public content and canonical facts.
2. `en-content-parity-control-master.v2.json` is the only sitewide V2 English parity control authority.
3. M01 GSC exports measure privacy-filtered search performance; they do not establish user language, content authority, publication eligibility, or full event-level traffic.
4. SERP samples describe observed result types, not stable rank guarantees.
5. Historical 1046 Career inventory is demand research only.

## English and market segmentation

An English page is identified by its verified `https://fermatmind.com/en` canonical cohort, not visitor country. Country is a market dimension only:

- `US = country=usa`
- `UK = country=gbr`
- `OTHER = all other returned country rows`
- `GLOBAL = an independently recomputed all-country view`

US, UK, and OTHER are mutually exclusive and exhaustive only within the retained returned-safe E01 rows. GLOBAL is not a fourth additive segment. Equality between the three groups and GLOBAL is a validation invariant for this retained dataset, not evidence that GSC returned every possible long-tail or privacy-suppressed row.

The only supported device values are `mobile`, `desktop`, and `tablet`. Surfaces are classified from verified canonical paths as assessment, personality, articles, career, hubs/content pages, and homepage.

## Boundaries that remain

- Search Analytics returns top rows and does not guarantee every possible row. Completed pagination does not prove event-level or full long-tail exhaustiveness.
- M01 privacy-filtered exclusions are absent data, not zero.
- User language remains `UNKNOWN_UNSUPPORTED_GSC_SEARCH_ANALYTICS_DIMENSION`; country, query text, and page path are not language proxies.
- Equivalent joint `searchAppearance` evidence remains `UNKNOWN_UNAVAILABLE_EQUIVALENT_JOINT_EVIDENCE`.
- B03 completed six-assessment technical-manual inventory: **UNKNOWN in this pre-closeout Window 9 source note; final cross-file closeout owns reconciliation to the latest B03 authority.**
- C06/C07 completion and formal Career batch: **`WAITING_ON_C06_C07`**.

Every CSV keeps the provenance prefix `source,captured_at,country,device,locale,date_window,query,page,evidence_status,limitation`. Machine-readable segmentation, source hashes, exclusions, and limitations are in `en_market_segment_spec.json` and `en_source_manifest.json`.
