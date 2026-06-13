import { execFileSync } from "node:child_process";

const CURRENT_BRANCH = (() => {
  const githubBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (githubBranch) {
    return githubBranch;
  }

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
})();

const RIASEC_PACK12_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/analytics/conversion-setup-qa-checklist.md",
  "docs/analytics/generated/tracking-activation-contract.v1.json",
  "docs/analytics/tracking-activation-runbook.md",
  "lib/tracking/client.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/seo-funnel-tracking-taxonomy.contract.test.ts",
  "tests/contracts/tracking-activation-contract.contract.test.ts",
  "lib/riasec/resultAssembler.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/api-gateway-smoke-rollback-runbook.contract.test.ts",
  "tests/contracts/api-edge-gateway-backend-authority-contract.contract.test.ts",
  "tests/contracts/api-edge-gateway-hardening-quarantine-plan.contract.test.ts",
  "tests/contracts/public-api-authority-acceptance-gate.contract.test.ts",
  "tests/contracts/search-intelligence-data-contract.contract.test.ts",
  "tests/contracts/api-gateway-evidence-completion.contract.test.ts",
  "tests/contracts/cms-seo-middle-platform-final-architecture.contract.test.ts",
  "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
  "tests/contracts/riasec-public-ia.contract.test.ts",
  "tests/contracts/riasec-lifecycle-feedback-boundary.contract.test.tsx",
  "tests/contracts/fixtures/riasec/lifecycle-feedback-boundaries.projection.json",
]);

const RESEARCH_REPORT_METADATA_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/research/[slug]/page.tsx",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/seo/metadata.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/research-runtime-mvp.contract.test.tsx",
]);

const HELP_SERVICE_FAQ_SCHEMA_RUNTIME_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/help/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/content-pages.ts",
  "tests/contracts/cms-rich-content-sanitization.contract.test.tsx",
  "tests/contracts/help-faq-schema.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const HELP_PAGES_NOINDEX_RUNTIME_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/help/[slug]/page.tsx",
  "tests/contracts/help-pages-noindex-runtime.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const HELP_SERVICE_FAQ_SCHEMA_RUNTIME_R2_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/help-service-faq-schema-runtime-r2-01.v1.json",
  "docs/seo/help-service-faq-schema-runtime-r2-01.md",
  "tests/contracts/help-service-faq-schema-runtime-r2-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/support/page.tsx",
  "components/content-pages/ContentPageTemplate.tsx",
  "lib/cms/content-pages.ts",
  "tests/contracts/cms-rich-content-sanitization.contract.test.tsx",
  "tests/contracts/help-faq-schema.contract.test.ts",
  "tests/contracts/help-pages-noindex-runtime.contract.test.ts",
  "tests/contracts/help-support-contact-runtime-01.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ORDER_LOOKUP_RECOVERY_CONTRACT_STABILIZE_ALLOWED_FILES = new Set([
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/order-lookup-recovery.contract.test.tsx",
]);

const SEO_SITEMAP_STABILITY_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/seo/sitemapFallback.cjs",
  "next-sitemap.config.js",
  "scripts/seo/generate-sitemap.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-generation-fallback.contract.test.ts",
]);

const SEO_SITEMAP_STABILITY_03_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "package.json",
  "scripts/seo/assert-live-sitemap-stability.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-live-stability.contract.test.ts",
]);

const SEO_SITEMAP_STABILITY_04_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "scripts/deploy_web_pm2.sh",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_SITEMAP_DIFF_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/generated/sitemap-diff-report.v1.json",
  "docs/seo/sitemap_diff_report.md",
  "package.json",
  "scripts/seo/diff-sitemap-source-vs-live.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-source-live-diff-report.contract.test.ts",
]);

const SEO_SITEMAP_DIFF_04_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/generated/sitemap-diff-report.v1.json",
  "docs/seo/sitemap_diff_report.md",
  "package.json",
  "scripts/seo/diff-sitemap-source-vs-live.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-source-live-diff-report.contract.test.ts",
]);

const SEO_CONV_TRACKING_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/tracking/events.ts",
  "lib/tracking/privacy.ts",
  "lib/tracking/attribution.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-conv-tracking-contract.contract.test.ts",
  "tests/contracts/seo-funnel-tracking-taxonomy.contract.test.ts",
  "tests/contracts/tracking-activation-contract.contract.test.ts",
]);

const SEO_CONV_RUNTIME_03_ALLOWED_FILES = new Set([
  "app/api/track/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/analytics.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-conv-runtime-contract.contract.test.ts",
  "tests/contracts/tracking-whitelist.contract.test.ts",
]);

const ARTICLE_H1_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "components/content/AttributedSanitizedCmsHtml.tsx",
  "components/content/SanitizedCmsHtml.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/sanitizeCmsRichText.ts",
  "lib/content/renderSimpleMarkdown.tsx",
  "tests/contracts/cms-rich-content-sanitization.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ARTICLE_H1_03_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/article_h1_audit_report.md",
  "docs/seo/generated/article-h1-audit.v1.json",
  "scripts/seo/audit-article-h1.mjs",
  "tests/contracts/article-h1-audit.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ARTICLE_NOINDEX_SCHEMA_HREFLANG_HOLD_00_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "docs/seo/generated/article-personality-jsonld-projection-gates.v1.json",
  "tests/contracts/article-publishing-runtime-truth.contract.test.ts",
  "tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts",
  "tests/contracts/articles-cleanup.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ARTICLE_SCHEMA_HOLD_DECOUPLE_00_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "docs/seo/article-jsonld-fallback-authority.md",
  "docs/seo/generated/article-personality-jsonld-projection-gates.v1.json",
  "docs/seo/generated/discoverability-authority-matrix.v1.json",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/ARTICLE_SCHEMA_BACKWARD_COMPATIBILITY_REVIEW.md",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/ARTICLE_SCHEMA_HOLD_DECOUPLE_DESIGN.md",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/ARTICLE_SCHEMA_HOLD_IMPLEMENTATION_REPORT.md",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/ARTICLE_SCHEMA_HOLD_TEST_REPORT.md",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/ARTICLE_SCHEMA_RUNTIME_POLICY.md",
  "generated/seo-ops-article-schema-hold-decouple-pr-00/NEXT_INDEXABILITY_RELEASE_RERUN_INSTRUCTIONS.md",
  "lib/seo/articlePersonalityAuthority.ts",
  "tests/contracts/article-answer-surface.contract.test.ts",
  "tests/contracts/article-jsonld-fallback-authority.contract.test.ts",
  "tests/contracts/article-publishing-runtime-truth.contract.test.ts",
  "tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts",
  "tests/contracts/articles-cleanup.contract.test.ts",
  "tests/contracts/fixtures/seo-foundation/article-jsonld-fallback-authority.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ARTICLE_SCHEMA_GRANULAR_GATES_00_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "lib/seo/articleJsonLdAuthority.ts",
  "lib/seo/articlePersonalityAuthority.ts",
  "tests/contracts/article-answer-surface.contract.test.ts",
  "tests/contracts/article-jsonld-fallback-authority.contract.test.ts",
  "tests/contracts/article-publishing-runtime-truth.contract.test.ts",
  "tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts",
  "tests/contracts/fixtures/seo-foundation/article-jsonld-fallback-authority.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ARTICLE_HREFLANG_HOLD_DECOUPLE_00_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "lib/seo/articlePersonalityAuthority.ts",
  "tests/contracts/article-metadata-consumption-gate.contract.test.ts",
  "tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts",
  "tests/contracts/articles-cleanup.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_01_ALLOWED_FILES = new Set([
  "components/result/eq/EQResultV5.tsx",
  "components/result/eq/utils.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_EQ_PER_03_ALLOWED_FILES = new Set([
  "components/result/eq/EQEvidenceSnapshot.tsx",
  "components/result/eq/types.ts",
  "components/result/eq/utils.ts",
  "lib/api/v0_3.ts",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/e2e/iq-eq-result-regression.spec.ts",
  "tests/fixtures/eq/v5/eq60_v5_balanced_integrated_en.json",
  "tests/fixtures/eq/v5/eq60_v5_balanced_integrated_zh.json",
  "tests/fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_en.json",
  "tests/fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_zh.json",
  "tests/fixtures/eq/v5/eq60_v5_low_confidence_en.json",
  "tests/fixtures/eq/v5/eq60_v5_low_confidence_zh.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_EQ_SJT_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/EqSjtTakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
  "components/result/eq/EQSJTBridgeCTA.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/assessmentSlugMap.ts",
  "lib/rollout/scaleRollout.ts",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/scale-rollout.contract.test.ts",
  "tests/contracts/test-detail-landing.contract.test.ts",
  "tests/contracts/test-slug-aliases.contract.test.ts",
]);

const PR_WEB_SEC_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/research/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/research/reports.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/research-runtime-mvp.contract.test.tsx",
]);

const PR_WEB_SEC_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/seoCtaAttribution.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-take-flow-shared-quizstore.contract.test.tsx",
]);

const PR_WEB_SEC_04_ALLOWED_FILES = new Set([
  "app/api/track/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/attribution.ts",
  "lib/tracking/events.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/tracking-whitelist.contract.test.ts",
]);

