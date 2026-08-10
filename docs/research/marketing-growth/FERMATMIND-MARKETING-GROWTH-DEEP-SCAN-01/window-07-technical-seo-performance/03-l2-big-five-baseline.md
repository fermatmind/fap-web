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

## Text-only boundary

No proposed optimization adds hero/inline/OG media, Markdown/HTML images or frontend image fallback. Legacy media fields remain ignored. Performance work must preserve the permanent Big Five/Enneagram text-only contracts.

## Priority guard

The shared quiz shell overlaps L1. Any bundle or API change must demonstrate no MBTI/RIASEC regression before Big Five improvement is accepted.
