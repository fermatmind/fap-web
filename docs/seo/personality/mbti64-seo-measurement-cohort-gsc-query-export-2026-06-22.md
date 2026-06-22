# MBTI64 GSC Query Export

Generated: 2026-06-22T02:00:59.180Z

## Decision

CONDITIONAL_PARTIAL_QUERY_EXPORT_CAPTURED

This is a read-only GSC query export gate. It did not write CMS content, mutate frontend runtime, enqueue search items, submit search requests, or request indexing.

## Summary

- Target URLs: 13
- Page-level GSC rows with impressions: 13
- URLs with visible query rows captured: 3
- URLs where the filtered GSC query table was empty or suppressed: 10
- Query rows captured: 3
- CSV records written: 13

## Query-Backed URLs

- /en/personality/enfj-a: enfj-a (1 impressions, position 4)
- /zh/personality/intp-a: intp-a (3 impressions, position 10.3)
- /zh/personality/esfp-a: esfp-a (1 impressions, position 7)

## Empty Or Suppressed Query Tables

- /en/personality/esfj-t: page impressions 15, average position 26.7
- /en/personality/enfp-a: page impressions 10, average position 38.4
- /zh/personality/istp-a: page impressions 7, average position 7.3
- /zh/personality/intp-a-vs-intp-t: page impressions 2, average position 11
- /en/personality/esfj-a: page impressions 3, average position 26.7
- /zh/personality/esfj-a: page impressions 1, average position 8
- /en/personality/intp-a: page impressions 1, average position 9
- /en/personality/istp-a: page impressions 1, average position 11
- /en/personality/entj-a: page impressions 2, average position 25
- /en/personality/estp-t: page impressions 2, average position 46.5

## Boundary

- No Search Console Request Indexing was run.
- No Search Queue enqueue, approve, submit, or external search API call was run.
- No CMS, frontend, sitemap, llms, or llms-full mutation was run.
- Empty query tables are treated as unavailable/suppressed evidence, not as proof of zero query demand.

## Next

MBTI64-AGENT-VISIBLE-EXPANSION-13-QUERY-EVIDENCE-DECISION-01
