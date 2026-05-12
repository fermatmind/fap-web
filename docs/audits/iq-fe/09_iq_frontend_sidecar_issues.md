# IQ Frontend Sidecar Issues

## IQ-FE-SIDECAR-BACKEND-COMMERCE-DEFERRED-001

- `sidecar_id`: `IQ-FE-SIDECAR-BACKEND-COMMERCE-DEFERRED-001`
- `title`: `defer(iq-fe): frontend unlock/payment work until backend IQ commerce exists`
- `owner_repo`: `fap-api`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `commerce_unlock`
- `evidence`:
  - backend IQ train explicitly deferred `iq-commerce-unlock-199-500`
  - current frontend has shared paywall primitives, but IQ commerce is intentionally not ready
- `severity`: `medium`
- `proposed_owner_pr`: `iq-commerce-unlock-199-500` and future `IQ-FE-7`
- `next_goal`: `Keep IQ frontend in deferred-commerce safe mode until backend unlock contract exists.`
- `may_continue_train`: `true`
- `resume_condition`: `Backend IQ commerce PR is merged and frontend receives a stable unlock contract.`

## IQ-FE-SIDECAR-IQ-REPORT-ROUTE-CLINICAL-ONLY-001

- `sidecar_id`: `IQ-FE-SIDECAR-IQ-REPORT-ROUTE-CLINICAL-ONLY-001`
- `title`: `gap(iq-fe): attempts report route is still clinical-specific`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `report_route`
- `evidence`:
  - `app/(localized)/[locale]/attempts/[attemptId]/report/page.tsx` renders `ClinicalReportClient`
- `severity`: `high`
- `proposed_owner_pr`: `IQ-FE-5`
- `next_goal`: `Introduce IQ-aware report module shell or route dispatch.`
- `may_continue_train`: `true`
- `resume_condition`: `IQ-FE-5 adds an IQ-capable report path without touching payment.`

## IQ-FE-SIDECAR-IQ-THREE-DIMENSION-RENDERING-MISSING-001

- `sidecar_id`: `IQ-FE-SIDECAR-IQ-THREE-DIMENSION-RENDERING-MISSING-001`
- `title`: `gap(iq-fe): no explicit VSPR/VSI/NPR rendering yet`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `result_report_rendering`
- `evidence`:
  - no explicit `visual_spatial_insight`
  - no explicit `visual_spatial_pattern_reasoning`
  - no explicit `numerical_pattern_reasoning`
  - no explicit IQ summary metric rendering found
- `severity`: `high`
- `proposed_owner_pr`: `IQ-FE-4`
- `next_goal`: `Add IQ result summary and three-dimension cards on shared result route.`
- `may_continue_train`: `true`
- `resume_condition`: `IQ-FE-4 lands explicit IQ result components.`

## IQ-FE-SIDECAR-FRONTEND-IQ-IDENTITY-LEGACY-BIAS-001

- `sidecar_id`: `IQ-FE-SIDECAR-FRONTEND-IQ-IDENTITY-LEGACY-BIAS-001`
- `title`: `gap(iq-fe): frontend canonical IQ slug still hangs off legacy IQ_RAVEN key`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `identity_metadata`
- `evidence`:
  - `lib/assessmentSlugMap.ts` uses `IQ_RAVEN` as canonical frontend slug key
  - `lib/content.ts` fallback seed uses `scale_code: "IQ_RAVEN"`
  - `RichResultReport.tsx` rich-scale union still keys IQ as `IQ_RAVEN`
- `severity`: `medium`
- `proposed_owner_pr`: `IQ-FE-1`
- `next_goal`: `Canonicalize frontend IQ identity around IQ_INTELLIGENCE_QUOTIENT while keeping legacy alias compatibility.`
- `may_continue_train`: `true`
- `resume_condition`: `IQ-FE-1 lands typed identity cleanup.`

## IQ-FE-SIDECAR-NORM-TABLE-DEFERRED-001

- `sidecar_id`: `IQ-FE-SIDECAR-NORM-TABLE-DEFERRED-001`
- `title`: `defer(iq-fe): frontend copy must not overclaim normed IQ validity before norm table is final`
- `owner_repo`: `fap-api`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `result_copy_policy`
- `evidence`:
  - backend foundation notes retain norm-table sidecar
