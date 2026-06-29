# Personality Post-Promotion Surface Safety Repair

Task: `PERSONALITY-POST-PROMOTION-SURFACE-SAFETY-REPAIR-01`

## Summary

The remaining 58 MBTI64 promoted pages were present in `sitemap.xml` and `llms.txt`, but the post-promotion search gate reported `0/58` membership in `/llms-full.txt`.

The page enumeration path was not the blocker: local generation against the production public API produced all 96 MBTI64 personality URLs, including the 58 remaining promoted variant URLs. The blocker was the `llms-full` complete-cache predicate: current backend authority marks the IQ assessment as not `llms_full_eligible`, while the complete predicate still required the IQ test routes. That prevented a complete generated artifact from being cached, which left the runtime vulnerable to degraded or stale `llms-full` output.

## Repair

- Keep MBTI64 personality enumeration CMS/API-authoritative.
- Keep the 96-URL MBTI64 personality completeness requirement.
- Keep the core assessment hub completeness requirement.
- Treat IQ `llms-full` membership as a separate explicit gate via `FERMATMIND_LLMS_FULL_REQUIRE_IQ_COHORT`.
- Do not add local personality fallback content.
- Do not mutate CMS, sitemap, `llms.txt`, Search Queue, URL Truth, or IndexNow.

## Validation Snapshot

Local generation using production public API after the repair:

- Complete cacheable artifact: `true`
- MBTI64 personality URLs: `96`
- Variant URLs: `64`
- Comparison URLs: `32`
- Remaining-58 target URLs present: `58/58`

## Runtime Follow-up

After this frontend repair is merged and deployed, run a controlled `/llms-full.txt` revalidation/warm and then rerun:

`PERSONALITY-AGENT-POST-PROMOTION-SEARCH-GATE-58-01`

Only if that gate returns `GO_FOR_INDEXNOW_DRY_RUN` should the workflow proceed to the IndexNow dry-run gate.
