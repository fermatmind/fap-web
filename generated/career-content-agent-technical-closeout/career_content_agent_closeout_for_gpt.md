# FermatMind Career Content Agent Technical Closeout

Generated: `2026-06-23T07:33:56.981986+00:00`

## Executive Verdict

The career content agent is now a real evidence-first content factory, not just a prompt workflow. It can generate and audit modular career content blocks through manifests, evidence, synthesis, reader assets, repair loops, frozen baselines, and final QA.

It is **not fully closed for the complete career page yet**. The current state has four rebuilt blocks complete, while `career-adjacent-comparison` and then `career-page-assembly` remain before full staging preview/import can be treated as ready.

## Current State Snapshot

Completed PASS baselines in `generated/fermatmind-content-agent-state/latest_pass_baselines.json`:

- `career-work-activities`: `CAREER_WORK_ACTIVITIES_1046_COMPLETE`, slugs `1046`
- `career-identity`: `CAREER_IDENTITY_1046_COMPLETE`, slugs `1046`
- `career-skills-entry`: `CAREER_SKILLS_ENTRY_1046_COMPLETE`, slugs `1046`
- `career-fit`: `CAREER_FIT_1046_COMPLETE`, slugs `1046`

Current next goal:

```text
# Next Goal Recommendation

Run `career-adjacent-comparison` through the same controlled block workflow. Do not run page assembly until adjacent comparison is COMPLETE.
```

Open failures: `0`

## Agent Workflow Now Canonicalized

`seed -> manifest -> evidence ledger -> evidence schema audit -> trust audit -> synthesis ledger -> synthesis audit -> asset JSONL -> asset/editorial audit -> freeze baseline -> final independent QA -> repair if needed -> staging preview design -> dry-run importer -> staging_preview write -> API/page smoke -> editorial_review -> approved -> exact-SHA production import -> post-import live QA/SEO safety`

## Completed Work From This Task Line

See:

- [completed_task_retro.md](completed_task_retro.md)
- [frontend_agent_scan.md](frontend_agent_scan.md)
- [backend_agent_scan.md](backend_agent_scan.md)

## Existing Agent Capability Boundary

See [agent_capability_boundary.md](agent_capability_boundary.md).

Short version:

- Agent can automate bounded content block production and repair.
- Agent cannot silently stage, import, modify SEO/runtime/CMS, or approve production.
- Backend remains runtime/import authority.
- Frontend renders reader-safe API payloads and fails closed.

## Backend Technical Alignment

The backend scan confirms fap-api already has import/state/projection infrastructure for career assets, including:

- page assembly preview importer/API harness
- AI Impact preview/import state machine
- salary preview/import pattern
- authority and runtime publish projection services
- display surface and career job bundle builders
- release train/operator docs

This supports using the same strict line for complete career page content: dry-run first, then staging preview, editorial review, approved transition, exact-SHA production import, and post-import live QA.

## Important Risk Notes

1. The current primary fap-web worktree is not on clean main; this report was generated in `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering`.
2. The primary fap-api worktree has an unrelated untracked SEO handoff doc. This scan did not modify it.
3. State files show `career-skills-entry` in latest PASS baselines but not consistently in `global_content_state.career_blocks`; reconcile state before page assembly.
4. Do not run page assembly until `career-adjacent-comparison` is complete.
5. Do not treat any generated baseline as public release authorization.

## Recommended Closeout Path

See [remaining_task_plan.md](remaining_task_plan.md).

Immediate next action: run `career-adjacent-comparison` to 1046 PASS/frozen, then run page assembly and integrated QA.

## No Side Effects Performed

This scan/report task did not:

- generate new career facts
- generate evidence/synthesis/assets
- modify runtime/page code
- modify SEO runtime
- modify CMS
- create staging preview
- import production


---

# Career Content Agent Task-Line Retro

Generated: `2026-06-23T07:33:56.981986+00:00`

## What This Conversation Completed

### 1. Salary Block

The salary block established the first mature career content production pattern: evidence-first generation, trust audit, reader repair, protected-field diff, freeze, staging preview, editorial review, approved transition, exact-SHA production import, and post-import SEO safety.

### 2. AI Impact / Risk-Future Block

AI Impact went through v2/v3/v4 quality escalations and then a v5 competitive rebuild. The final pattern included micro-family taxonomy, score calibration, standalone citation quality, skill-evidence usefulness, search-projection quarantine, 50-career batches, final independent QA, repair, staging preview, editorial approval, production import, and live SEO/page QA.

### 3. Shared Career Content Orchestrator

The repository now has `career-content-asset-factory` as the shared state machine and operator layer. It coordinates block factories but does not create facts directly.