const PR_WEB_SEC_05_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/api-edge-gateway-backend-authority-contract.md",
  "docs/seo/api-edge-gateway-hardening-quarantine-plan.md",
  "docs/seo/generated/api-edge-gateway-backend-authority-contract.v1.json",
  "docs/seo/generated/api-edge-gateway-hardening-quarantine-plan.v1.json",
  "tests/contracts/api-edge-gateway-backend-authority-contract.contract.test.ts",
  "tests/contracts/api-edge-gateway-hardening-quarantine-plan.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_06_ALLOWED_FILES = new Set([
  ".github/workflows/ci.yml",
  ".github/workflows/codeql.yml",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/ci-validator-hygiene.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_07_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/anon.ts",
  "tests/contracts/link-anon-login.contract.test.ts",
  "tests/contracts/providers-no-link-anon.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_08_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/big5-take-attempt-priming.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_09_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/riasec/api.ts",
  "tests/contracts/riasec-guest-token-parity.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_10_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/iq/result.ts",
  "tests/contracts/iq-report-module.contract.test.tsx",
  "tests/contracts/iq-result-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_11_ALLOWED_FILES = new Set([
  "docs/claims/generated/semantic-claim-scanner-baseline.v1.json",
  "docs/claims/semantic-claim-scanner-baseline.md",
  "docs/codex/pr-train-scb-state.json",
  "docs/codex/pr-train-scb.yaml",
  "docs/codex/pr-train-uasp2b-state.json",
  "docs/codex/pr-train-uasp2b.yaml",
  "docs/mbti-desktop-first-screen-convergence.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/semantic-claim-scanner-baseline.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_12_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/career/protocolReadiness.ts",
  "lib/seo/metadata.ts",
  "tests/contracts/career-claim-gate-render.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_13_ALLOWED_FILES = new Set([
  "app/not-found.tsx",
  "app/(root)/not-found.tsx",
  "app/(localized)/[locale]/not-found.tsx",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/not-found.contract.test.ts",
  "tests/contracts/root-not-found-layout.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_02_FOLLOWUP_NOTFOUND_RSC_PAYLOAD_CLEANUP_01_ALLOWED_FILES = new Set([
  "app/(root)/not-found.tsx",
  "app/(localized)/[locale]/not-found.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/not-found.contract.test.ts",
  "tests/contracts/root-not-found-layout.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_14_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "playwright.config.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/e2e/enneagram-phase1b-rendered-preview.spec.ts",
  "tests/e2e/enneagram-phase3b-1rd-partial-resonance-rendered-preview.spec.ts",
]);

const PR_WEB_SEC_15_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/big5/contracts/schemas.ts",
  "lib/big5/resultAssembler.ts",
  "tests/contracts/big5-result-assembler.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_16_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "scripts/deploy_web_pm2.sh",
  "scripts/staging_cms_baseline_smoke.sh",
  "scripts/validate-staging-cms-baseline.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/staging-cms-baseline-smoke.contract.test.ts",
]);

const PR_WEB_SEC_17_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "scripts/validate-staging-cms-baseline.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/staging-cms-baseline-validator.contract.test.ts",
]);

const PR_WEB_SEC_17A_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/staging-cms-baseline-validator.contract.test.ts",
]);

const PR_WEB_SEC_18_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "package.json",
  "scripts/check-cms-api-health.mjs",
  "tests/contracts/cms-api-environment.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_19_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/datasets/occupations/method/page.tsx",
  "components/datasets/DatasetMethodPanel.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/career/adapters/adaptCareerDatasetMethod.ts",
  "tests/contracts/dataset-method-links.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_20_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/rollout/scaleRollout.ts",
  "tests/contracts/scale-rollout.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_21_ALLOWED_FILES = new Set([
  "components/design/AnimatedCounter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/animated-counter.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);


const IQ_CMS_MEDIA_02_ALLOWED_FILES = new Set([
  "components/marketing/CmsMediaAuthorityShell.tsx",
  "components/marketing/HomePageExperience.tsx",
  "components/marketing/tests/TestsFamilyExplorer.tsx",
  "components/marketing/tests/TestsHubExperience.tsx",
  "components/marketing/tests/TestsShared.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/media.ts",
  "lib/marketing/homepageContent.ts",
  "lib/marketing/testsHubContent.ts",
  "tests/contracts/fixtures/cmsLandingSurfaceMock.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-cms-media-rendering-guard.contract.test.tsx",
  "tests/contracts/media-asset-contract.test.tsx",
]);

const IQ_PAID_REPORT_02_ALLOWED_FILES = new Set([
  "components/result/iq/IqReportModule.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/iq/result.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-report-module.contract.test.tsx",
]);

const IQ_SEO_RAMP_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/seo/backendTestDiscoverabilitySource.ts",
  "lib/seo/iqSeoRampAuthority.ts",
  "lib/seo/testDetailAuthority.ts",
  "next-sitemap.config.js",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-claim-seo-launch-guard.contract.test.ts",
  "tests/contracts/iq-seo-ramp-indexation-gate.contract.test.ts",
  "tests/contracts/llms-test-authority.contract.test.ts",
]);

const IQ_LIVE_RAMP_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "scripts/iq/iq-launch-readiness-smoke.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-launch-readiness-smoke.contract.test.ts",
]);

const IQ_RELEASE_01_ALLOWED_FILES = new Set([
  "docs/audits/iq-fe/20_iq_production_launch_readiness_ledger.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-release-readiness-ledger.contract.test.ts",
]);

const PR_WEB_SEC_22_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/api-client.ts",
  "lib/api/v0_3.ts",
  "tests/contracts/result-client-view-state.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_PDF_PRINT_PRIVATE_URL_GUARD_01_ALLOWED_FILES = new Set([
  "components/big5/pdf/PdfDownloadButton.tsx",
  "components/result/big5/Big5ResultShell.tsx",
  "components/result/enneagram/EnneagramResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/big5-shell-polish.contract.test.tsx",
  "tests/contracts/enneagram-pdf-surface.contract.test.tsx",
  "tests/contracts/rich-result-report.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_DEBUG_FIELD_SUPPRESSION_01_ALLOWED_FILES = new Set([
  "components/big5/report/BlockRenderer.tsx",
  "components/big5/report/SectionRenderer.tsx",
  "components/result/riasec/RiasecResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/big5-section-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-trusted-result-shell.contract.test.tsx",
]);

const RESULT_OBJECT_RENDER_GUARD_01_ALLOWED_FILES = new Set([
  "components/result/enneagram/EnneagramResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/enneagram-result-shell.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_PRIVATE_PRINT_STYLES_AND_FOOTER_GATE_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/page.tsx",
  "app/globals.css",
  "components/layout/SiteFooter.tsx",
  "components/layout/SiteHeader.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-print-chrome.contract.test.ts",
]);

const RESULT_LEAK_CONTRACT_TESTS_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-leak-regressions.contract.test.ts",
]);

const RESULT_PRINT_PRIVATE_URL_REDACTION_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/result/privatePrintUrlRedaction.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-leak-regressions.contract.test.ts",
  "tests/contracts/result-print-url-redaction.contract.test.ts",
]);

const RESULT_PRIVATE_PRINT_CHROME_GATE_HARDEN_02_ALLOWED_FILES = new Set([
  "app/globals.css",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-leak-regressions.contract.test.ts",
  "tests/contracts/result-private-print-chrome.contract.test.ts",
]);

const RESULT_BIG5_INTERNAL_METHOD_DEBUG_SUPPRESSION_02_ALLOWED_FILES = new Set([
  "components/big5/report/BlockRenderer.tsx",
  "components/big5/report/SectionRenderer.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/big5-section-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_RIASEC_DEBUG_LABEL_SUPPRESSION_02_ALLOWED_FILES = new Set([
  "components/result/riasec/RiasecResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-trusted-result-shell.contract.test.tsx",
]);

const RESULT_OBJECT_AND_PDF_LEAK_CONTRACT_EXPANSION_02_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-leak-regressions.contract.test.ts",
]);

const PR_WEB_SEC_23_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/big5/resultAssembler.ts",
  "lib/big5/sectionBlueprint.ts",
  "tests/contracts/big5-norms-comparison.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_24_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/quiz/store.tsx",
  "tests/contracts/mbti-desktop-storage-cutover.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_25_ALLOWED_FILES = new Set([
  "components/result/mbti/clone/MbtiDesktopCloneShell.tsx",
  "components/result/mbti/MbtiResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/mbti-desktop-shell-cta.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_26_ALLOWED_FILES = new Set([
  "components/result/RichResultReport.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/api/v0_3.ts",
  "lib/mbti/publicProjection.ts",
  "tests/contracts/mbti-share-consumer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const MBTI_RESULT_DESKTOP_CLONE_STORAGE_HYDRATION_01_ALLOWED_FILES = new Set([
  "components/result/mbti/MbtiResultShell.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/mbti-shell-ui.contract.test.tsx",
  "tests/contracts/rich-result-report.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const TAKE_FRONTEND_LOCALE_CONTRACT_04_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-take-attribution.contract.test.tsx",
  "tests/contracts/take-frontend-locale-contract.contract.test.ts",
]);

const TEST_KPI_FRONTEND_CONTRACT_06_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/EnneagramTakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "lib/tracking/testKpiMetadata.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/take-frontend-locale-contract.contract.test.ts",
  "tests/contracts/test-kpi-frontend-contract.contract.test.ts",
]);

const SCOPE_GUARD_CONTRACT_POSTMERGE_FIX_ALLOWED_FILES = new Set([
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/test-kpi-frontend-contract.contract.test.ts",
]);

const PR_WEB_SEC_27_ALLOWED_FILES = new Set([
  "components/layout/SiteFooter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/site-footer-social.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_28_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/take-submit-lockout.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_29_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/client.ts",
  "lib/tracking/events.ts",
  "tests/contracts/tracking-whitelist.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_30_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/deploy/502-recovery-runbook.md",
  "tests/contracts/deploy-runbook-redaction.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_WEB_SEC_31_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/clinical-consent-gates.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ANALYTICS_SEO_P0_04_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx",
  "app/(localized)/[locale]/orders/[orderNo]/page.tsx",
  "app/(localized)/[locale]/share/[id]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/privacy.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/orders-client-delivery.contract.test.tsx",
  "tests/contracts/robots.contract.test.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
]);

const ANALYTICS_SEO_P0_01_ALLOWED_FILES = new Set([
  "docs/analytics/generated/tracking-activation-contract.v1.json",
  "docs/analytics/tracking-activation-runbook.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/client.ts",
  "lib/tracking/events.ts",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-funnel-unlock-observability.contract.test.ts",
  "tests/contracts/seo-funnel-tracking-taxonomy.contract.test.ts",
  "tests/contracts/tracking-activation-contract.contract.test.ts",
]);

