# IQ Backend Result / Report Payload Inventory

Generated: 2026-06-02T17:03:49Z

## Backend source

- Preferred: `/Users/rainie/Desktop/GitHub/fap-api-pr-rt-01`
- Fallback: `/Users/rainie/Desktop/GitHub/fap-api`
- Selected: `/Users/rainie/Desktop/GitHub/fap-api`
- Status: `fallback_readonly_preferred_missing`

## Payload authority summary

- Backend remains authority for IQ score, percentile, confidence interval, quality, stability, norm/claim eligibility, answer key redaction, and entitlement.
- Frontend should render only fields present in result/report/access payloads and must not infer IQ/percentile/claims.
- Content package answer keys and solution/generator metadata must not appear in public payloads.

## Backend files with IQ payload evidence

| File | Payload fields discovered | Frontend action |
| --- | --- | --- |
| `backend/app/Services/Report/ClinicalCombo68ReportComposer.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Report/RiasecReportComposer.php` | quality | render_from_backend_when_present |
| `backend/app/Services/Report/ReportSnapshotStore.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN | authority_or_test_evidence |
| `backend/app/Services/Report/ReportComposer.php` | reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/BigFivePdfDocumentService.php` | locked, quality | authority_or_test_evidence |
| `backend/app/Services/Report/Sds20ReportComposer.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Report/IqReportBuilder.php` | IQ report, IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN, certificate, certificate_payload, confidence_interval, iq_estimate, locked, numerical_pattern_reasoning, pdf_payload, percentile, quality, reportAccess, result_stability, stability, visual_spatial_insight, visual_spatial_pattern_reasoning, 数字规律推理, 视觉空间模式推理, 视觉空间洞察 | render_from_backend_when_present |
| `backend/app/Services/Report/EnneagramReportComposer.php` | locked, quality | authority_or_test_evidence |
| `backend/app/Services/Report/ReportAccess.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN, locked, quality | authority_or_test_evidence |
| `backend/app/Services/Report/BigFiveReportComposer.php` | locked, percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Report/ReportComposerRegistry.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN | authority_or_test_evidence |
| `backend/app/Services/Report/MbtiPreviewContractBuilder.php` | locked | authority_or_test_evidence |
| `backend/app/Services/Report/SectionCardGenerator.php` | locked | authority_or_test_evidence |
| `backend/app/Services/Report/EqIntegratedReportComposer.php` | locked, percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Report/Eq60ReportComposer.php` | locked, percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Report/ReportGatekeeper.php` | IQ_RAVEN, locked, quality, reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/InviteUnlockSummaryBuilder.php` | locked | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportComposeContext.php` | reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportPayloadAssembler.php` | reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportPayloadAssemblerComposeEntryTrait.php` | reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportPayloadAssemblerComposeBuildTrait.php` | locked | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportPayloadAssemblerComposeFinalizeTrait.php` | reportAccess | authority_or_test_evidence |
| `backend/app/Services/Report/Composer/ReportPayloadAssemblerNormsAndContextTrait.php` | percentile | render_from_backend_when_present |
| `backend/app/Services/Report/Pdf/ReportPdfDocumentService.php` | locked, quality | authority_or_test_evidence |
| `backend/app/Services/Report/Resolvers/OfferResolver.php` | entitlement, locked | authority_or_test_evidence |
| `backend/app/Services/Report/Resolvers/AccessResolver.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN, entitlement | authority_or_test_evidence |
| `backend/app/Services/Report/Resolvers/CrisisPolicyResolver.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Drivers/Eq60Driver.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Drivers/RiasecDriver.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Drivers/BigFiveOceanDriver.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Assessment/Drivers/IqTestDriver.php` | IQ_INTELLIGENCE_QUOTIENT, confidence_interval, iq_estimate, locked, percentile, quality, result_stability, stability, 数字规律推理, 视觉空间模式推理, 视觉空间洞察 | render_from_backend_when_present |
| `backend/app/Services/Assessment/Scorers/Sds20ScorerV2FactorLogic.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Assessment/Scorers/BigFiveScorerV3.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Assessment/Scorers/EqSjt16Scorer.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Scorers/Eq60ScorerV1NormedValidity.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Assessment/Scorers/RiasecScorer.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Scorers/EnneagramLikert105Scorer.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Assessment/Scorers/ClinicalCombo68ScorerV1.php` | quality | authority_or_test_evidence |
| `backend/app/Services/Assessment/Scorers/EnneagramForcedChoice144Scorer.php` | percentile, quality | render_from_backend_when_present |
| `backend/app/Services/Iq/IqProductionObservability.php` | IQ_INTELLIGENCE_QUOTIENT, entitlement, locked, quality | render_from_backend_when_present |
| `backend/app/Services/Iq/IqNormAuthorityContract.php` | IQ_INTELLIGENCE_QUOTIENT, locked | authority_or_test_evidence |
| `backend/app/Services/Iq/IqResultPayloadRedactor.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN | authority_or_test_evidence |
| `backend/app/Http/Controllers/API/V0_3/AttemptInviteUnlockController.php` | locked | authority_or_test_evidence |
| `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | IQ_RAVEN, locked, quality, report-access, reportAccess, stability | authority_or_test_evidence |
| `backend/app/Http/Controllers/API/V0_3/MbtiAttributionEventController.php` | locked, quality | authority_or_test_evidence |
| `backend/app/Http/Controllers/API/V0_3/AuthPhoneController.php` | locked | authority_or_test_evidence |
| `backend/app/Http/Controllers/API/V0_3/Webhooks/PaymentWebhookController.php` | locked | authority_or_test_evidence |
| `backend/config/eq60_norms.php` | quality | authority_or_test_evidence |
| `backend/config/sds_norms.php` | quality | authority_or_test_evidence |
| `backend/config/big5_norms.php` | quality | authority_or_test_evidence |
| `backend/config/seo_intel.php` | quality | authority_or_test_evidence |
| `backend/config/database.php` | certificate | authority_or_test_evidence |
| `backend/config/scale_identity.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN | authority_or_test_evidence |
| `backend/config/fap.php` | IQ_RAVEN, quality | authority_or_test_evidence |
| `backend/config/ops.php` | stability | authority_or_test_evidence |
| `backend/config/cdn_map.php` | locked | authority_or_test_evidence |
| `backend/scripts/iq/build_iq_beta30_original_bank.php` | - | authority_or_test_evidence |
| `backend/scripts/iq/verify_iq_beta50_original_bank.php` | - | authority_or_test_evidence |
| `backend/scripts/iq/build_iq30_questions_from_prototype.php` | - | authority_or_test_evidence |
| `backend/scripts/iq/iq_beta50_original_bank_lib.php` | IQ_INTELLIGENCE_QUOTIENT, IQ_RAVEN, percentile | render_from_backend_when_present |
| `backend/scripts/iq/iq_svg_provenance_lib.php` | IQ_INTELLIGENCE_QUOTIENT | authority_or_test_evidence |
| `backend/scripts/iq/verify_iq_beta30_original_bank.php` | - | authority_or_test_evidence |
| `backend/scripts/iq/iq_beta30_original_bank_lib.php` | IQ_INTELLIGENCE_QUOTIENT, percentile | render_from_backend_when_present |
| `backend/scripts/iq/build_iq_beta50_original_bank.php` | - | authority_or_test_evidence |
| `backend/scripts/iq/iq_showcase12_bank_lib.php` | IQ_INTELLIGENCE_QUOTIENT, quality, 数字规律推理, 视觉空间模式推理, 视觉空间洞察 | render_from_backend_when_present |
| `backend/scripts/iq/verify_showcase12_beta_bank.php` | IQ_INTELLIGENCE_QUOTIENT | render_from_backend_when_present |
| `backend/scripts/iq/verify_legacy_svg_provenance.php` | IQ_RAVEN | authority_or_test_evidence |
| `backend/tests/Unit/Migrations/MigrationDestructiveRetirementEvidenceTest.php` | quality | authority_or_test_evidence |
| `backend/tests/Unit/Eq/EqSjtValidationTelemetryContractTest.php` | locked, percentile, quality | render_from_backend_when_present |
| `backend/tests/Unit/Template/BigFiveTemplateWhitelistTest.php` | quality | authority_or_test_evidence |
| `backend/tests/Unit/Assessment/IqTestDriverTest.php` | IQ_INTELLIGENCE_QUOTIENT, confidence_interval, iq_estimate, locked, percentile, quality, result_stability, stability | render_from_backend_when_present |
| `backend/tests/Unit/Assessment/RiasecScorerTest.php` | quality | render_from_backend_when_present |
| `backend/tests/Unit/Assessment/EqSjt16ScorerTest.php` | quality | authority_or_test_evidence |
| `backend/tests/Unit/Assessment/Eq60ScorerValidityTest.php` | quality | authority_or_test_evidence |
| `backend/tests/Unit/Support/PublicMediaUrlGuardTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Support/Mbti/MbtiCanonicalSectionRegistryTest.php` | stability | authority_or_test_evidence |
| `backend/tests/Unit/Report/EqIntegratedReportComposerTest.php` | locked, percentile, quality | render_from_backend_when_present |
| `backend/tests/Unit/Domain/Career/Audit/CareerDeltaRolloutGatePlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerCanonical80CandidateSelectorTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerCanonicalEligibilityAuditSchemaTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerRuntimeCandidatePrepPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerProgressiveReadinessSelectionTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerSeoGeoReadinessAuditorTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerPublicResolutionPlanResolverTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/Career2786ReadinessPolicyClassifierTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/Career2786FullAuditArtifactBuilderTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerSurfaceReadinessAuditorTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerCanonical80CohortReadinessPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerRuntimeProjectionTruthEligibilityAuditorTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/Career2786PublicResolutionPartitionPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/Career80TargetDeltaPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerCanonicalExpansionManifestTrainGeneratorTest.php` | locked, quality | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerLiveAcceptance1048CloseoutPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerBatchLiveAcceptanceV2AuditorTest.php` | locked, quality | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/Career80TotalLiveAcceptancePlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerProgressiveCohortDeltaPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerRuntimeArtifactRefreshPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerDeltaRolloutManifestPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerProgressiveLiveVerificationScalingPlannerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Domain/Career/Audit/CareerProgressiveCohortCloseoutPlannerTest.php` | locked, quality | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerJobDisplaySurfaceBuilderTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveIndexPolicyEngineTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFullReleaseLedgerServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/ClaimPermissionsCompilerTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerCrosswalkBacklogConvergenceServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveReleaseArtifactProjectionServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerCrosswalkReviewQueueServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/StrainRadarBuilderTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/FirstWaveReadinessSummaryServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/ConfidenceScoreCalculatorTest.php` | quality | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveDiscoverabilityManifestServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFamilyHubBundleBuilderTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveOccupationCompanionLinksServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerTrustFactReviewPolicyTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveLaunchReadinessAuditServiceTest.php` | locked, quality | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerStrongIndexEligibilityServiceTest.php` | locked | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerWhiteBoxScorePayloadBuilderTest.php` | locked | render_from_backend_when_present |
| `backend/tests/Unit/Services/Career/CanonicalRolloutGovernanceValidatorTest.php` | locked, quality | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerScoringTestCase.php` | quality, stability | authority_or_test_evidence |
| `backend/tests/Unit/Services/Career/CareerFirstWaveRolloutBundleArtifactMaterializationServiceTest.php` | locked | authority_or_test_evidence |

