# GSC Exact Export Handoff

Status: `GSC_EXACT_EXPORT_BLOCKED`

## Recovered evidence

- Property: `sc-domain:fermatmind.com`
- Search type: `web`
- Page filter: `contains https://fermatmind.com/en/`
- Complete-day end: `2026-08-08`
- UI ZIPs: recent 7 complete days, recent 28 complete days, previous 28 complete days, and recent 90-day request
- Normalized outputs: `en_gsc_country_device.csv` and `en_query_page_opportunities.csv`

## Missing evidence

- Exact `query×page×country×device×date` rows
- Search appearance rows (all four UI CSVs were empty; therefore `UNKNOWN`)
- Prior-year comparison (requested 90-day range begins 2026-05-11, first returned daily row is 2026-05-31)

## Next authorized read-only run

1. Use Search Console API credentials restricted to `https://www.googleapis.com/auth/webmasters.readonly`.
2. Run the exact request in `02-gsc-us-uk-global-device.md` for all four windows.
3. Paginate with `rowLimit=25000` and `startRow=0,25000,...` until the response contains no rows.
4. Run search appearance as a separate dimension request if the joint query rejects it.
5. Save request/response bytes and SHA-256; do not expose tokens, cookies, account identifiers, private result URLs, or credentials.
6. Normalize country codes as `USA`, `GBR`, and `OTHER=NOT IN (USA,GBR)`; keep GLOBAL independent.
7. Re-run canonical, CSV formula-injection, private-URL, date-window, mutual-exclusion, and scope validators.

The observed API Explorer OAuth URL requested both `webmasters` and `webmasters.readonly`. That overbroad consent was not granted. A read-only-only credential path is required.