const ANALYTICS_SEO_P0_05_ALLOWED_FILES = new Set([
  "docs/analytics/tracking-activation-runbook.md",
  "docs/analytics/utm-channel-governance.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/utmGovernance.ts",
  "lib/ui/footerSocialIcons.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/site-footer-social.contract.test.tsx",
  "tests/contracts/utm-continuity.contract.test.ts",
]);

const COMMERCIAL_CONTRACTS_FOUNDATION_01_ALLOWED_FILES = new Set([
  "docs/analytics/commercial-events-business-dictionary.md",
  "docs/analytics/utm-channel-governance.md",
  "docs/analytics/generated/commercial-readiness-contracts.v1.json",
  "docs/operations/freemium-locale-policy-spec.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

export function isCommercialContractsFoundation01AllowedFile(file: string): boolean {
  return COMMERCIAL_CONTRACTS_FOUNDATION_01_ALLOWED_FILES.has(file);
}

const TEST_LANDING_PROOF_SURFACE_01_ALLOWED_FILES = new Set([
  "docs/seo/test-landing-proof-surfaces.md",
  "docs/seo/generated/test-landing-proof-surfaces.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/test-landing-proof-surfaces.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

export function isTestLandingProofSurface01AllowedFile(file: string): boolean {
  return TEST_LANDING_PROOF_SURFACE_01_ALLOWED_FILES.has(file);
}

const HELP_CONTENT_INVENTORY_01_ALLOWED_FILES = new Set([
  "docs/operations/help-content-inventory.md",
  "docs/operations/generated/help-content-inventory.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/help-content-inventory.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

export function isHelpContentInventory01AllowedFile(file: string): boolean {
  return HELP_CONTENT_INVENTORY_01_ALLOWED_FILES.has(file);
}

const ANALYTICS_COMMERCIAL_EVENTS_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx",
  "docs/analytics/commercial-events-business-dictionary.md",
  "docs/analytics/utm-channel-governance.md",
  "docs/analytics/generated/commercial-readiness-contracts.v1.json",
  "docs/analytics/generated/tracking-activation-contract.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/operations/freemium-locale-policy-spec.md",
  "lib/tracking/client.ts",
  "lib/tracking/events.ts",
  "tests/contracts/analytics-commercial-events-runtime.contract.test.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-funnel-unlock-observability.contract.test.ts",
  "tests/contracts/orders-client-delivery.contract.test.tsx",
  "tests/contracts/search-intelligence-tracking-fields.contract.test.ts",
  "tests/contracts/seo-funnel-tracking-taxonomy.contract.test.ts",
  "tests/contracts/tracking-activation-contract.contract.test.ts",
  "tests/contracts/tracking-whitelist.contract.test.ts",
]);

const CONTRACT_SCOPE_GUARD_MAIN_CI_FIX_ALLOWED_FILES = new Set([
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue.contract.test.ts",
]);

const ANALYTICS_SEO_P1_08_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/analytics-seo-metadata-sitemap-canonical.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ANALYTICS_SEO_P1_06_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "components/tests/MbtiLandingSurfaceSections.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-landing-structure.contract.test.tsx",
]);

const ANALYTICS_SEO_P1_07_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "components/tests/RiasecLandingSurfaceSections.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-landing-structure.contract.test.tsx",
]);

const ANALYTICS_SEO_P0_10_ALLOWED_FILES = new Set([
  "components/analytics/AnalyticsScripts.tsx",
  "docs/analytics/internal-traffic-referral-governance.md",
  "docs/audits/analytics-seo-postmerge-audit.md",
  "docs/codex/pr-train-state.json",
  "lib/seo/noindex.ts",
  "lib/tracking/browserAnalyticsSuppression.ts",
  "lib/tracking/internalTraffic.ts",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/tracking-activation-contract.contract.test.ts",
]);

const PRIVATE_ANALYTICS_SHARE_METADATA_HARDENING_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/share/[id]/page.tsx",
  "components/analytics/AnalyticsScripts.tsx",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-share-consumer.contract.test.tsx",
  "tests/contracts/robots.contract.test.ts",
]);

const ANALYTICS_SEO_P0_12_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/layout.tsx",
  "components/analytics/AnalyticsScripts.tsx",
  "docs/analytics/internal-traffic-referral-governance.md",
  "docs/analytics/tracking-activation-runbook.md",
  "docs/audits/analytics-seo-private-html-hardening.md",
  "lib/tracking/browserAnalyticsSuppression.ts",
  "next.config.mjs",
  "proxy.ts",
  "tests/contracts/analytics-scripts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/private-noindex.contract.test.ts",
  "tests/contracts/proxy-boundary.contract.test.ts",
]);

const PR_WEB_SEC_32_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "proxy.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/proxy-boundary.contract.test.ts",
  "tests/contracts/scale-rollout.contract.test.ts",
]);

const PR_WEB_SEC_33_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/preview-fixture-validation.contract.test.ts",
  "tests/e2e/enneagram-phase1b-rendered-preview.spec.ts",
  "tests/e2e/enneagram-phase3b-1rd-partial-resonance-rendered-preview.spec.ts",
]);

const SEO_OPERATIONS_DASHBOARD_SHELL_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/ops/seo-operations/page.tsx",
  "components/ops/seo/IssueQueueTable.tsx",
  "components/ops/seo/SeoOperationsDashboard.tsx",
  "components/ops/seo/mockSeoOperations.ts",
  "components/ops/shared/DataTable.tsx",
  "components/ops/shared/FilterBar.tsx",
  "components/ops/shared/KpiCard.tsx",
  "components/ops/shared/OpsHeader.tsx",
  "components/ops/shared/OpsShell.tsx",
  "components/ops/shared/OpsSidebar.tsx",
  "components/ops/shared/SegmentedControl.tsx",
  "components/ops/shared/StatusBadge.tsx",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_CMS_CANARY_WEB_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "components/content/AnswerSurfaceSection.tsx",
  "components/cta/SeoTrackedCtaLink.tsx",
  "docs/analytics/conversion-setup-qa-checklist.md",
  "docs/analytics/seo-cta-attribution.md",
  "docs/analytics/tracking-activation-runbook.md",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/articles.ts",
  "lib/landing/landingSurface.ts",
  "lib/tracking/client.ts",
  "lib/tracking/events.ts",
  "lib/tracking/seoCtaAttribution.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-cms-canary-web01-article-to-test-click.contract.test.tsx",
  "tests/contracts/seo-page-cta-attribution.contract.test.ts",
]);

const PR_AUDIT_FE_01_ALLOWED_FILES = new Set([
  ".github/workflows/ci.yml",
  "components/career/CareerShortlistAction.tsx",
  "components/cta/SeoTrackedCtaLink.tsx",
  "components/design/AnimatedCounter.tsx",
  "components/result/mbti/clone/MbtiCloneAssetSlot.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "ecosystem.config.cjs",
  "lib/cms/last-known-good.ts",
  "tests/contracts/big5-pilot-payload-only-renderer.contract.test.tsx",
  "tests/contracts/big5-public-pilot-result-page.contract.test.tsx",
  "tests/contracts/cms-seo-middle-platform-final-architecture.contract.test.ts",
  "tests/contracts/enneagram-asset-backed-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
]);

const PR_AUDIT_FE_02_ALLOWED_FILES = new Set([
  "deploy/nginx/fap-web.conf",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "next.config.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/private-noindex.contract.test.ts",
  "tests/contracts/security-headers.contract.test.ts",
]);

const PR_AUDIT_FE_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/commerce/pendingOrder.ts",
  "tests/contracts/alipay-return-flow.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/order-lookup-recovery.contract.test.tsx",
  "tests/contracts/orders-client-delivery.contract.test.tsx",
  "tests/contracts/payment-wait-flow.contract.test.ts",
  "tests/e2e/alipay-return-recovery.spec.ts",
  "tests/e2e/order-lookup-recovery.spec.ts",
  "tests/e2e/payment-wait-flow.spec.ts",
]);

const CODEQL_HYGIENE_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx",
  "app/api/content-release/revalidate/route.ts",
  "components/personality/ScenarioIntelligenceMatrix.tsx",
  "components/result/mbti/clone/MbtiDesktopCloneShell.tsx",
  "lib/big5/resultAssembler.ts",
  "lib/cms/career-guides.ts",
  "lib/tracking/seoCtaAttribution.ts",
  "next-sitemap.config.js",
  "scripts/seo/detect-internal-link-orphans.mjs",
  "tests/contracts/article-metadata-consumption-gate.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-full-content-freeze.contract.test.tsx",
  "tests/e2e/big5-flow.spec.ts",
]);

const DISCOVERABILITY_STAGING_META_NOINDEX_FIX_02_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/seo/metadata.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/staging-discoverability-containment.contract.test.ts",
]);

const SEARCH_CHANNEL_LIVE_ZH_MBTI_01A_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/search-channel-live-zh-mbti-01a-indexnow-keylocation-fix.v1.json",
  "docs/seo/search-channel-live-zh-mbti-01a-indexnow-keylocation-fix.md",
  "public/8d59565935303aad72c5eb0ec5bfa42e.txt",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/indexnow-keylocation.contract.test.ts",
]);

const EN_PARITY_08_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "components/marketing/HomePageExperience.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/en-parity-08-visual-overflow.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/e2e/en-parity-08-overflow.spec.ts",
]);

const GLOBAL_EN_ZH_PARITY_P0_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/seo/sitemapAuthorityAdapters.cjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-full-enrichment.contract.test.ts",
  "tests/contracts/llms-url-hygiene.contract.test.ts",
  "tests/contracts/sitemap-authority-adapters.contract.test.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
  "tests/contracts/sitemap-llms-lastmod-authority.contract.test.ts",
]);

