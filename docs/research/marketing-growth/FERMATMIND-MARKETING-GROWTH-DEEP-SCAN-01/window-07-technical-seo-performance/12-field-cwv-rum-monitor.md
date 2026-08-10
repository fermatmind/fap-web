# Field CWV / RUM monthly monitor

Status: **FIELD_CWV_RUM_MONITOR_SPEC_AND_DISABLED_COLLECTOR_COMPLETE**

Baseline: **FIELD_CWV_RUM_BASELINE_INSUFFICIENT_DATA**

## Source priority

1. Production RUM and CrUX for real-user conclusions.
2. GSC Core Web Vitals for search-side URL groups.
3. Backend/API telemetry for server diagnosis.
4. Synthetic lab for root-cause diagnosis only.

Official thresholds and definitions: [Chrome Web Vitals](https://web.dev/articles/vitals), [threshold rationale](https://web.dev/articles/defining-core-web-vitals-thresholds), [CrUX API](https://developer.chrome.com/docs/crux/api), [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started).

## Primary metrics

- LCP p75: good <=2.5s, needs improvement >2.5s–4.0s, poor >4.0s.
- INP p75: good <=200ms, needs improvement >200ms–500ms, poor >500ms.
- CLS p75: good <=0.1, needs improvement >0.1–0.25, poor >0.25.
- Evaluate mobile and desktop separately.

## Drivers and guardrails

TTFB p75, FCP p75, JS bytes, long-task time, LCP resource load, API p95, render/question/submit failures, 5xx/timeout rate, freshness, sample coverage, assessment start/complete and Organic Qualified Assessment Completes.

## Privacy

Allowed dimensions: tier, template/surface, locale, device, browser family, coarse region, navigation type and release/build identity.

Forbidden payload: complete URL/query, attempt/result/order, answers/scores, email/phone, token/session, user ID or private URL. Emit a route family/template only; strip query and fragment; drop private routes.

## Disabled collector contract

`PUBLIC-CWV-RUM-PRIVACY-SAFE-INSTRUMENTATION-01` adds a frontend product-code-only collector boundary using the framework Web Vitals observer. It is not active unless `NEXT_PUBLIC_PUBLIC_CWV_RUM_ENABLED` is exactly `true`; the current repository and production configuration do not enable it.

Even after a future explicit flag change, collection fails closed unless analytics consent, production environment, approved host, referrer, query and public-route gates all pass. The route classifier covers only allowlisted non-Career public families and drops assessment-taking, result, history, order, share, payment, API, Career and unknown routes.

The payload allowlist contains only schema version, metric, rounded value, rating, L1/L2/L3 tier, coarse surface, locale, mobile/desktop and navigation type. It excludes full URL, pathname, slug, query, fragment, Web Vitals id/delta/entries, DOM/interaction content, session, user and private identifiers. The current sink is an intentional no-op with no endpoint, vendor, beacon or network transport. Production activation and any real sink require separate authorization and are not part of this train.

## Monthly output

Reporting month, freshness, sample size, coverage, tier p75, classification, month-over-month, release annotations, regression cohort, likely cause, owner, next PR/monitor and limitations.

No readable field dataset was available. Monthly values stay blank/`INSUFFICIENT_FIELD_DATA`; they are never zero and never replaced by lab results. Relative alerts wait for a stable baseline. Implementing a disabled no-op collector does not create field evidence or enable production tracking.
