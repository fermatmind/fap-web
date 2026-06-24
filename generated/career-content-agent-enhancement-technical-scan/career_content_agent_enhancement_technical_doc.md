# Career Content Agent Enhancement Technical Scan

Generated: `2026-06-24T13:55:21Z`

## Executive Verdict

The 1046 bilingual career page content agent line is complete and live-safe. The next phase is enhancement: query intent, internal links, personality-test conversion bridge, and high-value editorial upgrades. These must begin as candidate/audit layers, not runtime SEO or content imports.

## Completion Evidence

- `career-work-activities`: `CAREER_WORK_ACTIVITIES_1046_COMPLETE`, slugs `1046`, baseline `generated/career-work-activities-v1-batch-1046-pass-baseline-final-repaired`
- `career-identity`: `CAREER_IDENTITY_1046_COMPLETE`, slugs `1046`, baseline `generated/career-identity-v1-batch-1046-pass-baseline-final-repaired`
- `career-skills-entry`: `CAREER_SKILLS_ENTRY_1046_COMPLETE`, slugs `1046`, baseline `generated/career-skills-entry-v1-batch-1046-pass-baseline-final-repaired`
- `career-fit`: `CAREER_FIT_1046_COMPLETE`, slugs `1046`, baseline `generated/career-fit-v1-batch-1046-pass-baseline-final-repaired`
- `career-adjacent-comparison`: `CAREER_ADJACENT_COMPARISON_1046_COMPLETE`, slugs `1046`, baseline `generated/career-adjacent-comparison-v1-1046-pass-baseline-final-repaired`
- `career-page-assembly`: `CAREER_PAGE_ASSEMBLY_1046_COMPLETE`, slugs `1046`, baseline `generated/career-page-assembly-v1-1046-pass-baseline`

- Staging/editorial review: `CAREER_CONTENT_1046_EDITORIAL_REVIEW_PASS`
  - page assembly API: `2092/2092`
  - AI Impact API: `2092/2092`
  - staging pages: `2092/2092`

- Post-import live QA: `CAREER_CONTENT_1046_POST_IMPORT_LIVE_QA_SEO_SAFE`
  - `source_trace_id_leakage` = `0`
  - `internal_leakage_count` = `0`
  - `live_page_404_after_targeted_recheck` = `0`
  - `english_contains_chinese_count` = `0`
  - `raw_enum_or_search_projection_after_targeted_recheck` = `0`
  - `sitemap_llms_preview_or_internal_leakage` = `0`
  - `unauthorized_jsonld_schema_count` = `0`

## Existing Agent Capabilities

- `career-content-asset-factory`: orchestrator, state machine, batch/freeze/import readiness.
- Block skills: salary, identity, work-activities, skills-entry, fit, risk/future AI Impact, adjacent comparison, page assembly.
- Operator mode: controlled batching, repair loops, hard stops, source availability policy.
- Release chain: staging preview, editorial review, approved transition, exact-SHA production import, post-import live QA.

## Existing Backend Technical Docs

fap-api has existing career technical documentation. The primary document is `backend/docs/career/README.md`; it covers backend runtime authority and 1046/10k career architecture. It is not the same as the fap-web modular content-agent skill docs.

Important backend docs:
- `backend/docs/career/README.md`
- `backend/docs/seo/career-10k-rollout-architecture-spec-01.md`
- `backend/docs/seo/generated/career-1046-internal-linking-authority-01.v1.json`
- `.github/workflows/career-content-production-dry-run.yml`
- `.github/workflows/career-content-production-import.yml`

## Completed PR Inventory

This scan records `71` key merged PRs in `completed_pr_inventory.csv`. Representative PRs:

### fap-web
- PR #1241: Add career content orchestrator design (`dfcac88878fe`) - https://github.com/fermatmind/fap-web/pull/1241
- PR #1242: Add controlled career content operator mode (`a736e9767bba`) - https://github.com/fermatmind/fap-web/pull/1242
- PR #1244: Harden career content operator hard-stop policy (`ca6e5696076c`) - https://github.com/fermatmind/fap-web/pull/1244
- PR #1245: Support schema-compliant career content state (`f94112e4fdfc`) - https://github.com/fermatmind/fap-web/pull/1245
- PR #1246: Add work activities O*NET authority override policy (`ef36a75aaa4a`) - https://github.com/fermatmind/fap-web/pull/1246
- PR #1247: Add career identity factory scripts (`5494c86e9e2b`) - https://github.com/fermatmind/fap-web/pull/1247
- PR #1249: Harden career identity reader asset projection (`cd99b27decee`) - https://github.com/fermatmind/fap-web/pull/1249
- PR #1254: Add career skills-entry block pipeline scripts (`05d1a27abca8`) - https://github.com/fermatmind/fap-web/pull/1254
- PR #1267: Add career-fit content factory scripts (`71a071476c49`) - https://github.com/fermatmind/fap-web/pull/1267
- PR #1285: Add career-adjacent comparison factory scripts (`991a37e61693`) - https://github.com/fermatmind/fap-web/pull/1285
- PR #1286: Add career page assembly QA tooling (`674a0275a98f`) - https://github.com/fermatmind/fap-web/pull/1286
- PR #1288: Add career content staging preview dry-run (`fdd75a2f4d91`) - https://github.com/fermatmind/fap-web/pull/1288
- PR #1290: Add career content editorial quality gate (`ea3c819220a6`) - https://github.com/fermatmind/fap-web/pull/1290
- PR #1293: Harden career editorial block audit gate (`fab73764df15`) - https://github.com/fermatmind/fap-web/pull/1293
- PR #1299: Fix career page assembly preview order (`72e2889490af`) - https://github.com/fermatmind/fap-web/pull/1299
- PR #1351: Add career work activities generator (`ecab82d7f174`) - https://github.com/fermatmind/fap-web/pull/1351
- PR #1355: Register career work activities completion (`c8af412acae5`) - https://github.com/fermatmind/fap-web/pull/1355
- PR #1358: Career identity 1046 completion and authority repair state (`d1c7ed54256b`) - https://github.com/fermatmind/fap-web/pull/1358
- PR #1360: Career skills entry 1046 completion and generator state (`efff62dc73cc`) - https://github.com/fermatmind/fap-web/pull/1360
- PR #1362: Complete career-fit 1046 content block state (`c9998aac2960`) - https://github.com/fermatmind/fap-web/pull/1362
- PR #1364: Add career content agent technical closeout (`57f70fbfdce7`) - https://github.com/fermatmind/fap-web/pull/1364
- PR #1367: Complete career adjacent comparison block (`faa61e894e63`) - https://github.com/fermatmind/fap-web/pull/1367
- PR #1369: Complete career page assembly dry-run readiness (`a653eefbb36c`) - https://github.com/fermatmind/fap-web/pull/1369
- PR #1380: Add RIASEC Career Graph source authority packet (`853cbaea946f`) - https://github.com/fermatmind/fap-web/pull/1380
- PR #1395: Guard career display locale rendering (`4487ac2ff703`) - https://github.com/fermatmind/fap-web/pull/1395

