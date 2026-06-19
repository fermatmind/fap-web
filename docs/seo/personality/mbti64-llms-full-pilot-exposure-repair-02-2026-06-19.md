# MBTI64 llms-full Pilot Exposure Repair 02

## Summary

This PR repairs the MBTI64 `/llms-full.txt` pilot exposure regression where the 8 pilot personality URLs dropped from exact membership after previously passing.

It changes only the fap-web `llms-full` generation and cacheability contract. It does not mutate CMS content, sitemap generation, `llms.txt`, Search Queue, IndexNow, GSC, or expansion decisions.

## Evidence

- `MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-REGRESSION-RECHECK-03` confirmed current live `/llms-full.txt` had 0/8 pilot URLs while `/sitemap.xml` and `/llms.txt` had 8/8.
- `MBTI64-LLMS-FULL-RUNTIME-CACHE-API-DIAGNOSIS-01` confirmed production personality API can derive 96 MBTI64 URLs: 64 A/T variant URLs and 32 A-vs-T comparison URLs.
- The same diagnosis measured `include_variants=1` personality API calls above the default 1500ms source budget, so `listPersonalityEntries()` could fall back to an empty list during generation.
- Live `/llms-full.txt` was served from `X-FermatMind-LLMS-Full-Source: cache`, allowing an incomplete personality cohort to remain visible as a complete cached artifact.

## Repair

- Adds a dedicated `LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS` budget for personality enumeration in `llms-full`.
- Keeps personality URL authority in backend/CMS public APIs. No local editorial fallback is introduced.
- Strengthens `isCompleteLlmsFullText()` so an artifact missing the MBTI64 96-URL personality cohort cannot be cached as complete.
- Locks the 8 pilot URLs as required exact members of a complete `llms-full` artifact.

## Deferred

- No production revalidation or warm is executed in this PR.
- No Search Queue, submit, approval, sitemap, `llms.txt`, CMS, or backend action is included.
- No pilot expansion decision is made here.

## Required Follow-up

After merge and frontend deploy approval:

1. Deploy the fap-web SHA containing this repair.
2. Run controlled `/llms-full.txt` revalidation/warm.
3. Run `MBTI64-LLMS-FULL-PILOT-MEMBERSHIP-RECHECK-04`.
4. Continue Search Queue or expansion decisions only after live `/llms-full.txt` is stable at 8/8 exact pilot membership.