const PR_03_DISCOVERABILITY_SITEMAP_LLMS_AUTHORITY_ALIGNMENT_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/seo/sitemapAuthorityAdapters.cjs",
  "next-sitemap.config.js",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-full-enrichment.contract.test.ts",
  "tests/contracts/llms-url-hygiene.contract.test.ts",
  "tests/contracts/global-en-zh-content-pages-llms-exposure-repair-01.contract.test.ts",
  "tests/contracts/sitemap-authority-adapters.contract.test.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
  "tests/contracts/sitemap-llms-lastmod-authority.contract.test.ts",
]);

const PR_03_FOLLOWUP_LLMS_CONTENT_PAGE_DETAIL_AUTHORITY_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/content-pages.ts",
  "tests/contracts/career-llms-alignment.contract.test.ts",
  "tests/contracts/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.contract.test.ts",
  "tests/contracts/detail-ready-1046-discoverability-exposure-repair-01.contract.test.ts",
  "tests/contracts/detail-ready-1046-llms-full-artifact-consistency-repair-01.contract.test.ts",
  "tests/contracts/global-en-zh-content-pages-llms-exposure-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-full-enrichment.contract.test.ts",
  "tests/contracts/llms-parity-contract.contract.test.ts",
  "tests/contracts/llms-url-hygiene.contract.test.ts",
  "tests/contracts/public-surface-lkg-coverage.contract.test.ts",
]);

const GLOBAL_EN_ZH_FOOTER_NAV_PARITY_01_ALLOWED_FILES = new Set([
  "components/layout/SiteFooter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/navigation/headerDropdownMenus.ts",
  "tests/contracts/global-en-zh-footer-nav-parity.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/site-footer-routing.contract.test.tsx",
]);

const GLOBAL_EN_ZH_FOOTER_NAV_PARITY_02_ALLOWED_FILES = new Set([
  "components/layout/SiteFooter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/global-en-zh-footer-nav-parity.contract.test.tsx",
  "tests/contracts/global-ui-i18n-batch-08.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/site-footer-routing.contract.test.tsx",
]);

const GLOBAL_EN_ZH_GLOBAL_UI_I18N_BATCH_08_ALLOWED_FILES = new Set([
  "components/layout/SiteFooter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/i18n/locales/en.ts",
  "lib/i18n/locales/zh.ts",
  "lib/i18n/types.ts",
  "tests/contracts/global-ui-i18n-batch-08.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const GLOBAL_EN_ZH_CONTENT_PAGES_FRONTEND_RUNTIME_REPAIR_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/api-base.ts",
  "tests/contracts/api-proxy-routing.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const OPS_API_PUBLIC_TLS_PATH_FIX_01A_FRONTEND_SAME_ORIGIN_FOUNDATION_API_PROXY_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "next.config.mjs",
  "tests/contracts/api-proxy-routing.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PR_FDN_02B_DAILY_GIVING_FRONTEND_PAGES_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/foundation/daily-giving/page.tsx",
  "app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx",
  "components/foundation/DailyGivingLedgerPage.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/foundation/dailyGiving.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-02b-daily-giving-frontend-pages.contract.test.tsx",
]);

export function isPrFdn02bDailyGivingFrontendPagesAllowedFile(file: string): boolean {
  return PR_FDN_02B_DAILY_GIVING_FRONTEND_PAGES_ALLOWED_FILES.has(file);
}

const DAILY_GIVING_PROOF_PUBLIC_URL_FRONTEND_ADAPTER_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/foundation/dailyGiving.ts",
  "tests/contracts/daily-giving-proof-public-url-frontend-adapter-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

export function isDailyGivingProofPublicUrlFrontendAdapter01AllowedFile(file: string): boolean {
  return DAILY_GIVING_PROOF_PUBLIC_URL_FRONTEND_ADAPTER_01_ALLOWED_FILES.has(file);
}

const PR_FDN_02B_POST_DEPLOY_RUNTIME_SMOKE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-02b-post-deploy-runtime-smoke.v1.json",
  "docs/seo/pr-fdn-02b-post-deploy-runtime-smoke.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-02b-post-deploy-runtime-smoke.contract.test.ts",
]);

export function isPrFdn02bPostDeployRuntimeSmokeAllowedFile(file: string): boolean {
  return PR_FDN_02B_POST_DEPLOY_RUNTIME_SMOKE_ALLOWED_FILES.has(file);
}

const PR_FDN_SEO_01_READINESS_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-seo-01-readiness.v1.json",
  "docs/seo/pr-fdn-seo-01-readiness.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-seo-01-readiness.contract.test.ts",
]);

export function isPrFdnSeo01ReadinessAllowedFile(file: string): boolean {
  return PR_FDN_SEO_01_READINESS_ALLOWED_FILES.has(file);
}

const PERSONALITY_SEO_CURRENT_AUDIT_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/personality-seo-current-audit-01.v1.json",
  "docs/seo/personality-seo-current-audit-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-seo-current-audit-01.contract.test.ts",
]);

export function isPersonalitySeoCurrentAudit01AllowedFile(file: string): boolean {
  return PERSONALITY_SEO_CURRENT_AUDIT_01_ALLOWED_FILES.has(file);
}

const PR_FDN_SEO_01_IMPLEMENTATION_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/foundation/daily-giving/page.tsx",
  "app/(localized)/[locale]/foundation/daily-giving/[yearMonth]/page.tsx",
  "app/llms.txt/route.ts",
  "app/llms-full.txt/route.ts",
  "lib/foundation/dailyGivingSeo.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "docs/seo/generated/pr-fdn-seo-01-implementation.v1.json",
  "docs/seo/pr-fdn-seo-01-implementation.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-02b-daily-giving-frontend-pages.contract.test.tsx",
  "tests/contracts/pr-fdn-seo-01-implementation.contract.test.ts",
]);

export function isPrFdnSeo01ImplementationAllowedFile(file: string): boolean {
  return PR_FDN_SEO_01_IMPLEMENTATION_ALLOWED_FILES.has(file);
}

const PR_FDN_SEO_01_POST_DEPLOY_SMOKE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-seo-01-post-deploy-smoke.v1.json",
  "docs/seo/pr-fdn-seo-01-post-deploy-smoke.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-seo-01-post-deploy-smoke.contract.test.ts",
]);

export function isPrFdnSeo01PostDeploySmokeAllowedFile(file: string): boolean {
  return PR_FDN_SEO_01_POST_DEPLOY_SMOKE_ALLOWED_FILES.has(file);
}

const PR_FDN_SOCIAL_LINK_DISPLAY_REVIEW_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-social-link-display-review-01.v1.json",
  "docs/seo/pr-fdn-social-link-display-review-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-social-link-display-review-01.contract.test.ts",
]);

export function isPrFdnSocialLinkDisplayReview01AllowedFile(file: string): boolean {
  return PR_FDN_SOCIAL_LINK_DISPLAY_REVIEW_01_ALLOWED_FILES.has(file);
}

const PR_FDN_SOCIAL_LINK_DISPLAY_IMPLEMENTATION_01_ALLOWED_FILES = new Set([
  "components/foundation/DailyGivingLedgerPage.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-social-link-display-implementation-01.v1.json",
  "docs/seo/pr-fdn-social-link-display-implementation-01.md",
  "lib/foundation/dailyGiving.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-social-link-display-implementation-01.contract.test.tsx",
]);

export function isPrFdnSocialLinkDisplayImplementation01AllowedFile(file: string): boolean {
  return PR_FDN_SOCIAL_LINK_DISPLAY_IMPLEMENTATION_01_ALLOWED_FILES.has(file);
}

const LEGACY_SEO_RECONCILIATION_SCAN_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/legacy-seo-reconciliation-scan.v1.json",
  "docs/seo/legacy-seo-reconciliation-scan.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/legacy-seo-reconciliation-scan.contract.test.ts",
]);

export function isLegacySeoReconciliationScanAllowedFile(file: string): boolean {
  return LEGACY_SEO_RECONCILIATION_SCAN_ALLOWED_FILES.has(file);
}

const GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_READINESS_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/global-en-zh-content-pages-discoverability-exposure-readiness-01.md",
  "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-readiness-01.v1.json",
  "tests/contracts/global-en-zh-content-pages-discoverability-exposure-readiness-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_IMPLEMENTATION_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "components/layout/SiteFooter.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/global-en-zh-content-pages-discoverability-exposure-implementation-01.md",
  "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-implementation-01.v1.json",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/seo/cmsRoutePolicy.cjs",
  "lib/seo/sitemapAuthorityAdapters.cjs",
  "next-sitemap.config.js",
  "tests/contracts/global-en-zh-content-pages-discoverability-exposure-implementation-01.contract.test.tsx",
  "tests/contracts/global-en-zh-footer-nav-parity.contract.test.tsx",
  "tests/contracts/global-ui-i18n-batch-08.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/site-footer-routing.contract.test.tsx",
  "tests/contracts/sitemap-indexability.contract.test.ts",
]);

export function isGlobalEnZhContentPagesDiscoverabilityExposureImplementation01AllowedFile(file: string): boolean {
  return GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_IMPLEMENTATION_01_ALLOWED_FILES.has(file);
}

const GLOBAL_EN_ZH_CONTENT_PAGES_LLMS_EXPOSURE_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/global-en-zh-content-pages-llms-exposure-repair-01.md",
  "docs/seo/generated/global-en-zh-content-pages-llms-exposure-repair-01.v1.json",
  "lib/cms/content-pages.ts",
  "tests/contracts/career-llms-alignment.contract.test.ts",
  "tests/contracts/global-en-zh-content-pages-llms-exposure-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-full-enrichment.contract.test.ts",
  "tests/contracts/llms-parity-contract.contract.test.ts",
]);

const SCIENCE_CONTENTPAGE_DISCOVERABILITY_RUNTIME_ALLOWED_FILES = new Set([
  "lib/cms/content-pages.ts",
  "next-sitemap.config.js",
  "public/sitemap.xml",
  "tests/contracts/global-en-zh-content-pages-llms-exposure-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
]);

