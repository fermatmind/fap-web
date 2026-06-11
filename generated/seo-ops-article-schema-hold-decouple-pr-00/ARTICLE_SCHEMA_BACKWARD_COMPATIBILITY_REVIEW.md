# Article Schema Backward Compatibility Review

## Existing indexable article reviewed
- Public route: `/en/articles/what-is-riasec-holland-code-career-interest-test`
- SEO API scan result: indexable with Article/FAQ-related structured data present.
- Compatibility action: retained through `LEGACY_ARTICLE_SCHEMA_COMPATIBILITY_ALLOWLIST`.

## New / canary CMS article behavior
- Public route: `/en/articles/why-mbti-and-holland-code-results-dont-match`
- Current release need: make indexable while holding schema.
- New behavior: indexability no longer implies Article/Breadcrumb/FAQ JSON-LD.

## Risk controls
- No broad CMS migration.
- No broad allowlist.
- `structured_data_keys` is not treated as approval because Article 42 had these keys while schema was intentionally held.
- Explicit schema launch can be implemented later through CMS/runtime schema gate fields.

## Hreflang/canonical impact
No change. This PR does not modify canonical or hreflang logic.
