# MBTI64 SEO Measurement Cohort 01

Decision: `BASELINE_CREATED_WITH_BLOCKERS`.

This artifact refreshes the 8-page MBTI64 pilot measurement baseline after closure gates, llms-full repair, and IndexNow live submit. It does not perform CMS writes, frontend changes, queue writes, approvals, submissions, sitemap/llms mutations, or external API calls.

## Measurement Boundary

| Source | Status |
| --- | --- |
| Public HTTP live pages | collected |
| `sitemap.xml` | collected |
| `llms.txt` | collected |
| `llms-full.txt` | collected |
| GSC | `Unknown` |
| GA4 | `Unknown` |
| Search Queue / IndexNow | prior approved live submit accepted 8/8; not repeated by this artifact |

## Cohort Summary

| Metric | Count |
| --- | ---: |
| Pilot URLs | 8 |
| HTTP 200 | 8 |
| Self-canonical | 8 |
| index/follow | 8 |
| Same-origin private route hits | 0 |
| Present in sitemap.xml | 8 |
| Present in llms.txt | 8 |
| Present in llms-full.txt | 0 |
| Duplicated title brand suffix | 0 |

## Surface Snapshots

| Surface | Status | Bytes | SHA256 | Pilot present |
| --- | ---: | ---: | --- | ---: |
| `/sitemap.xml` | 200 | 340113 | `9d4df59aad6921461118edfe429f36c2655fb65b37e9770ceed9fc3052d2fd0e` | 8 |
| `/llms.txt` | 200 | 164108 | `a3419978d6629d7613e8d090c03b76e95d542424dcca225a0e6996a43763df0d` | 8 |
| `/llms-full.txt` | 200 | 526003 | `282e1d0d80b864d4a3af61d7714c7db417d9aa6a8bae4c5d1de1e7aff66054a5` | 0 |

## Page Baseline

| URL | Status | Canonical | Robots | H1 | Sitemap | llms | llms-full | Private hits |
| --- | ---: | --- | --- | --- | --- | --- | --- | ---: |
| `/en/personality/intj-a-vs-intj-t` | 200 | self | `index, follow` | `INTJ-A vs INTJ-T: Key Differences` | yes | yes | no | 0 |
| `/zh/personality/istj-a` | 200 | self | `index, follow` | `ISTJ-A 人格特点` | yes | yes | no | 0 |
| `/en/personality/intp-a-vs-intp-t` | 200 | self | `index, follow` | `INTP-A vs INTP-T: Key Differences` | yes | yes | no | 0 |
| `/zh/personality/infp-t` | 200 | self | `index, follow` | `INFP-T 人格特点` | yes | yes | no | 0 |
| `/en/personality/intj-a` | 200 | self | `index, follow` | `INTJ-A Meaning` | yes | yes | no | 0 |
| `/en/personality/intj-t` | 200 | self | `index, follow` | `INTJ-T Meaning` | yes | yes | no | 0 |
| `/zh/personality/intj-a` | 200 | self | `index, follow` | `INTJ-A 人格特点` | yes | yes | no | 0 |
| `/zh/personality/intj-t` | 200 | self | `index, follow` | `INTJ-T 人格特点` | yes | yes | no | 0 |

## Search Channel State

- URL Truth: 96 MBTI64 rows written in prior approved production gate.
- GSC readiness: 8 readiness queue items retained as evidence, not submitted.
- IndexNow: 8 queue items enqueued, approved, live submitted, and accepted with HTTP 200.
- Do not repeat IndexNow submit unless a future requeue policy explicitly calls for it.

## Warnings
- GSC and GA4 metrics are Unknown in this artifact because no authenticated analytics connector/browser collection was used.
- Current live `llms-full.txt` differs from the earlier passing `/tmp` recheck artifact; treat as a surface regression or cache/policy drift requiring follow-up before expansion.

## Blockers
- surface membership sitemap=8, llms=8, llms_full=0

## Next
1. `MBTI64-INDEXNOW-LIVE-SUBMIT-24H-OBSERVATION-01`
2. `MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-REGRESSION-RECHECK-03`
3. `MBTI64-SEO-MEASUREMENT-COHORT-72H-01`
4. `MBTI64-PILOT-EXPANSION-DECISION-GATE-01` after 7-14 days of data and no surface blockers
