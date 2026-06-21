# Goal: Run Career Content Editorial Quality Sample Audit

Use `career-content-asset-factory`.

Inputs:
- completed page assembly baseline
- canonical 1046 seed
- completed block status

Task:
1. Select a representative editorial quality sample.
2. Run read-only editorial quality audit.
3. Render repair recommendations.

Hard prohibitions:
- Do not rewrite content.
- Do not mutate frozen baselines.
- Do not generate evidence, synthesis, assets, or search_projection.
- Do not modify runtime, SEO, CMS, staging, production, sitemap, canonical, noindex, robots, llms, or JSON-LD.

Expected outputs:
- `editorial_quality_report.json/.md`
- `editorial_quality_findings.csv`
- `editorial_quality_scores.csv`
- `editorial_repair_plan.json/.md`

Stop after reporting findings.
