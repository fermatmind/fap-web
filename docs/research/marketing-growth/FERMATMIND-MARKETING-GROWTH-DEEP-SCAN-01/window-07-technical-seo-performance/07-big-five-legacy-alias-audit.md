# Big Five legacy alias audit

## Cohort

The backend-locked ten aliases were checked in EN and ZH for 20 locale paths:

- `high-*` and `low-*` aliases for openness, conscientiousness, extraversion and agreeableness.
- `high-neuroticism`.
- `emotional-stability` → `neuroticism-low`.

## Result

All 20 paths satisfy the locked contract:

1. Initial HTTP status is 301.
2. Exactly one redirect hop occurs.
3. The target exactly matches the locked locale target and returns 200.
4. Synthetic attribution query is preserved on redirect.
5. Route configuration/request evidence shows no legacy CMS fetch/render before redirect.
6. Alias is absent from sitemap, hreflang, llms, llms-full and frontend canonical catalog.
7. The 525-page SSR link scan found zero internal inbound links to aliases.

No alias returned 200/302, used multiple hops or leaked into public enumeration. Per-path evidence is in `big_five_alias_audit.csv`.

GSC impressions remain UNKNOWN because current GSC data was unavailable. Passing HTTP/enumeration checks do not prove zero historical search impressions.
