# MBTI64 llms-full Pilot Membership Recheck 01

## Summary

Decision: `CONDITIONAL_NOT_IN_LLMS_FULL_BUT_POLICY_EXPLAINED`.

This is an artifact-only recheck for the 8 MBTI64 V2.1 pilot URLs. It does not modify sitemap, llms, llms-full, frontend runtime, CMS content, Search Queue, or search submissions.

## Source Snapshots

| Source | Status | Bytes | SHA256 | Exact URL count |
| --- | ---: | ---: | --- | ---: |
| sitemap.xml | 200 | 337203 | `a0f40c9f383bd7ea8fb7eb8d517f4fffa1542e34844529bd36b377fe607a6c83` | 2299 |
| llms.txt | 200 | 164108 | `a3419978d6629d7613e8d090c03b76e95d542424dcca225a0e6996a43763df0d` | 2285 |
| llms-full.txt | 200 | 522571 | `b35d124d749cbed28175ef31ca366ef38d74745bbe5ce5dd47ce693fb8930dd2` | 2175 |

## Pilot Membership

| Path | sitemap exact | llms exact | llms-full exact URL | llms-full exact path | llms-full fuzzy diagnostic | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| /en/personality/intj-a-vs-intj-t | yes | yes | no | no | no | missing |
| /zh/personality/istj-a | yes | yes | no | no | no | missing |
| /en/personality/intp-a-vs-intp-t | yes | yes | no | no | no | missing |
| /zh/personality/infp-t | yes | yes | no | no | no | missing |
| /en/personality/intj-a | yes | yes | no | no | no | missing |
| /en/personality/intj-t | yes | yes | no | no | no | missing |
| /zh/personality/intj-a | yes | yes | no | no | no | missing |
| /zh/personality/intj-t | yes | yes | no | no | no | missing |

## Interpretation

The current exact recheck finds 0/8 pilot URLs in `llms-full.txt` by exact full URL or path membership. Fuzzy diagnostics are non-authoritative and do not affect the decision.

If the pilot should enter `llms-full.txt`, handle that in a separate policy/repair PR. Do not patch this report into the runtime generator.

## Warnings

- 0/8 pilot URLs are present in llms-full.txt by exact URL/path membership.

## Blockers

- None.

## Next

Recommended next task: `MBTI64-LLMS-FULL-PILOT-EXPOSURE-POLICY-01`.
