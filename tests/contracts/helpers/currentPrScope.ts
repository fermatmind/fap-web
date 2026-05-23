import { execFileSync } from "node:child_process";

const CURRENT_BRANCH = (() => {
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

const PR_WEB_SEC_01_ALLOWED_FILES = new Set([
  "components/result/eq/EQResultV5.tsx",
  "components/result/eq/utils.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
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

export function isCurrentRiasecPack12AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH === "codex/pr-web-sec-01-eq-v5-report-gate") {
    return PR_WEB_SEC_01_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/research-report-metadata") {
    return RESEARCH_REPORT_METADATA_ALLOWED_FILES.has(file);
  }

  return CURRENT_BRANCH === "codex/riasec-full-content-pack-12" && RIASEC_PACK12_ALLOWED_FILES.has(file);
}
