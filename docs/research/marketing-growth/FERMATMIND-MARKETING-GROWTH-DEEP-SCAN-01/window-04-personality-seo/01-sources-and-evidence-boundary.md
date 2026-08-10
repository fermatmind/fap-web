# Sources and Evidence Boundary

Revalidated at: `2026-08-10T06:54:30Z`

## Sole GSC authority

- Objective: `FERMATMIND-MEASUREMENT-M01-GSC-EXPORT-01`.
- Combined input SHA-256: `9b7c470aa39aff0e6062c41fe5d71e2e8164159747953d42bd032046cc10f691`.
- Windows: current28 `2026-07-13..2026-08-09`; prev28 `2026-06-15..2026-07-12`; day90 `2026-05-12..2026-08-09`.
- Dimensions: query, page, country, device; `rowLimit=25000`; recorded pagination complete.
- Older GSC summaries and the 2026-06-22 historical snapshot are explicitly excluded from P02/P06 calculations.

## Aggregation

- Clicks and impressions are summed over returned safe country/device rows.
- CTR is total clicks divided by total impressions.
- Position is impression-weighted over returned aggregate rows.
- Query ownership uses an exact normalized safe query within route locale. Route locale comes from the backend-authoritative public URL inventory and is not a GSC language dimension.
- `NOT_RETURNED` means the M01 top-row aggregate did not return a row; it never means zero.

## Unknowns

- Language: `UNKNOWN_UNSUPPORTED`.
- Page-level Page Indexing / URL Inspection: `UNKNOWN_PAGE_LEVEL`.
- Property-level Page Indexing categories are not projected onto personality URLs.

No credential, cookie, token, account identifier, private result, attempt, order, payment, or private report data is present in this package.
