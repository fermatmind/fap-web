# MBTI64 LLMS Full Fresh 3 Membership Repair

Task: `MBTI64-LLMS-FULL-FRESH-3-MEMBERSHIP-REPAIR-01`

## Summary

The fresh query-backed MBTI64 pages are live, but the production `/llms-full.txt`
runtime smoke observed `0/3` exact membership for:

- `https://fermatmind.com/zh/personality/esfj-a`
- `https://fermatmind.com/zh/personality/intp-a`
- `https://fermatmind.com/zh/personality/istp-a`

The live `/llms-full.txt` response was in degraded mode. The complete generator
already enumerates the MBTI64 personality cohort from the CMS/public API, but
the degraded fallback only emitted canonical entrypoints, career entries, and
the sitemap. That meant a temporary complete-build timeout could return a
valid 200 degraded response with no MBTI64 personality URLs.

## Change

- Add the fresh query-backed 3 URLs to the required MBTI64 personality
  completeness check.
- Include CMS-authoritative personality entries in degraded `/llms-full.txt`
  responses.
- Keep the personality source as the public CMS/API enumeration; no local MBTI
  editorial fallback is introduced.

## Boundaries

- No CMS writes.
- No backend changes.
- No sitemap or `llms.txt` generation changes.
- No Search Queue enqueue, approval, submission, or external API calls.
- No frontend editorial content fallback.

## Validation

Focused contract coverage verifies:

- The complete MBTI64 llms-full cohort includes the old 8 pilot URLs and the
  fresh query-backed 3 URLs.
- Degraded `/llms-full.txt` includes the same CMS-authoritative MBTI64
  personality cohort.
- Incomplete MBTI64 personality cohorts are not accepted as complete cache
  artifacts.
- Private/result/order/payment/account/session/token route patterns remain
  excluded.

## Next Runtime Gate

After merge and production deploy, run:

`MBTI64-LLMS-FULL-FRESH-3-MEMBERSHIP-RECHECK-01`

PASS requires live `/llms-full.txt` exact membership `3/3` for the fresh
query-backed URLs and no same-origin private route leakage.