const PR_FDN_01_LLMS_FULL_RECHECK_OR_REPAIR_ALLOWED_FILES = new Set([
  "app/api/content-release/revalidate/route.ts",
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/pr-fdn-01-llms-full-recheck-or-repair.v1.json",
  "docs/seo/pr-fdn-01-llms-full-recheck-or-repair.md",
  "lib/seo/llmsFullResponseCache.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/pr-fdn-01-llms-full-recheck-or-repair.contract.test.ts",
]);

const DETAIL_READY_1046_FRONTEND_METADATA_REVALIDATION_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/detail-ready-1046-frontend-metadata-revalidation-01.md",
  "docs/seo/generated/detail-ready-1046-frontend-metadata-revalidation-01.v1.json",
  "tests/contracts/career-claim-gate-render.contract.test.tsx",
  "tests/contracts/detail-ready-1046-frontend-metadata-revalidation-01.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const DETAIL_READY_1046_DISCOVERABILITY_EXPOSURE_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/detail-ready-1046-discoverability-exposure-repair-01.md",
  "docs/seo/generated/detail-ready-1046-discoverability-exposure-repair-01.v1.json",
  "lib/seo/backendSitemapSource.ts",
  "lib/seo/llmsRouteBudget.ts",
  "next-sitemap.config.js",
  "tests/contracts/career-llms-alignment.contract.test.ts",
  "tests/contracts/detail-ready-1046-discoverability-exposure-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
]);

const DETAIL_READY_1046_CAREER_DETAIL_METADATA_AND_LLMS_FULL_STABILITY_REPAIR_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.md",
  "docs/seo/generated/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.v1.json",
  "lib/seo/llmsRouteBudget.ts",
  "tests/contracts/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
]);

const DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/detail-ready-1046-llms-full-artifact-consistency-repair-01.md",
  "docs/seo/generated/detail-ready-1046-llms-full-artifact-consistency-repair-01.v1.json",
  "lib/seo/llmsFullResponseCache.ts",
  "tests/contracts/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.contract.test.ts",
  "tests/contracts/detail-ready-1046-llms-full-artifact-consistency-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
]);

const CAREER_1046_FRONTEND_DISCOVERY_UX_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/page.tsx",
  "components/career/CareerOccupationDirectory.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-1046-frontend-discovery-ux-01.md",
  "docs/seo/generated/career-1046-frontend-discovery-ux-01.v1.json",
  "lib/career/datasetDirectory.ts",
  "tests/contracts/career-1046-frontend-discovery-ux-01.contract.test.tsx",
  "tests/contracts/career-jobs-search-ux.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_JOBS_PAGINATED_DIRECTORY_SHELL_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-jobs-paginated-directory-shell-01.md",
  "docs/seo/generated/career-jobs-paginated-directory-shell-01.v1.json",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/career/adapters/adaptCareerDirectory.ts",
  "lib/career/api/fetchCareerDirectory.ts",
  "lib/career/api/types.ts",
  "tests/contracts/career-1046-frontend-discovery-ux-01.contract.test.tsx",
  "tests/contracts/career-job-index-backend.contract.test.tsx",
  "tests/contracts/career-jobs-cms.contract.test.tsx",
  "tests/contracts/career-jobs-search-ux.contract.test.tsx",
  "tests/contracts/career-launch-smoke.contract.test.ts",
  "tests/contracts/career-search-backend.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/schema-present.contract.test.ts",
]);

const CAREER_LLMS_DIRECTORY_SITEMAP_AUTHORITY_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-llms-directory-sitemap-authority-01.md",
  "docs/seo/generated/career-llms-directory-sitemap-authority-01.v1.json",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/seo/backendSitemapSource.ts",
  "tests/contracts/career-llms-alignment.contract.test.ts",
  "tests/contracts/detail-ready-1046-discoverability-exposure-repair-01.contract.test.ts",
  "tests/contracts/fixtures/discoverability-foundation/cms-seo-completeness-matrix.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
  "tests/contracts/llms-url-hygiene.contract.test.ts",
]);

const CAREER_DIRECTORY_PRODUCTION_CONSUMPTION_REPAIR_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-directory-production-consumption-repair-01.md",
  "docs/seo/generated/career-directory-production-consumption-repair-01.v1.json",
  "next.config.mjs",
  "tests/contracts/career-job-index-backend.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_LLMS_TXT_DIRECTORY_URL_EXPOSURE_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-llms-txt-directory-url-exposure-repair-01.md",
  "docs/seo/generated/career-llms-txt-directory-url-exposure-repair-01.v1.json",
  "tests/contracts/career-llms-txt-directory-url-exposure-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_DETAIL_P95_LATENCY_SCAN_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-detail-p95-latency-scan-01.md",
  "docs/seo/generated/career-detail-p95-latency-scan-01.v1.json",
  "tests/contracts/career-detail-p95-latency-scan-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_DETAIL_CACHE_BUDGET_REPAIR_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
  "lib/career/api/fetchCareerJobBundle.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-detail-cache-budget-repair-01.md",
  "docs/seo/generated/career-detail-cache-budget-repair-01.v1.json",
  "tests/contracts/career-detail-cache-budget-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_LLMS_FULL_10K_BUDGET_GATE_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-llms-full-10k-budget-gate-01.md",
  "docs/seo/generated/career-llms-full-10k-budget-gate-01.v1.json",
  "tests/contracts/career-llms-full-10k-budget-gate-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_DIRECTORY_UX_FACETS_PARITY_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/page.tsx",
  "components/career/CareerOccupationDirectory.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/career-directory-ux-facets-parity-01.md",
  "docs/seo/generated/career-directory-ux-facets-parity-01.v1.json",
  "tests/contracts/career-directory-ux-facets-parity-01.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const COOKIE_BANNER_HYDRATION_01_ALLOWED_FILES = new Set([
  "components/legal/CookieBanner.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/cookie-banner-gate.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_EMAIL_LOOKUP_TOKEN_OPEN_04_ALLOWED_FILES = new Set([
  "components/support/ResultEmailLookupForm.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/result-email-lookup.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_EMAIL_FIRST_BINDING_UX_05_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "lib/api/v0_3.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/result-client-view-state.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PAYMENT_WAIT_PAID_REDIRECT_CONTRACT_06_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/orders/[orderNo]/OrdersClient.tsx",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/orders-client-delivery.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_READINESS_TEST_FIX_ALLOWED_FILES = new Set([
  "tests/contracts/global-en-zh-content-pages-discoverability-exposure-readiness-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const FRONTEND_CI_BUILD_TIMEOUT_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/professions/[code]/page.tsx",
  "lib/cms/career-guides.ts",
  "tests/contracts/career-guides-cms.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/public-api-cache.contract.test.ts",
]);

const SEO_SITEMAP_P0_05_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/operations/sitemap-url-policy-decision-2026-06-02.md",
  "docs/seo/generated/url-inventory.v1.csv",
  "docs/seo/generated/url-inventory.v1.json",
  "docs/seo/url-inventory-governance.md",
  "tests/contracts/core-topic-graph-inventory.contract.test.ts",
  "tests/contracts/duplicate-seo-entities.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/internal-link-orphan-detector.contract.test.ts",
  "tests/contracts/sitemap-url-policy-decision.contract.test.ts",
]);

const SITEMAP_FRONTEND_CONVERGENCE_ALLOWED_FILES = new Set([
  "public/sitemap.xml",
  "scripts/seo/check-sitemap-indexability.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/sitemap-indexability.contract.test.ts",
  "tests/contracts/url-inventory-generator.contract.test.ts",
]);

const RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES = new Set([
  "docs/seo/generated/riasec-v2-post-publish-smoke-02.v1.json",
  "docs/seo/riasec-v2-post-publish-smoke-02.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-v2-post-publish-smoke-02.contract.test.ts",
]);

const RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES = new Set([
  "docs/seo/generated/riasec-v2-search-submission-preflight-01.v1.json",
  "docs/seo/riasec-v2-search-submission-preflight-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-v2-search-submission-preflight-01.contract.test.ts",
]);

const HOMEPAGE_UI_IMAGE_FALLBACK_01_ALLOWED_FILES = new Set([
  "components/content/ArticleResponsiveImage.tsx",
  "components/layout/SiteFooter.tsx",
  "components/marketing/HomePageExperience.tsx",
  "tests/contracts/article-responsive-image-fallback.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/homepage-recommended-articles-block.contract.test.ts",
  "tests/contracts/homepage-v1-density.contract.test.tsx",
  "tests/contracts/homepage-v1-hero.contract.test.tsx",
  "tests/contracts/media-asset-contract.test.tsx",
  "tests/contracts/navigation-dead-links.contract.test.ts",
]);

const BACKEND_RUNTIME_02D_RECONCILE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/cms-seo-middle-platform-final-architecture.md",
  "docs/seo/generated/cms-seo-middle-platform-final-architecture.v1.json",
  "tests/contracts/cms-seo-middle-platform-final-architecture.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CMS_OPS_IA_00_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/operations/cms-ops-ia-permission-matrix.md",
  "docs/operations/generated/cms-ops-ia-permission-matrix.v1.json",
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CMS_OPS_RELEASE_02_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/operations/cms-ops-release-checklist.md",
  "docs/operations/generated/cms-ops-release-checklist.v1.json",
  "tests/contracts/cms-ops-release-checklist.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_COMPETITOR_URL_00_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/competitor-url-inventory-tracker.md",
  "docs/seo/generated/competitor-url-inventory-tracker.v1.json",
  "tests/contracts/competitor-url-inventory-tracker.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_COMPETITOR_URL_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/competitor-url-inventory-tracker.md",
  "docs/seo/generated/competitor-url-inventory-generator.v1.json",
  "scripts/seo/generate-competitor-url-inventory.mjs",
  "tests/contracts/competitor-url-inventory-generator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_ISSUE_QUEUE_00_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/seo-issue-queue-read-model.md",
  "docs/seo/generated/seo-issue-queue.v1.json",
  "tests/contracts/seo-issue-queue.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_ISSUE_QUEUE_00_LEDGER_RECONCILE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/seo-issue-queue.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_ISSUE_QUEUE_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/seo-issue-queue-read-model.md",
  "docs/seo/generated/seo-issue-queue.v1.json",
  "docs/seo/generated/seo-issue-queue.v1.csv",
  "scripts/seo/generate-seo-issue-queue.mjs",
  "tests/contracts/seo-issue-queue.contract.test.ts",
  "tests/contracts/seo-issue-queue-generator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_ISSUE_QUEUE_01_LEDGER_RECONCILE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/competitor-url-inventory-generator.contract.test.ts",
  "tests/contracts/competitor-url-inventory-tracker.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue.contract.test.ts",
  "tests/contracts/seo-issue-queue-generator.contract.test.ts",
]);

