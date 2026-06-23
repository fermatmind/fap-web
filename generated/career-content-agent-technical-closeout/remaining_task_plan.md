# Remaining Career Agent Task Plan

Generated: `2026-06-23T07:33:56.981986+00:00`

## Immediate Next Task

Run `career-adjacent-comparison` through the controlled block workflow.

```text
Run career-content operator for block = career-adjacent-comparison until 1046 careers are complete.

Start from no existing career-adjacent-comparison baseline unless a valid frozen PASS baseline is detected.

Allowed autonomous actions:
- create next batch manifest using control_<previous> + new_50
- generate adjacent-comparison evidence
- validate evidence schema
- audit evidence and trust rules
- repair evidence if REPAIR_REQUIRED
- generate synthesis only after evidence/trust PASS
- audit synthesis
- repair synthesis if REPAIR_REQUIRED
- generate reader-facing asset only after synthesis PASS
- audit asset
- repair asset if REPAIR_REQUIRED
- freeze each PASS batch baseline
- after 1046 PASS baseline is frozen, run final independent QA
- register career-adjacent-comparison COMPLETE in generated/fermatmind-content-agent-state/

Hard stops:
- REJECT
- BLOCKED
- schema change needed
- source availability issue without valid cache
- max repair loops exceeded
- title-similarity proxy risk cannot be resolved
- runtime / SEO / CMS / staging / production requirement

Prohibitions:
- Do not generate search_projection.
- Do not modify page assembly.
- Do not modify runtime / SEO / CMS.
- Do not stage or import.
- Do not modify salary, AI Impact, work-activities, identity, skills-entry, or fit assets.
- Do not mutate frozen baselines.
```

## Then

1. Open a narrow PR if adjacent-comparison generator/gate/state helper changes were needed.
2. Run `career-page-assembly` only after all upstream blocks are PASS/frozen.
3. Run full integrated QA.
4. Create staging preview design package.
5. Run fap-api dry-run importer/API harness for page assembly and dependent preview blocks.
6. Only after dry-run PASS, request explicit authorization for `staging_preview` write.
7. Run full staging API smoke and staging page/editorial QA.
8. Generate editorial approval package.
9. Run approved transition only after approval manifest SHA and QA SHA match.
10. Prepare production readiness package and stop for exact-SHA approval.
11. Production import only after explicit phrase: `批准 career content 1046 production import, using SHA <exact_sha>`.
12. Run post-import live QA and SEO safety.

## Fast Closeout Recommendation

To close the agent task line quickly without prematurely entering production:

- Finish adjacent comparison.
- Run page assembly.
- Run integrated QA.
- Produce staging preview dry-run design/readiness artifacts.
- Stop there and label the content-agent production line as `READY_FOR_STAGING_PREVIEW_APPROVAL`.
