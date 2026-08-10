# Export Method and Evidence Boundary

## Source and extraction

- Property: `sc-domain:fermatmind.com`.
- Surfaces: authenticated Google Search Console UI for Performance and Page Indexing; official Search Analytics API Explorer for the combined grain.
- Search type: `web`.
- Performance freshness observed at UI capture: `last updated 4.5 hours ago`.
- Page Indexing freshness: `2026-08-07`.
- UI extraction timestamp: `2026-08-10T05:21:48Z`.
- Combined API extraction timestamp: `2026-08-10T06:06:20Z`.
- UI export row limit: 1,000 for query/page tables.
- API request: ordered dimensions `query`, `page`, `country`, `device`; `type=web`; `aggregationType=auto`; `dataState=final`; `rowLimit=25000`; no additional dimension filter groups.
- API response aggregation type: `byPage` for each window.
- Authorization: only `https://www.googleapis.com/auth/webmasters.readonly` was selected; the writable `webmasters` scope remained disabled.

## Requested windows and pagination

| Window | Start | End | Requested days | API start rows requested | Source rows | Safe rows | Completion evidence |
| --- | --- | --- | ---: | --- | ---: | ---: | --- |
| current28 | 2026-07-13 | 2026-08-09 | 28 | `0`, `25000` | 3922 | 3863 | the `25000` page returned 0 rows |
| prev28 | 2026-06-15 | 2026-07-12 | 28 | `0` | 2646 | 2482 | first page was shorter than 25,000 |
| day90 | 2026-05-12 | 2026-08-09 | 90 | `0` | 6215 | 5991 | first page was shorter than 25,000 |

The official UI export contains separate query, page, country, device, date, search-appearance, and filter files. Those files remain separate grains and are never joined. The combined CSV comes only from the official multi-dimension API response. Search Analytics returns top rows and is not guaranteed to return every possible row, so pagination completion proves that no further returned page was available, not event-level exhaustiveness. Official reference: `https://developers.google.com/webmaster-tools/v1/searchanalytics/query`.

## Safety transformation

- Raw ZIPs and raw API responses are not retained in the repository.
- Page rows containing query strings, fragments, or private route families (`result`, `report`, `attempt`, `order`, `checkout`, payment paths) are excluded.
- Query rows matching email-like, conservative phone-like, or secret-like patterns are excluded without retaining their values.
- The conservative phone-like filter may exclude harmless numeric queries; this is an intentional privacy-first tradeoff.
- CSV cells are protected against spreadsheet formula prefixes.
- No cookie, token, credential, OAuth URL, account identifier, private result, score, order, payment, or user record is stored.

## Explicit unknowns and limits

- language: `UNKNOWN_UNSUPPORTED`; it is not inferred from text, country, URL locale, or browser language.
- Page Indexing is category-level property evidence. It cannot be presented as page-level or personality-only indexing truth.
- The API export is aggregated GSC evidence, not raw search events and not a guarantee that every possible row is returned.
