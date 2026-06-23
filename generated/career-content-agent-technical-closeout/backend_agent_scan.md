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
