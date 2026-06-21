# Goal: Rerun Editorial Quality Audit After Repair

Use `career-content-asset-factory`.

Input:
- repaired career content bundle
- prior editorial quality report
- protected diff report

Task:
Rerun the same editorial quality audit on the repaired bundle.

Hard prohibitions:
- Do not rewrite content in this goal.
- Do not mutate frozen baselines.
- Do not generate search_projection.
- Do not modify runtime, SEO, CMS, staging, or production.

Expected:
- updated editorial report
- updated repair plan if findings remain
- explicit conclusion for human staging review
