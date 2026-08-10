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

## Critical lab remeasurement — 2026-08-10

`NONCAREER-CRITICAL-LAB-REMEASUREMENT-01` reran only the two definitions represented by historical `LAB-028`–`LAB-030` and `LAB-034`–`LAB-036`. The original six failure rows and their source-file hashes remain unchanged.

- Playwright CLI: two public definitions × three serial attempts, desktop 1440×960, local unthrottled network, bounded 2200 ms post-DOM observation, six retained measurement-success rows and zero collector failures.
- RIASEC zh: two warm attempts rendered question 1/60 with five options; the isolated-context first attempt completed measurement but did not reach the question semantic gate inside the bounded window. This is retained as a runtime timing result rather than recoded as a tool failure.
- Big Five zh: all three attempts rendered the expected H1 and both `big5_120`/`big5_90` public start links.
- Lighthouse 13.4.1 desktop: six serial audits completed with no runtime error. Standard Speed Index is populated for every row. Standard TBT is 0 ms for every row; that zero is the Lighthouse audit output, not the earlier long-task proxy or a substituted fallback.
- Snapshot/selector calibration occurred before the frozen six-row Playwright protocol. All attempts after protocol freeze are retained in `critical_lab_remeasurement.csv`.
- No answer, submit, private route, cache-bypass header, load test or production write occurred.

Artifacts: `critical_lab_remeasurement.csv`, `lighthouse_lab_samples.csv` and `critical_lab_remeasurement_manifest.json`.

## Runtime identity

- Source Git SHA: `556da366`
- Live SEO revision: `38b5625dd917dceb6eeb3843259e7f7731cb66ce`
- Backend sitemap-source and public HTML intentionally expose different cache boundaries.
- Follow-up remeasurement base commit: `8bc5689155eae362c4baa02b938dda729ad2a95b`; the live runtime did not expose an exact application revision, so it remains `UNKNOWN_NOT_EXPOSED` rather than inferred from the repository base.
