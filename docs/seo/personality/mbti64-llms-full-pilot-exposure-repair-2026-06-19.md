# MBTI64 llms-full Pilot Exposure Repair 01

## Summary

This PR repairs the `llms-full.txt` personality generator so the MBTI64 public personality cohort is deterministic:

- 64 A/T variant URLs.
- 32 A-vs-T comparison URLs.
- 8/8 pilot URLs protected by focused contract coverage.

It does not modify CMS content, backend data, sitemap generation, `llms.txt` scope, Search Queue, enqueue, approval, submit, or external search API behavior.

## Cause

The prior policy artifact showed:

- sitemap.xml exact membership: 8/8.
- llms.txt exact membership: 8/8.
- llms-full.txt exact membership: 0/8.
- private/sensitive route matches: 0.

`llms-full.txt` had a 96 personality URL budget, but the generator did not explicitly guarantee separate 64 variant and 32 comparison cohorts before enrichment. The repair makes those cohorts first-class generator behavior.

## Repair

- `app/llms-full.txt/route.ts` now builds explicit per-locale variant and comparison cohorts from CMS/API personality records.
- Variant entries prefer CMS `includeVariants` records and only use CMS base profiles as a non-editorial fallback.
- Comparison entries are derived from indexable CMS variant records.
- Paths are exact-normalized and deduped.
- Private/result/order/pay/account/token paths remain blocked.
- Personality release revalidation now refreshes `/llms.txt` and `/llms-full.txt` and clears the llms-full process cache.

## Deferred

- No Search Queue release.
- No enqueue, approve, submit, or external search API call.
- No CMS write, import, promotion, or publish.
- No direct sitemap or llms.txt URL-set change.

Next task after merge and frontend deploy: `MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-RECHECK-02`.
