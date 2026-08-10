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
- The original Lighthouse attempts returned `NO_FCP` and remain retained. The follow-up ran six successful Lighthouse 13.4.1 desktop audits with standard Speed Index and TBT populated; these are separate lab-only evidence and do not rewrite the original attempts.
- Anonymous PSI returned quota failure; no usable CrUX/GSC/RUM dataset was available.
- Three well-spaced L1 windows were not completed: **BASELINE_WINDOW_INCOMPLETE**.

## L1 interval baseline — 2026-08-10

`NONCAREER-L1-INTERVAL-BASELINE-01` retained one new complete ten-definition L1 registry window in `performance_l1_interval_samples.csv`.

- Window `L1-WINDOW-20260810-01` ran serially from `2026-08-10T06:32:17.644Z` through `2026-08-10T06:32:43.192Z` in the declared `Asia/Shanghai` timezone using `@playwright/cli Chromium`.
- All ten fixed definitions returned HTTP 200, completed measurement and passed their public semantic gate. The registry covers the existing EN/ZH Tests Hub, MBTI and RIASEC landings, and the four fixed public question-bootstrap forms.
- The historical L1 baseline is preserved as point-in-time context, not recoded as an accepted interval window. Its three attempts per definition were consecutive inside one capture period.
- The PR2 remeasurement is also excluded from interval counting because it covered only one L1 definition plus one L2 definition rather than the complete L1 registry.
- Accepted windows: 1 of 3. Missing complete windows: 2. No evaluable >=30-minute interval pair exists, so the result remains **BASELINE_WINDOW_INCOMPLETE**.
- These are local unthrottled laboratory observations, not field Core Web Vitals. No long blocking sleep, copied observation, answer, submit or private-flow access was used.

Artifacts: `performance_l1_interval_samples.csv` and `l1_interval_baseline_manifest.json`.

## Critical lab remeasurement — 2026-08-10

`NONCAREER-CRITICAL-LAB-REMEASUREMENT-01` reran only the two definitions represented by historical `LAB-028`–`LAB-030` and `LAB-034`–`LAB-036`. The original six failure rows and their source-file hashes remain unchanged.

- Playwright CLI: two public definitions × three serial attempts, desktop 1440×960, local unthrottled network, bounded 2200 ms post-DOM observation, six retained measurement-success rows and zero collector failures.
- RIASEC zh: two warm attempts rendered question 1/60 with five options; the isolated-context first attempt completed measurement but did not reach the question semantic gate inside the bounded window. This is retained as a runtime timing result rather than recoded as a tool failure.
- Big Five zh: all three attempts rendered the expected H1 and both `big5_120`/`big5_90` public start links.
- Lighthouse 13.4.1 desktop: six serial audits completed with no runtime error. Standard Speed Index is populated for every row. Standard TBT is 0 ms for every row; that zero is the Lighthouse audit output, not the earlier long-task proxy or a substituted fallback.
- Snapshot/selector calibration occurred before the frozen six-row Playwright protocol. All attempts after protocol freeze are retained in `critical_lab_remeasurement.csv`.
- No answer, submit, private route, cache-bypass header, load test or production write occurred.

Artifacts: `critical_lab_remeasurement.csv`, `lighthouse_lab_samples.csv` and `critical_lab_remeasurement_manifest.json`.

## Completion-train closeout validation — 2026-08-10

Closeout ran from latest `main` after all six predecessor merge commits were verified in `origin/main` and their local/remote task branches were absent.

- All 40 current Window 7 files decoded as UTF-8. The original 31-file package remained present; nine follow-up CSV/JSON artifacts were added by the measurement/evidence PRs.
- All 16 CSV files parsed with one fixed non-empty header per file, consistent row widths and no spreadsheet-formula-leading cells. All nine JSON files parsed.
- The non-Career freeze recomputed to 525 absolute URLs, 525 normalized paths and 306 identities with exact SHA-256 values `2804a0f64a358ba27bd5e417989f573d5d684d0b601893dcea93d87675dae8ad`, `cb221673447dc66a197e77a8042ab9048af78a9dff50fcc5ee1185dda215aa79` and `b1a79072fda69eaf73572f637fb7b50e399b61b5d5b7ed5016d77e52e7e8e679`.
- All 28 explicit `/en|zh/career...` URLs remain outside that cohort. All 20 Big Five legacy aliases remain one-hop 301 redirects to the expected 200 target and absent from canonical/discovery catalogs.
- Canonical V2 has 20 fact rows and does not claim GSC/index verification. The GSC/GA4 cohort evidence has its fixed header and zero fact rows because required sources are missing.
- The Web Vitals observer is gated by the exact `NEXT_PUBLIC_PUBLIC_CWV_RUM_ENABLED === "true"` condition; repository default and production tracking are false, the sink is intentional no-op and network transport is none.
- Lab and field classifications remain separate. No production data collection, deployment, CMS/database/SEO runtime write, secret or permission change occurred.

## Runtime identity

- Source Git SHA: `556da366`
- Live SEO revision: `38b5625dd917dceb6eeb3843259e7f7731cb66ce`
- Backend sitemap-source and public HTML intentionally expose different cache boundaries.
- Follow-up remeasurement base commit: `8bc5689155eae362c4baa02b938dda729ad2a95b`; the live runtime did not expose an exact application revision, so it remains `UNKNOWN_NOT_EXPOSED` rather than inferred from the repository base.
