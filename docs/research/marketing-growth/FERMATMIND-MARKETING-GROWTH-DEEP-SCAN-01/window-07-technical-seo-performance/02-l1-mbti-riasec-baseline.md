# L1 MBTI and RIASEC baseline

## Coverage

Production authority confirmed the EN/ZH Test Hub and canonical landings. Coverage includes:

- MBTI EN/ZH landings and hub entry.
- MBTI `mbti_93` and `mbti_144` question bootstrap.
- RIASEC canonical `/tests/holland-career-interest-test-riasec` EN/ZH landings.
- RIASEC `riasec_60` and `riasec_140` bootstrap.
- Public question/lookup/metrics requests, resource waterfall, cache signals and browser console.

No answers were entered or submitted. The legacy 36Q surface was not used or restored.

## Comparable baseline

| Metric | L1 | Evidence |
| --- | --- | --- |
| Rows | 30: 27 success / 3 tool failures | LAB_ONLY |
| TTFB | median 118.9 ms; p75 154.3 ms; p95 361.6 ms | LAB_ONLY |
| FCP p75 | 636 ms | LAB_ONLY |
| LCP p75 | 1236 ms | LAB_ONLY |
| CLS p75 | 0.48 | LAB_ONLY; above official poor boundary |
| TBT proxy p75 | 0 ms | LAB_ONLY; not INP |
| Requests p75 | 29 | LAB_ONLY |
| Transferred p75 | 495668 B | LAB_ONLY |
| JS p75 | 310672 B | LAB_ONLY |
| Field INP | UNKNOWN | No readable field source |

## Findings

- VERIFIED: successful MBTI/RIASEC question API observations returned 200.
- VERIFIED: HTML remained `private/no-store` and `X-Proxy-Cache: BYPASS`; this is the required nonce boundary.
- LAB_ONLY: hub and both scale landings repeatedly showed CLS near 0.48.
- LAB_ONLY: the RIASEC EN first question fetch was slower than cached repeat; the sample is too small for a persistent backend conclusion.
- Two definitions (RIASEC zh question bootstrap and a later L2 definition) failed during DOM collection; all three attempts per definition remain as tool failures.

## Follow-up critical remeasurement

The historical L1 table remains the frozen first-window baseline. The follow-up does not replace `LAB-028`–`LAB-030`; it appends `RELAB-001`–`RELAB-003` plus three standard Lighthouse rows.

| Follow-up evidence | Result | Classification |
| --- | --- | --- |
| Playwright collector | 3/3 completed; HTTP 200; no tool failure | LAB_ONLY |
| First-question semantic gate | 2/3 within the bounded window; isolated-context run remained false | LAB_ONLY; runtime timing gap retained |
| Standard Lighthouse Speed Index | 1805.69 / 1469.45 / 1254.86 ms | LAB_LIGHTHOUSE |
| Standard Lighthouse TBT | 0 / 0 / 0 ms | LAB_LIGHTHOUSE; measured audit values, not proxy |
| Lighthouse runtime error | 0/3 | VERIFIED tool outcome |

The follow-up closes the collector-null failure. It does not prove a field-CWV improvement, and the first-navigation question-window miss remains a diagnosis candidate outside this evidence-only PR.

## Interval baseline status

The dedicated interval protocol captured one new complete L1 registry window with 10/10 HTTP and semantic successes. It did not manufacture the two missing windows or count the historical consecutive attempts and PR2 partial-registry remeasurement as interval windows.

| Requirement | Retained result | Verdict |
| --- | --- | --- |
| Fixed L1 registry | 10 definitions; EN/ZH hub, MBTI/RIASEC landing and four public bootstrap forms | complete for accepted window |
| Complete current windows | 1 of 3 | insufficient |
| Separation | no evaluable pair; two complete windows remain missing | not proven |
| Evidence class | local unthrottled Playwright lab evidence | LAB_ONLY |
| Overall interval status | `BASELINE_WINDOW_INCOMPLETE` | retained |

The accepted window ran from `2026-08-10T06:32:17.644Z` to `2026-08-10T06:32:43.192Z` in `Asia/Shanghai`. Detailed rows and the counting decision are frozen in `performance_l1_interval_samples.csv` and `l1_interval_baseline_manifest.json`.

## Root cause and impact

The top L1 signal is a shared landing/test layout shift. The symptom is VERIFIED in lab; the exact component cause is INFERRED until layout-shift sources are captured. Possible user/conversion impact is CTA instability; SEO impact is UNKNOWN without field CLS.

The shared question shell carries more JS than the landing shell. This is an optimization candidate only after bundle attribution, and it must protect MBTI/RIASEC before L2/L3.

## Regression guard

Both locales, both RIASEC forms, both MBTI forms, question-load success, no submit, cache-boundary assertion, CLS/resource budget and no MBTI/RIASEC behavior divergence.
