# Sources and evidence boundary

Acceptance revalidated at: 2026-08-10

Evidence uses VERIFIED / INFERRED / UNKNOWN / HISTORICAL exactly as defined by the goal. The machine-readable source register is [article_source_manifest.json](article_source_manifest.json). No environment file, credential, private draft, attempt/report/order/payment record, token, cookie, PII or unredacted backend payload was read.

## Counting units

| Unit | Count | Status |
|---|---:|---|
| CMS article identity / public API record | 129 | VERIFIED |
| Translation group | 95 | VERIFIED |
| Published locale-page | 129 (ZH 89, EN 40) | VERIFIED |
| Sitemap article URL | 111 | VERIFIED |
| Live HTTP 200 | 129 | VERIFIED |
| GSC observed article URL | 56 (ZH 39, EN 17) | HISTORICAL 2026-07-13_to_2026-08-09 |

Sitemap is a discoverability surface, llms is an AI/GEO entry surface, and JSON-LD is structured data. None proves a graph, citation, scientific validity or ranking.

`article_performance_ledger.csv` keeps `backend_structured_data_keys` separate from `live_jsonld_types` and `live_jsonld_parse_errors`. The former records API-declared material; the latter two come from parsing the current server HTML. Absence of live JSON-LD is recorded as `none_observed`, never inferred from backend keys.

The ten SERP snapshots use stateless Brave Search HTML requests with explicit CN/US country controls, locale/search language and a desktop Chrome user-agent. They are reproducible provider-specific observations, not Google Search Console positions, city-level localization, personalized results or future ranking guarantees.