## Content package / bank JSON assets

| File | Bank | Item count | Answer count | Public payload policy | Norm policy |
| --- | --- | --- | --- | --- | --- |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_30_ORIGINAL/answer_key.json` | IQ_BETA_30_ORIGINAL | - | 30 | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_30_ORIGINAL/items.json` | IQ_BETA_30_ORIGINAL | 30 | - | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_30_ORIGINAL/manifest.json` | IQ_BETA_30_ORIGINAL | - | - | {"may_emit_items": true, "may_emit_answer_key": false, "may_emit_solution_rule": false, "may_emit_generator_metadata": false} | {"iq_claims_enabled": false, "percentile_claims_enabled": false, "population_norm_table_required_before_production": true} |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_30_ORIGINAL/scoring_spec.json` | IQ_BETA_30_ORIGINAL | - | - | "-" | {"iq_claims_enabled": false, "percentile_claims_enabled": false, "population_norm_table_required_before_production": true, "beta_copy_allowed_claim": "practice-style cognitive reasoning score only"} |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_50_ORIGINAL/answer_key.json` | IQ_BETA_50_ORIGINAL | - | 50 | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_50_ORIGINAL/items.json` | IQ_BETA_50_ORIGINAL | 50 | - | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_50_ORIGINAL/manifest.json` | IQ_BETA_50_ORIGINAL | - | - | {"may_emit_items": false, "may_emit_answer_key": false, "may_emit_solution_rule": false, "may_emit_generator_metadata": false} | {"iq_claims_enabled": false, "percentile_claims_enabled": false, "population_norm_table_required_before_production": true} |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_BETA_50_ORIGINAL/scoring_spec.json` | IQ_BETA_50_ORIGINAL | - | - | "-" | {"iq_claims_enabled": false, "percentile_claims_enabled": false, "population_norm_table_required_before_production": true, "beta_copy_allowed_claim": "practice-style cognitive reasoning score only"} |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_SHOWCASE_12_BETA/answer_key.json` | IQ_SHOWCASE_12_BETA | 12 | - | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_SHOWCASE_12_BETA/items.json` | IQ_SHOWCASE_12_BETA | 12 | - | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_SHOWCASE_12_BETA/manifest.json` | IQ_SHOWCASE_12_BETA | - | - | "-" | "-" |
| `content_packages/default/CN_MAINLAND/zh-CN/IQ_INTELLIGENCE_QUOTIENT-CN-v0.3.0-DEMO/banks/IQ_SHOWCASE_12_BETA/scoring_spec.json` | - | 12 | - | "-" | "-" |

## Missing backend fields for stronger result-page design

- `overall_band` and backend-owned performance band table for the overall score.
- `norm_version`, `population_reference`, `claim_eligible`, and `claim_policy` in the result/report payload consumed by frontend.
- Reviewed explanation copy for percentile, CI, score distribution, and online-estimate boundary.
- Dimension deep-dive copy and band tables for VSI/VSPR/NPR.
- Backend-owned report preview sections for free/deferred-commerce state.
- Delivery URLs/status for PDF and certificate, if policy allows.
