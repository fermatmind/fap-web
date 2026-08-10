# Performance root causes

## Registry summary

| ID | Tier | Finding | Confidence | Disposition |
| --- | --- | --- | --- | --- |
| RC-01 | L1 | Synthetic CLS p75 is 0.47986 and repeats across EN/ZH hub and scale landings. | VERIFIED symptom / INFERRED component cause | PUBLIC-SURFACE-L1-LAYOUT-CLS-01 |
| RC-02 | L1/L2/L3 | Non-home response headers preload the homepage top.png image and three font files. | VERIFIED | GLOBAL-LAYOUT-NONHOME-PRELOAD-SCOPE-01 |
| RC-03 | L1/L2 | Question shell JS p75 is about 310672 bytes versus roughly 189223 bytes on scale landings. | LAB_ONLY / INFERRED | PUBLIC-SURFACE-L1-PERFORMANCE-BUDGET-01 |
| RC-04 | L3 | Article TTFB/LCP varies materially; the authority sample reached 7.26s TTFB. | LAB_ONLY; root cause UNKNOWN | NONE_DIAGNOSE_FIRST |
| RC-05 | L3 | One lab run transferred about 1.67 MB. | LAB_ONLY | NONE_SINGLE_SAMPLE |
| RC-06 | L3 | Four sitemap-included HTTP 200 pages lack SSR canonical and og:url. | VERIFIED symptom; owner/root cause UNKNOWN | ASSESSMENT-IQ-EQ-METADATA-CONTRACT-01 |
| RC-07 | Shared discoverability | Artifact reported Mode: degraded; serial elapsed observations ranged from 7.8s to 35.3s. | LAB_ONLY; root cause UNKNOWN | NONE_DIAGNOSE_FIRST |
| RC-08 | L1/L2/L3 | Browser console reports enforced CSP blocking inline style on sampled pages. | VERIFIED symptom; emitter UNKNOWN | NONE_SECURITY_DIAGNOSIS_FIRST |
| RC-09 | L1 | The isolated-context RIASEC zh follow-up measurement completed but missed the first-question semantic gate within the bounded window; two same-context repeats rendered it. | LAB_ONLY; root cause UNKNOWN | NONE_DIAGNOSE_FIRST |

## Decision rules

- RC-02 is the only directly source-confirmed implementation mechanism.
- RC-01 and RC-03 have repeatable lab symptoms but require layout/module attribution before repair.
- RC-04, RC-05 and RC-07 remain diagnosis/measurement work; a short-window delay or single large transfer is not enough for an implementation PR.
- RC-06 is a verified metadata symptom, but repository ownership depends on the authority payload trace.
- RC-08 requires security-aware diagnosis. No proposal may weaken CSP.
- RC-09 closes the former collector-null error but does not prove a persistent product incident from one bounded first-navigation miss. Authentication/question waterfall attribution must precede any repair.

## Remeasurement interpretation

- Six Playwright follow-up rows completed with no collector error; historical `LAB-028`–`LAB-036` failures remain immutable audit history.
- Six Lighthouse 13.4.1 desktop audits completed with populated Speed Index and null runtime errors.
- Standard Lighthouse TBT measured 0 ms in all six audits. The source is `audits.total-blocking-time.numericValue`; it is not inferred from the Playwright long-task observer and does not establish field INP.
- Big Five zh follow-up CLS was about 0.36976 across all three Playwright attempts and about 0.39579 across all three Lighthouse attempts. This is a repeatable lab symptom only.

## Cache boundary

Nonce-bearing/dynamic HTML correctly bypasses the shared proxy cache and preserves application cache headers. “Cache the HTML” is explicitly rejected as a performance shortcut. Only allowlisted immutable/static resources may use public ingress caching.

## Priority

Shared repair acceptance is ordered L1 > L2 > L3. A shared optimization is not successful if L3 improves while MBTI/RIASEC API, rendering, question load or conversion guardrails regress.