### 4. Operator Mode And Hard-Stop Policy

Operator mode was added and hardened for bounded autonomous work: next-batch selection, repair loops, cache-only reruns, source availability classification, lexical false positives, military direct O*NET duty exceptions, and max repair loop stop states.

### 5. Completed Rebuilt Blocks In Current State

- `career-work-activities`: COMPLETE, 1046 slugs.
- `career-identity`: COMPLETE, 1046 slugs.
- `career-skills-entry`: COMPLETE, 1046 slugs.
- `career-fit`: COMPLETE, 1046 slugs.

## What Is Not Yet Closed

- `career-adjacent-comparison` is still the next block in the current state recommendation.
- `career-page-assembly` cannot run until all upstream blocks, including adjacent comparison, are PASS/frozen.
- Full integrated QA has not been re-run on the regenerated current block set.
- Full 1046 staging preview/import/page QA for the assembled career content has not been completed in this current rebuilt line.
- Production import for complete career page assembly has not been approved or executed in this current rebuilt line.


---

# Career Content Agent Capability Boundary

Generated: `2026-06-23T07:33:56.981986+00:00`

## What The Agent Can Do Now

- Read canonical 1046 seed and build `control_<previous> + new_50` manifests.
- Generate block evidence only after source rules are satisfied.
- Run schema, trust, editorial, locale, template-reuse, leakage, and block-specific gates.
- Generate synthesis and reader-facing assets only after evidence/trust PASS.
- Repair failed rows within bounded repair loops.
- Freeze PASS baselines with SHA manifests.
- Track block state in `generated/fermatmind-content-agent-state/`.
- Render next-goal recommendations.
- Prepare staging/import/readiness artifacts.

## What The Agent Must Not Do Without Separate Approval

- Change schema contracts or source policies beyond the current scope.
- Modify runtime page code, SEO runtime, CMS resources, sitemap, llms, canonical, noindex, robots, or JSON-LD.
- Write staging preview rows.
- Move rows to editorial/approved.
- Import production.
- Treat `PASS`, `freeze`, `editorial PASS`, or PR merge as production approval.
- Put search/SEO/schema candidate fields into reader assets or runtime payloads.
- Let page assembly invent facts missing from upstream blocks.

## Backend/Frontend Boundary

- fap-api is the import/runtime authority for career assets, authority gates, page assembly preview, AI Impact preview, salary assets, runtime projection, and reader-safe API projection.
- fap-web should render API-provided reader-safe payloads and fail closed if data/status/flag/allowlist does not permit display.
- fap-web must not add fallback editorial content for career pages.

## Closeout Boundary

This task line can be considered technically closed only after:

1. `career-adjacent-comparison` reaches 1046 PASS/frozen.
2. `career-page-assembly` composes all PASS blocks and reaches 1046 PASS/frozen.
3. Full integrated QA PASS.
4. Staging preview design and dry-run package PASS.

Public release is a separate line and closes only after staging write, editorial approval, approved transition, exact-SHA production import, and post-import live QA/SEO safety.


---

# Frontend / Content-Agent Scan

Generated: `2026-06-23T07:33:56.981986+00:00`

## Verdict

The clean fap-web main worktree contains the career-content orchestrator skill and all block factory skills needed to continue the career content agent. Generated state currently records four completed non-salary blocks and recommends `career-adjacent-comparison` next.

## Skill Inventory

- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-adjacent-comparison-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-content-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-fit-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-identity-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-page-assembly-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-risk-future-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-salary-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-skills-entry-asset-factory/SKILL.md`
- `/private/tmp/fap-web-enneagram-share-card-public-safe-rendering/.agents/skills/career-work-activities-asset-factory/SKILL.md`

## Current Agent State

Latest PASS baselines recorded:

- `career-work-activities`: `CAREER_WORK_ACTIVITIES_1046_COMPLETE`, slugs `1046`, baseline `generated/career-work-activities-v1-batch-1046-pass-baseline-final-repaired`
- `career-identity`: `CAREER_IDENTITY_1046_COMPLETE`, slugs `1046`, baseline `generated/career-identity-v1-batch-1046-pass-baseline-final-repaired`
- `career-skills-entry`: `CAREER_SKILLS_ENTRY_1046_COMPLETE`, slugs `1046`, baseline `generated/career-skills-entry-v1-batch-1046-pass-baseline-final-repaired`
- `career-fit`: `CAREER_FIT_1046_COMPLETE`, slugs `1046`, baseline `generated/career-fit-v1-batch-1046-pass-baseline-final-repaired`

Current block status:

- block: `career-fit`
- phase: `final_qa_pass`
- latest baseline: `generated/career-fit-v1-batch-1046-pass-baseline-final-repaired`
- open failures: `0`
- staging status: `not_started`
- production import status: `not_started`

Next recommended goal:

```text
# Next Goal Recommendation

