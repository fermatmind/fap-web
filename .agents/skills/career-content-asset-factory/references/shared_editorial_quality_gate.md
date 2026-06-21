# Shared Editorial Quality Gate

A block can be safe but still not useful. Public readiness requires a block-specific quality gate plus this shared competitive/editorial layer. Full integrated QA PASS is necessary but not sufficient for staging preview.

This gate is a post-asset / pre-staging quality layer. It produces findings and repair plans; it does not rewrite content.

## Shared Checks

- reader text is occupation-specific
- concrete workflow, tool, stakeholder, setting, constraint, output, or artifact details are present where the block calls for them
- repeated phrases and repeated structural skeletons are below threshold
- locale writing is market-specific
- high-risk claims have concrete responsibility boundaries
- preparation or action advice is useful and verifiable
- conversion copy is clear, bounded, and non-manipulative
- each block contributes its own value and does not repeat another block
- no audit/process leakage, raw enum leakage, internal lineage, evidence ID, row hash, or source ID leakage
- no employment, income, admission, licensing, immigration, health, safety, test-result, or personal outcome guarantee
- protected-field diff is clean or explicitly explained
- search_projection, SEO candidates, schema candidates, sitemap/canonical/noindex/robots/llms instructions, and runtime metadata are absent from reader assets

## Block Adaptation

- `career-work-activities-asset-factory`: emphasize real workflow, tools, context, stakeholders, and environment. Template task wording fails.
- `career-skills-entry-asset-factory`: emphasize verifiable skills, tools, credentials, projects, portfolio artifacts, and region-specific boundary rules.
- `career-adjacent-comparison-asset-factory`: prevent title-similarity proxy; compare actual duties, constraints, tools, and transfer cost.
- `career-page-assembly-asset-factory`: assemble PASS block assets only. It must not invent new facts.
- `career-identity-asset-factory`: prioritize official boundary, title cleanup, alias/disambiguation, and classification consistency. Do not apply generic reader repair as the main gate.
- `career-fit-asset-factory`: use RIASEC/Big Five/MBTI signals carefully, avoid diagnosis or success claims, and check CTA/locale quality.
- `career-salary-asset-factory`: keep existing salary evidence/estimate/asset gates. It should adopt shared staging/import/post-import QA, not AI Impact scoring rules.

## Shared Metrics

Use the metric definitions in `competitive_editorial_quality_metrics.md`:

- `occupation_specificity_score`
- `workflow_density_score`
- `reader_usefulness_score`
- `template_reuse_score`
- `locale_naturalness_score`
- `conversion_clarity_score`
- `competitive_depth_score`
- `source_backed_claim_density_score`
- `block_relevance_score`
- `reader_safe_boundary_score`

The shared gate should score rows from 0 to 5 and classify rows as `editorial_ready`, `editorial_repair_required`, or `blocked`.

## Release Policy

- Run a representative editorial quality sample audit before staging preview.
- Run the full editorial quality audit before production import.
- Findings must be resolved or explicitly accepted by human editorial approval.
- Editorial acceptance does not authorize runtime SEO, staging write, CMS import, or production import.
- `search_projection` remains quarantined unless a separate SEO/runtime release explicitly approves it.

## Verdicts

Use the same verdict vocabulary:

- `PASS`
- `REPAIR_REQUIRED`
- `REJECT`

Do not advance to staging preview design until the quality gate returns PASS or the final independent QA returns a block-specific `READY_FOR_STAGING_PREVIEW_DESIGN`.