const SEO_ISSUE_QUEUE_02_ALLOWED_FILES = new Set([
  "components/ops/seo/IssueQueueTable.tsx",
  "components/ops/seo/SeoOperationsDashboard.tsx",
  "components/ops/seo/mockSeoOperations.ts",
  "components/ops/seo/seoIssueQueueArtifactAdapter.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue-dashboard-shell.contract.test.ts",
]);

const SEO_ISSUE_QUEUE_02_RECONCILE_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/seo-issue-queue-read-model.md",
  "docs/seo/generated/seo-issue-queue.v1.json",
  "docs/seo/generated/seo-issue-queue.v1.csv",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue.contract.test.ts",
]);

const SEO_BRIEF_00_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/seo-content-brief-generator-contract.md",
  "docs/seo/generated/seo-content-brief-generator.v1.json",
  "tests/contracts/seo-content-brief-generator.contract.test.ts",
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SEO_BRIEF_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/seo-content-brief-generator-contract.md",
  "docs/seo/generated/seo-content-briefs.v1.json",
  "docs/seo/generated/seo-content-briefs.v1.md",
  "scripts/seo/generate-seo-content-briefs.mjs",
  "tests/contracts/seo-content-brief-generator-readonly.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CMS_OPS_IA_MAIN_SCOPE_REVALIDATE_FIX_ALLOWED_FILES = new Set([
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue.contract.test.ts",
]);

const PRIVACY_HISTORY_ANALYTICS_BLOCK_01_ALLOWED_FILES = new Set([
  "app/api/track/route.ts",
  "docs/audits/privacy-history-analytics-block-01-2026-06-04.md",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/tracking/attribution.ts",
  "lib/tracking/client.ts",
  "lib/tracking/events.ts",
  "lib/tracking/privacy.ts",
  "tests/contracts/analytics-payload-privacy.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SECURITY_CODEQL_87_FILE_ACCESS_ALLOWED_FILES = new Set([
  "scripts/seo/generate-competitor-url-inventory.mjs",
  "tests/contracts/competitor-url-inventory-generator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-content-brief-generator.contract.test.ts",
]);

const SCIENCE_CONTENTPAGE_CLAIM_GATE_01_ALLOWED_FILES = new Set([
  "docs/claims/generated/science-contentpage-claim-gate-01.v1.json",
  "docs/claims/science-contentpage-claim-gate-01.md",
  "tests/contracts/help-cms-authority.contract.test.ts",
  "tests/contracts/help-cms-draft-preflight.contract.test.ts",
  "tests/contracts/help-content-inventory.contract.test.ts",
  "tests/contracts/help-content-package-validation.contract.test.ts",
  "tests/contracts/help-content-packages.contract.test.ts",
  "tests/contracts/help-footer-link-qa.contract.test.ts",
  "tests/contracts/help-schema-gate.contract.test.ts",
  "tests/contracts/help-service-content-drafts-validation.contract.test.ts",
  "tests/contracts/help-service-content-drafts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/science-contentpage-claim-gate.contract.test.ts",
  "tests/contracts/support-flow-smoke.contract.test.ts",
]);

const SCIENCE_CONTENTPAGE_FAQ_SCHEMA_GATE_01_ALLOWED_FILES = new Set([
  "docs/seo/generated/science-contentpage-faq-schema-gate-01.v1.json",
  "docs/seo/science-contentpage-faq-schema-gate-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/science-contentpage-faq-schema-gate.contract.test.ts",
]);

const SCIENCE_CONTENTPAGE_DISCOVERABILITY_GATE_01_ALLOWED_FILES = new Set([
  "docs/seo/generated/science-contentpage-discoverability-gate-01.v1.json",
  "docs/seo/science-contentpage-discoverability-gate-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/science-contentpage-faq-schema-gate.contract.test.ts",
  "tests/contracts/science-contentpage-discoverability-gate.contract.test.ts",
]);

const HOMEPAGE_CONTENT_POLISH_BATCH_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "app/globals.css",
  "components/content-pages/ContentPageTemplate.tsx",
  "components/layout/SiteFooter.tsx",
  "components/layout/SiteHeader.tsx",
  "components/marketing/HomePageExperience.tsx",
  "components/support/SupportTrustDetailTemplate.tsx",
  "docs/claims/generated/science-contentpage-claim-gate-01.v1.json",
  "docs/claims/science-contentpage-claim-gate-01.md",
  "docs/seo/generated/science-contentpage-discoverability-gate-01.v1.json",
  "docs/seo/generated/science-contentpage-faq-schema-gate-01.v1.json",
  "docs/seo/science-contentpage-discoverability-gate-01.md",
  "docs/seo/science-contentpage-faq-schema-gate-01.md",
  "lib/content/markdownInline.tsx",
  "lib/content/renderSimpleMarkdown.tsx",
  "lib/content/textPunctuation.tsx",
  "tests/contracts/cms-rich-content-sanitization.contract.test.tsx",
  "tests/contracts/content-page-careers-rendering.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/homepage-v1-density.contract.test.tsx",
  "tests/contracts/homepage-v1-hero.contract.test.tsx",
  "tests/contracts/navigation-dead-links.contract.test.ts",
  "tests/contracts/science-contentpage-claim-gate.contract.test.ts",
  "tests/contracts/science-contentpage-discoverability-gate.contract.test.ts",
  "tests/contracts/science-contentpage-faq-schema-gate.contract.test.ts",
  "tests/contracts/site-footer-routing.contract.test.tsx",
  "tests/contracts/site-header-locale-link.contract.test.tsx",
]);

const FRONTEND_UI_POLISH_BATCH_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/guides/[slug]/page.tsx",
  "app/(localized)/[locale]/career/guides/page.tsx",
  "app/(localized)/[locale]/career/page.tsx",
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/(localized)/[locale]/support/page.tsx",
  "app/(localized)/[locale]/topics/[slug]/page.tsx",
  "app/(localized)/[locale]/topics/page.tsx",
  "components/content/AnswerSurfaceSection.tsx",
  "components/content/MbtiScenarioDeepDiveSection.tsx",
  "components/content/MbtiSceneEntrySection.tsx",
  "components/i18n/LocaleSwitcher.tsx",
  "components/marketing/HomePageExperience.tsx",
  "lib/cms/topics.ts",
  "lib/mbti/intpContentPack.ts",
  "lib/mbti/mbtiTypeContentPack.ts",
  "lib/mbti/mbtiTypeContentPacks.generated.ts",
  "lib/mbti/sceneDeepContent.ts",
  "tests/contracts/career-guides-cms.contract.test.tsx",
  "tests/contracts/en-parity-08-visual-overflow.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/homepage-v1-density.contract.test.tsx",
  "tests/contracts/locale-purity.contract.test.ts",
  "tests/contracts/mbti-ads-whitelist.contract.test.ts",
  "tests/contracts/mbti-entry-surface.contract.test.ts",
  "tests/contracts/personality-type-browse.contract.test.tsx",
  "tests/contracts/site-header-locale-link.contract.test.tsx",
  "tests/contracts/topics-cms.contract.test.tsx",
]);

const PERSONALITY_HUB_IMAGE_CONSUME_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/page.tsx",
  "lib/cms/personality.ts",
  "lib/mbti/personalityHub.adapter.ts",
  "lib/mbti/personalityHub.types.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-hub-contract.test.ts",
  "tests/contracts/personality-type-browse.contract.test.tsx",
]);

const PERSONALITY_HUB_32_VARIANTS_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/(localized)/[locale]/personality/page.tsx",
  "lib/cms/personality.ts",
  "lib/mbti/personalityHub.adapter.ts",
  "lib/mbti/personalityHub.types.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-hub-contract.test.ts",
  "tests/contracts/personality-semantics.contract.test.ts",
  "tests/contracts/personality-type-browse.contract.test.tsx",
  "tests/contracts/personality-workbench.contract.test.ts",
]);

const RESULT_SMOKE_PROXY_GENERATION_HINTS_ALLOWED_FILES = new Set([
  ".github/workflows/live-result-smoke.yml",
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "lib/api-base.ts",
  "next.config.mjs",
  "package.json",
  "scripts/ops/check-live-result-smoke.mjs",
  "tests/contracts/api-proxy-routing.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-client-view-state.contract.test.tsx",
]);

function isFrontendUiPolishBatch02ScopeActive(): boolean {
  if (CURRENT_BRANCH === "codex/frontend-ui-polish-batch-02") {
    return true;
  }

  try {
    const output = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const files = output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return files.length > 0 && files.every((file) => FRONTEND_UI_POLISH_BATCH_02_ALLOWED_FILES.has(file));
  } catch {
    return false;
  }
}

