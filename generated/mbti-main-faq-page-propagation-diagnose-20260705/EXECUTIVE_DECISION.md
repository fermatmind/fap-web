# MBTI Main FAQ Page Propagation Diagnose

PR id: `MBTI-MAIN-FAQ-PAGE-PROPAGATION-DIAGNOSE-01`

Decision: `CACHE_REVALIDATION_REPAIR_RECOMMENDED`

Observed at: 2026-07-05T09:53:18Z

## Summary

The current fap-web runtime can read the production API's 8-entry `content_i18n_json.zh.faq` payload and render both visible FAQ and FAQPage JSON-LD from it.

The canonical production page without a cache-bust query still served a stale 4-entry HTML response with `x-proxy-cache: STALE`.

A cache-bust request to the same route rendered 8 visible FAQ entries and 8 FAQPage JSON-LD entries immediately.

## Root Cause Classification

Most likely root cause: canonical production HTML/ISR/proxy cache is stale for the MBTI zh test detail URL.

Not supported by current evidence:

- fap-web adapter failure
- schema renderer-only failure
- runtime data source still hardwired to the old 4-entry FAQ
- CMS landing surface overriding FAQ with old content

## Next PR Recommendation

Open `MBTI-MAIN-FAQ-CACHE-REVALIDATION-REPAIR-01` only if the canonical URL continues to serve stale 4-entry HTML after normal TTL/background regeneration.

Do not open `MBTI-MAIN-FAQ-WEB-ADAPTER-PROPAGATION-REPAIR-01` based on current evidence.

Do not open `MBTI-MAIN-FAQ-RUNTIME-DATA-SOURCE-REPAIR-01` based on current evidence.

After the canonical URL renders 8/8 without cache-bust, rerun `MBTI-MAIN-FAQ-PRODUCTION-RUNTIME-READBACK-02`.

No runtime code, CMS content, sitemap, llms, Search Channel, deployment, or production mutation was changed in this PR.