Run `career-adjacent-comparison` through the same controlled block workflow. Do not run page assembly until adjacent comparison is COMPLETE.
```

## Important State Caveat

`generated/fermatmind-content-agent-state/global_content_state.json` lists `career_blocks` as `career-fit`, `career-identity`, and `career-work-activities`, while `latest_pass_baselines.json` also includes `career-skills-entry`. Before final page assembly, run state reconciliation so every completed block appears consistently across `global_content_state`, `batch_registry`, `latest_pass_baselines`, and `import_state`.


---

# Backend Agent And Career Runtime Scan

Generated: `2026-06-23T07:33:56.981986+00:00`

## Verdict

`fap-api` already contains the runtime/import authority needed for staged career content rollout. The backend has dedicated command/service/test surfaces for page assembly, AI Impact, salary assets, career authority, runtime publish projection, public career bundle construction, display asset lineage, and release governance.

The scan found:

- Career console commands: `90`
- Career services: `66`
- Career tests: `258`
- Release/operator docs: `2`

## Key Backend Surfaces

### Page Assembly Preview Import

- Command: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/CareerImportPageAssemblyAssetsPreview.php`
- Service: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/PageAssemblyAssets/CareerPageAssemblyImportService.php`
- Preview service: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/PageAssemblyAssets/CareerPageAssemblyPreviewService.php`
- Feature test: `/Users/rainie/Desktop/GitHub/fap-api/backend/tests/Feature/Career/CareerPageAssemblyAssetPreviewImportTest.php`

Observed contract:

- `--dry-run` validates without writing.
- `--force` writes only `staging_preview` rows.
- `--all-slugs-from-file` plus `--force` requires `--confirm-full-staging-preview`.
- Reader-safe API projection keeps reader keys and removes `audit_fields`, `block_refs`, `source_row_hash`, `row_hash`, `search_projection`, and lineage fields.
- Reports explicitly set `production_import_allowed=false`, `runtime_modified=false`, `seo_runtime_modified=false`, and `search_projection_activated=false` for preview paths.

### AI Impact Preview / Import

- Command: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/CareerImportAiImpactAssetsPreview.php`
- Service: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/AiImpactAssets/CareerAiImpactAssetImportService.php`
- State machine: `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/AiImpactAssets/CareerAiImpactAssetImportStateMachine.php`
- Feature test: `/Users/rainie/Desktop/GitHub/fap-api/backend/tests/Feature/Career/CareerAiImpactAssetPreviewImportTest.php`

Observed state machine:

`dry_run -> staging_preview -> editorial_review -> approved -> production_imported`

Production import is constrained to rows already in `approved`, and command flags require explicit confirmation for full staging preview, approved transition, and production import.

### Career Runtime Authority

Representative files:

- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/Bundles/CareerJobDetailBundleBuilder.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/Bundles/CareerJobDisplaySurfaceBuilder.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/Bundles/CareerRuntimePublishedDisplaySurfaceBuilder.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/Import/CareerAuthorityDatasetReader.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Career/Governance/CareerDisplayAssetLineageReporter.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/CareerValidateRuntimePublishProjection.php`
- `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/CareerValidateReleaseGate.php`

This confirms the backend remains the page/runtime/import authority. The frontend should consume reader-safe API payloads and fail closed, not become content authority.

## Release Governance

- `/Users/rainie/Desktop/GitHub/fap-api/docs/ops/release-train.md`
- `/Users/rainie/Desktop/GitHub/fap-api/docs/04-ops/release-operator-workflow.md`

Release docs distinguish dry-run/readiness from real production execution. They require clean main, exact SHA, release records, and explicit operator approval before production deploy/import.

## Backend Gap To Track

The page assembly preview channel exists, but full career-content production import should remain gated behind:

1. 1046 full dry-run.
2. 1046 `staging_preview` write.
3. API smoke.
4. Page/editorial QA.
5. Editorial approval manifest.
6. Approved transition.
7. Production readiness.
8. User exact-SHA production import approval.
9. Post-import live QA and SEO safety.


---

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


---

# Next Goal Recommendation

Run `career-adjacent-comparison` to 1046 PASS/frozen, then open a narrow PR only if generator/gate/state helper changes were needed.

Do not run page assembly until adjacent comparison is COMPLETE.

Use the prompt in `remaining_task_plan.md` as the next execution instruction.
