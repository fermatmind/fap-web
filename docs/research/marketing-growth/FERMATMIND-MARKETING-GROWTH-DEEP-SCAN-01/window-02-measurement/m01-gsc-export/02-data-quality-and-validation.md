# Data Quality and Validation

## Dataset and grain

- `gsc_query_single_dimension.csv`: one GSC query per window.
- `gsc_page_single_dimension.csv`: one safe public page URL per window.
- `gsc_country_single_dimension.csv`: one country label per window.
- `gsc_device_single_dimension.csv`: one device class per window.
- `gsc_daily.csv`: one returned GSC date per window.
- `gsc_query_page_country_device.csv`: one unique safe `(window, query, page, country, device)` aggregate row; 12,336 rows total.
- Page Indexing files: property-level daily/category aggregates; no URL samples retained.

## Quality findings

| Finding | Evidence | Severity | Downstream interpretation |
| --- | --- | --- | --- |
| Combined grain verified | 12,336 safe rows; no duplicate combined keys | Resolved | Query ownership and cannibalization may be analyzed within the API availability limit |
| Search Analytics top-row boundary | API pagination completed; Google does not guarantee all possible rows | High | Do not claim event-level or long-tail exhaustiveness |
| Query/page UI cap | current28 and day90 query/page UI exports each reached 1,000 rows | High | Use the combined API export for attribution; UI long tail may be omitted |
| 90d omitted dates | 71 returned dates for a 90-day request | Medium | Missing dates must not be treated as explicit zeroes |
| Language unsupported | No Search Analytics language dimension | Medium | Locale cannot be inferred from query/country |
| Page Indexing is property-level | 969 indexed, 2,133 not indexed, 9 reasons | Medium | Cannot claim personality-page indexing state |

## Privacy exclusions — combined API grain

| Window | Source rows | Safe rows | Query email | Query phone-like | Query secret | Parameter/fragment pages | Private-route pages |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| current28 | 3922 | 3863 | 0 | 52 | 0 | 7 | 0 |
| prev28 | 2646 | 2482 | 0 | 163 | 0 | 1 | 0 |
| day90 | 6215 | 5991 | 0 | 216 | 0 | 8 | 0 |

The phone-like exclusion is deliberately conservative and may remove benign numeric searches. No excluded query or URL value is retained.

## Validation outcome

- All CSV and JSON files parse successfully and have unique headers.
- The combined key `(window_id, query, page, country, device)` is unique for all 12,336 rows.
- Combined clicks and impressions are non-negative; CTR is within `[0,1]`; position is non-negative.
- Retained URLs contain no query string, fragment, or configured private-route family.
- Retained queries contain no configured email-like, phone-like, or secret-like pattern.
- No unsafe spreadsheet formula prefix is present.
- Page Indexing reason totals reconcile to 2,133 not-indexed pages.
- File hashes reconcile through the manifest and validation report.

M01 is complete. The evidence can support downstream Top20 and cannibalization work only with the documented Search Analytics top-row and aggregation limits preserved.
