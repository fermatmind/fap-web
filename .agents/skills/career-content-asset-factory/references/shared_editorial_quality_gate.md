# Shared Editorial Quality Gate

A block can be safe but still not useful. Public readiness requires a block-specific quality gate.

## Shared Checks

- reader text is occupation-specific
- repeated phrases and repeated structural skeletons are below threshold
- locale writing is market-specific
- high-risk claims have concrete responsibility boundaries
- preparation or action advice is useful and verifiable
- no audit/process leakage, raw enum leakage, internal lineage, or source ID leakage
- no employment, income, admission, licensing, immigration, health, safety, or personal outcome guarantee
- protected-field diff is clean or explicitly explained

## Block Adaptation

- `career-work-activities-asset-factory`: emphasize real workflow, tools, context, stakeholders, and environment. Template task wording fails.
- `career-skills-entry-asset-factory`: emphasize verifiable skills, tools, credentials, projects, portfolio artifacts, and region-specific boundary rules.
- `career-adjacent-comparison-asset-factory`: prevent title-similarity proxy; compare actual duties, constraints, tools, and transfer cost.
- `career-page-assembly-asset-factory`: assemble PASS block assets only. It must not invent new facts.
- `career-identity-asset-factory`: prioritize official boundary, title cleanup, alias/disambiguation, and classification consistency. Do not apply generic reader repair as the main gate.
- `career-fit-asset-factory`: use RIASEC/Big Five/MBTI signals carefully, avoid diagnosis or success claims, and check CTA/locale quality.
- `career-salary-asset-factory`: keep existing salary evidence/estimate/asset gates. It should adopt shared staging/import/post-import QA, not AI Impact scoring rules.

## Verdicts

Use the same verdict vocabulary:

- `PASS`
- `REPAIR_REQUIRED`
- `REJECT`

Do not advance to staging preview design until the quality gate returns PASS or the final independent QA returns a block-specific `READY_FOR_STAGING_PREVIEW_DESIGN`.