- `severity`: `medium`
- `proposed_owner_pr`: `backend follow-up calibration PR`, with frontend copy enforcement in `IQ-FE-4`
- `next_goal`: `Use cautious copy for percentile/confidence until norm-table status is finalized.`
- `may_continue_train`: `true`
- `resume_condition`: `Backend norm table contract becomes stable enough for production claims.`

## IQ-FE-SIDECAR-PDF-CERTIFICATE-UI-MISSING-001

- `sidecar_id`: `IQ-FE-SIDECAR-PDF-CERTIFICATE-UI-MISSING-001`
- `title`: `gap(iq-fe): no dedicated IQ PDF/certificate renderer found`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `report_delivery`
- `evidence`:
  - current scan found no dedicated IQ PDF/certificate result module
- `severity`: `low`
- `proposed_owner_pr`: `future post-IQ-FE-5 follow-up`
- `next_goal`: `Decide whether IQ frontend needs dedicated PDF/certificate entrypoints after report shell is stable.`
- `may_continue_train`: `true`
- `resume_condition`: `IQ report shell exists and backend delivery contract is ready.`

## IQ-FE-SIDECAR-LOCAL-BUILD-OPS-RUNTIME-001

- `sidecar_id`: `IQ-FE-SIDECAR-LOCAL-BUILD-OPS-RUNTIME-001`
- `title`: `env(iq-fe): local build depends on non-IQ ops runtime at 127.0.0.1:8000`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `local_build_validation`
- `evidence`:
  - current `pnpm build` failed prerendering `/zh/ops/content-pages`
  - failure cause was `connect ECONNREFUSED 127.0.0.1:8000`
- `severity`: `medium`
- `proposed_owner_pr`: `non-IQ ops/content-pages runtime follow-up`
- `next_goal`: `Decouple local build from unavailable ops runtime or provide stable mock/runtime for prerender.`
- `may_continue_train`: `true`
- `resume_condition`: `Local build can prerender ops content pages without requiring unavailable local service state.`

## IQ-FE-SIDECAR-LINT-BASELINE-UNRELATED-001

- `sidecar_id`: `IQ-FE-SIDECAR-LINT-BASELINE-UNRELATED-001`
- `title`: `env(iq-fe): repo lint baseline currently fails outside IQ scan scope`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `local_lint_validation`
- `evidence`:
  - current `pnpm lint` fails in unrelated files such as `components/career/CareerShortlistAction.tsx`, `components/result/mbti/clone/MbtiCloneAssetSlot.tsx`, `lib/cms/last-known-good.ts`, `ecosystem.config.cjs`
  - no lint failure referenced any file under `docs/audits/iq-fe/`
- `severity`: `medium`
- `proposed_owner_pr`: `separate repo lint-baseline cleanup`
- `next_goal`: `Fix existing repo-wide ESLint baseline independently of IQ frontend audit docs.`
- `may_continue_train`: `true`
- `resume_condition`: `Repo lint baseline is clean or required checks exclude unrelated existing lint debt.`

## IQ-FE-SIDECAR-CLEAN-WORKTREE-BUILD-ENV-001

- `sidecar_id`: `IQ-FE-SIDECAR-CLEAN-WORKTREE-BUILD-ENV-001`
- `title`: `env(iq-fe): clean worktree local build cannot use symlinked node_modules with Turbopack`
- `owner_repo`: `fap-web`
- `scope_relation`: `external_to_current_pr`
- `introduced_by_current_pr`: `false`
- `affected_area`: `local_build_validation`
- `evidence`:
  - current IQ-FE-1 implementation ran in a clean temp worktree to avoid unrelated main-worktree drift
  - `pnpm build` failed before application compilation with `Symlink node_modules is invalid, it points out of the filesystem root`
  - no build error referenced files under `lib/iq/`, `tests/contracts/iq-frontend-api-contracts.contract.test.ts`, or `docs/audits/iq-fe/10_iq_fe_1_api_contract_notes.md`
- `severity`: `low`
- `proposed_owner_pr`: `none required for IQ-FE-1; GitHub required build check is authoritative`
- `next_goal`: `Validate merged/frontend PRs in a standard clone or a worktree with native dependencies rather than a symlinked dependency tree.`
- `may_continue_train`: `true`
- `resume_condition`: `A standard checkout or CI run validates build without the temp-worktree symlink constraint.`
