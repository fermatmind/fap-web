# GSC US, UK, OTHER, GLOBAL and Device Split

## Goal status

**`GSC_EXACT_EXPORT_BLOCKED`**. Four canonical `/en/` UI export windows are verified and normalized, but the Search Console UI provides `query`, `page`, `country`, `device`, `date`, and `search appearance` as separate tables. It does not provide the required `query×page×country×device` joint rows. The official API Explorer can express the joint request, but the observed OAuth flow requested both read/write and read-only scopes; this report-only goal did not approve the broader write scope.

This is a data-recovery improvement over the earlier aggregate-only state, not completion of E01.

## Exact GLOBAL totals

GLOBAL is the independent chart total. It is not a fourth mutually exclusive country group and is never added to US+UK+OTHER.

| Window | Requested dates | Clicks | Impressions | CTR | Position | Returned query rows | Returned page rows | Daily rows actually present |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| recent_7_complete_days | 2026-08-02 → 2026-08-08 | 8 | 3223 | 0.25% | 12.87 | 141 | 355 | 2026-08-02 → 2026-08-08 (7 rows) |
| recent_28_complete_days | 2026-07-12 → 2026-08-08 | 25 | 13656 | 0.18% | 13.04 | 586 | 479 | 2026-07-12 → 2026-08-08 (28 rows) |
| previous_28_complete_days | 2026-06-14 → 2026-07-11 | 9 | 10660 | 0.08% | 12.19 | 375 | 388 | 2026-06-14 → 2026-07-11 (28 rows) |
| recent_90_days | 2026-05-11 → 2026-08-08 | 39 | 26799 | 0.15% | 12.43 | 900 | 563 | 2026-05-31 → 2026-08-08 (70 rows) |

The 90-day request is `2026-05-11/2026-08-08`, but the first returned daily row is `2026-05-31`; the 20 earlier requested days are absent, not zero. Prior-year comparison is therefore `UNKNOWN`.

## Trend

- Recent 28 days versus previous 28 days: clicks +177.78%; impressions +28.11%; CTR +116.84%; position changed from 12.19 to 13.04 (higher is worse).
- Recent 90-day request: 39 clicks, 26799 impressions, 0.15% CTR, position 12.43; only 70 daily rows were returned.

## Country and device returned-row shares

These shares use only rows returned in their own dimension table. They are not GLOBAL shares because the 28-day country rows contain 2783 impressions and device rows contain 2783, versus the independent GLOBAL total of 13656 impressions.

| Window | US impression share | UK impression share | OTHER impression share | Mobile impression share | Mobile click share |
| --- | ---: | ---: | ---: | ---: | ---: |
| Recent 28 complete days | 20.52% | 3.92% | 75.57% | 39.49% | 50.00% |
| Recent 90-day request | 28.14% | 4.58% | 67.29% | 30.64% | 40.00% |

`US = USA`, `UK = GBR`, and `OTHER = all returned country rows excluding USA and GBR`. Country is a market dimension only; it is never used as a proxy for user language. Locale is recognized only from GSC canonical page URLs beginning `https://fermatmind.com/en/`.

## Query, page, brand and surface evidence

- Recent 28-day returned-row counts: 586 query rows and 479 page rows. They are separate tables and must not be joined by row order or matching metrics.
- Branded definition: case-insensitive `fermatmind`, `fermat mind`, or `费马测试`. Recent 28-day query export returned 1 branded query rows and 585 non-branded query rows; returned clicks were 0 branded and 4 non-branded. These are returned-query-row values, not GLOBAL totals.
- `en_query_page_opportunities.csv` contains top returned queries/pages, near winners (`impressions>=20` and `4<=position<=20`), zero-click high-impression rows (`impressions>=100`), and page-only surface rollups for assessment, personality, articles, career, hubs/content pages, and homepage.
- Search appearance CSVs were present but empty in all four exports. They are recorded as `UNKNOWN`, not zero.

## Exact handoff

Use a credential flow restricted to `https://www.googleapis.com/auth/webmasters.readonly` and query `sc-domain:fermatmind.com` with:

```json
{
  "startDate": "<window-start>",
  "endDate": "<window-end>",
  "dimensions": ["query", "page", "country", "device", "date"],
  "dimensionFilterGroups": [
    {
      "groupType": "and",
      "filters": [
        {
          "dimension": "page",
          "operator": "contains",
          "expression": "https://fermatmind.com/en/"
        }
      ]
    }
  ],
  "type": "web",
  "aggregationType": "byPage",
  "rowLimit": 25000,
  "startRow": 0,
  "dataState": "final"
}
```

Paginate `startRow` until no rows are returned for each required window. Query search appearance separately if Google rejects it in the joint dimension set. Preserve raw responses, request body, exact capture time, property, OAuth scope, pagination offsets, and SHA-256. Google's [Search Analytics query reference](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) states that the API returns top rows and does not guarantee every data row; its [data-limit guidance](https://developers.google.com/webmaster-tools/v1/how-tos/all-your-data#data_limits) must therefore remain an explicit limitation even after API success.

No route, regional content, CMS, product-code, production, sitemap, llms, or V2 action is authorized by this report.
