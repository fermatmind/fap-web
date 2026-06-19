# MBTI64 SEO Measurement Cohort 01

## Summary

Decision: `BASELINE_CREATED_CONDITIONAL_FOR_SEARCH_RELEASE`.

This is an artifact-only measurement baseline for the MBTI64 V2.1 8-page pilot cohort before Search Queue release. It does not write CMS content, change frontend runtime, change sitemap/llms, enqueue Search Queue items, approve search release, submit URLs, or call external search APIs.

## Measurement Boundary

| Source | Status |
| --- | --- |
| Public HTTP live pages | collected |
| `sitemap.xml` | collected |
| `llms.txt` | collected |
| `llms-full.txt` | collected |
| GSC | `Unknown` |
| GA4 | `Unknown` |
| Search Queue enqueue | not performed |
| Search submit | not performed |

GSC and GA4 require a separate authenticated read-only collection task. This baseline does not fabricate analytics metrics.

## Cohort Summary

| Metric | Count |
| --- | ---: |
| Pilot URLs | 8 |
| HTTP 200 | 8 |
| Self-canonical | 8 |
| `index, follow` | 8 |
| Same-origin private route hits | 0 |
| Present in `sitemap.xml` | 8 |
| Present in `llms.txt` | 8 |
| Present in `llms-full.txt` | 0 |
| Duplicated title brand suffix | 8 |

## Surface Snapshots

| Surface | Status | Bytes | SHA256 | Pilot present |
| --- | ---: | ---: | --- | ---: |
| `/sitemap.xml` | 200 | 337203 | `a0f40c9f383bd7ea8fb7eb8d517f4fffa1542e34844529bd36b377fe607a6c83` | 8 |
| `/llms.txt` | 200 | 164108 | `a3419978d6629d7613e8d090c03b76e95d542424dcca225a0e6996a43763df0d` | 8 |
| `/llms-full.txt` | 200 | 522571 | `b35d124d749cbed28175ef31ca366ef38d74745bbe5ce5dd47ce693fb8930dd2` | 0 |

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

Latest production Search Queue dry-run artifacts were not present in this local worktree. The current operator-reported state is:

- 96 MBTI64 URL Truth rows were written.
- 8/8 pilot URLs were found in URL Truth after the write.
- Search Queue dry-run was eligible for the 8 pilot URLs.
- Planned queue count was 64.
- Duplicate count was 0.
- No enqueue, approval, submit, or external API call has been performed by this measurement baseline.

This baseline does not replace `MBTI64-SEARCH-QUEUE-RELEASE-01`.

## Warnings

- `llms-full.txt` currently does not contain the 8 pilot URLs by exact full URL or path string matching, while `sitemap.xml` and `llms.txt` do.
- All 8 live titles contain a duplicated brand suffix pattern: `| FermatMind | FermatMind`.
- GSC and GA4 metrics are `Unknown`; collect them in a separate read-only analytics task.

## Blockers

None for measurement baseline creation.

## Final Decision

`BASELINE_CREATED_CONDITIONAL_FOR_SEARCH_RELEASE`

Search Queue release should not be treated as completed by this PR. Before production enqueue/search release, review the `llms-full` membership warning and title suffix issue, or explicitly accept them as non-blocking for the search gate.

## Next

1. `MBTI64-SERP-SNIPPET-CTR-PACKAGE-01`
2. `MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-RECHECK-01`
3. `MBTI64-SEARCH-QUEUE-RELEASE-01`
