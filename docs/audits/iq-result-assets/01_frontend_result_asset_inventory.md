# IQ Result Page Frontend Asset Inventory

Generated: 2026-06-02T17:03:49Z

Primary repo evidence source: `/Users/rainie/Desktop/GitHub/fap-web` via isolated worktree `/private/tmp/fap-web-iq-result-assets-scan-20260603`.

## Summary

- Dedicated IQ result shell exists and is selected before the generic rich report path.
- Private result route is noindex and dynamic.
- IQ report module exists as a safe entitlement-aware module, with no checkout or payment implementation.
- Current UI is safe but basic; strongest next design input is result hero + reliability + dimension deep dives.

## Inventory

| File | Component/function | Status | Inputs | Result summary | Dimensions | Report content | Paid/locked state | Payment risk | Design relevance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | ResultPage metadata/noindex route shell | present | locale, attemptId | False | False | False | False | none_found_in_scan | supporting_or_contract_input |
| `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` | ResultClient IQ scale branch | present | reportData, resultData, accessView, locale, attemptId, scale_code, summary, dimensions | False | False | False | True | none_found_in_scan | supporting_or_contract_input |
| `components/result/iq/IqResultShell.tsx` | IqResultShell | present | reportData, resultData, accessView, locale, summary, dimensions | True | True | False | True | none_found_in_scan | primary_design_input |
| `components/result/iq/IqReportModule.tsx` | IqReportModule | present | locale, dimensions | False | False | True | True | none_found_in_scan | primary_design_input |
| `lib/iq/constants.ts` | IQ canonical/legacy constants and dimension fields | present | - | False | True | False | False | none_found_in_scan | supporting_or_contract_input |
| `lib/iq/contracts.ts` | IQ Zod payload schemas | present | locale, scale_code, iq_pro, summary, dimensions | True | True | True | True | none_found_in_scan | supporting_or_contract_input |
| `lib/iq/api.ts` | IQ result/report/access API adapters | present | locale, attemptId, scale_code | False | False | False | False | none_found_in_scan | supporting_or_contract_input |
| `lib/iq/result.ts` | buildIqResultViewModel and IQ result/report view-model helpers | present | reportData, resultData, accessView, locale, scale_code, iq_pro, summary, dimensions | True | True | True | True | none_found_in_scan | primary_design_input |
| `lib/iq/bankDisplay.ts` | IQ beta30/beta50 bank display model | present | locale | False | False | False | False | none_found_in_scan | supporting_or_contract_input |
| `tests/contracts/iq-result-renderer.contract.test.tsx` | contract/docs evidence | present | reportData, resultData, accessView, locale, attemptId, scale_code, iq_pro, summary, dimensions | True | True | True | True | guarded_low | supporting_or_contract_input |
| `tests/contracts/iq-report-module.contract.test.tsx` | contract/docs evidence | present | reportData, resultData, accessView, locale, attemptId, scale_code, iq_pro, summary, dimensions | True | True | True | True | guarded_low | supporting_or_contract_input |
| `tests/contracts/iq-frontend-api-contracts.contract.test.ts` | contract/docs evidence | present | locale, attemptId, scale_code, summary, dimensions | True | True | False | True | guarded_low | supporting_or_contract_input |
| `tests/contracts/result-client-view-state.contract.test.tsx` | contract/docs evidence | present | reportData, resultData, locale, attemptId, scale_code, summary, dimensions | True | True | False | True | guarded_low | supporting_or_contract_input |
| `tests/contracts/iq-cms-media-rendering-guard.contract.test.tsx` | contract/docs evidence | present | locale | False | False | False | False | guarded_low | supporting_or_contract_input |
| `tests/contracts/iq-claim-seo-launch-guard.contract.test.ts` | contract/docs evidence | present | locale | False | False | False | True | none_found_in_scan | supporting_or_contract_input |
| `tests/contracts/iq-launch-readiness-smoke.contract.test.ts` | contract/docs evidence | present | attemptId | False | False | False | False | guarded_low | supporting_or_contract_input |
| `tests/contracts/iq-seo-ramp-indexation-gate.contract.test.ts` | contract/docs evidence | present | locale | False | False | False | False | none_found_in_scan | supporting_or_contract_input |
| `docs/audits/iq-fe/05_result_report_renderer_audit.md` | contract/docs evidence | present | locale, attemptId, scale_code, summary, dimensions | True | True | False | True | none_found_in_scan | supporting_or_contract_input |
| `docs/audits/iq-fe/13_iq_fe_4_result_page_notes.md` | contract/docs evidence | present | locale, summary | False | True | False | True | guarded_low | supporting_or_contract_input |
| `docs/audits/iq-fe/14_iq_fe_5_report_module_notes.md` | contract/docs evidence | present | summary | False | False | False | True | guarded_low | supporting_or_contract_input |
| `docs/audits/iq-fe/18_iq_claim_seo_launch_guard.md` | contract/docs evidence | present | - | False | False | False | True | none_found_in_scan | supporting_or_contract_input |
| `docs/audits/iq-fe/19_iq_live_smoke_launch_readiness.md` | contract/docs evidence | present | - | False | False | False | True | guarded_low | supporting_or_contract_input |
| `docs/audits/iq-fe/20_iq_production_launch_readiness_ledger.md` | contract/docs evidence | present | - | False | False | False | True | guarded_low | supporting_or_contract_input |

