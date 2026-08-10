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

## Root cause and impact

The top L1 signal is a shared landing/test layout shift. The symptom is VERIFIED in lab; the exact component cause is INFERRED until layout-shift sources are captured. Possible user/conversion impact is CTA instability; SEO impact is UNKNOWN without field CLS.

The shared question shell carries more JS than the landing shell. This is an optimization candidate only after bundle attribution, and it must protect MBTI/RIASEC before L2/L3.

## Regression guard

Both locales, both RIASEC forms, both MBTI forms, question-load success, no submit, cache-boundary assertion, CLS/resource budget and no MBTI/RIASEC behavior divergence.
