# L2 Big Five baseline

## Coverage

- EN/ZH assessment landing and Test Hub entry.
- Start/question load without submit.
- Public hub, dimension, pole and facet examples.
- EN/ZH and mobile/desktop profiles with cold-ish/warm attempts.
- Public APIs and the permanent text-only rendering boundary.

| Metric | L2 | Evidence |
| --- | --- | --- |
| Rows | 36: 33 success / 3 tool failures | LAB_ONLY |
| TTFB | median 162.1 ms; p75 245.6 ms; p95 1513.1 ms | LAB_ONLY |
| FCP p75 | 444 ms | LAB_ONLY |
| LCP p75 | 636 ms | LAB_ONLY |
| CLS p75 | 0.08 | LAB_ONLY |
| TBT proxy p75 | 0 ms | LAB_ONLY; not INP |
| Transferred p75 | 405789 B | LAB_ONLY |
| Field CWV/INP | UNKNOWN | No readable field source |

## Findings

- The zh assessment landing definition failed in DOM collection; its three failure rows remain in the CSV.
- A high cold-ish EN landing TTFB is not promoted to a bilingual or persistent incident.
- Successful EN/ZH question lookup and question requests returned 200.
- Public hub/dimension/pole/facet samples did not introduce page images in the observed resource set.

## Follow-up critical remeasurement

The historical L2 table and `LAB-034`–`LAB-036` failure rows remain unchanged. `RELAB-004`–`RELAB-006` completed successfully:

| Follow-up evidence | Result | Classification |
| --- | --- | --- |
| Playwright collector | 3/3 completed; HTTP 200; no tool failure | LAB_ONLY |
| Expected H1 + `big5_120`/`big5_90` links | 3/3 rendered | LAB_ONLY |
| LCP | 1576 / 468 / 440 ms | LAB_ONLY |
| CLS | 0.36976 in 3/3 | LAB_ONLY; follow-up symptom, not field CWV |
| Standard Lighthouse Speed Index | 781.36 / 1148.17 / 1263.98 ms | LAB_LIGHTHOUSE |
| Standard Lighthouse TBT | 0 / 0 / 0 ms | LAB_LIGHTHOUSE; measured audit values, not proxy |
| Lighthouse runtime error | 0/3 | VERIFIED tool outcome |

The collector failure is closed. The repeated lab CLS signal is retained for later diagnosis and does not authorize a runtime fix inside this evidence-only scope.

## Text-only boundary

No proposed optimization adds hero/inline/OG media, Markdown/HTML images or frontend image fallback. Legacy media fields remain ignored. Performance work must preserve the permanent Big Five/Enneagram text-only contracts.

## Priority guard

The shared quiz shell overlaps L1. Any bundle or API change must demonstrate no MBTI/RIASEC regression before Big Five improvement is accepted.

## GSC/GA4 cohort evidence

`NONCAREER-GSC-GA4-COHORT-EVIDENCE-01` binds L2 to the frozen 106-URL `L2_BIG_FIVE` registry cohort. A currently authorized read-only M01 GSC export provides partial context: exact page-row matches are 88 for current 28 days, 22 for previous 28 days and 74 for current 90 days. These are top-row availability diagnostics, not exhaustive cohort metrics.

The required prior 90-day GSC export is absent, and no authorized GA4 current/prior 90-day export exists in the repository. The 28-day windows are not relabeled as 90-day evidence, and GSC is not used as a substitute for sessions, users or conversions. Consequently the evidence CSV contains its fixed header and zero data rows, with L2 rankings, traffic, medians and analytics outcomes retained as `UNKNOWN` under `INSUFFICIENT_DATA_ZERO_ROWS`.