## Additional IQ-related frontend files discovered

- `docs/audits/iq-fe/01_frontend_structure_scan.json`
- `docs/audits/iq-fe/01_frontend_structure_scan.md`
- `docs/audits/iq-fe/02_route_surface_audit.json`
- `docs/audits/iq-fe/02_route_surface_audit.md`
- `docs/audits/iq-fe/03_api_contract_audit.json`
- `docs/audits/iq-fe/03_api_contract_audit.md`
- `docs/audits/iq-fe/04_question_renderer_audit.json`
- `docs/audits/iq-fe/04_question_renderer_audit.md`
- `docs/audits/iq-fe/05_result_report_renderer_audit.json`
- `docs/audits/iq-fe/05_result_report_renderer_audit.md`
- `docs/audits/iq-fe/06_deferred_commerce_surface_audit.json`
- `docs/audits/iq-fe/06_deferred_commerce_surface_audit.md`
- `docs/audits/iq-fe/07_test_build_strategy.json`
- `docs/audits/iq-fe/07_test_build_strategy.md`
- `docs/audits/iq-fe/08_iq_frontend_pr_split_plan.json`
- `docs/audits/iq-fe/08_iq_frontend_pr_split_plan.md`
- `docs/audits/iq-fe/09_iq_frontend_sidecar_issues.md`
- `docs/audits/iq-fe/10_iq_fe_1_api_contract_notes.md`
- `docs/audits/iq-fe/11_iq_fe_2_renderer_notes.md`
- `docs/audits/iq-fe/12_iq_fe_3_take_page_notes.md`
- `docs/audits/iq-fe/13_iq_fe_4_result_page_notes.md`
- `docs/audits/iq-fe/14_iq_fe_5_report_module_notes.md`
- `docs/audits/iq-fe/15_iq_fe_6_mobile_loading_error_notes.md`
- `docs/audits/iq-fe/18_iq_claim_seo_launch_guard.md`
- `docs/audits/iq-fe/19_iq_live_smoke_launch_readiness.md`
- `docs/audits/iq-fe/20_iq_production_launch_readiness_ledger.md`
- `lib/seo/iqSeoRampAuthority.ts`
- `lib/seo/testDetailAuthority.ts`
- `lib/seo/topicLlmsAuthority.ts`
- `public/static/sbti/illustrations/DRUNK.png`
- `public/static/sbti/illustrations/MUM.png`
- `public/static/sbti/illustrations/POOR.png`
- `scripts/iq/iq-launch-readiness-smoke.mjs`
- `tests/contracts/depression-entry-visibility.contract.test.tsx`
- `tests/contracts/fixtures/cmsLandingSurfaceMock.ts`
- `tests/contracts/helpers/currentPrScope.ts`
- `tests/contracts/homepage-articles-empty-state.contract.test.tsx`
- `tests/contracts/homepage-v1-core-grid.contract.test.tsx`
- `tests/contracts/homepage-v1-density.contract.test.tsx`
- `tests/contracts/iq-bank-display-model.contract.test.ts`
- `tests/contracts/iq-claim-seo-launch-guard.contract.test.ts`
- `tests/contracts/iq-cms-media-rendering-guard.contract.test.tsx`
- `tests/contracts/iq-frontend-api-contracts.contract.test.ts`
- `tests/contracts/iq-launch-readiness-smoke.contract.test.ts`
- `tests/contracts/iq-question-renderer.contract.test.tsx`
- `tests/contracts/iq-release-readiness-ledger.contract.test.ts`
- `tests/contracts/iq-report-module.contract.test.tsx`
- `tests/contracts/iq-result-renderer.contract.test.tsx`
- `tests/contracts/iq-seo-ramp-indexation-gate.contract.test.ts`
- `tests/contracts/iq-take-lifecycle.contract.test.tsx`
- `tests/contracts/quiz-normalization.contract.test.ts`
- `tests/contracts/result-client-view-state.contract.test.tsx`
- `tests/contracts/search-intelligence-data-contract.contract.test.ts`
- `tests/contracts/test-detail-softwareapplication-schema.contract.test.ts`
- `tests/contracts/test-slug-aliases.contract.test.ts`
- `tests/contracts/test-title-display.contract.test.ts`
- `tests/contracts/tests-hub-pr-ux-01-render.contract.test.tsx`
- `tests/contracts/uasp-existing-scale-signal-registry.contract.test.ts`
- `tests/contracts/uasp-profile-sensitivity-policy.contract.test.ts`
- `tests/contracts/uasp-profile-write-blocker-memory-readiness-ledger.contract.test.ts`
- `tests/contracts/uasp-readiness-dashboard.contract.test.ts`
- `tests/e2e/home-visual.spec.ts`
- `tests/e2e/iq-eq-result-regression.spec.ts`
- `tests/e2e/visual/home.visual.spec.ts-snapshots/home-footer-en-chromium-linux.png`
- `tests/e2e/visual/home.visual.spec.ts-snapshots/home-hero-en-chromium-linux.png`
- `tests/e2e/visual/iq-take.visual.spec.ts`
- `tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-desktop-options-en-chromium-linux.png`
- `tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-mobile-options-en-chromium-linux.png`
- `tests/e2e/visual/support.visual.spec.ts-snapshots/help-en-chromium-linux.png`
- `tests/e2e/visual/tests-list.visual.spec.ts-snapshots/tests-list-footer-en-chromium-linux.png`
