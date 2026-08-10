# Article authority inventory

Acceptance revalidated at: 2026-08-10

The complete 129-row locale-page ledger is [article_performance_ledger.csv](article_performance_ledger.csv). CMS/public API identity, publication flags, SEO/landing/answer surfaces, live status/H1/canonical/robots/schema, sitemap and llms observations are current. All 129 canonical pages returned 200 during the bounded revalidation. Backend-declared structured-data keys and parsed live JSON-LD types are separate columns. GSC is joined only where a historical URL row exists; per-article GA4 and downstream conversion remain UNKNOWN.

## Reconciliation

- Historical audit and current sitemap: 111 URLs = ZH 89 + EN 22.
- Current public Article API: 129 published/public records = ZH 89 + EN 40.
- Difference: 18 EN records published/public but `is_indexable=false`, `sitemap_eligible=false`, `llms_eligible=false`.
- Translation groups: 95; a group and a locale-page are not interchangeable.
