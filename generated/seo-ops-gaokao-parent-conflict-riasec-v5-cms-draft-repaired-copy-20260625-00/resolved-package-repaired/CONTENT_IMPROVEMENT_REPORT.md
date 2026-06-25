# Content Improvement Report v5

Final decision: `CONTENT_PACKAGE_V5_READY_FOR_CODEX_QA`

## What changed from v4

1. Added `GSC_STRATEGY_APPENDIX.md` with operator screenshot baseline and warning not to infer strategy from 24h data alone.
2. Added `contracts/GSC_QUERY_PAGE_STRATEGY_CONTRACT.json` to lock query-owner boundaries.
3. Added `contracts/PUBLISH_DEPENDENCY_AND_ORDER.json` to connect the article package with P0 RIASEC test page CTR repair.
4. Added `observation/GSC_QUERY_PAGE_OBSERVATION_PLAN.md` with target queries, wrong-owner watchlist, and thresholds.
5. Updated manifests, CMS fields, SEO fields, and Codex handoff to mark v5 and include GSC appendix.
6. Preserved all v4 article/tool-page improvements: short SEO title candidate, 2026 context, two walkthrough cases, copyable templates, distribution assets, and runtime preview QA.

## Strategic rationale

Current GSC screenshots show the existing Gaokao major-choice cluster has visibility, especially `/zh/articles/college-major-choice-holland-mbti-career-test`, while prior P0 evidence shows the RIASEC test page requires CTR repair. This article should therefore serve as a downstream scenario page for parent-child conflict, not as a replacement for the generic Gaokao major-choice article or the RIASEC test page.

## Still blocked

- CMS write / draft creation.
- Media Library URL resolution.
- CMS dry-run.
- Operator review.
- Publish.
- Search submission.
- URL Truth / sitemap / llms.
- Schema / hreflang.
- Revalidation / deploy / PR.
