# Goal: Run Full Career Content Editorial Quality Audit

Use `career-content-asset-factory`.

Run a full 1046 career editorial quality audit against the completed page assembly baseline.

Hard prohibitions:
- Do not rewrite content.
- Do not mutate frozen baselines.
- Do not generate new facts.
- Do not generate search_projection.
- Do not modify runtime, SEO, CMS, staging, or production.

Checks:
- occupation specificity
- workflow density
- reader usefulness
- template / duplicate phrase risk
- locale naturalness
- conversion clarity
- competitive depth
- source-backed claim density
- block relevance
- reader-safe boundary quality

Final conclusion:
- `EDITORIAL_READY`
- `EDITORIAL_REPAIR_REQUIRED`
- `EDITORIAL_BLOCKED`
