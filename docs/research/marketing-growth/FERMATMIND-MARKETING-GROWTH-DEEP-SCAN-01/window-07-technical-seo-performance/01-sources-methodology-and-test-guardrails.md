# Sources, methodology and test guardrails

## Required sources read

- Repository `AGENTS.md`, SEO/GEO authority skill and both public-claim guard documents.
- Canonical, redirect, sitemap, llms, API-edge, authority and performance-relevant `docs/seo/` material.
- `deploy/openresty/fap-web-public.conf` and its nonce HTML bypass/static allowlist boundary.
- Deep scan reports 00, 24, 29, 30, 31 and 32 plus the current Article window.
- Big Five canonical route catalog, redirect configuration and 104-route/alias contracts.
- Current live sitemap, backend `/api/v0.5/seo/sitemap-source`, family sitemaps, llms and llms-full.

Independent current outputs for Measurement M01/M04/M05/M06, Topic Graph G01 and Career C01/C03/C04/C06 were not present. The report does not invent their state: current facts are UNKNOWN or dependency-gated.

## Official definitions

Official definitions were refreshed from [Chrome Web Vitals](https://web.dev/articles/vitals), [threshold rationale](https://web.dev/articles/defining-core-web-vitals-thresholds), [CrUX API](https://developer.chrome.com/docs/crux/api), [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started). Current good thresholds are LCP <=2.5s, INP <=200ms and CLS <=0.1 at p75, evaluated separately for mobile and desktop. Lighthouse cannot provide field INP; TBT/long-task diagnostics are proxies only.

## Production safeguards

- One browser/page request stream at a time; full HTTP scan concurrency was 1.
- 36 definitions × 3 attempts = 108 retained browser rows.
- 525 non-Career URLs were fetched serially; all returned 200 and no two-consecutive-failure stop fired.
- No answers, assessment submission, payment, order, private result, attempt, token or user identifier was accessed.
- No cache bypass header, stress/load test or artificial whole-site warming was used.
- Failed collection rows remain in the CSV; no retry overwrote them.

## Profiles and limitations

- Mobile: 390×844 viewport with desktop Chrome UA; desktop: 1440×960.
- Network: local and unthrottled. These are lab diagnostics, not standardized Lighthouse throttling.
- First attempt is cold-ish only because shared browser cache was not cleared; attempts 2–3 are warm.
- Lighthouse attempts returned `NO_FCP`; Speed Index and Lighthouse TBT remain UNKNOWN.
- Anonymous PSI returned quota failure; no usable CrUX/GSC/RUM dataset was available.
- Three well-spaced L1 windows were not completed: **BASELINE_WINDOW_INCOMPLETE**.

## Runtime identity

- Source Git SHA: `556da366`
- Live SEO revision: `38b5625dd917dceb6eeb3843259e7f7731cb66ce`
- Backend sitemap-source and public HTML intentionally expose different cache boundaries.