### fap-api
- PR #2135: Enable full AI Impact staging preview contract (`db25ab4b6736`) - https://github.com/fermatmind/fap-api/pull/2135
- PR #2137: Fix AI impact preview locale fail-closed (`c5de88c49e9a`) - https://github.com/fermatmind/fap-api/pull/2137
- PR #2142: Add AI Impact v5 approved transition gate (`1a729e01d39e`) - https://github.com/fermatmind/fap-api/pull/2142
- PR #2144: Enable AI Impact v5 production import ops gate (`e1b1cf2c72d7`) - https://github.com/fermatmind/fap-api/pull/2144
- PR #2146: Fix AI Impact production reader projection (`dca3f04260db`) - https://github.com/fermatmind/fap-api/pull/2146
- PR #2148: Record AI Impact v5 production import ops report (`0b20f39e407c`) - https://github.com/fermatmind/fap-api/pull/2148
- PR #2245: Add career page assembly staging preview importer (`bf665575e1e9`) - https://github.com/fermatmind/fap-api/pull/2245
- PR #2262: Fix AI impact boundary projection wording (`4a7adeee1813`) - https://github.com/fermatmind/fap-api/pull/2262
- PR #2323: Enable AI Impact preview detail shell fallback (`aa0a96a79762`) - https://github.com/fermatmind/fap-api/pull/2323
- PR #2344: Fix AI Impact preview projection wording (`20db67e1da9e`) - https://github.com/fermatmind/fap-api/pull/2344
- PR #2348: Repair wind AI impact preview projection (`e84a7e78aefb`) - https://github.com/fermatmind/fap-api/pull/2348
- PR #2365: Fix career content staging preview projection leaks (`853f0f2a6de1`) - https://github.com/fermatmind/fap-api/pull/2365
- PR #2366: Fix remaining career AI Impact projection context leaks (`00c20dc8869d`) - https://github.com/fermatmind/fap-api/pull/2366
- PR #2368: Add page assembly approved transition gate (`2eda84de3907`) - https://github.com/fermatmind/fap-api/pull/2368
- PR #2370: Add page assembly production import gate (`43fd32d46386`) - https://github.com/fermatmind/fap-api/pull/2370
- PR #2372: Add career content production readiness dry-run workflow (`4885444b1a89`) - https://github.com/fermatmind/fap-api/pull/2372
- PR #2373: Add AI Impact production import dry-run gate (`4c0011688e31`) - https://github.com/fermatmind/fap-api/pull/2373
- PR #2376: Add career content production import workflow (`6b8956facd50`) - https://github.com/fermatmind/fap-api/pull/2376
- PR #2378: Allow staging artifact transfer for career production import (`31e23f01c296`) - https://github.com/fermatmind/fap-api/pull/2378
- PR #2379: Stage approved rows before career content production import (`5a58cdfa5a30`) - https://github.com/fermatmind/fap-api/pull/2379
- PR #2380: Run full state machine before career content production import (`751a273550e4`) - https://github.com/fermatmind/fap-api/pull/2380
- PR #2381: Make career content production import workflow retry-safe (`427447409ab7`) - https://github.com/fermatmind/fap-api/pull/2381
- PR #2382: Sanitize career detail source refs (`b645278de987`) - https://github.com/fermatmind/fap-api/pull/2382
- PR #2387: Sanitize career detail source lineage payload (`e773650a75ec`) - https://github.com/fermatmind/fap-api/pull/2387
- PR #2391: Sanitize career detail raw enum projection (`0f92307a0ba7`) - https://github.com/fermatmind/fap-api/pull/2391

## Enhancement Task Lines

1. SEO/GEO query intent candidate layer.
2. Internal-link and adjacent career graph optimization.
3. RIASEC / Big Five / MBTI conversion bridge.
4. High-value career manual editorial upgrade cohort.

See `enhancement_task_breakdown.md` for detailed PR/task split.

## Recommended Next Goal

Run a read-only `career-enhancement-opportunity-scan` that outputs query intent audit, internal-link graph audit, personality bridge gap audit, high-value editorial cohort, risk register, and PR sequence. No runtime, CMS, SEO, staging, or import changes.
