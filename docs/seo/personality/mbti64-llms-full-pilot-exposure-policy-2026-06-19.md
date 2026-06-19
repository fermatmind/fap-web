# MBTI64 llms-full Pilot Exposure Policy 01

## Summary

Decision: `CONDITIONAL_REPAIR_RECOMMENDED`.

This is an artifact-only policy decision for the 8 MBTI64 V2.1 pilot URLs. It does not modify `app/llms-full.txt/route.ts`, sitemap generation, `llms.txt`, `llms-full.txt`, CMS content, Search Queue, enqueue, approval, or search submission behavior.

## Evidence

| Check | Result |
| --- | ---: |
| Pilot URLs | 8 |
| sitemap.xml exact membership | 8/8 |
| llms.txt exact membership | 8/8 |
| llms-full.txt exact membership | 0/8 |
| llms-full fuzzy diagnostic | 0/8 |
| Private/sensitive route matches | 0 |
| live llms-full status | 200 |

Source artifact: `docs/seo/personality/mbti64-llms-full-pilot-membership-recheck-2026-06-19.json`.

## Generator Policy Observed

`app/llms-full.txt/route.ts` defines a personality entry budget of 96 URLs:

- `LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT = 32 * 2`
- `LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT = 16 * 2`
- `LLMS_FULL_PERSONALITY_ENTRY_LIMIT = 96`

The route builds personality entries from backend CMS authority, including variant profiles and A-vs-T comparison slugs. The deny pattern blocks base 16 type paths such as `/en/personality/intj`; it does not directly block the A/T pilot variant paths or A-vs-T comparison paths.

## Policy Answer

The 8 pilot URLs should be eligible for llms-full exposure because they are public MBTI64 personality pages, appear in sitemap.xml and llms.txt, and have no private-route or sensitive-token matches in the latest recheck artifact.

Current 0/8 llms-full membership is not explained by route safety. Evidence is insufficient to prove a single cause from artifacts alone. The likely causes are generator ordering, enrichment/cache timing, CMS/API list shape, or current live llms-full cache state.

## Decision

Recommended next task: `MBTI64-LLMS-FULL-PILOT-EXPOSURE-REPAIR-01`.

Search release can treat llms-full absence as a non-blocking warning only if the operator explicitly accepts that llms-full is not required for this 8-page pilot after sitemap, llms.txt, URL Truth, metadata, private-route, and Search Queue dry-run gates pass.

## Deferred

- No llms-full generator repair in this PR.
- No sitemap or llms URL-set change.
- No CMS write, import, promotion, or publish.
- No Search Queue enqueue, approve, submit, or external search API call.
