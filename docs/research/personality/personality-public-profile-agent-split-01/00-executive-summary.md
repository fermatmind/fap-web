# PERSONALITY-PUBLIC-PROFILE-AGENT-SPLIT-01

## Summary

This artifact records the split of the public profile SEO asset factory into framework-specific public profile agents for MBTI64, Big Five, and Enneagram, plus shared orchestration, SEO QA, editorial QA, and release guard roles.

## What Changed

- Added explicit agent contracts under `.agents/skills/public-profile-seo-asset-factory/agents/`.
- Added a matrix under `.agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md`.
- Updated the skill entrypoint to describe the public profile agent matrix.
- Added PR-train metadata and scope validation for this scoped agent-contract PR.

## What Did Not Change

- No frontend runtime files changed.
- No CMS imports, writes, promotions, or publication actions were performed.
- No sitemap, `llms.txt`, or `llms-full.txt` behavior changed.
- No Search Queue enqueue, approval, or submission was performed.
- No MBTI, Big Five, or Enneagram result page behavior changed.
- No public editorial content was generated for production.

## Framework Boundaries

- MBTI64: existing 64 A/T variant pages and 32 A-vs-T comparison pages only.
- Big Five: dimensional 5-domain, 10-pole, 30-facet structure only.
- Enneagram: hub, 3 centers, and 9 core types before wings or instinctual subtypes.

## Recommended Next Task

After this PR is merged, execute `MBTI64-SEARCH-QUEUE-EXPANSION-DRY-RUN-01` as a read-only production dry-run for the 96 MBTI64 URLs. That task must not enqueue, approve, submit, mutate CMS, mutate URL Truth, or change sitemap/llms surfaces.