export function isCleanMainLikeCheckout(): boolean {
  if (CURRENT_BRANCH === "main") {
    return true;
  }

  try {
    const head = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    const originMain = execFileSync("git", ["rev-parse", "origin/main"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    return head === originMain;
  } catch {
    return false;
  }
}

export function isTestKpiFrontendContract06AllowedFile(file: string): boolean {
  return TEST_KPI_FRONTEND_CONTRACT_06_ALLOWED_FILES.has(file);
}

export function isCurrentRiasecPack12AllowedFile(file: string): boolean {
  if (
    RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
    RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file)) {
    return true;
  }

  if (CURRENT_BRANCH === "codex/homepage-ui-image-fallback-01") {
    return HOMEPAGE_UI_IMAGE_FALLBACK_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/homepage-content-polish-batch") {
    return HOMEPAGE_CONTENT_POLISH_BATCH_ALLOWED_FILES.has(file);
  }

  if (isFrontendUiPolishBatch02ScopeActive()) {
    return FRONTEND_UI_POLISH_BATCH_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-hub-image-consume-01") {
    return PERSONALITY_HUB_IMAGE_CONSUME_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-hub-32-variants-01") {
    return PERSONALITY_HUB_32_VARIANTS_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-smoke-proxy-generation-hints") {
    return RESULT_SMOKE_PROXY_GENERATION_HINTS_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-codeql-87-file-access") {
    return SECURITY_CODEQL_87_FILE_ACCESS_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/science-contentpage-claim-gate-01") {
    return SCIENCE_CONTENTPAGE_CLAIM_GATE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/science-contentpage-faq-schema-gate-01") {
    return SCIENCE_CONTENTPAGE_FAQ_SCHEMA_GATE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/science-contentpage-discoverability-gate-01") {
    return SCIENCE_CONTENTPAGE_DISCOVERABILITY_GATE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/science-contentpage-discoverability") {
    return SCIENCE_CONTENTPAGE_DISCOVERABILITY_RUNTIME_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/help-content-inventory-01") {
    return HELP_CONTENT_INVENTORY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/privacy-history-analytics-block-01") {
    return PRIVACY_HISTORY_ANALYTICS_BLOCK_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fix-commercial-readiness-contract-main-ci") {
    return CONTRACT_SCOPE_GUARD_MAIN_CI_FIX_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-commercial-events-01") {
    return ANALYTICS_COMMERCIAL_EVENTS_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/commercial-contracts-foundation-01") {
    return COMMERCIAL_CONTRACTS_FOUNDATION_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/test-landing-proof-surface-01") {
    return TEST_LANDING_PROOF_SURFACE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-02-reconcile-01") {
    return SEO_ISSUE_QUEUE_02_RECONCILE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-brief-00-content-brief-contract") {
    return SEO_BRIEF_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-brief-01-readonly-generator") {
    return SEO_BRIEF_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-02-dashboard-artifact-shell") {
    return SEO_ISSUE_QUEUE_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/cms-ops-ia-main-scope-revalidate-fix") {
    return CMS_OPS_IA_MAIN_SCOPE_REVALIDATE_FIX_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-01-ledger-reconcile") {
    return SEO_ISSUE_QUEUE_01_LEDGER_RECONCILE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-01-readonly-generator") {
    return SEO_ISSUE_QUEUE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-00-ledger-reconcile") {
    return SEO_ISSUE_QUEUE_00_LEDGER_RECONCILE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-issue-queue-00-read-model") {
    return SEO_ISSUE_QUEUE_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-competitor-url-01-readonly-generator") {
    return SEO_COMPETITOR_URL_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-competitor-url-00-inventory-contract") {
    return SEO_COMPETITOR_URL_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/backend-runtime-02d-reconcile") {
    return BACKEND_RUNTIME_02D_RECONCILE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/cms-ops-ia-00-permission-matrix") {
    return CMS_OPS_IA_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/cms-ops-release-02-checklist") {
    return CMS_OPS_RELEASE_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-p0-05-url-truth-policy") {
    return SEO_SITEMAP_P0_05_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/sitemap-frontend-convergence") {
    return SITEMAP_FRONTEND_CONVERGENCE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/riasec-post-publish-smoke-02") {
    return RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/riasec-search-submission-preflight-01") {
    return (
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-cms-canary-web-01-article-to-test-tracking") {
    return SEO_CMS_CANARY_WEB_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-funnel-web-event-name-alignment-02") {
    return RIASEC_PACK12_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-02-followup-notfound-rsc-payload-cleanup-01") {
    return PR_02_FOLLOWUP_NOTFOUND_RSC_PAYLOAD_CLEANUP_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-content-pages-discoverability-readiness-test-fix") {
    return GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_READINESS_TEST_FIX_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-content-pages-discoverability-exposure-readiness-01") {
    return GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_READINESS_01_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "main" ||
    CURRENT_BRANCH === "codex/fix-main-contract-scope-metadata-inventory" ||
    CURRENT_BRANCH === "codex/frontend-contract-blocker-fix" ||
    CURRENT_BRANCH === "codex/global-en-zh-content-pages-discoverability-exposure-implementation-01" ||
    CURRENT_BRANCH === "codex/fix-global-en-zh-discoverability-exposure-contract"
  ) {
    return (
      GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_IMPLEMENTATION_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-content-pages-llms-exposure-repair-01") {
    return GLOBAL_EN_ZH_CONTENT_PAGES_LLMS_EXPOSURE_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-01-llms-full-recheck-or-repair") {
    return PR_FDN_01_LLMS_FULL_RECHECK_OR_REPAIR_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/detail-ready-1046-frontend-metadata-revalidation-01") {
    return DETAIL_READY_1046_FRONTEND_METADATA_REVALIDATION_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/detail-ready-1046-discoverability-exposure-repair-01") {
    return DETAIL_READY_1046_DISCOVERABILITY_EXPOSURE_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01") {
    return DETAIL_READY_1046_CAREER_DETAIL_METADATA_AND_LLMS_FULL_STABILITY_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/detail-ready-1046-llms-full-artifact-consistency-repair-01") {
    return DETAIL_READY_1046_LLMS_FULL_ARTIFACT_CONSISTENCY_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-1046-frontend-discovery-ux-01") {
    return CAREER_1046_FRONTEND_DISCOVERY_UX_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-jobs-paginated-directory-shell-01") {
    return CAREER_JOBS_PAGINATED_DIRECTORY_SHELL_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-llms-directory-sitemap-authority-01") {
    return CAREER_LLMS_DIRECTORY_SITEMAP_AUTHORITY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-directory-production-consumption-repair-01") {
    return CAREER_DIRECTORY_PRODUCTION_CONSUMPTION_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-llms-txt-directory-url-exposure-repair-01") {
    return CAREER_LLMS_TXT_DIRECTORY_URL_EXPOSURE_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-detail-p95-latency-scan-01") {
    return CAREER_DETAIL_P95_LATENCY_SCAN_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-detail-cache-budget-repair-01") {
    return CAREER_DETAIL_CACHE_BUDGET_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-llms-full-10k-budget-gate-01") {
    return CAREER_LLMS_FULL_10K_BUDGET_GATE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-directory-ux-facets-parity-01") {
    return CAREER_DIRECTORY_UX_FACETS_PARITY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-content-pages-frontend-runtime-repair-01") {
    return GLOBAL_EN_ZH_CONTENT_PAGES_FRONTEND_RUNTIME_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/cookie-banner-hydration-01") {
    return COOKIE_BANNER_HYDRATION_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-email-lookup-token-open-04") {
    return RESULT_EMAIL_LOOKUP_TOKEN_OPEN_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-email-first-binding-ux-05") {
    return RESULT_EMAIL_FIRST_BINDING_UX_05_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/payment-wait-paid-redirect-contract-06") {
    return PAYMENT_WAIT_PAID_REDIRECT_CONTRACT_06_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-footer-nav-parity-01") {
    return GLOBAL_EN_ZH_FOOTER_NAV_PARITY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-footer-nav-parity-02") {
    return GLOBAL_EN_ZH_FOOTER_NAV_PARITY_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-global-ui-i18n-batch-08") {
    return GLOBAL_EN_ZH_GLOBAL_UI_I18N_BATCH_08_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/global-en-zh-parity-p0-01-content-help-policy-discoverability") {
    return GLOBAL_EN_ZH_PARITY_P0_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-03-discoverability-sitemap-llms-authority-alignment-01") {
    return PR_03_DISCOVERABILITY_SITEMAP_LLMS_AUTHORITY_ALIGNMENT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-03-followup-llms-content-page-detail-authority-01") {
    return PR_03_FOLLOWUP_LLMS_CONTENT_PAGE_DETAIL_AUTHORITY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fix-frontend-ci-build-timeout") {
    return FRONTEND_CI_BUILD_TIMEOUT_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/en-parity-08-visual-parity") {
    return EN_PARITY_08_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/search-channel-live-zh-mbti-01a-indexnow-keylocation-fix") {
    return SEARCH_CHANNEL_LIVE_ZH_MBTI_01A_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/discoverability-staging-meta-noindex-fix-02") {
    return DISCOVERABILITY_STAGING_META_NOINDEX_FIX_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/codeql-hygiene-alerts") {
    return CODEQL_HYGIENE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-01-eq-v5-report-gate") {
    return PR_WEB_SEC_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-eq-per-03-frontend-eq-v51-personalization") {
    return PR_EQ_PER_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-eq-sjt-03-frontend-take-flow") {
    return PR_EQ_SJT_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-02-research-publication-guard") {
    return PR_WEB_SEC_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-03-riasec-landing-path-sanitize") {
    return PR_WEB_SEC_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-04-tracking-attribution-whitelist") {
    return PR_WEB_SEC_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-05-docs-infra-redaction") {
    return PR_WEB_SEC_05_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-06-ci-action-policy-parser") {
    return PR_WEB_SEC_06_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-07-anon-crypto-fallback") {
    return PR_WEB_SEC_07_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-08-vitest-hoisted-fixture") {
    return PR_WEB_SEC_08_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-09-riasec-token-reuse") {
    return PR_WEB_SEC_09_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-10-iq-dimension-null-guard") {
    return PR_WEB_SEC_10_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-11-developer-path-redaction") {
    return PR_WEB_SEC_11_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-12-career-index-gate") {
    return PR_WEB_SEC_12_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-13-root-not-found-layout") {
    return PR_WEB_SEC_13_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-02-followup-notfound-rsc-payload-cleanup-01") {
    return PR_02_FOLLOWUP_NOTFOUND_RSC_PAYLOAD_CLEANUP_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-14-e2e-fixture-env-guards") {
    return PR_WEB_SEC_14_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-15-big5-v2-array-guards") {
    return PR_WEB_SEC_15_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-16-staging-smoke-separator") {
    return PR_WEB_SEC_16_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-17-staging-validator-exact-count") {
    return PR_WEB_SEC_17_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-17a-post-merge-scope-contract") {
    return PR_WEB_SEC_17A_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-18-cms-health-timeout") {
    return PR_WEB_SEC_18_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-19-dataset-url-allowlist") {
    return PR_WEB_SEC_19_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-20-anon-rollout-bucketing") {
    return PR_WEB_SEC_20_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-21-animated-counter-reduced-motion") {
    return PR_WEB_SEC_21_ALLOWED_FILES.has(file);
  }


  if (CURRENT_BRANCH === "codex/iq-cms-media-02-rendering-guard") {
    return IQ_CMS_MEDIA_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-paid-report-02-render-entitlement-states") {
    return IQ_PAID_REPORT_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-seo-ramp-02-indexation-gate") {
    return IQ_SEO_RAMP_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-live-ramp-01-authenticated-smoke") {
    return IQ_LIVE_RAMP_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-release-01-launch-readiness-ledger") {
    return IQ_RELEASE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-22-result-retry-credentials") {
    return PR_WEB_SEC_22_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-pdf-print-private-url-guard-01") {
    return RESULT_PDF_PRINT_PRIVATE_URL_GUARD_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-debug-field-suppression-01") {
    return RESULT_DEBUG_FIELD_SUPPRESSION_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-object-render-guard-01") {
    return RESULT_OBJECT_RENDER_GUARD_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-private-print-styles-footer-gate-01") {
    return RESULT_PRIVATE_PRINT_STYLES_AND_FOOTER_GATE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-leak-contract-tests-01") {
    return RESULT_LEAK_CONTRACT_TESTS_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-private-print-chrome-gate-harden-02") {
    return RESULT_PRIVATE_PRINT_CHROME_GATE_HARDEN_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-big5-internal-method-debug-suppression-02") {
    return RESULT_BIG5_INTERNAL_METHOD_DEBUG_SUPPRESSION_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-riasec-debug-label-suppression-02") {
    return RESULT_RIASEC_DEBUG_LABEL_SUPPRESSION_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-object-and-pdf-leak-contract-expansion-02") {
    return RESULT_OBJECT_AND_PDF_LEAK_CONTRACT_EXPANSION_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-23-big5-comparative-fallback") {
    return PR_WEB_SEC_23_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-24-mbti-draft-form-guard") {
    return PR_WEB_SEC_24_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-25-mbti-offer-hash") {
    return PR_WEB_SEC_25_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-26-mbti-score-pct-fallback") {
    return PR_WEB_SEC_26_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti-result-desktop-clone-storage-hydration-01") {
    return (
      MBTI_RESULT_DESKTOP_CLONE_STORAGE_HYDRATION_01_ALLOWED_FILES.has(file) ||
      GLOBAL_EN_ZH_CONTENT_PAGES_DISCOVERABILITY_EXPOSURE_IMPLEMENTATION_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/take-frontend-locale-contract-04") {
    return TAKE_FRONTEND_LOCALE_CONTRACT_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/TEST-KPI-FRONTEND-CONTRACT-06") {
    return TEST_KPI_FRONTEND_CONTRACT_06_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/scope-guard-contract-postmerge-fix") {
    return SCOPE_GUARD_CONTRACT_POSTMERGE_FIX_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-27-footer-qr-toggle") {
    return PR_WEB_SEC_27_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-28-take-submit-lockout") {
    return PR_WEB_SEC_28_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-29-result-tracking-whitelist") {
    return PR_WEB_SEC_29_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-30-deploy-runbook-redaction") {
    return PR_WEB_SEC_30_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-31-clinical-session-storage-guard") {
    return PR_WEB_SEC_31_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p0-04-private-indexing-privacy") {
    return ANALYTICS_SEO_P0_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p0-01-standardize-events") {
    return ANALYTICS_SEO_P0_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p0-05-utm-governance") {
    return ANALYTICS_SEO_P0_05_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p1-08-metadata-sitemap-canonical") {
    return ANALYTICS_SEO_P1_08_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p1-06-mbti-landing-structure") {
    return ANALYTICS_SEO_P1_06_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p1-07-riasec-landing-structure") {
    return ANALYTICS_SEO_P1_07_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p0-10-private-route-analytics-suppression") {
    return ANALYTICS_SEO_P0_10_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/private-analytics-share-metadata-hardening") {
    return PRIVATE_ANALYTICS_SHARE_METADATA_HARDENING_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/analytics-seo-p0-12-private-html-hardening") {
    return ANALYTICS_SEO_P0_12_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-32-landing-rollout-seed") {
    return PR_WEB_SEC_32_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-33-preview-fixture-hard-fail") {
    return PR_WEB_SEC_33_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-operations-dashboard-shell") {
    return SEO_OPERATIONS_DASHBOARD_SHELL_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-cms-canary-web-01-article-to-test-tracking") {
    return SEO_CMS_CANARY_WEB_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-print-private-url-redaction-02") {
    return RESULT_PRINT_PRIVATE_URL_REDACTION_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-audit-fe-01-lint-ci-baseline") {
    return PR_AUDIT_FE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-audit-fe-02-csp-noindex") {
    return PR_AUDIT_FE_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-audit-fe-03-recovery-token") {
    return PR_AUDIT_FE_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/ops-api-public-tls-path-fix-01a-frontend-same-origin-foundation-api-proxy") {
    return OPS_API_PUBLIC_TLS_PATH_FIX_01A_FRONTEND_SAME_ORIGIN_FOUNDATION_API_PROXY_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-02b-daily-giving-frontend-pages") {
    return PR_FDN_02B_DAILY_GIVING_FRONTEND_PAGES_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/daily-giving-proof-public-url-adapter-01") {
    return DAILY_GIVING_PROOF_PUBLIC_URL_FRONTEND_ADAPTER_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-02b-post-deploy-runtime-smoke") {
    return PR_FDN_02B_POST_DEPLOY_RUNTIME_SMOKE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-seo-01-readiness") {
    return PR_FDN_SEO_01_READINESS_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-seo-current-audit-01") {
    return PERSONALITY_SEO_CURRENT_AUDIT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-seo-01-implementation") {
    return PR_FDN_SEO_01_IMPLEMENTATION_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-seo-01-post-deploy-smoke") {
    return PR_FDN_SEO_01_POST_DEPLOY_SMOKE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-social-link-display-review-01") {
    return PR_FDN_SOCIAL_LINK_DISPLAY_REVIEW_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-fdn-social-link-display-implementation-01") {
    return PR_FDN_SOCIAL_LINK_DISPLAY_IMPLEMENTATION_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/legacy-seo-reconciliation-scan") {
    return LEGACY_SEO_RECONCILIATION_SCAN_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/research-report-metadata") {
    return RESEARCH_REPORT_METADATA_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/help-service-faq-schema-runtime-01") {
    return (
      HELP_SERVICE_FAQ_SCHEMA_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/help-pages-noindex-runtime-01") {
    return (
      HELP_PAGES_NOINDEX_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/help-service-faq-schema-runtime-r2-01") {
    return (
      HELP_SERVICE_FAQ_SCHEMA_RUNTIME_R2_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/help-support-contact-runtime-01") {
    return (
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/order-lookup-recovery-contract-stabilize") {
    return (
      ORDER_LOOKUP_RECOVERY_CONTRACT_STABILIZE_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-stability-01") {
    return (
      SEO_SITEMAP_STABILITY_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-stability-03") {
    return (
      SEO_SITEMAP_STABILITY_03_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-stability-04") {
    return (
      SEO_SITEMAP_STABILITY_04_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-diff-01") {
    return (
      SEO_SITEMAP_DIFF_01_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-sitemap-diff-04") {
    return (
      SEO_SITEMAP_DIFF_04_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-conv-tracking-01") {
    return SEO_CONV_TRACKING_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-conv-runtime-03") {
    return SEO_CONV_RUNTIME_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-h1-01") {
    return ARTICLE_H1_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-h1-03") {
    return ARTICLE_H1_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-noindex-schema-hreflang-hold-00") {
    return ARTICLE_NOINDEX_SCHEMA_HREFLANG_HOLD_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-schema-hold-decouple-00") {
    return ARTICLE_SCHEMA_HOLD_DECOUPLE_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-schema-granular-gates-00") {
    return ARTICLE_SCHEMA_GRANULAR_GATES_00_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/article-hreflang-hold-decouple-00") {
    return ARTICLE_HREFLANG_HOLD_DECOUPLE_00_ALLOWED_FILES.has(file);
  }

  return CURRENT_BRANCH === "codex/riasec-full-content-pack-12" && RIASEC_PACK12_ALLOWED_FILES.has(file);
}

export function isSeoConvTracking01AllowedFile(file: string): boolean {
  return SEO_CONV_TRACKING_01_ALLOWED_FILES.has(file);
}

export function isSeoConvRuntime03AllowedFile(file: string): boolean {
  return SEO_CONV_RUNTIME_03_ALLOWED_FILES.has(file);
}

export function isArticleH101AllowedFile(file: string): boolean {
  return ARTICLE_H1_01_ALLOWED_FILES.has(file);
}

export function isArticleH103AllowedFile(file: string): boolean {
  return ARTICLE_H1_03_ALLOWED_FILES.has(file);
}
