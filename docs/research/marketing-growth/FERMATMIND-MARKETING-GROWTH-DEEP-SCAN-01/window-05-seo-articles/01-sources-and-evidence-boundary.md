# Sources and evidence boundary

Evidence closeout revalidated at: 2026-08-10T18:30:00+08:00

Evidence uses VERIFIED / INFERRED / UNKNOWN / HISTORICAL exactly as defined by the goal. The machine-readable source register is [article_source_manifest.json](article_source_manifest.json). No environment file, credential, private draft, attempt/report/order/payment record, token, cookie, PII or unredacted backend payload was read.

## Counting units

| Unit | Count | Status |
|---|---:|---|
| CMS article identity / public API record | 129 | VERIFIED |
| Translation group | 95 | VERIFIED |
| Published locale-page | 129 (ZH 89, EN 40) | VERIFIED |
| Sitemap article URL | 111 | VERIFIED |
| Live HTTP 200 | 129 | VERIFIED |
| GSC observed article URL, current28 | 58 / 129 | VERIFIED single-dimension, source-limited |
| GSC observed article URL, prev28 | 48 / 129 | VERIFIED single-dimension, source-limited |
| GSC observed article URL, day90 | 58 / 129 | VERIFIED single-dimension, source-limited |

Sitemap is a discoverability surface, llms is an AI/GEO entry surface, and JSON-LD is structured data. None proves a graph, citation, scientific validity or ranking.

`article_performance_ledger.csv` keeps `backend_structured_data_keys` separate from `live_jsonld_types` and `live_jsonld_parse_errors`. The former records API-declared material; the latter two come from parsing the current server HTML. Absence of live JSON-LD is recorded as `none_observed`, never inferred from backend keys.

The ten SERP snapshots use stateless Brave Search HTML requests with explicit CN/US country controls, locale/search language and a desktop Chrome user-agent. They are reproducible provider-specific observations, not Google Search Console positions, city-level localization, personalized results or future ranking guarantees.

The safe M01 projection is [article_gsc_page_evidence.csv](article_gsc_page_evidence.csv). It contains exactly the 164 article rows intersecting the 129-page portfolio across current28, prev28 and day90; its source CSV SHA-256 is bound in the dependency ledger. Because the GSC UI export is capped at 1,000 rows per window, absence from this projection means Unknown rather than zero. The combined query×page×country×device file has zero data rows, language is unsupported, and dimensions are not joined or inferred.

The complete M01 query×page export and its Window5 delta are now consumed with their declared privacy and exact-alias boundaries. A01/P03-P05 remain design inputs. G03 governance is complete, the backend Authority contract is merged for non-Career edges and G04's fail-closed renderer is implemented, but none of those facts activates or publishes a Window5 edge; production deployment and imported rows are not proven, and C06 remains closed. M06's measurement/read-model contract is merged and the public topic-edge click runtime callsite is consent-gated; production dispatch or receipt is not claimed. M07's active backend event has no article identity in its aggregate dimensions. The M04 exporter is available for a separate read-only acceptance, but that production observation has not yet been written into this package. B03 is an inventory-complete, structurally validated, partially blocked evidence authority rather than a missing artifact. See [article_evidence_closeout_dependencies.json](article_evidence_closeout_dependencies.json).
