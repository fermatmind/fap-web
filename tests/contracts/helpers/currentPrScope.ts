import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

type BranchResolutionInput = {
  githubHeadRef?: string;
  githubEventPullRequestHeadRef?: unknown;
  githubRefName?: string;
  gitBranch?: string;
};

export function isPullRequestMergeRefName(branch: string): boolean {
  return /^\d+\/merge$/.test(branch) || /^refs\/pull\/\d+\/merge$/.test(branch);
}

export function resolveBranchName(input: BranchResolutionInput): string {
  const githubHeadBranch = input.githubHeadRef;
  if (githubHeadBranch) {
    return githubHeadBranch;
  }

  const pullRequestHeadRef = input.githubEventPullRequestHeadRef;
  if (typeof pullRequestHeadRef === "string" && pullRequestHeadRef.length > 0) {
    return pullRequestHeadRef;
  }

  const githubBranch = input.githubRefName;
  if (githubBranch && !isPullRequestMergeRefName(githubBranch)) {
    return githubBranch;
  }

  return input.gitBranch ?? "";
}

const CURRENT_BRANCH = (() => {
  const githubEventPath = process.env.GITHUB_EVENT_PATH;
  let githubEventPullRequestHeadRef: unknown;
  if (githubEventPath) {
    try {
      const eventPayload = JSON.parse(readFileSync(githubEventPath, "utf8")) as {
        pull_request?: { head?: { ref?: unknown } };
      };
      githubEventPullRequestHeadRef = eventPayload.pull_request?.head?.ref;
    } catch {
      // Fall through to the ref name and local git branch fallbacks.
    }
  }

  let gitBranch = "";
  try {
    gitBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
  } catch {
    gitBranch = "";
  }

  return resolveBranchName({
    githubHeadRef: process.env.GITHUB_HEAD_REF,
    githubEventPullRequestHeadRef,
    githubRefName: process.env.GITHUB_REF_NAME,
    gitBranch,
  });
})();

export const IS_GITHUB_PULL_REQUEST_MERGE_REF = isPullRequestMergeRefName(CURRENT_BRANCH);
export const IS_GITHUB_ACTIONS_DETACHED_HEAD = CURRENT_BRANCH === "HEAD" && process.env.GITHUB_ACTIONS === "true";

const BIG_FIVE_PUBLIC_PROFILE_AGENT_PILOT_01_ALLOWED_FILES = new Set([
  "scripts/seo/generate-big-five-public-profile-agent-pilot.mjs",
  "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.json",
  "docs/seo/personality/big-five-public-profile-agent-pilot-2026-06-24.md",
  "tests/contracts/big-five-public-profile-agent-pilot-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const BIG_FIVE_PUBLIC_PROFILE_AGENT_QA_01_ALLOWED_FILES = new Set([
  "scripts/seo/validate-big-five-public-profile-agent-qa.mjs",
  "docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.json",
  "docs/seo/personality/big-five-public-profile-agent-qa-2026-06-24.md",
  "tests/contracts/big-five-public-profile-agent-qa-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PERSONALITY_AGENT_OPPORTUNITY_RANKER_AUTOMATION_01_ALLOWED_FILES = new Set([
  "scripts/seo/personality-agent-opportunity-ranker.mjs",
  "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.json",
  "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.md",
  "docs/seo/personality/personality-agent-opportunity-ranker-automation-2026-06-27.csv",
  "tests/contracts/personality-agent-opportunity-ranker-automation-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PERSONALITY_AGENT_RECOMMENDATION_AUTO_RUNNER_01_ALLOWED_FILES = new Set([
  "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
  "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.json",
  "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.md",
  "docs/seo/personality/personality-agent-recommendation-auto-runner-2026-06-27.csv",
  "tests/contracts/personality-agent-recommendation-auto-runner-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PERSONALITY_AGENT_AUTO_QA_AND_APPROVAL_HANDOFF_01_ALLOWED_FILES = new Set([
  "scripts/seo/personality-agent-auto-qa-and-approval-handoff.mjs",
  "docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-2026-06-27.json",
  "docs/seo/personality/personality-agent-auto-qa-and-approval-handoff-2026-06-27.md",
  "docs/seo/personality/personality-agent-auto-approval-handoff-package-2026-06-27.json",
  "tests/contracts/personality-agent-auto-qa-and-approval-handoff-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const MBTI_MAIN_FAQ_SCHEMA_EVIDENCE_01_ALLOWED_FILES = new Set([
  "docs/seo/evidence/mbti-personality-test-16-personality-types/structured-data/README.md",
  "docs/seo/evidence/mbti-personality-test-16-personality-types/structured-data/faq-schema-parity-readback-2026-06-29.json",
  "tests/contracts/test-detail-landing.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const MBTI_RESULT_PAGE_PDF_SMOKE_QUALITY_GATE_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/ops/check-mbti-result-page-pdf-smoke.mjs",
  "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const MBTI_RESULT_PAGE_PDF_VISUAL_PAGINATION_ALLOWED_FILES = new Set([
  "app/globals.css",
  "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx",
  "components/result/mbti/clone/MbtiCloneAssetSlot.tsx",
  "components/result/mbti/clone/MbtiCloneNarrativeSection.tsx",
  "components/result/mbti/clone/mbtiDesktopClone.module.css",
  "tests/contracts/mbti-pdf-snapshot-print-layout-polish.contract.test.ts",
  "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
  "tests/contracts/mbti-result-page-pdf-visual-pagination.contract.test.ts",
  "tests/contracts/result-private-print-chrome.contract.test.ts",
  "tests/contracts/mbti-desktop-shell-cta.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const MBTI_PDF_SNAPSHOT_RENDERED_SMOKE_H2_ALLOWED_FILES = new Set([
  "scripts/ops/check-mbti-result-page-pdf-smoke.mjs",
  "tests/contracts/mbti-pdf-snapshot-rendered-smoke-h2.contract.test.ts",
  "tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PR_CAREER_KG_00_ALLOWED_FILES = new Set([
  "components/career/display/CareerDecisionActionBlock.tsx",
  "components/career/display/CareerDisplayCTA.tsx",
  "components/career/display/CareerDisplayHero.tsx",
  "components/career/display/SourceDisclosureBlock.tsx",
  "tests/contracts/career-display-surface.contract.test.tsx",
  "tests/contracts/career-job-detail-actors-v42.contract.test.tsx",
  "tests/contracts/career-job-seo-display-asset-projection.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_01_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-01-graphic-designers/README.md",
  "generated/career-kg-pr-01-graphic-designers/graphic-designers.zh-CN.asset.json",
  "generated/career-kg-pr-01-graphic-designers/qa_report.json",
  "generated/career-kg-pr-01-graphic-designers/dry_run_importer_report.json",
  "generated/career-kg-pr-01-graphic-designers/staging_preview_smoke.json",
  "generated/career-kg-pr-01-graphic-designers/fap_web_render_smoke.json",
  "generated/career-kg-pr-01-graphic-designers/sha256_manifest.json",
  "tests/contracts/career-kg-01-graphic-designers.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_02_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-02-production-planning-expediting-clerks/README.md",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/production-planning-expediting-clerks.zh-CN.asset.json",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/qa_report.json",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/dry_run_importer_report.json",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/staging_preview_smoke.json",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/fap_web_render_smoke.json",
  "generated/career-kg-pr-02-production-planning-expediting-clerks/sha256_manifest.json",
  "tests/contracts/career-kg-02-production-planning-expediting-clerks.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_03_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/README.md",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/bus-drivers-transit-intercity.zh-CN.asset.json",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/qa_report.json",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/dry_run_importer_report.json",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/staging_preview_smoke.json",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/fap_web_render_smoke.json",
  "generated/career-kg-pr-03-transit-intercity-bus-drivers/sha256_manifest.json",
  "tests/contracts/career-kg-03-transit-intercity-bus-drivers.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_04_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-04-archivists/README.md",
  "generated/career-kg-pr-04-archivists/archivists.zh-CN.asset.json",
  "generated/career-kg-pr-04-archivists/qa_report.json",
  "generated/career-kg-pr-04-archivists/dry_run_importer_report.json",
  "generated/career-kg-pr-04-archivists/staging_preview_smoke.json",
  "generated/career-kg-pr-04-archivists/fap_web_render_smoke.json",
  "generated/career-kg-pr-04-archivists/sha256_manifest.json",
  "tests/contracts/career-kg-04-archivists.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_05_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-05-postal-mail-sorters-processors/README.md",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/postal-service-mail-sorters-processors-processing-machine-operators.zh-CN.asset.json",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/qa_report.json",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/dry_run_importer_report.json",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/staging_preview_smoke.json",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/fap_web_render_smoke.json",
  "generated/career-kg-pr-05-postal-mail-sorters-processors/sha256_manifest.json",
  "tests/contracts/career-kg-05-postal-mail-sorters-processors.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_06_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-06-aircraft-avionics-technicians/README.md",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/aircraft-and-avionics-equipment-mechanics-and-technicians.zh-CN.asset.json",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/qa_report.json",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/dry_run_importer_report.json",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/staging_preview_smoke.json",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/fap_web_render_smoke.json",
  "generated/career-kg-pr-06-aircraft-avionics-technicians/sha256_manifest.json",
  "tests/contracts/career-kg-06-aircraft-avionics-technicians.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_07_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-07-civil-engineering-technicians/README.md",
  "generated/career-kg-pr-07-civil-engineering-technicians/civil-engineering-technologists-and-technicians.zh-CN.asset.json",
  "generated/career-kg-pr-07-civil-engineering-technicians/qa_report.json",
  "generated/career-kg-pr-07-civil-engineering-technicians/dry_run_importer_report.json",
  "generated/career-kg-pr-07-civil-engineering-technicians/staging_preview_smoke.json",
  "generated/career-kg-pr-07-civil-engineering-technicians/fap_web_render_smoke.json",
  "generated/career-kg-pr-07-civil-engineering-technicians/sha256_manifest.json",
  "tests/contracts/career-kg-07-civil-engineering-technicians.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_08_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-08-aerospace-engineers/README.md",
  "generated/career-kg-pr-08-aerospace-engineers/aerospace-engineers.zh-CN.asset.json",
  "generated/career-kg-pr-08-aerospace-engineers/qa_report.json",
  "generated/career-kg-pr-08-aerospace-engineers/dry_run_importer_report.json",
  "generated/career-kg-pr-08-aerospace-engineers/staging_preview_smoke.json",
  "generated/career-kg-pr-08-aerospace-engineers/fap_web_render_smoke.json",
  "generated/career-kg-pr-08-aerospace-engineers/sha256_manifest.json",
  "tests/contracts/career-kg-08-aerospace-engineers.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_09_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-09-auto-mechanics/README.md",
  "generated/career-kg-pr-09-auto-mechanics/automotive-service-technicians-and-mechanics.zh-CN.asset.json",
  "generated/career-kg-pr-09-auto-mechanics/qa_report.json",
  "generated/career-kg-pr-09-auto-mechanics/dry_run_importer_report.json",
  "generated/career-kg-pr-09-auto-mechanics/staging_preview_smoke.json",
  "generated/career-kg-pr-09-auto-mechanics/fap_web_render_smoke.json",
  "generated/career-kg-pr-09-auto-mechanics/sha256_manifest.json",
  "tests/contracts/career-kg-09-auto-mechanics.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_10_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-10-secretaries-admin-assistants/README.md",
  "generated/career-kg-pr-10-secretaries-admin-assistants/secretaries-and-administrative-assistants-except-legal-medical-and-executive.zh-CN.asset.json",
  "generated/career-kg-pr-10-secretaries-admin-assistants/qa_report.json",
  "generated/career-kg-pr-10-secretaries-admin-assistants/dry_run_importer_report.json",
  "generated/career-kg-pr-10-secretaries-admin-assistants/staging_preview_smoke.json",
  "generated/career-kg-pr-10-secretaries-admin-assistants/fap_web_render_smoke.json",
  "generated/career-kg-pr-10-secretaries-admin-assistants/sha256_manifest.json",
  "tests/contracts/career-kg-10-secretaries-admin-assistants.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_11_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-11-mechanical-drafters/README.md",
  "generated/career-kg-pr-11-mechanical-drafters/mechanical-drafters.zh-CN.asset.json",
  "generated/career-kg-pr-11-mechanical-drafters/qa_report.json",
  "generated/career-kg-pr-11-mechanical-drafters/dry_run_importer_report.json",
  "generated/career-kg-pr-11-mechanical-drafters/staging_preview_smoke.json",
  "generated/career-kg-pr-11-mechanical-drafters/fap_web_render_smoke.json",
  "generated/career-kg-pr-11-mechanical-drafters/sha256_manifest.json",
  "tests/contracts/career-kg-11-mechanical-drafters.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_12_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-12-search-marketing-strategists/README.md",
  "generated/career-kg-pr-12-search-marketing-strategists/search-marketing-strategists.zh-CN.asset.json",
  "generated/career-kg-pr-12-search-marketing-strategists/qa_report.json",
  "generated/career-kg-pr-12-search-marketing-strategists/dry_run_importer_report.json",
  "generated/career-kg-pr-12-search-marketing-strategists/staging_preview_smoke.json",
  "generated/career-kg-pr-12-search-marketing-strategists/fap_web_render_smoke.json",
  "generated/career-kg-pr-12-search-marketing-strategists/sha256_manifest.json",
  "tests/contracts/career-kg-12-search-marketing-strategists.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_13_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/README.md",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/zoologists-and-wildlife-biologists.zh-CN.asset.json",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/qa_report.json",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/dry_run_importer_report.json",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/staging_preview_smoke.json",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/fap_web_render_smoke.json",
  "generated/career-kg-pr-13-zoologists-wildlife-biologists/sha256_manifest.json",
  "tests/contracts/career-kg-13-zoologists-wildlife-biologists.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_14_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-14-mining-geological-engineers/README.md",
  "generated/career-kg-pr-14-mining-geological-engineers/mining-and-geological-engineers.zh-CN.asset.json",
  "generated/career-kg-pr-14-mining-geological-engineers/qa_report.json",
  "generated/career-kg-pr-14-mining-geological-engineers/dry_run_importer_report.json",
  "generated/career-kg-pr-14-mining-geological-engineers/staging_preview_smoke.json",
  "generated/career-kg-pr-14-mining-geological-engineers/fap_web_render_smoke.json",
  "generated/career-kg-pr-14-mining-geological-engineers/sha256_manifest.json",
  "tests/contracts/career-kg-14-mining-geological-engineers.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_15_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-15-geodetic-surveyors/README.md",
  "generated/career-kg-pr-15-geodetic-surveyors/geodetic-surveyors.zh-CN.asset.json",
  "generated/career-kg-pr-15-geodetic-surveyors/qa_report.json",
  "generated/career-kg-pr-15-geodetic-surveyors/dry_run_importer_report.json",
  "generated/career-kg-pr-15-geodetic-surveyors/staging_preview_smoke.json",
  "generated/career-kg-pr-15-geodetic-surveyors/fap_web_render_smoke.json",
  "generated/career-kg-pr-15-geodetic-surveyors/sha256_manifest.json",
  "tests/contracts/career-kg-15-geodetic-surveyors.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_16_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/README.md",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/market-research-analysts-and-marketing-specialists.zh-CN.asset.json",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/qa_report.json",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/dry_run_importer_report.json",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/staging_preview_smoke.json",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/fap_web_render_smoke.json",
  "generated/career-kg-pr-16-market-research-analysts-marketing-specialists/sha256_manifest.json",
  "tests/contracts/career-kg-16-market-research-analysts-marketing-specialists.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_17_ALLOWED_FILES = new Set([
  "generated/career-kg-pr-17-postal-service-mail-carriers/README.md",
  "generated/career-kg-pr-17-postal-service-mail-carriers/postal-service-mail-carriers.zh-CN.asset.json",
  "generated/career-kg-pr-17-postal-service-mail-carriers/qa_report.json",
  "generated/career-kg-pr-17-postal-service-mail-carriers/dry_run_importer_report.json",
  "generated/career-kg-pr-17-postal-service-mail-carriers/staging_preview_smoke.json",
  "generated/career-kg-pr-17-postal-service-mail-carriers/fap_web_render_smoke.json",
  "generated/career-kg-pr-17-postal-service-mail-carriers/sha256_manifest.json",
  "tests/contracts/career-kg-17-postal-service-mail-carriers.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_AGENT_01_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/references/career_kg_confirmed_batch_contract.md",
  ".agents/skills/career-content-asset-factory/schemas/career_kg_confirmed_batch.schema.json",
  ".agents/skills/career-content-asset-factory/schemas/career_kg_asset_package.schema.json",
  "docs/career/career-kg-agent-optimization-runbook.md",
  "tests/contracts/career-kg-agent-package-schema.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PR_CAREER_KG_AGENT_02_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/scripts/generate_career_kg_package.py",
  ".agents/skills/career-content-asset-factory/templates/career_kg_asset_package_template.json",
  ".agents/skills/career-content-asset-factory/templates/career_kg_readme_template.md",
  "tests/contracts/career-kg-package-generator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_AGENT_03_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_package.py",
  ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_claim_boundaries.py",
  ".agents/skills/career-content-asset-factory/scripts/validate_career_kg_sources.py",
  "tests/contracts/career-kg-package-validator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_AGENT_04_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/scripts/validate_search_projection_quarantine.py",
  ".agents/skills/career-content-asset-factory/schemas/career_kg_search_projection_candidate.schema.json",
  ".agents/skills/career-content-asset-factory/templates/career_kg_search_projection_candidate.json",
  "tests/contracts/career-kg-search-projection-quarantine.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_AGENT_05_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/scripts/generate_career_kg_pr_train_entries.py",
  ".agents/skills/career-content-asset-factory/templates/career_kg_pr_train_entry.yaml",
  ".agents/skills/career-content-asset-factory/templates/career_kg_pr_train_state_entry.json",
  "tests/contracts/career-kg-pr-train-entry-generator.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const PR_CAREER_KG_AGENT_06_ALLOWED_FILES = new Set([
  ".agents/skills/career-content-asset-factory/SKILL.md",
  ".agents/skills/career-content-asset-factory/references/operator_runbook.md",
  ".agents/skills/career-content-asset-factory/references/search_projection_quarantine.md",
  "docs/career/career-content-agent-technical-summary-2026-06-25.md",
  "docs/codex/career-batch-review-checklist.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_OPS_GAOKAO_V5_PACKAGE_CONTRACT_REPAIR_01_ALLOWED_FILES = new Set([
  "tests/contracts/seo-ops-gaokao-v5-package-contract-repair.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_OPS_GAOKAO_V5_PACKAGE_CONTRACT_REPAIR_01_ALLOWED_PREFIXES = [
  "generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/",
  "generated/pr-train-sidecar-issues/",
];

const EQ_V19_FRONTEND_DEPTH_CONSUMPTION_ALLOWED_FILES = new Set([
  "components/result/eq/EQCrossAssessmentContext.tsx",
  "components/result/eq/EQEvidenceSnapshot.tsx",
  "components/result/eq/EQRealitySceneCards.tsx",
  "components/result/eq/EQResultDepthModules.tsx",
  "components/result/eq/EQResultHero.tsx",
  "components/result/eq/EQResultV5.tsx",
  "components/result/eq/types.ts",
  "components/result/eq/utils.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const EQ_V20_FRONTEND_V23_CONSUMPTION_ALLOWED_FILES = new Set([
  "components/result/eq/EQRealitySceneCards.tsx",
  "components/result/eq/types.ts",
  "components/result/eq/utils.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-remaining-58-competitor-gap-qa-v2-01.contract.test.ts",
  "tests/fixtures/eq/v5/eq60_v5_balanced_integrated_en.json",
  "tests/fixtures/eq/v5/eq60_v5_balanced_integrated_zh.json",
  "tests/fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_en.json",
  "tests/fixtures/eq/v5/eq60_v5_high_empathy_low_recovery_zh.json",
  "tests/fixtures/eq/v5/eq60_v5_low_confidence_en.json",
  "tests/fixtures/eq/v5/eq60_v5_low_confidence_zh.json",
]);

const ARTICLE_ANSWER_SURFACE_LAYOUT_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/articles/[slug]/page.tsx",
  "components/content/AnswerSurfaceSection.tsx",
  "docs/seo/generated/discoverability-authority-matrix.v1.json",
  "docs/seo/generated/june-seo-p0-mobile-seo-gate.v1.json",
  "scripts/seo/check-mobile-seo-gate.mjs",
  "tests/contracts/articles-cleanup.contract.test.ts",
  "tests/contracts/article-answer-surface.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/june-seo-p0-mobile-seo-gate.contract.test.ts",
  "tests/contracts/seo-ops-02-article-cta-attribution.contract.test.ts",
  "tests/contracts/seo-ops-02d-article-rich-content-cta-attribution.contract.test.tsx",
  "tests/contracts/seo-page-cta-attribution.contract.test.ts",
]);

const SEO_FREE_TEST_HOMEPAGE_CTA_01_ALLOWED_FILES = new Set([
  "components/marketing/HomePageExperience.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/homepage-v1-core-grid.contract.test.tsx",
]);

const SEO_FREE_TEST_HUB_CATEGORY_CTA_02_ALLOWED_FILES = new Set([
  "components/marketing/tests/TestCategoryExperience.tsx",
  "components/marketing/tests/TestsHubExperience.tsx",
  "components/marketing/tests/TestsShared.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/marketing/testsHubContent.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/tests-hub-category.contract.test.ts",
  "tests/contracts/tests-hub-pr-ux-01-render.contract.test.tsx",
]);

const SEO_FREE_TEST_FLAGSHIP_LANDING_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-free-test-flagship-landing.contract.test.ts",
]);

const SIX_HUB_TEST_DETAIL_FRONTEND_LANDING_SURFACE_CONSUMER_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-free-test-flagship-landing.contract.test.ts",
  "tests/contracts/test-detail-landing.contract.test.ts",
  "tests/contracts/test-detail-softwareapplication-schema.contract.test.ts",
]);

const FA30_WEB_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/six-assessment-hub-parity.v1.json",
  "docs/seo/six-assessment-hub-parity.md",
  "package.json",
  "scripts/seo/check-six-assessment-hub-parity.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/six-assessment-hub-parity.contract.test.ts",
]);

const FA30_WEB_02_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "package.json",
  "scripts/ops/check-batch2-runtime-qa-handoff.mjs",
  "tests/contracts/fa30-batch2-runtime-qa-harness.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/fixtures/result_page/batch2_readback_review_ledger.sample.json",
]);

const SEO_FREE_TEST_SECONDARY_CTA_04_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/tests/page.tsx",
  "app/(localized)/[locale]/personality/page.tsx",
  "app/(localized)/[locale]/share/[id]/ShareClient.tsx",
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
  "app/(localized)/[locale]/topics/[slug]/page.tsx",
  "components/business/CTASticky.tsx",
  "components/personality/PersonalityMobileDecisionBar.tsx",
  "components/personality/PublicContentAssetRenderer.tsx",
  "components/share/EnneagramShareSummaryCard.tsx",
  "components/share/MbtiShareSummaryCard.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/mbti/personalityHub.adapter.ts",
  "lib/mbti/sceneDeepContent.ts",
  "lib/og/mbtiShare.tsx",
  "lib/tests/freeTestLabels.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-entry-wiring.contract.test.tsx",
  "tests/contracts/seo-free-test-secondary-cta.contract.test.ts",
]);

const SEO_FREE_TEST_ARTICLE_INTERNAL_LINKS_05_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/content/internalLinkText.ts",
  "tests/contracts/article-internal-link-anchor-text.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

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

const RIASEC_RESULT_FAPWEB_RENDERED_PREVIEW_QA_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-result-rendered-preview-qa.contract.test.tsx",
  "tests/fixtures/riasec/result_page_v2/render_preview_fixture_manifest.v0_1.json",
  "tests/fixtures/riasec/result_page_v2/result_page_ias_staging_payload.v0_1.json",
  "tests/fixtures/riasec/result_page_v2/pdf_ias_staging_payload.v0_1.json",
  "tests/fixtures/riasec/result_page_v2/share_ias_staging_payload.v0_1.json",
  "tests/fixtures/riasec/result_page_v2/history_ias_staging_payload.v0_1.json",
  "tests/fixtures/riasec/result_page_v2/compare_ias_staging_payload.v0_1.json",
]);

const RIASEC_CAREER_GRAPH_BRIDGE_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/career-graph/riasec-career-graph-bridge-common-contract-2026-06-23.md",
  "docs/career-graph/riasec-career-graph-bridge-common-contract.v1.json",
  "tests/contracts/riasec-career-graph-bridge-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const BIG5_METHODOLOGY_TRUST_SCIENCE_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/methodology-trust-science/big5-methodology-trust-science-common-contract-2026-06-23.md",
  "docs/methodology-trust-science/big5-methodology-trust-science-common-contract.v1.json",
  "tests/contracts/big5-methodology-trust-science-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const BIG5_METHODOLOGY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/methodology-trust-science/big5-methodology-source-authority-packet-2026-06-23.md",
  "docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json",
  "tests/contracts/big5-methodology-source-authority-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const RIASEC_CAREER_GRAPH_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/career-graph/riasec-career-graph-source-authority-packet-2026-06-23.md",
  "docs/career-graph/riasec-career-graph-source-authority-packet.v1.json",
  "tests/contracts/riasec-career-graph-source-authority-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const RIASEC_CAREER_GRAPH_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/career-graph/riasec-career-graph-claim-safety-packet-2026-06-23.md",
  "docs/career-graph/riasec-career-graph-claim-safety-packet.v1.json",
  "tests/contracts/riasec-career-graph-claim-safety-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const RIASEC_CAREER_GRAPH_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES = new Set([
  "docs/career-graph/riasec-career-graph-candidate-cluster-packet-2026-06-23.md",
  "docs/career-graph/riasec-career-graph-candidate-cluster-packet.v1.json",
  "tests/contracts/riasec-career-graph-candidate-cluster-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const RIASEC_CAREER_GRAPH_BRIDGE_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/career-graph/riasec-career-graph-bridge-matrix-2026-06-23.md",
  "docs/career-graph/riasec-career-graph-bridge-matrix.v1.json",
  "tests/contracts/riasec-career-graph-bridge-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const ENNEAGRAM_PUBLIC_PERSONALITY_HANDOFF_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/public-personality/enneagram-public-personality-handoff-common-contract-2026-06-23.md",
  "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json",
  "tests/contracts/enneagram-public-personality-handoff-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const ENNEAGRAM_PUBLIC_PERSONALITY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/public-personality/enneagram-public-personality-source-authority-packet-2026-06-23.md",
  "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json",
  "tests/contracts/enneagram-public-personality-source-authority-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const ENNEAGRAM_PUBLIC_PERSONALITY_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/public-personality/enneagram-public-personality-claim-safety-packet-2026-06-23.md",
  "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json",
  "tests/contracts/enneagram-public-personality-claim-safety-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const ENNEAGRAM_PUBLIC_PERSONALITY_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES = new Set([
  "docs/public-personality/enneagram-public-personality-candidate-cluster-packet-2026-06-23.md",
  "docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json",
  "tests/contracts/enneagram-public-personality-candidate-cluster-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const ENNEAGRAM_PUBLIC_PERSONALITY_HANDOFF_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/public-personality/enneagram-public-personality-handoff-matrix-2026-06-23.md",
  "docs/public-personality/enneagram-public-personality-handoff-matrix.v1.json",
  "tests/contracts/enneagram-public-personality-handoff-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const QUIZ_PACK_PERFORMANCE_HOTFIX_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/seo/agent/FAPWEB_CODE_PR_WRITER.md",
  "docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json",
  "docs/seo/generated/seo-agent-fapweb-code-pr-writer.v1.json",
  "package.json",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "tests/contracts/seo-agent-fapweb-code-pr-writer.contract.test.ts",
  "tests/e2e/big5-flow.spec.ts",
  "tests/e2e/mbti-locked-unlock.spec.ts",
  "tests/e2e/mbti-share.spec.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
  "tests/contracts/riasec-guest-token-parity.contract.test.ts",
]);

const MBTI64_FRONTEND_SEO_CONSUME_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/seo/personality/frontend-seo-consume-2026-06-18.json",
  "docs/seo/personality/frontend-seo-consume-2026-06-18.md",
  "lib/cms/personality-sections.tsx",
  "lib/cms/personality.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-sections.contract.test.tsx",
]);

const MBTI64_FRONTEND_PERSONALITY_V21_RENDER_CONTRACT_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/seo/personality/mbti64-v21-render-contract-2026-06-19.md",
  "lib/cms/personality.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
]);

const MBTI64_FRONTEND_PERSONALITY_V21_HTML_COMPLETENESS_REPAIR_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/seo/personality/mbti64-v21-html-completeness-repair-2026-06-19.md",
  "lib/cms/personality-sections.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-sections.contract.test.tsx",
]);

const MBTI64_GLOBAL_HEADER_PRIVATE_ROUTE_HYGIENE_01_ALLOWED_FILES = new Set([
  "components/layout/SiteHeader.tsx",
  "docs/seo/personality/mbti64-global-header-private-route-hygiene-2026-06-19.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-ads-whitelist.contract.test.ts",
  "tests/contracts/site-header-locale-link.contract.test.tsx",
]);

const MBTI64_LLMS_FULL_PILOT_EXPOSURE_REPAIR_01_ALLOWED_FILES = new Set([
  "app/api/content-release/revalidate/route.ts",
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/personality/mbti64-llms-full-pilot-exposure-repair-2026-06-19.json",
  "docs/seo/personality/mbti64-llms-full-pilot-exposure-repair-2026-06-19.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
  "tests/contracts/personality-llms-full-comparison-repair-01.contract.test.ts",
  "tests/contracts/pr-fdn-01-llms-full-recheck-or-repair.contract.test.ts",
]);

const MBTI64_LLMS_FULL_PILOT_EXPOSURE_REPAIR_02_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "docs/seo/personality/mbti64-llms-full-pilot-exposure-repair-02-2026-06-19.md",
  "lib/seo/llmsRouteBudget.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
]);

const FIX_CONTRACT_MBTI64_LLMS_AUTHORITY_ALLOWED_FILES = new Set([
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
]);

const MBTI64_LLMS_FULL_FRESH_3_MEMBERSHIP_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "docs/seo/personality/mbti64-llms-full-fresh-3-membership-repair-2026-06-23.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
]);

const MBTI64_PERSONALITY_DETAIL_FRONTEND_API_ORIGIN_REPAIR_01_ALLOWED_FILES = new Set([
  "lib/api-base.ts",
  "next.config.mjs",
  "tests/contracts/api-proxy-routing.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const PERSONALITY_AGENT_QA_GATES_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.json",
  "docs/seo/personality/mbti64-agent-expansion-88-qa-2026-06-21.md",
  "scripts/seo/validate-mbti64-agent-expansion-88-qa.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-agent-qa-gates-01.contract.test.ts",
]);

const MBTI64_GSC_IMPORT_STABILIZE_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-23.json",
  "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-23.md",
  "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-23.csv",
  "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-23.json",
  "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-23.md",
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-23.json",
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-23.md",
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-2026-06-23.json",
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-2026-06-23.md",
  "scripts/seo/decide-mbti64-visible-expansion-query-evidence.mjs",
  "scripts/seo/import-mbti64-gsc-measurement-cohort.mjs",
  "scripts/seo/select-mbti64-agent-optimization-priorities.mjs",
  "scripts/seo/stabilize-mbti64-gsc-import-priority.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-gsc-import-stabilize.contract.test.ts",
]);

const MBTI64_AGENT_PRIORITY_RANKER_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.csv",
  "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.json",
  "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.md",
  "scripts/seo/rank-mbti64-agent-priorities.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-priority-ranker.contract.test.ts",
]);

const MBTI64_AGENT_RECOMMENDATION_RERUN_LOOP_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.csv",
  "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.json",
  "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.md",
  "scripts/seo/plan-mbti64-agent-recommendation-rerun-loop.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-recommendation-rerun-loop.contract.test.ts",
]);

const PERSONALITY_AGENT_AUTO_RUNNER_SCHEDULER_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/personality-agent-auto-runner-scheduler-2026-06-24.csv",
  "docs/seo/personality/personality-agent-auto-runner-scheduler-2026-06-24.json",
  "docs/seo/personality/personality-agent-auto-runner-scheduler-2026-06-24.md",
  "scripts/seo/run-personality-agent-auto-runner.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-agent-auto-runner-scheduler-01.contract.test.ts",
]);

const PERSONALITY_AGENT_AUTO_RUNNER_SCHEDULER_ACTIVATION_01_ALLOWED_FILES = new Set([
  ".github/workflows/personality-agent-auto-runner.yml",
  "docs/seo/personality/personality-agent-auto-runner-scheduler-activation-2026-06-24.json",
  "docs/seo/personality/personality-agent-auto-runner-scheduler-activation-2026-06-24.md",
  "scripts/seo/run-personality-agent-auto-runner.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-agent-auto-runner-scheduler-activation-01.contract.test.ts",
]);

const MBTI64_GSC_QUERY_EXPORT_10_01_ALLOWED_FILES = new Set([
  "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.csv",
  "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.json",
  "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.md",
  "scripts/seo/prepare-mbti64-gsc-query-evidence-export-10.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-gsc-query-export-10.contract.test.ts",
]);

const FAP_WEB_PRODUCTION_AUTO_DEPLOY_ENV_FIX_01_ALLOWED_FILES = new Set([
  ".github/workflows/deploy-production.yml",
  "tests/contracts/deploy-production-workflow-env.contract.test.ts",
  "tests/contracts/audit-prr2-web-01-deploy-recovery-lane.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CONTRACT_SCOPE_GUARD_STRATEGY_02_ALLOWED_FILES = new Set([
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-public-profile-agent-split-01.contract.test.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
  "tests/contracts/seo-agent-fapweb-code-pr-writer.contract.test.ts",
  "tests/contracts/seo-agent-gpt55-handoff.contract.test.ts",
  "tests/contracts/seo-agent-weekly-control-packet.contract.test.ts",
  "tests/contracts/seo-cms-draft-package-contract.contract.test.ts",
  "tests/contracts/seo-opportunity-queue-contract.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
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

const SEO_OPS_READMODEL_BRIDGE_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/ops/seo-operations/page.tsx",
  "components/ops/seo/SeoOperationsDashboard.tsx",
  "components/ops/seo/mockSeoOperations.ts",
  "components/ops/seo/seoIssueQueueArtifactAdapter.ts",
  "lib/ops/seoOperationsReadModel.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue-dashboard-shell.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_RUNTIME_QA_AGENT_01_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/check-public-runtime-seo-qa.mjs",
  "docs/seo/seo-runtime-qa-agent.md",
  "docs/seo/agent/runtime-qa/default-samples.v1.json",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_GPT55_HANDOFF_01_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/check-seo-agent-gpt55-handoff.mjs",
  "docs/seo/agent/GPT55_REVIEW_PACKET.md",
  "docs/seo/agent/examples/gpt55-review-response.example.json",
  "docs/seo/agent/schemas/GPT55_REVIEW_RESPONSE.schema.json",
  "tests/contracts/seo-agent-gpt55-handoff.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_WEEKLY_AUTOMATION_CONTROL_PACKET_02_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/check-seo-agent-weekly-control-packet.mjs",
  "docs/seo/agent/WEEKLY_AUTOMATION_CONTROL_PACKET.md",
  "docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json",
  "docs/seo/agent/schemas/SEO_AGENT_CONTROL_PACKET.schema.json",
  "tests/contracts/seo-agent-weekly-control-packet.contract.test.ts",
  "tests/contracts/seo-agent-gpt55-handoff.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_OPPORTUNITY_QUEUE_CONTRACT_01_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/check-seo-opportunity-queue-contract.mjs",
  "docs/seo/agent/OPPORTUNITY_QUEUE_CONTRACT.md",
  "docs/seo/agent/examples/seo-opportunity-queue-contract.example.json",
  "docs/seo/agent/schemas/SEO_OPPORTUNITY_QUEUE_CONTRACT.schema.json",
  "tests/contracts/seo-opportunity-queue-contract.contract.test.ts",
  "tests/contracts/seo-agent-weekly-control-packet.contract.test.ts",
  "tests/contracts/seo-agent-gpt55-handoff.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_CMS_DRAFT_PACKAGE_CONTRACT_01_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/check-seo-cms-draft-package-contract.mjs",
  "docs/seo/agent/CMS_DRAFT_PACKAGE_CONTRACT.md",
  "docs/seo/agent/examples/seo-cms-draft-package-contract.example.json",
  "docs/seo/agent/schemas/SEO_CMS_DRAFT_PACKAGE_CONTRACT.schema.json",
  "tests/contracts/seo-cms-draft-package-contract.contract.test.ts",
  "tests/contracts/seo-opportunity-queue-contract.contract.test.ts",
  "tests/contracts/seo-agent-weekly-control-packet.contract.test.ts",
  "tests/contracts/seo-agent-gpt55-handoff.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES = new Set([
  ".agents/skills/fap-web-seo-geo-authority/SKILL.md",
  ".agents/skills/fermatmind-seo-ops/SKILL.md",
  "package.json",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "docs/seo/agent/FAPWEB_CODE_PR_WRITER.md",
  "docs/seo/agent/examples/seo-agent-fapweb-code-pr-request.example.json",
  "docs/seo/generated/seo-agent-fapweb-code-pr-writer.v1.json",
  "tests/contracts/seo-agent-fapweb-code-pr-writer.contract.test.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
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

const SEO_OPS_STABILIZE_02_PUBLIC_ARTICLE_SMOKE_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/seo/verify-public-article-release.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/public-article-release-smoke.contract.test.ts",
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

const CAREER_SALARY_POST_IMPORT_SEO_SAFETY_AUDIT_ALLOWED_FILES = new Set([
  "generated/career-salary-1046-post-import-seo-safety-audit/audit.json",
  "generated/career-salary-1046-post-import-seo-safety-audit/audit.md",
  "generated/career-salary-1046-post-import-seo-safety-audit/jsonld_schema_review.json",
  "generated/career-salary-1046-post-import-seo-safety-audit/rendering_smoke.json",
  "generated/career-salary-1046-post-import-seo-safety-audit/sample_pages.csv",
  "generated/career-salary-1046-post-import-seo-safety-audit/sha256_manifest.json",
  "generated/career-salary-1046-post-import-seo-safety-audit/sitemap_llms_review.json",
  "scripts/seo/audit-career-salary-post-import-seo-safety.mjs",
  "tests/contracts/career-salary-post-import-seo-safety-audit.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_AI_IMPACT_PREVIEW_CONSUMER_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
  "components/career/ai-impact/CareerAiImpactPreviewSection.tsx",
  "components/career/display/CareerDisplaySurface.tsx",
  "lib/career/aiImpactAssetPreviewConfig.ts",
  "lib/career/api/fetchCareerAiImpactAssetPreview.ts",
  "tests/contracts/career-ai-impact-preview-consumer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_IDENTITY_1046_AUTHORITY_STATE_ALLOWED_FILES = new Set([
  ".agents/skills/career-identity-asset-factory/scripts/generate_evidence.py",
  "generated/fermatmind-content-agent-state/batch_registry.json",
  "generated/fermatmind-content-agent-state/career_block_status.json",
  "generated/fermatmind-content-agent-state/global_content_state.json",
  "generated/fermatmind-content-agent-state/import_state.json",
  "generated/fermatmind-content-agent-state/latest_pass_baselines.json",
  "generated/fermatmind-content-agent-state/next_goal_recommendation.md",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const CAREER_SKILLS_ENTRY_1046_COMPLETION_STATE_ALLOWED_FILES = new Set([
  ".agents/skills/career-skills-entry-asset-factory/scripts/collect_evidence.py",
  "generated/fermatmind-content-agent-state/batch_registry.json",
  "generated/fermatmind-content-agent-state/career_block_status.json",
  "generated/fermatmind-content-agent-state/global_content_state.json",
  "generated/fermatmind-content-agent-state/import_state.json",
  "generated/fermatmind-content-agent-state/latest_pass_baselines.json",
  "generated/fermatmind-content-agent-state/next_goal_recommendation.md",
  "tests/contracts/helpers/currentPrScope.ts",
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

const ARTICLE_HREFLANG_PARITY_VERIFIER_ALLOWED_FILES = new Set([
  "scripts/seo/verify-public-article-release.mjs",
  "tests/contracts/public-article-release-smoke.contract.test.ts",
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

const SECURITY_103_WEB_01_ALLOWED_FILES = new Set([
  ".github/workflows/deploy-production.yml",
  ".github/workflows/deploy-staging.yml",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/deploy-production-workflow-env.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-103-web-01-deploy-workflow-hardening.contract.test.ts",
]);

const SECURITY_123_WEB_01_ALLOWED_FILES = new Set([
  ".github/workflows/deploy-production.yml",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/deploy-production-workflow-env.contract.test.ts",
  "tests/contracts/audit-prr2-web-01-deploy-recovery-lane.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-103-web-01-deploy-workflow-hardening.contract.test.ts",
  "tests/contracts/security-123-web-01-production-approval-guard.contract.test.ts",
]);

const SECURITY_123_WEB_02_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "lib/cms/articles.ts",
  "tests/contracts/articles-cleanup.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
  "tests/contracts/public-surface-lkg-coverage.contract.test.ts",
  "tests/contracts/security-123-web-02-llms-article-cache-concurrency.contract.test.ts",
]);

const SECURITY_123_WEB_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-123-web-03-big5-explicit-consent.contract.test.tsx",
]);

const SECURITY_123_WEB_04_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "scripts/seo/artifactSafety.mjs",
  "scripts/seo/build-mbti-gsc-11-query-evidence-export.mjs",
  "scripts/seo/build-mbti-gsc-19-submission-monitoring.mjs",
  "scripts/seo/build-mbti-ops-08-gsc-priority-monitoring.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-gsc-11-query-evidence-export.contract.test.ts",
  "tests/contracts/mbti-gsc-19-submission-monitoring.contract.test.ts",
  "tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts",
  "tests/contracts/security-123-web-04-gsc-csv-formula-guards.contract.test.ts",
]);

const SECURITY_123_WEB_05_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-cms-16-profile-dry-run-approval-package.contract.test.ts",
  "tests/contracts/security-123-web-05-cms16-full-diff-scope.contract.test.ts",
]);

const SECURITY_123_WEB_06_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "lib/cms/personality-sections.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-cms-16-profile-dry-run-approval-package.contract.test.ts",
  "tests/contracts/personality-sections.contract.test.tsx",
  "tests/contracts/security-123-web-06-personality-array-normalization.contract.test.tsx",
]);

const SECURITY_123_WEB_07_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "lib/cms/personality-public-content-assets.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
  "tests/contracts/security-123-web-07-personality-asset-cache.contract.test.ts",
]);

const SECURITY_123_WEB_08_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/enneagram/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-enneagram-v1-noindex-render.contract.test.ts",
  "tests/contracts/security-123-web-08-enneagram-robots-follow.contract.test.ts",
]);

const SECURITY_123_WEB_09_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
  "tests/contracts/security-123-web-09-big-five-facet-hub-jsonld.contract.test.ts",
]);

const BIG5_114_SEO_RUNTIME_RELEASE_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/seo/backendSitemapSource.ts",
  "tests/contracts/big5-114-seo-runtime-release-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
]);

const BIG5_114_LLMS_WORKER_CACHE_CONSISTENCY_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/seo/backendSitemapSource.ts",
  "tests/contracts/big5-114-llms-worker-cache-consistency-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_SITEMAP_PRIVATE_PATH_GATE_PRECISION_REPAIR_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "scripts/deploy_web_pm2.sh",
  "tests/contracts/big5-sitemap-private-path-gate-precision-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const SECURITY_122_WEB_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-01-train-reconciliation.contract.test.ts",
]);

const SECURITY_122_WEB_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx",
  "app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap.ts",
  "components/support/ResultEmailLookupForm.tsx",
  "lib/access/reportActionUrls.ts",
  "lib/api/v0_3.ts",
  "lib/commerce/redirectUrls.ts",
  "lib/result/pdfExportToken.ts",
  "lib/result/resultAccessTokenHandoff.ts",
  "scripts/ops/check-mbti-pdf-print-asset-hash.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/report-action-url-safety.contract.test.ts",
  "tests/contracts/result-access-token-api.contract.test.ts",
  "tests/contracts/result-client-view-state.contract.test.tsx",
  "tests/contracts/result-email-lookup.contract.test.tsx",
  "tests/contracts/result-gotenberg-print-route.contract.test.ts",
  "tests/contracts/security-122-web-01-train-reconciliation.contract.test.ts",
  "tests/contracts/security-122-web-02-result-token-redaction.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SECURITY_122_WEB_03_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/agent/FAPWEB_CODE_PR_WRITER.md",
  "docs/seo/agent/SEO_AGENT_PR_DECOMPOSITION_2026-06-20.md",
  "docs/seo/agent/evidence/pr_decomposition.json",
  "docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json",
  "lib/iq/bankDisplay.ts",
  "scripts/seo/check-seo-agent-weekly-control-packet.mjs",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-bank-display-model.contract.test.ts",
  "tests/contracts/security-122-web-03-seo-agent-approval-redaction.contract.test.ts",
  "tests/contracts/seo-agent-fapweb-code-pr-writer.contract.test.ts",
  "tests/contracts/seo-agent-weekly-control-packet.contract.test.ts",
]);

const SECURITY_122_WEB_04_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/ops/content-pages/[slug]/page.tsx",
  "app/(localized)/[locale]/ops/content-pages/page.tsx",
  "app/(localized)/[locale]/ops/seo-operations/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/ops/opsRouteAccess.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-04-ops-route-auth.contract.test.ts",
]);

const SECURITY_122_WEB_05_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/answer/answerSurface.ts",
  "lib/cms/articles.ts",
  "lib/cms/sanitizeCmsRichText.ts",
  "lib/landing/landingSurface.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-05-cms-url-field-guards.contract.test.ts",
]);

const SECURITY_122_WEB_06_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/content-pages.ts",
  "lib/cms/last-known-good.ts",
  "lib/seo/llmsFullResponseCache.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-06-sitemap-llms-lkg-fail-closed.contract.test.ts",
]);

const SECURITY_122_WEB_07_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/tracking/attribution.ts",
  "tests/contracts/mbti-take-attribution.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-07-tracking-attribution-sanitization.contract.test.ts",
]);

const SECURITY_122_WEB_08_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/foundation/dailyGiving.ts",
  "proxy.ts",
  "scripts/ops/check-mbti-pdf-print-asset-hash.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-08-daily-giving-guards.contract.test.ts",
]);

const SECURITY_122_WEB_09_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/career/api/fetchCareerAiImpactAssetPreview.ts",
  "lib/career/api/fetchCareerSalaryAssetPreview.ts",
  "lib/iq/renderer.ts",
  "lib/iq/result.ts",
  "tests/contracts/career-ai-impact-preview-consumer.contract.test.tsx",
  "tests/contracts/career-salary-asset-preview-consumer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-question-renderer.contract.test.tsx",
  "tests/contracts/security-122-web-09-ai-iq-salary-guards.contract.test.tsx",
]);

const SECURITY_122_WEB_10_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/seo-intelligence-asset-map.v1.json",
  "docs/seo/personality/backend-import-dry-run-2026-06-18.json",
  "docs/seo/personality/backend-import-dry-run-2026-06-18.md",
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.json",
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-2026-07-01.json",
  "generated/public-profile-assets/big-five-v1-34-codex-only-batch/research/source-ledger.csv",
  "generated/public-profile-assets/big-five-v1-34-codex-only-batch/run-manifest.json",
  "generated/public-profile-assets/big-five-v1-openness-dry-run-codex-only/research/source-ledger.csv",
  "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs",
  "scripts/seo/dry-run-mbti64-backend-import.mjs",
  "scripts/seo/validate-mbti64-backend-import-contract.mjs",
  "scripts/seo/validate-mbti64-content-package-v2.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-10-generated-artifact-redaction.contract.test.ts",
  "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
]);

const SECURITY_122_WEB_11_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "scripts/seo/artifactSafety.mjs",
  "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs",
  "scripts/seo/build-personality-agent-next-batch-6-handoff.mjs",
  "scripts/seo/dry-run-mbti64-backend-import.mjs",
  "scripts/seo/generate-duplicate-title-governance-report.mjs",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "scripts/seo/generate-url-inventory.mjs",
  "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
  "scripts/seo/rank-mbti64-agent-priorities.mjs",
  "scripts/seo/validate-mbti64-backend-import-contract.mjs",
  "scripts/seo/validate-mbti64-content-package-v2.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-11-artifact-integrity.contract.test.ts",
]);

const SECURITY_122_WEB_12_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-12-pr-scope-guard.contract.test.ts",
]);

const SECURITY_122_WEB_13_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/career/displaySurface.ts",
  "tests/contracts/career-display-surface.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-13-career-source-trust.contract.test.tsx",
]);

const SECURITY_122_WEB_14_ALLOWED_FILES = new Set([
  "components/career/display/CareerDisplaySurface.tsx",
  "docs/codex/pr-train-state.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-14-career-claim-audit.contract.test.tsx",
]);

const SECURITY_122_WEB_15_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "scripts/seo/check-public-runtime-seo-qa.mjs",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "scripts/seo/personality-agent-auto-qa-and-approval-handoff.mjs",
  "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-15-seo-runtime-qa-fail-closed.contract.test.ts",
]);

const SECURITY_122_WEB_16_ALLOWED_FILES = new Set([
  "app/(root)/layout.tsx",
  "app/mbti-career-cta.css",
  "docs/codex/pr-train-state.json",
  "lib/site.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-16-public-ui-route-config-guards.contract.test.tsx",
]);

const SECURITY_122_WEB_17_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx",
  "app/globals.css",
  "components/commerce/AttemptPdfDownloadButton.tsx",
  "components/layout/Container.tsx",
  "docs/codex/pr-train-state.json",
  "scripts/ops/check-mbti-result-page-pdf-smoke.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-17-pdf-print-delivery.contract.test.tsx",
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

const PR_EQ_AGENT_RUNTIME_03_ALLOWED_FILES = new Set([
  "components/result/eq/EQAgentEntryGuard.tsx",
  "components/result/eq/EQResultV5.tsx",
  "components/result/eq/EQSaveShareRelated.tsx",
  "components/result/eq/types.ts",
  "lib/api/v0_3.ts",
  "tests/contracts/eq-result-v5-renderer.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/e2e/iq-eq-result-regression.spec.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
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

const IQ_OWNER_30_FE_IMAGE_RENDERER_03_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "components/quiz/iq/IqOptionBoard.tsx",
  "components/quiz/iq/IqStemSvg.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/api/v0_3.ts",
  "lib/iq/contracts.ts",
  "lib/iq/renderer.ts",
  "lib/iq/take.ts",
  "lib/quiz/types.ts",
  "tests/a11y/iq-option-board.a11y.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-question-renderer.contract.test.tsx",
  "tests/e2e/visual/iq-take.visual.spec.ts",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-desktop-full-page-en-chromium-linux.png",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-desktop-options-en-chromium-linux.png",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-mobile-full-page-en-chromium-linux.png",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-mobile-options-en-chromium-linux.png",
]);

const IQ_OWNER_30_FE_FORMCODE_04_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/iq/api.ts",
  "lib/iq/bankDisplay.ts",
  "lib/iq/constants.ts",
  "lib/iq/contracts.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/enneagram-api.contract.test.ts",
  "tests/contracts/iq-bank-display-model.contract.test.ts",
  "tests/contracts/iq-frontend-api-contracts.contract.test.ts",
  "tests/contracts/iq-take-lifecycle.contract.test.tsx",
  "tests/contracts/test-detail-landing.contract.test.ts",
]);

const IQ_SESSION_QUESTION_DELIVERY_05B_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/api/v0_3.ts",
  "lib/iq/api.ts",
  "lib/iq/contracts.ts",
  "lib/iq/take.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-frontend-api-contracts.contract.test.ts",
  "tests/contracts/iq-take-lifecycle.contract.test.tsx",
  "tests/e2e/visual/iq-take.visual.spec.ts",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-desktop-full-page-en-chromium-linux.png",
  "tests/e2e/visual/iq-take.visual.spec.ts-snapshots/iq-take-mobile-full-page-en-chromium-linux.png",
]);

const IQ_OWNER_30_NORM_CLAIM_POLICY_02B_ALLOWED_FILES = new Set([
  "components/result/iq/IqResultShell.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/iq/contracts.ts",
  "lib/iq/result.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-frontend-api-contracts.contract.test.ts",
  "tests/contracts/iq-result-renderer.contract.test.tsx",
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

const MBTI_PDF_RESULT_SNAPSHOT_SHELL_ALLOWED_FILES = new Set([
  "proxy.ts",
  "app/(localized)/[locale]/layout.tsx",
  "components/result/mbti/clone/MbtiDesktopCloneShell.tsx",
  "tests/contracts/result-private-print-chrome.contract.test.ts",
  "tests/contracts/result-gotenberg-print-route.contract.test.ts",
  "tests/contracts/result-client-view-state.contract.test.tsx",
  "tests/contracts/mbti-desktop-shell-cta.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
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

const MBTI_TAKE_ATTRIBUTION_FLAKY_CI_FIX_ALLOWED_FILES = new Set([
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-take-attribution.contract.test.tsx",
]);

const MBTI_DESKTOP_BAND_NUANCE_CONTRACT_FIX_01_ALLOWED_FILES = new Set([
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-desktop-p0-render.contract.test.tsx",
]);

const MBTI_CONTRACT_SIDECAR_FIXES_1388_1292_ALLOWED_FILES = new Set([
  "package.json",
  "scripts/release_freeze_verify.sh",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/release-freeze-harness.contract.test.ts",
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
  if (isAiImpactV5ExpandedPageQaAllowedFile(file)) {
    return true;
  }

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
  "scripts/seo/export-mbti64-gsc-query-evidence.mjs",
  "scripts/seo/generate-mbti64-agent-expansion-88.mjs",
  "scripts/seo/generate-mbti64-internal-link-graph.mjs",
  "scripts/seo/generate-seo-content-briefs.mjs",
  "scripts/seo/validate-mbti64-content-package-gates.mjs",
  "tests/contracts/article-metadata-consumption-gate.contract.test.ts",
  "tests/contracts/career-1046-frontend-discovery-ux-01.contract.test.tsx",
  "tests/contracts/cms-ops-ia-permission-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts",
  "tests/contracts/riasec-full-content-freeze.contract.test.tsx",
  "tests/e2e/big5-flow.spec.ts",
]);

const ENNEAGRAM_PHASE8C_CONFIGURABLE_TIMEOUT_SCOPE_GUARD_ALLOWED_FILES = new Set([
  "scripts/seo/generate-mbti64-agent-expansion-88.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts",
  "tests/e2e/enneagram-phase8c-production-equivalent-candidate-e2e.spec.ts",
]);

const MBTI64_AGENT_EXPANSION_88_SECURITY_ALLOWED_FILES = new Set([
  "scripts/seo/generate-mbti64-agent-expansion-88.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts",
]);

const CODEQL_HTTP_FILE_ACCESS_108_ALLOWED_FILES = new Set([
  "scripts/ops/check-big5-v2-live-result-pdf.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-private-leak-regressions.contract.test.ts",
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

const LLMS_FULL_ARTICLE_ENUMERATION_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "lib/seo/llmsRouteBudget.ts",
  "tests/contracts/detail-ready-1046-llms-full-artifact-consistency-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/llms-route-fanout.contract.test.ts",
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
  return PERSONALITY_SEO_CURRENT_AUDIT_01_ALLOWED_FILES.has(file) || isCurrentRiasecPack12AllowedFile(file);
}

const PERSONALITY_PUBLIC_PROFILE_AGENT_SPLIT_01_ALLOWED_FILES = new Set([
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/personality-content-orchestrator.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/big-five-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/enneagram-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/seo-projection-qa-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/editorial-claim-qa-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/release-guard-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/research/personality/personality-public-profile-agent-split-01/00-executive-summary.md",
  "docs/research/personality/personality-public-profile-agent-split-01/01-agent-matrix.md",
  "docs/research/personality/personality-public-profile-agent-split-01/02-next-task-handoff.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-public-profile-agent-split-01.contract.test.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
]);

export function isPersonalityPublicProfileAgentSplit01AllowedFile(file: string): boolean {
  return PERSONALITY_PUBLIC_PROFILE_AGENT_SPLIT_01_ALLOWED_FILES.has(file);
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

const ASSESSMENT_HUB_DISCOVERABILITY_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "tests/contracts/detail-ready-1046-llms-full-artifact-consistency-repair-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
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

const PERSONALITY_HUB_MEDIA_RENDER_VERIFY_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/(localized)/[locale]/personality/page.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/personality.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-hub-contract.test.ts",
  "tests/contracts/personality-hub-media-render-verify-01.contract.test.ts",
  "tests/contracts/personality-type-browse.contract.test.tsx",
]);

const PERSONALITY_PUBLIC_CONTENT_REMOVE_MEDIA_WEB_ALLOWED_FILES = new Set([
  "AGENTS.md",
  "app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx",
  "app/(localized)/[locale]/personality/big-five/page.tsx",
  "app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx",
  "app/(localized)/[locale]/personality/enneagram/page.tsx",
  "components/content/SanitizedCmsHtml.tsx",
  "components/personality/PublicContentAssetRenderer.tsx",
  "lib/cms/personality-public-content-assets.ts",
  "lib/cms/sanitizeCmsRichText.ts",
  "lib/content/renderSimpleMarkdown.tsx",
  "tests/contracts/big-five-hub-cms-markdown-link.contract.test.tsx",
  "tests/contracts/big-five-public-render-guard.contract.test.tsx",
  "tests/contracts/big5-authority-v2-web-trust-renderer-04-contract.contract.test.tsx",
  "tests/contracts/cms-rich-content-sanitization.contract.test.tsx",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
  "tests/contracts/personality-enneagram-authority-v2.contract.test.ts",
  "tests/contracts/personality-enneagram-v1-noindex-render.contract.test.ts",
]);

const PERSONALITY_DETAIL_FAQ_SEO_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/seo/generated/article-personality-jsonld-projection-gates.v1.json",
  "lib/cms/personality-sections.tsx",
  "tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/locale-purity.contract.test.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-sections.contract.test.tsx",
]);

const PERSONALITY_SEO_TITLE_METADATA_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/(localized)/[locale]/personality/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/personality.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
]);

const PERSONALITY_COMPARISON_PAGES_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/llms-full.txt/route.ts",
  "app/llms.txt/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/personality.ts",
  "lib/mbti/entryTracking.ts",
  "lib/mbti/personalityComparison.ts",
  "next-sitemap.config.js",
  "public/sitemap.xml",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-comparison-pages.contract.test.tsx",
]);

const MBTI_SEO_05_COMPARISON_TEMPLATE_REFRESH_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/cms/personality.ts",
  "lib/mbti/personalityComparison.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-comparison-pages.contract.test.tsx",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const PERSONALITY_AT_COMPARISON_HOMEPAGE_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/page.tsx",
  "lib/cms/personality.ts",
  "lib/navigation/headerDropdownMenus.ts",
  "tests/contracts/header-big-five-personality-nav.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-at-comparison-homepage.contract.test.tsx",
]);

const PERSONALITY_CROSS_TYPE_WEB_02_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "app/(localized)/[locale]/personality/page.tsx",
  "lib/cms/personality.ts",
  "lib/mbti/personalityComparison.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-at-comparison-homepage.contract.test.tsx",
  "tests/contracts/personality-comparison-pages.contract.test.tsx",
]);

const MBTI64_SERP_SNIPPET_METADATA_ADAPTER_REPAIR_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/[type]/page.tsx",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/personality/mbti64-serp-snippet-metadata-adapter-repair-2026-06-19.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-cms.contract.test.ts",
  "tests/contracts/personality-comparison-pages.contract.test.tsx",
]);

const PERSONALITY_LLMS_FULL_COMPARISON_REPAIR_01_ALLOWED_FILES = new Set([
  "app/llms-full.txt/route.ts",
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-llms-full-comparison-repair-01.contract.test.ts",
]);
const LEGACY_CI_EMPTY_DIFF_SCOPE_SENTINEL_FILES = new Set([
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
]);

const PERSONALITY_SEO_POST_DEPLOY_INDEXATION_AUDIT_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/generated/personality-seo-post-deploy-indexation-audit-01.v1.json",
  "docs/seo/personality-seo-post-deploy-indexation-audit-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-seo-post-deploy-indexation-audit-01.contract.test.ts",
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

const PERSONALITY_BIG5_V1_NOINDEX_RENDER_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/big-five/[slug]/page.tsx",
  "app/(localized)/[locale]/personality/big-five/page.tsx",
  "components/personality/PublicContentAssetRenderer.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/research/personality/big-five-v1-noindex-render/00-executive-summary.md",
  "docs/research/personality/big-five-v1-noindex-render/01-route-inventory.md",
  "docs/research/personality/big-five-v1-noindex-render/02-api-consumer-contract.md",
  "docs/research/personality/big-five-v1-noindex-render/03-metadata-schema-audit.md",
  "docs/research/personality/big-five-v1-noindex-render/04-noindex-sitemap-llms-audit.md",
  "docs/research/personality/big-five-v1-noindex-render/05-render-smoke-results.md",
  "docs/research/personality/big-five-v1-noindex-render/06-go-no-go-for-publish-gate.md",
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "lib/cms/personality-public-content-assets.ts",
  "lib/personality/bigFivePublicRoutes.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts",
]);

const PERSONALITY_ENNEAGRAM_V1_NOINDEX_RENDER_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/personality/enneagram/[...slug]/page.tsx",
  "app/(localized)/[locale]/personality/enneagram/page.tsx",
  "components/personality/EnneagramHubContentScaffold.tsx",
  "components/personality/PublicContentAssetRenderer.tsx",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "lib/cms/personality-public-content-assets.ts",
  "lib/personality/enneagramPublicRoutes.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/personality-enneagram-v1-noindex-render.contract.test.ts",
]);

const PERSONALITY_BIG5_NAV_ENTRY_ALLOWED_FILES = new Set([
  "lib/navigation/headerDropdownMenus.ts",
  "tests/contracts/header-big-five-personality-nav.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ENNEAGRAM_PERSONALITY_NAV_ENTRY_ALLOWED_FILES = new Set([
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "lib/navigation/headerDropdownMenus.ts",
  "tests/contracts/header-enneagram-personality-nav.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
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

const ENNEAGRAM_LIVE_RESULT_SMOKE_ANSWER_CODE_FIX_01_ALLOWED_FILES = new Set([
  "scripts/ops/check-live-result-smoke.mjs",
  "tests/contracts/enneagram-api.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const EQ_LIVE_RESULT_SMOKE_ANCHOR_FIX_01_ALLOWED_FILES = new Set([
  "scripts/ops/check-live-result-smoke.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-smoke-eq-option-anchors.contract.test.ts",
]);

const RESULT_P0_LIVE_PDFS_EVIDENCE_REPORT_01_ALLOWED_FILES = new Set([
  "docs/seo/result-p0-post-deploy-smoke-rerun-live-pdfs-01.md",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const AGENT_OS_REGISTRY_GO_HOLD_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/agent-os/AGENT_HANDOFF_PROTOCOL.md",
  "docs/agent-os/AGENT_OPERATING_MODEL.md",
  "docs/agent-os/agent-registry.v1.json",
  "docs/agent-os/go-hold-matrix.v1.json",
  "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md",
  "docs/result-page-agents/six-scale-result-agent-readiness.template.json",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_PAGE_AGENT_PLATFORM_STANDARD_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md",
  "docs/result-page-agents/six-scale-result-agent-readiness.template.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts",
]);

const MBTI_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/mbti-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/mbti-result-page-agent-scaffold-scan-2026-06-22.md",
  "tests/contracts/fa30-batch2-runtime-qa-harness.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/mbti-result-page-agent-readiness-proposal.contract.test.ts",
]);

const IQ_RAVEN_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/iq-raven-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/iq-raven-result-page-agent-scaffold-scan-2026-06-22.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/iq-raven-result-page-agent-readiness-proposal.contract.test.ts",
]);

const EQ60_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/eq60-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/eq60-result-page-agent-scaffold-scan-2026-06-22.md",
  "tests/contracts/eq60-result-page-agent-readiness-proposal.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/big-five-result-page-agent-standard-alignment-2026-06-22.md",
  "tests/contracts/big-five-result-page-agent-standard-alignment.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_RESULT_PAGE_AGENT_READINESS_DOC_REFRESH_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/big-five-result-page-agent-standard-alignment-2026-06-22.md",
  "tests/contracts/big-five-result-page-agent-standard-alignment.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_RESULT_PAGE_AGENT_READY_READONLY_CLEARED_HANDOFF_ALLOWED_FILES = new Set([
  "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md",
  "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff-2026-06-23.md",
  "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json",
  "docs/result-page-agents/result-page-agent-analytics-handoff-2026-06-23.md",
  "docs/result-page-agents/result-page-agent-analytics-handoff.v1.json",
  "docs/result-page-agents/result-page-agent-runtime-qa-handoff-2026-06-23.md",
  "docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json",
  "docs/result-page-agents/six-hub-free-full-report-runtime-qa-2026-06-23.md",
  "docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json",
  "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md",
  "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review.proposal.json",
  "docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md",
  "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json",
  "docs/result-page-agents/six-scale-result-agent-readiness.template.json",
  "tests/contracts/big-five-result-page-agent-readonly-cleared-handoff.contract.test.ts",
  "tests/contracts/big-five-result-page-agent-standard-alignment.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-page-agent-analytics-handoff.contract.test.ts",
  "tests/contracts/result-page-agent-runtime-qa-handoff.contract.test.ts",
  "tests/contracts/six-hub-free-full-report-runtime-qa.contract.test.ts",
  "tests/contracts/six-result-page-agent-readonly-route-api-pdf-share-review.contract.test.ts",
  "tests/contracts/six-result-page-agent-readiness-matrix.contract.test.ts",
]);

const ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/enneagram-result-page-agent-standard-alignment-2026-06-22.md",
  "tests/contracts/enneagram-result-page-agent-standard-alignment.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/riasec-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/riasec-result-page-agent-standard-alignment-2026-06-23.md",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-result-page-agent-standard-alignment.contract.test.ts",
]);

const SIX_RESULT_PAGE_AGENT_READINESS_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md",
  "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/six-result-page-agent-readiness-matrix.contract.test.ts",
]);

const SIX_HUB_FREE_FULL_REPORT_RUNTIME_QA_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/six-hub-free-full-report-runtime-qa-2026-06-23.md",
  "docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/six-hub-free-full-report-runtime-qa.contract.test.ts",
]);

const SIX_HUB_PAID_UNLOCK_COPY_AUTHORITY_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract-2026-06-25.md",
  "docs/seo/agent/six-hub-paid-unlock-copy-authority-contract.v1.json",
  "tests/contracts/six-hub-paid-unlock-copy-authority-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const SIX_HUB_PAID_UNLOCK_FRONTEND_CONSUMER_GUARD_01_ALLOWED_FILES = new Set([
  "app/(localized)/[locale]/tests/[slug]/page.tsx",
  "lib/rollout/scaleRollout.ts",
  "lib/i18n/dict/en.json",
  "lib/i18n/dict/zh.json",
  "tests/contracts/six-hub-paid-unlock-copy-authority-contract.contract.test.ts",
  "tests/contracts/six-hub-paid-unlock-frontend-consumer-guard.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const RESULT_PAGE_AGENT_RUNTIME_QA_HANDOFF_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/result-page-agent-runtime-qa-handoff-2026-06-23.md",
  "docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-page-agent-runtime-qa-handoff.contract.test.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json",
  "tests/contracts/active-result-page-agents-runtime-qa-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/big5-runtime-qa-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json",
  "tests/contracts/big5-runtime-qa-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ENNEAGRAM_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/enneagram-runtime-qa-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json",
  "tests/contracts/enneagram-runtime-qa-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RIASEC_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/riasec-runtime-qa-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json",
  "tests/contracts/riasec-runtime-qa-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-runtime-qa-matrix-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-runtime-qa-matrix.v1.json",
  "tests/contracts/active-result-page-agents-runtime-qa-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RESULT_PAGE_AGENT_ANALYTICS_HANDOFF_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/result-page-agent-analytics-handoff-2026-06-23.md",
  "docs/result-page-agents/result-page-agent-analytics-handoff.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-page-agent-analytics-handoff.contract.test.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-analytics-common-contract-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json",
  "tests/contracts/active-result-page-agents-analytics-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/big5-analytics-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/big5-analytics-consumption-packet.v1.json",
  "tests/contracts/big5-analytics-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ENNEAGRAM_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/enneagram-analytics-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json",
  "tests/contracts/enneagram-analytics-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RIASEC_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/riasec-analytics-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/riasec-analytics-consumption-packet.v1.json",
  "tests/contracts/riasec-analytics-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-analytics-matrix-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-analytics-matrix.v1.json",
  "tests/contracts/active-result-page-agents-analytics-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json",
  "tests/contracts/active-result-page-agents-safety-gate-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const BIG5_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/big5-safety-gate-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/big5-safety-gate-consumption-packet.v1.json",
  "tests/contracts/big5-safety-gate-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ENNEAGRAM_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/enneagram-safety-gate-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json",
  "tests/contracts/enneagram-safety-gate-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const RIASEC_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/riasec-safety-gate-consumption-packet-2026-06-23.md",
  "docs/result-page-agents/riasec-safety-gate-consumption-packet.v1.json",
  "tests/contracts/riasec-safety-gate-consumption-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "docs/result-page-agents/active-result-page-agents-safety-gate-matrix-2026-06-23.md",
  "docs/result-page-agents/active-result-page-agents-safety-gate-matrix.v1.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "tests/contracts/active-result-page-agents-safety-gate-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
]);

const ASSESSMENT_HUB_QA_COMMON_CONTRACT_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-qa-common-contract-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-qa-common-contract.v1.json",
  "tests/contracts/assessment-hub-qa-common-contract.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

const ASSESSMENT_HUB_SIX_ROUTE_METADATA_PARITY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-six-route-metadata-parity-packet.v1.json",
  "tests/contracts/assessment-hub-six-route-metadata-parity-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const ASSESSMENT_HUB_TAKE_FLOW_CTA_PACKET_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-take-flow-cta-packet-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-take-flow-cta-packet.v1.json",
  "tests/contracts/assessment-hub-take-flow-cta-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const ASSESSMENT_HUB_FREE_FULL_REPORT_CLAIM_PACKET_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-free-full-report-claim-packet-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-free-full-report-claim-packet.v1.json",
  "tests/contracts/assessment-hub-free-full-report-claim-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
]);

const ASSESSMENT_HUB_SOURCE_AUTHORITY_INDEXABILITY_PACKET_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-source-authority-indexability-packet-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-source-authority-indexability-packet.v1.json",
  "tests/contracts/assessment-hub-source-authority-indexability-packet.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const ASSESSMENT_HUB_QA_READINESS_MATRIX_01_ALLOWED_FILES = new Set([
  "docs/assessment-hub/assessment-hub-qa-readiness-matrix-2026-06-24.md",
  "docs/assessment-hub/assessment-hub-qa-readiness-matrix.v1.json",
  "tests/contracts/assessment-hub-qa-readiness-matrix.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

const RESULT_PAGE_AGENT_SEO_CONTROL_HANDOFF_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/result-page-agent-seo-control-handoff-2026-06-23.md",
  "docs/result-page-agents/result-page-agent-seo-control-handoff.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/result-page-agent-seo-control-handoff.contract.test.ts",
]);

const RIASEC_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md",
  "docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review.v1.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/riasec-result-page-agent-readonly-route-api-pdf-share-review.contract.test.ts",
]);

const SIX_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES = new Set([
  "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review-2026-06-23.md",
  "docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review.proposal.json",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/six-result-page-agent-readonly-route-api-pdf-share-review.contract.test.ts",
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

export function isSecurity103Web01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-103-web-01") {
    return true;
  }

  return SECURITY_103_WEB_01_ALLOWED_FILES.has(file);
}

export function isSecurity123Web01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-01") {
    return true;
  }

  return SECURITY_123_WEB_01_ALLOWED_FILES.has(file);
}

export function isSecurity123Web02AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-02") {
    return true;
  }

  return SECURITY_123_WEB_02_ALLOWED_FILES.has(file);
}

export function isSecurity123Web03AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-03") {
    return true;
  }

  return SECURITY_123_WEB_03_ALLOWED_FILES.has(file);
}

export function isSecurity123Web04AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-04") {
    return true;
  }

  return SECURITY_123_WEB_04_ALLOWED_FILES.has(file);
}

export function isSecurity123Web04ScopeActive(branch = CURRENT_BRANCH): boolean {
  return branch === "codex/security-123-web-04";
}

export function isSecurity123Web05AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-05") {
    return true;
  }

  return SECURITY_123_WEB_05_ALLOWED_FILES.has(file);
}

export function isSecurity123Web05ScopeActive(branch = CURRENT_BRANCH): boolean {
  return branch === "codex/security-123-web-05";
}

export function isSecurity123Web06AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-06") {
    return true;
  }

  return SECURITY_123_WEB_06_ALLOWED_FILES.has(file);
}

export function isSecurity123Web07AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-07") {
    return true;
  }

  return SECURITY_123_WEB_07_ALLOWED_FILES.has(file);
}

export function isSecurity123Web08AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-08") {
    return true;
  }

  return SECURITY_123_WEB_08_ALLOWED_FILES.has(file);
}

export function isSecurity123Web09AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-123-web-09") {
    return true;
  }

  return SECURITY_123_WEB_09_ALLOWED_FILES.has(file);
}

export function isSecurity122Web01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-01") {
    return true;
  }

  return SECURITY_122_WEB_01_ALLOWED_FILES.has(file);
}

export function isSecurity122Web02AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-02") {
    return true;
  }

  return SECURITY_122_WEB_02_ALLOWED_FILES.has(file);
}

export function isSecurity122Web03AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-03") {
    return true;
  }

  return SECURITY_122_WEB_03_ALLOWED_FILES.has(file);
}

export function isSecurity122Web04AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-04") {
    return true;
  }

  return SECURITY_122_WEB_04_ALLOWED_FILES.has(file);
}

export function isSecurity122Web05AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-05") {
    return true;
  }

  return SECURITY_122_WEB_05_ALLOWED_FILES.has(file);
}

export function isSecurity122Web06AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-06") {
    return true;
  }

  return SECURITY_122_WEB_06_ALLOWED_FILES.has(file);
}

export function isSecurity122Web07AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-07") {
    return true;
  }

  return SECURITY_122_WEB_07_ALLOWED_FILES.has(file);
}

export function isSecurity122Web08AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-08") {
    return true;
  }

  return SECURITY_122_WEB_08_ALLOWED_FILES.has(file);
}

export function isSecurity122Web09AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-09") {
    return true;
  }

  return SECURITY_122_WEB_09_ALLOWED_FILES.has(file);
}

export function isSecurity122Web10AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-10") {
    return true;
  }

  return SECURITY_122_WEB_10_ALLOWED_FILES.has(file);
}

export function isSecurity122Web11AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-11") {
    return true;
  }

  return SECURITY_122_WEB_11_ALLOWED_FILES.has(file);
}

export function isSecurity122Web12AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-12") {
    return true;
  }

  return SECURITY_122_WEB_12_ALLOWED_FILES.has(file);
}

export function isSecurity122Web13AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-13") {
    return true;
  }

  return SECURITY_122_WEB_13_ALLOWED_FILES.has(file);
}

export function isSecurity122Web14AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-14") {
    return true;
  }

  return SECURITY_122_WEB_14_ALLOWED_FILES.has(file);
}

export function isSecurity122Web15AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-15") {
    return true;
  }

  return SECURITY_122_WEB_15_ALLOWED_FILES.has(file);
}

export function isSecurity122Web16AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-16") {
    return true;
  }

  return SECURITY_122_WEB_16_ALLOWED_FILES.has(file);
}

export function isSecurity122Web17AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/security-122-web-17") {
    return true;
  }

  return SECURITY_122_WEB_17_ALLOWED_FILES.has(file);
}

export function isAiImpactV5ExpandedPageQaAllowedFile(file: string): boolean {
  return (
    file === "tests/contracts/helpers/currentPrScope.ts" ||
    file === "lib/career/api/fetchCareerAiImpactAssetPreview.ts" ||
    file === "tests/contracts/career-ai-impact-preview-consumer.contract.test.tsx" ||
    file.startsWith("generated/career-ai-impact-v5-1046-expanded-page-qa/") ||
    file.startsWith("generated/career-ai-impact-v5-editorial-review-package/")
  );
}

export function isQuizPackPerformanceHotfixAllowedFile(file: string): boolean {
  return QUIZ_PACK_PERFORMANCE_HOTFIX_ALLOWED_FILES.has(file);
}

function isQuizPackContractMainReplayAllowedFile(file: string): boolean {
  return (
    CURRENT_BRANCH === "codex/fix-quiz-pack-contract-main-replay" &&
    (file === "tests/contracts/helpers/currentPrScope.ts" || file === "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts")
  );
}

export function isCurrentQuizPackPerformanceHotfixAllowedFile(file: string): boolean {
  return CURRENT_BRANCH === "codex/quiz-pack-performance-hotfix" && isQuizPackPerformanceHotfixAllowedFile(file);
}

function isCurrentCareerSkillsEntry1046CompletionStateAllowedFile(file: string): boolean {
  return (
    CURRENT_BRANCH === "codex/career-skills-entry-1046-completion-state" &&
    CAREER_SKILLS_ENTRY_1046_COMPLETION_STATE_ALLOWED_FILES.has(file)
  );
}

export function isCurrentRiasecPack12AllowedFile(file: string): boolean {
  if (isBigFivePublicProfileAgentPilot01AllowedFile(file)) {
    return true;
  }

  if (isCurrentMbtiContractSidecarFixAllowedFile(file)) {
    return true;
  }

  if (isCurrentCareerSkillsEntry1046CompletionStateAllowedFile(file)) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-career-graph-bridge-common-contract-01" &&
    RIASEC_CAREER_GRAPH_BRIDGE_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-methodology-common-contract-01" &&
    BIG5_METHODOLOGY_TRUST_SCIENCE_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-methodology-source-authority-packet-01" &&
    BIG5_METHODOLOGY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-career-graph-source-authority-packet-01" &&
    RIASEC_CAREER_GRAPH_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-career-graph-claim-safety-packet-01" &&
    RIASEC_CAREER_GRAPH_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-career-graph-candidate-cluster-packet-01" &&
    RIASEC_CAREER_GRAPH_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-career-graph-bridge-matrix-01" &&
    RIASEC_CAREER_GRAPH_BRIDGE_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-public-personality-handoff-common-contract-01" &&
    ENNEAGRAM_PUBLIC_PERSONALITY_HANDOFF_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-public-personality-source-authority-packet-01" &&
    ENNEAGRAM_PUBLIC_PERSONALITY_SOURCE_AUTHORITY_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-public-personality-claim-safety-packet-01" &&
    ENNEAGRAM_PUBLIC_PERSONALITY_CLAIM_SAFETY_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-public-personality-candidate-cluster-packet-01" &&
    ENNEAGRAM_PUBLIC_PERSONALITY_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-public-personality-handoff-matrix-01" &&
    ENNEAGRAM_PUBLIC_PERSONALITY_HANDOFF_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/iq-owner-30-fe-formcode-04" &&
    IQ_OWNER_30_FE_FORMCODE_04_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-phase8c-configurable-timeout" &&
    ENNEAGRAM_PHASE8C_CONFIGURABLE_TIMEOUT_SCOPE_GUARD_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-hub-test-detail-frontend-landing-surface-consumer-01" ||
    CURRENT_BRANCH === "codex/batch-1-riasec-boundary-runtime-fix-01"
  ) {
    return (
      SIX_HUB_TEST_DETAIL_FRONTEND_LANDING_SURFACE_CONSUMER_01_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file) ||
      CODEQL_HYGIENE_ALLOWED_FILES.has(file)
    );
  }

  if (isQuizPackContractMainReplayAllowedFile(file)) {
    return true;
  }

  if (isCurrentQuizPackPerformanceHotfixAllowedFile(file)) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti64-gsc-import-stabilize-01" &&
    MBTI64_GSC_IMPORT_STABILIZE_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti64-agent-priority-ranker-01" &&
    MBTI64_AGENT_PRIORITY_RANKER_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti64-agent-recommendation-rerun-loop-01" &&
    MBTI64_AGENT_RECOMMENDATION_RERUN_LOOP_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/personality-agent-auto-runner-scheduler-01" &&
    PERSONALITY_AGENT_AUTO_RUNNER_SCHEDULER_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/personality-agent-auto-runner-scheduler-activation-01" &&
    PERSONALITY_AGENT_AUTO_RUNNER_SCHEDULER_ACTIVATION_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti64-gsc-query-export-10-01" &&
    MBTI64_GSC_QUERY_EXPORT_10_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti64-personality-detail-frontend-api-origin-repair-01" &&
    MBTI64_PERSONALITY_DETAIL_FRONTEND_API_ORIGIN_REPAIR_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/fap-web-production-auto-deploy-env-fix-01" &&
    FAP_WEB_PRODUCTION_AUTO_DEPLOY_ENV_FIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/result-p0-live-pdfs-evidence-report-01" &&
    (RESULT_P0_LIVE_PDFS_EVIDENCE_REPORT_01_ALLOWED_FILES.has(file) || CODEQL_HYGIENE_ALLOWED_FILES.has(file))
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/agent-os-registry-go-hold-matrix-01" &&
    (AGENT_OS_REGISTRY_GO_HOLD_MATRIX_01_ALLOWED_FILES.has(file) || CODEQL_HYGIENE_ALLOWED_FILES.has(file))
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/result-page-agent-platform-standard-01" &&
    RESULT_PAGE_AGENT_PLATFORM_STANDARD_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/mbti-result-page-agent-scaffold-scan-01" &&
    MBTI_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/iq-raven-result-page-agent-scaffold-scan-01" &&
    IQ_RAVEN_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/eq60-result-page-agent-scaffold-scan-01" &&
    EQ60_RESULT_PAGE_AGENT_SCAFFOLD_SCAN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-result-page-agent-standard-align-01" &&
    BIG5_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-readiness-doc-refresh" &&
    BIG5_RESULT_PAGE_AGENT_READINESS_DOC_REFRESH_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-ready-readonly-cleared-handoff" &&
    BIG5_RESULT_PAGE_AGENT_READY_READONLY_CLEARED_HANDOFF_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-result-page-agent-standard-align-01" &&
    ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-result-page-agent-standard-align-01" &&
    RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGN_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-result-page-agent-readiness-matrix-01" &&
    SIX_RESULT_PAGE_AGENT_READINESS_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-hub-free-full-report-runtime-qa-01" &&
    SIX_HUB_FREE_FULL_REPORT_RUNTIME_QA_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-hub-paid-unlock-copy-authority-contract-01" &&
    SIX_HUB_PAID_UNLOCK_COPY_AUTHORITY_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-hub-paid-unlock-frontend-consumer-guard-01" &&
    isSixHubPaidUnlockFrontendConsumerGuard01AllowedFile(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/result-page-agent-runtime-qa-handoff-01" &&
    RESULT_PAGE_AGENT_RUNTIME_QA_HANDOFF_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-runtime-qa-common-contract-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-runtime-qa-consumption-packet-01" &&
    BIG5_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-runtime-qa-consumption-packet-01" &&
    ENNEAGRAM_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-runtime-qa-consumption-packet-01" &&
    RIASEC_RUNTIME_QA_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-runtime-qa-matrix-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/result-page-agent-analytics-handoff-01" &&
    RESULT_PAGE_AGENT_ANALYTICS_HANDOFF_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-analytics-common-contract-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-analytics-consumption-packet-01" &&
    BIG5_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-analytics-consumption-packet-01" &&
    ENNEAGRAM_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-analytics-consumption-packet-01" &&
    RIASEC_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-analytics-matrix-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-safety-gate-common-contract-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_COMMON_CONTRACT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/big5-safety-gate-consumption-packet-01" &&
    BIG5_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-safety-gate-consumption-packet-01" &&
    ENNEAGRAM_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-safety-gate-consumption-packet-01" &&
    RIASEC_SAFETY_GATE_CONSUMPTION_PACKET_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/active-result-page-agents-safety-gate-matrix-01" &&
    ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_MATRIX_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/result-page-agent-seo-control-handoff-01" &&
    RESULT_PAGE_AGENT_SEO_CONTROL_HANDOFF_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/riasec-result-page-agent-readonly-route-api-pdf-share-review-01" &&
    RIASEC_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (
    CURRENT_BRANCH === "codex/six-result-page-agent-readonly-route-api-pdf-share-review-01" &&
    SIX_RESULT_PAGE_AGENT_READONLY_ROUTE_API_PDF_SHARE_REVIEW_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (isAiImpactV5ExpandedPageQaAllowedFile(file)) {
    return true;
  }

  if (MBTI64_AGENT_EXPANSION_88_SECURITY_ALLOWED_FILES.has(file)) {
    return true;
  }

  if (HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file)) {
    return true;
  }

  if (
    RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
    RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (CURRENT_BRANCH === "codex/personality-enneagram-v1-noindex-render-01") {
    return (
      PERSONALITY_ENNEAGRAM_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file) ||
      file === "docs/seo/generated/metadata-surface-inventory.v1.csv" ||
      file === "docs/seo/generated/metadata-surface-inventory.v1.json"
    );
  }

  if (CURRENT_BRANCH === "codex/personality-enneagram-nav-hub-alignment-01") {
    return (
      ENNEAGRAM_PERSONALITY_NAV_ENTRY_ALLOWED_FILES.has(file) ||
      file === "docs/seo/generated/metadata-surface-inventory.v1.csv" ||
      file === "docs/seo/generated/metadata-surface-inventory.v1.json"
    );
  }

  if (
    (CURRENT_BRANCH === "main" || CURRENT_BRANCH === "codex/fix-main-contract-scope-965") &&
    PERSONALITY_BIG5_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file)
  ) {
    return true;
  }

  if (CURRENT_BRANCH === "codex/homepage-ui-image-fallback-01") {
    return HOMEPAGE_UI_IMAGE_FALLBACK_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/homepage-content-polish-batch") {
    return HOMEPAGE_CONTENT_POLISH_BATCH_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-free-test-homepage-cta-01") {
    return SEO_FREE_TEST_HOMEPAGE_CTA_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-free-test-hub-category-cta-02") {
    return SEO_FREE_TEST_HUB_CATEGORY_CTA_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-free-test-flagship-landing-03") {
    return SEO_FREE_TEST_FLAGSHIP_LANDING_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fa30-web-01-six-assessment-hub-parity") {
    return FA30_WEB_01_ALLOWED_FILES.has(file) || CODEQL_HYGIENE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fa30-web-02-runtime-qa-harness") {
    return FA30_WEB_02_ALLOWED_FILES.has(file) || CODEQL_HYGIENE_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "codex/six-hub-test-detail-frontend-landing-surface-consumer-01" ||
    CURRENT_BRANCH === "codex/batch-1-riasec-boundary-runtime-fix-01"
  ) {
    return (
      SIX_HUB_TEST_DETAIL_FRONTEND_LANDING_SURFACE_CONSUMER_01_ALLOWED_FILES.has(file) ||
      HELP_SUPPORT_CONTACT_RUNTIME_01_ALLOWED_FILES.has(file) ||
      RIASEC_V2_POST_PUBLISH_SMOKE_02_ALLOWED_FILES.has(file) ||
      RIASEC_V2_SEARCH_SUBMISSION_PREFLIGHT_01_ALLOWED_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/seo-free-test-secondary-cta-04") {
    return SEO_FREE_TEST_SECONDARY_CTA_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-free-test-article-internal-links-05") {
    return SEO_FREE_TEST_ARTICLE_INTERNAL_LINKS_05_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/personality-at-comparison-homepage-01") {
    return PERSONALITY_AT_COMPARISON_HOMEPAGE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-cross-type-web-02") {
    return PERSONALITY_CROSS_TYPE_WEB_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-frontend-seo-consume-01") {
    return MBTI64_FRONTEND_SEO_CONSUME_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-frontend-personality-v21-render-contract-01") {
    return MBTI64_FRONTEND_PERSONALITY_V21_RENDER_CONTRACT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-frontend-personality-v21-html-completeness-repair-01") {
    return MBTI64_FRONTEND_PERSONALITY_V21_HTML_COMPLETENESS_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-global-header-private-route-hygiene-01") {
    return MBTI64_GLOBAL_HEADER_PRIVATE_ROUTE_HYGIENE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-agent-qa-gates-01") {
    return PERSONALITY_AGENT_QA_GATES_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/contract-scope-guard-strategy-02") {
    return CONTRACT_SCOPE_GUARD_STRATEGY_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/result-smoke-proxy-generation-hints") {
    return RESULT_SMOKE_PROXY_GENERATION_HINTS_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/enneagram-live-result-smoke-answer-code-fix-01") {
    return ENNEAGRAM_LIVE_RESULT_SMOKE_ANSWER_CODE_FIX_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/eq-live-result-smoke-anchor-fix-01") {
    return EQ_LIVE_RESULT_SMOKE_ANCHOR_FIX_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-owner-30-fe-image-renderer-03") {
    return IQ_OWNER_30_FE_IMAGE_RENDERER_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-owner-30-fe-formcode-04") {
    return IQ_OWNER_30_FE_FORMCODE_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-session-question-delivery-05b") {
    return IQ_SESSION_QUESTION_DELIVERY_05B_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/iq-owner-30-norm-claim-policy-02b") {
    return IQ_OWNER_30_NORM_CLAIM_POLICY_02B_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "codex/article-answer-surface-layout" ||
    CURRENT_BRANCH === "codex/article-body-width-align"
  ) {
    return ARTICLE_ANSWER_SURFACE_LAYOUT_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/assessment-hub-qa-common-contract-01") {
    return ASSESSMENT_HUB_QA_COMMON_CONTRACT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/assessment-hub-six-route-metadata-parity-packet-01") {
    return ASSESSMENT_HUB_SIX_ROUTE_METADATA_PARITY_PACKET_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/assessment-hub-take-flow-cta-packet-01") {
    return ASSESSMENT_HUB_TAKE_FLOW_CTA_PACKET_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/assessment-hub-free-full-report-claim-packet-01") {
    return ASSESSMENT_HUB_FREE_FULL_REPORT_CLAIM_PACKET_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/assessment-hub-source-authority-indexability-packet-01") {
    return ASSESSMENT_HUB_SOURCE_AUTHORITY_INDEXABILITY_PACKET_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/assessment-hub-qa-readiness-matrix-01") {
    return ASSESSMENT_HUB_QA_READINESS_MATRIX_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/big-five-public-profile-agent-qa-01") {
    return BIG_FIVE_PUBLIC_PROFILE_AGENT_QA_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/big5-114-seo-runtime-release-01") {
    return BIG5_114_SEO_RUNTIME_RELEASE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/big5-114-llms-worker-cache-consistency-repair-01") {
    return BIG5_114_LLMS_WORKER_CACHE_CONSISTENCY_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/big5-sitemap-private-path-gate-precision-repair-01") {
    return BIG5_SITEMAP_PRIVATE_PATH_GATE_PRECISION_REPAIR_01_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/assessment-hub-discoverability-repair-01") {
    return ASSESSMENT_HUB_DISCOVERABILITY_REPAIR_01_ALLOWED_FILES.has(file);
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

  if (
    CURRENT_BRANCH === "codex/llms-full-article-enumeration" ||
    CURRENT_BRANCH === "codex/llms-full-latest-article-enumeration"
  ) {
    return LLMS_FULL_ARTICLE_ENUMERATION_ALLOWED_FILES.has(file);
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

  if (
    CURRENT_BRANCH === "codex/codeql-hygiene-alerts" ||
    CURRENT_BRANCH === "codex/codeql-mbti64-agent-offline-surface" ||
    CURRENT_BRANCH === "codex/codeql-hygiene-unused-conditionals"
  ) {
    return CODEQL_HYGIENE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fix-codeql-http-file-access") {
    return CODEQL_HTTP_FILE_ACCESS_108_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-web-sec-01-eq-v5-report-gate") {
    return PR_WEB_SEC_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-103-web-01") {
    return SECURITY_103_WEB_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-01") {
    return SECURITY_122_WEB_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-02") {
    return SECURITY_122_WEB_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-03") {
    return SECURITY_122_WEB_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-04") {
    return SECURITY_122_WEB_04_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-05") {
    return SECURITY_122_WEB_05_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-06") {
    return SECURITY_122_WEB_06_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-07") {
    return SECURITY_122_WEB_07_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-08") {
    return SECURITY_122_WEB_08_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-09") {
    return SECURITY_122_WEB_09_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-10") {
    return SECURITY_122_WEB_10_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-11") {
    return SECURITY_122_WEB_11_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-12") {
    return SECURITY_122_WEB_12_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-13") {
    return SECURITY_122_WEB_13_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-14") {
    return SECURITY_122_WEB_14_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-15") {
    return SECURITY_122_WEB_15_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-16") {
    return SECURITY_122_WEB_16_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/security-122-web-17") {
    return SECURITY_122_WEB_17_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-eq-per-03-frontend-eq-v51-personalization") {
    return PR_EQ_PER_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-eq-sjt-03-frontend-take-flow") {
    return PR_EQ_SJT_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/pr-eq-agent-runtime-03-frontend-drawer") {
    return PR_EQ_AGENT_RUNTIME_03_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/mbti-pdf-result-snapshot-shell") {
    return MBTI_PDF_RESULT_SNAPSHOT_SHELL_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/mbti-take-attribution-flaky-ci-fix") {
    return MBTI_TAKE_ATTRIBUTION_FLAKY_CI_FIX_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti-desktop-band-nuance-contract-fix-01") {
    return MBTI_DESKTOP_BAND_NUANCE_CONTRACT_FIX_01_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "codex/mbti-contract-sidecar-fixes-1388-1292" ||
    CURRENT_BRANCH === "codex/mbti-contract-sidecar-main-revalidate-fix"
  ) {
    return MBTI_CONTRACT_SIDECAR_FIXES_1388_1292_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/personality-public-profile-agent-split-01") {
    return PERSONALITY_PUBLIC_PROFILE_AGENT_SPLIT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-hub-media-render-verify-01") {
    return PERSONALITY_HUB_MEDIA_RENDER_VERIFY_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-public-content-remove-media-web") {
    return PERSONALITY_PUBLIC_CONTENT_REMOVE_MEDIA_WEB_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-detail-faq-seo-01") {
    return PERSONALITY_DETAIL_FAQ_SEO_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-seo-title-metadata-01") {
    return PERSONALITY_SEO_TITLE_METADATA_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-comparison-pages-01") {
    return PERSONALITY_COMPARISON_PAGES_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti-seo-05-comparison-template-refresh") {
    return MBTI_SEO_05_COMPARISON_TEMPLATE_REFRESH_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-serp-snippet-metadata-adapter-repair-01") {
    return MBTI64_SERP_SNIPPET_METADATA_ADAPTER_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-llms-full-comparison-repair-01") {
    return (
      PERSONALITY_LLMS_FULL_COMPARISON_REPAIR_01_ALLOWED_FILES.has(file) ||
      LEGACY_CI_EMPTY_DIFF_SCOPE_SENTINEL_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/personality-seo-post-deploy-indexation-audit-01") {
    return (
      PERSONALITY_SEO_POST_DEPLOY_INDEXATION_AUDIT_01_ALLOWED_FILES.has(file) ||
      LEGACY_CI_EMPTY_DIFF_SCOPE_SENTINEL_FILES.has(file)
    );
  }

  if (CURRENT_BRANCH === "codex/personality-big5-v1-noindex-render-01") {
    return PERSONALITY_BIG5_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/personality-enneagram-v1-noindex-render-01") {
    return PERSONALITY_ENNEAGRAM_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/big-five-personality-nav-entry") {
    return PERSONALITY_BIG5_NAV_ENTRY_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "codex/enneagram-personality-nav-entry" ||
    CURRENT_BRANCH === "codex/personality-enneagram-nav-hub-alignment-01"
  ) {
    return ENNEAGRAM_PERSONALITY_NAV_ENTRY_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/seo-ops-stabilize-02-public-article-smoke") {
    return SEO_OPS_STABILIZE_02_PUBLIC_ARTICLE_SMOKE_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/career-salary-post-import-seo-safety-audit") {
    return CAREER_SALARY_POST_IMPORT_SEO_SAFETY_AUDIT_ALLOWED_FILES.has(file);
  }

  if (
    CURRENT_BRANCH === "codex/career-ai-impact-preview-consumer" ||
    CURRENT_BRANCH === "codex/ai-impact-v5-staging-page-qa-50" ||
    CURRENT_BRANCH === "codex/ai-impact-post-import-seo-safety-audit"
  ) {
    return CAREER_AI_IMPACT_PREVIEW_CONSUMER_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-identity-1046-authority-state") {
    return CAREER_IDENTITY_1046_AUTHORITY_STATE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/career-skills-entry-1046-completion-state") {
    return CAREER_SKILLS_ENTRY_1046_COMPLETION_STATE_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-conv-tracking-01") {
    return SEO_CONV_TRACKING_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-conv-runtime-03") {
    return SEO_CONV_RUNTIME_03_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-ops-readmodel-bridge-01") {
    return SEO_OPS_READMODEL_BRIDGE_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-runtime-qa-agent-01") {
    return SEO_RUNTIME_QA_AGENT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-gpt55-handoff-01") {
    return SEO_GPT55_HANDOFF_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-weekly-automation-control-packet-02") {
    return SEO_WEEKLY_AUTOMATION_CONTROL_PACKET_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-opportunity-queue-contract-01") {
    return SEO_OPPORTUNITY_QUEUE_CONTRACT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-cms-draft-package-contract-01") {
    return SEO_CMS_DRAFT_PACKAGE_CONTRACT_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/seo-agent-fapweb-code-pr-writer-01") {
    return SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-llms-full-pilot-exposure-repair-01") {
    return MBTI64_LLMS_FULL_PILOT_EXPOSURE_REPAIR_01_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-llms-full-pilot-exposure-repair-02") {
    return MBTI64_LLMS_FULL_PILOT_EXPOSURE_REPAIR_02_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/fix-contract-mbti64-llms-authority") {
    return FIX_CONTRACT_MBTI64_LLMS_AUTHORITY_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/mbti64-llms-full-fresh-3-membership-repair-01") {
    return MBTI64_LLMS_FULL_FRESH_3_MEMBERSHIP_REPAIR_01_ALLOWED_FILES.has(file);
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

  if (CURRENT_BRANCH === "codex/article-hreflang-parity-verifier") {
    return ARTICLE_HREFLANG_PARITY_VERIFIER_ALLOWED_FILES.has(file);
  }

  if (CURRENT_BRANCH === "codex/riasec-result-fapweb-rendered-preview-qa-01") {
    return RIASEC_RESULT_FAPWEB_RENDERED_PREVIEW_QA_01_ALLOWED_FILES.has(file);
  }

  return CURRENT_BRANCH === "codex/riasec-full-content-pack-12" && RIASEC_PACK12_ALLOWED_FILES.has(file);
}

export function isCurrentMbtiContractSidecarFixAllowedFile(file: string): boolean {
  return (
    (CURRENT_BRANCH === "codex/mbti-contract-sidecar-fixes-1388-1292" ||
      CURRENT_BRANCH === "codex/mbti-contract-sidecar-main-revalidate-fix" ||
      CURRENT_BRANCH === "codex/release-freeze-harness-scope-ci-fix") &&
    MBTI_CONTRACT_SIDECAR_FIXES_1388_1292_ALLOWED_FILES.has(file)
  );
}

export function isPersonalityBig5V1NoindexRender01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-big5-v1-noindex-render-01") {
    return true;
  }

  return PERSONALITY_BIG5_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file);
}

export function isBigFivePublicProfileAgentPilot01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/big-five-public-profile-agent-pilot-01") {
    return true;
  }

  return BIG_FIVE_PUBLIC_PROFILE_AGENT_PILOT_01_ALLOWED_FILES.has(file);
}

export function isBigFivePublicProfileAgentQa01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/big-five-public-profile-agent-qa-01") {
    return true;
  }

  return BIG_FIVE_PUBLIC_PROFILE_AGENT_QA_01_ALLOWED_FILES.has(file);
}

export function isPersonalityAgentOpportunityRankerAutomation01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-agent-opportunity-ranker-automation-01") {
    return true;
  }

  return PERSONALITY_AGENT_OPPORTUNITY_RANKER_AUTOMATION_01_ALLOWED_FILES.has(file);
}

export function isPersonalityAgentRecommendationAutoRunner01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-agent-recommendation-auto-runner-01") {
    return true;
  }

  return PERSONALITY_AGENT_RECOMMENDATION_AUTO_RUNNER_01_ALLOWED_FILES.has(file);
}

export function isPersonalityAgentAutoQaAndApprovalHandoff01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-agent-auto-qa-and-approval-handoff-01") {
    return true;
  }

  return PERSONALITY_AGENT_AUTO_QA_AND_APPROVAL_HANDOFF_01_ALLOWED_FILES.has(file);
}

export function isMbtiMainFaqSchemaEvidence01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-main-faq-schema-evidence-01") {
    return true;
  }

  return MBTI_MAIN_FAQ_SCHEMA_EVIDENCE_01_ALLOWED_FILES.has(file);
}

export function isMbtiResultPagePdfSmokeQualityGateAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-pdf-result-snapshot-smoke-quality-gate") {
    return true;
  }

  return MBTI_RESULT_PAGE_PDF_SMOKE_QUALITY_GATE_ALLOWED_FILES.has(file);
}

export function isMbtiResultPagePdfVisualPaginationAllowedFile(file: string): boolean {
  return MBTI_RESULT_PAGE_PDF_VISUAL_PAGINATION_ALLOWED_FILES.has(file);
}

export function isMbtiPdfSnapshotRenderedSmokeH2AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-pdf-snapshot-rendered-smoke-h2") {
    return true;
  }

  return MBTI_PDF_SNAPSHOT_RENDERED_SMOKE_H2_ALLOWED_FILES.has(file);
}

export function isPrCareerKg00AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-00-seo-display-asset-projection-lock") {
    return true;
  }

  return PR_CAREER_KG_00_ALLOWED_FILES.has(file);
}

export function isPrCareerKg01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-01-graphic-designers") {
    return true;
  }

  return PR_CAREER_KG_01_ALLOWED_FILES.has(file);
}

export function isPrCareerKg02AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-02-production-planning-clerks") {
    return true;
  }

  return PR_CAREER_KG_02_ALLOWED_FILES.has(file);
}

export function isPrCareerKg03AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-03-transit-intercity-bus-drivers") {
    return true;
  }

  return PR_CAREER_KG_03_ALLOWED_FILES.has(file);
}

export function isPrCareerKg04AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-04-archivists") {
    return true;
  }

  return PR_CAREER_KG_04_ALLOWED_FILES.has(file);
}

export function isPrCareerKg05AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-05-postal-mail-sorters-processors") {
    return true;
  }

  return PR_CAREER_KG_05_ALLOWED_FILES.has(file);
}

export function isPrCareerKg06AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-06-aircraft-avionics-technicians") {
    return true;
  }

  return PR_CAREER_KG_06_ALLOWED_FILES.has(file);
}

export function isPrCareerKg07AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-07-civil-engineering-technologists-technicians") {
    return true;
  }

  return PR_CAREER_KG_07_ALLOWED_FILES.has(file);
}

export function isPrCareerKg08AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-08-aerospace-engineers") {
    return true;
  }

  return PR_CAREER_KG_08_ALLOWED_FILES.has(file);
}

export function isPrCareerKg09AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-09-auto-mechanics") {
    return true;
  }

  return PR_CAREER_KG_09_ALLOWED_FILES.has(file);
}

export function isPrCareerKg10AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-10-secretaries-admin-assistants") {
    return true;
  }

  return PR_CAREER_KG_10_ALLOWED_FILES.has(file);
}

export function isPrCareerKg11AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-11-mechanical-drafters") {
    return true;
  }

  return PR_CAREER_KG_11_ALLOWED_FILES.has(file);
}

export function isPrCareerKg12AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-12-search-marketing-strategists") {
    return true;
  }

  return PR_CAREER_KG_12_ALLOWED_FILES.has(file);
}

export function isPrCareerKg13AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-13-zoologists-wildlife-biologists") {
    return true;
  }

  return PR_CAREER_KG_13_ALLOWED_FILES.has(file);
}

export function isPrCareerKg14AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-14-mining-geological-engineers") {
    return true;
  }

  return PR_CAREER_KG_14_ALLOWED_FILES.has(file);
}

export function isPrCareerKg15AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-15-geodetic-surveyors") {
    return true;
  }

  return PR_CAREER_KG_15_ALLOWED_FILES.has(file);
}

export function isPrCareerKg16AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-16-market-research-analysts-marketing-specialists") {
    return true;
  }

  return PR_CAREER_KG_16_ALLOWED_FILES.has(file);
}

export function isPrCareerKg17AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-17-postal-service-mail-carriers") {
    return true;
  }

  return PR_CAREER_KG_17_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-01-contract-schema") {
    return true;
  }

  return PR_CAREER_KG_AGENT_01_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent02AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-02-package-generator") {
    return true;
  }

  return PR_CAREER_KG_AGENT_02_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent03AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-03-qa-gate") {
    return true;
  }

  return PR_CAREER_KG_AGENT_03_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent04AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-04-search-projection-quarantine") {
    return true;
  }

  return PR_CAREER_KG_AGENT_04_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent05AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-05-pr-train-generator") {
    return true;
  }

  return PR_CAREER_KG_AGENT_05_ALLOWED_FILES.has(file);
}

export function isPrCareerKgAgent06AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-career-kg-agent-06-runbook-skill-integration") {
    return true;
  }

  return PR_CAREER_KG_AGENT_06_ALLOWED_FILES.has(file);
}

export function isSeoOpsGaokaoV5PackageContractRepair01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/seo-ops-gaokao-v5-package-contract-repair-01") {
    return true;
  }

  return (
    SEO_OPS_GAOKAO_V5_PACKAGE_CONTRACT_REPAIR_01_ALLOWED_FILES.has(file) ||
    SEO_OPS_GAOKAO_V5_PACKAGE_CONTRACT_REPAIR_01_ALLOWED_PREFIXES.some((prefix) => file.startsWith(prefix))
  );
}

export function isEqV19FrontendDepthConsumptionAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-eq-v19-05-frontend-depth-consumption") {
    return true;
  }

  return EQ_V19_FRONTEND_DEPTH_CONSUMPTION_ALLOWED_FILES.has(file);
}

export function isEqV20FrontendV23ConsumptionAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/pr-eq-v20-05-frontend-v23-consumption") {
    return true;
  }

  return EQ_V20_FRONTEND_V23_CONSUMPTION_ALLOWED_FILES.has(file);
}

export function isPersonalityEnneagramV1NoindexRender01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-enneagram-v1-noindex-render-01") {
    return true;
  }

  return PERSONALITY_ENNEAGRAM_V1_NOINDEX_RENDER_01_ALLOWED_FILES.has(file);
}

export function isSeoConvTracking01AllowedFile(file: string): boolean {
  return SEO_CONV_TRACKING_01_ALLOWED_FILES.has(file);
}

export function isFa30Web02AllowedFile(file: string): boolean {
  return FA30_WEB_02_ALLOWED_FILES.has(file);
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

export function isSixHubPaidUnlockCopyAuthorityContract01AllowedFile(file: string): boolean {
  return SIX_HUB_PAID_UNLOCK_COPY_AUTHORITY_CONTRACT_01_ALLOWED_FILES.has(file);
}

export function isSixHubPaidUnlockFrontendConsumerGuard01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/six-hub-paid-unlock-frontend-consumer-guard-01") {
    return true;
  }

  return (
    SIX_HUB_PAID_UNLOCK_FRONTEND_CONSUMER_GUARD_01_ALLOWED_FILES.has(file) ||
    file.startsWith("generated/pr-train-sidecar-issues/")
  );
}

export function isSeoGpt55Handoff01AllowedFile(file: string): boolean {
  return (
    isPersonalityPublicProfileAgentSplit01AllowedFile(file) ||
    SEO_GPT55_HANDOFF_01_ALLOWED_FILES.has(file) ||
    SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES.has(file) ||
    isAiImpactV5ExpandedPageQaAllowedFile(file) ||
    isQuizPackContractMainReplayAllowedFile(file) ||
    isCurrentQuizPackPerformanceHotfixAllowedFile(file)
  );
}

export function isSeoWeeklyAutomationControlPacket02AllowedFile(file: string): boolean {
  return (
    isPersonalityPublicProfileAgentSplit01AllowedFile(file) ||
    SEO_WEEKLY_AUTOMATION_CONTROL_PACKET_02_ALLOWED_FILES.has(file) ||
    SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES.has(file) ||
    isAiImpactV5ExpandedPageQaAllowedFile(file) ||
    isQuizPackContractMainReplayAllowedFile(file) ||
    isCurrentQuizPackPerformanceHotfixAllowedFile(file)
  );
}

export function isSeoOpportunityQueueContract01AllowedFile(file: string): boolean {
  return (
    isPersonalityPublicProfileAgentSplit01AllowedFile(file) ||
    SEO_OPPORTUNITY_QUEUE_CONTRACT_01_ALLOWED_FILES.has(file) ||
    SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES.has(file) ||
    isAiImpactV5ExpandedPageQaAllowedFile(file) ||
    isQuizPackContractMainReplayAllowedFile(file) ||
    isCurrentQuizPackPerformanceHotfixAllowedFile(file)
  );
}

export function isSeoCmsDraftPackageContract01AllowedFile(file: string): boolean {
  return (
    isPersonalityPublicProfileAgentSplit01AllowedFile(file) ||
    SEO_CMS_DRAFT_PACKAGE_CONTRACT_01_ALLOWED_FILES.has(file) ||
    SEO_AGENT_FAPWEB_CODE_PR_WRITER_01_ALLOWED_FILES.has(file) ||
    isAiImpactV5ExpandedPageQaAllowedFile(file) ||
    isQuizPackContractMainReplayAllowedFile(file) ||
    isCurrentQuizPackPerformanceHotfixAllowedFile(file)
  );
}

export function isPersonalityComparisonV1FromAssetsAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-comparison-v1-from-assets") {
    return false;
  }

  return new Set([
    "app/(localized)/[locale]/personality/[type]/page.tsx",
    "tests/contracts/helpers/currentPrScope.ts",
    "tests/contracts/personality-comparison-pages.contract.test.tsx",
  ]).has(file);
}

export function isMbtiIndex24aComparisonJsonLdAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-index-24a-render-comparison-jsonld") {
    return false;
  }

  return new Set([
    "app/(localized)/[locale]/personality/[type]/page.tsx",
    "lib/cms/personality.ts",
    "tests/contracts/helpers/currentPrScope.ts",
    "tests/contracts/mbti-index-24a-render-comparison-jsonld.contract.test.ts",
    "tests/contracts/personality-comparison-pages.contract.test.tsx",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ]).has(file);
}

export function isPersonalityComparisonSeoGate01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/personality-comparison-seo-gate-01") {
    return false;
  }

  return new Set([
    "app/(localized)/[locale]/personality/[type]/page.tsx",
    "app/llms.txt/route.ts",
    "app/llms-full.txt/route.ts",
    "tests/contracts/helpers/currentPrScope.ts",
    "tests/contracts/llms-full-enrichment.contract.test.ts",
    "tests/contracts/llms-parity-contract.contract.test.ts",
    "tests/contracts/mbti64-llms-full-pilot-exposure-repair.contract.test.ts",
    "tests/contracts/personality-comparison-pages.contract.test.tsx",
    "tests/contracts/personality-llms-full-comparison-repair-01.contract.test.ts",
    "tests/contracts/public-sitemap-route.contract.test.ts",
  ]).has(file);
}

export function isMbtiSeo05ComparisonTemplateRefreshAllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-seo-05-comparison-template-refresh") {
    return false;
  }

  return MBTI_SEO_05_COMPARISON_TEMPLATE_REFRESH_ALLOWED_FILES.has(file);
}

const MBTI_ASSET_SKILL_10_ALLOWED_FILES = new Set([
  ".agents/skills/public-profile-seo-asset-factory/SKILL.md",
  ".agents/skills/public-profile-seo-asset-factory/agents/mbti64-public-personality-agent.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/personality-agent-matrix.md",
  ".agents/skills/public-profile-seo-asset-factory/orchestration/state-machine.md",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/mbti-existing-asset-enhancement.md",
  "tests/contracts/mbti-asset-skill-10-public-profile-seo-asset-factory.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isMbtiAssetSkill10AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/mbti-asset-skill-10-profile-seo-runbook") {
    return true;
  }

  return MBTI_ASSET_SKILL_10_ALLOWED_FILES.has(file);
}

const IQ_METHOD_01_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/README.md",
  "generated/iq-method-pages-zh-cn-v0.2/GLOBAL_CLAIM_POLICY.md",
  "generated/iq-method-pages-zh-cn-v0.2/GLOBAL_SEO_GEO_STANDARD.md",
  "generated/iq-method-pages-zh-cn-v0.2/DUPLICATE_CANNIBALIZATION_MAP.md",
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/01-what-is-iq-style-reasoning-test/qa_checklist.md",
  "tests/contracts/iq-method-01-content-asset.contract.test.ts",
  "tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-01-what-is-iq-style") {
    return true;
  }

  return IQ_METHOD_01_ALLOWED_FILES.has(file);
}

const IQ_METHOD_02_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/02-online-iq-test-vs-professional-assessment/qa_checklist.md",
  "tests/contracts/iq-method-01-content-asset.contract.test.ts",
  "tests/contracts/iq-method-02-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod02AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-02-online-vs-professional") {
    return true;
  }

  return IQ_METHOD_02_ALLOWED_FILES.has(file);
}

const IQ_METHOD_03_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/03-iq-test-score-meaning-boundary/qa_checklist.md",
  "tests/contracts/iq-method-02-content-asset.contract.test.ts",
  "tests/contracts/iq-method-03-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod03AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-03-score-meaning-boundary") {
    return true;
  }

  return IQ_METHOD_03_ALLOWED_FILES.has(file);
}

const IQ_METHOD_04_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/04-matrix-reasoning-pattern-recognition-guide/qa_checklist.md",
  "tests/contracts/iq-method-03-content-asset.contract.test.ts",
  "tests/contracts/iq-method-04-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod04AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-04-matrix-reasoning-guide") {
    return true;
  }

  return IQ_METHOD_04_ALLOWED_FILES.has(file);
}

const IQ_METHOD_05_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/05-why-fermatmind-iq-v1-not-certification/qa_checklist.md",
  "tests/contracts/iq-method-04-content-asset.contract.test.ts",
  "tests/contracts/iq-method-05-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod05AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-05-not-certification") {
    return true;
  }

  return IQ_METHOD_05_ALLOWED_FILES.has(file);
}

const IQ_METHOD_06_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/06-iq-test-privacy-data-boundary/qa_checklist.md",
  "tests/contracts/iq-method-05-content-asset.contract.test.ts",
  "tests/contracts/iq-method-06-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod06AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-06-privacy-data-boundary") {
    return true;
  }

  return IQ_METHOD_06_ALLOWED_FILES.has(file);
}

const IQ_METHOD_07_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/article.md",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/article.cms.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/seo.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/answer_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/landing_surface_v1.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/faq.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/geo_answer_block.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/claim_audit.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/internal_links.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/media_brief.json",
  "generated/iq-method-pages-zh-cn-v0.2/pages/07-iq-expert-review-disclosure/qa_checklist.md",
  "tests/contracts/iq-method-06-content-asset.contract.test.ts",
  "tests/contracts/iq-method-07-content-asset.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethod07AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-07-expert-review-disclosure") {
    return true;
  }

  return IQ_METHOD_07_ALLOWED_FILES.has(file);
}

const IQ_METHOD_PAGES_CMS_DRY_RUN_01_ALLOWED_FILES = new Set([
  "generated/iq-method-pages-zh-cn-v0.2/PR_TRAIN_INDEX.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/README.md",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/cms_import_manifest.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/topic_iq_articles_mapping.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/landing_page_blocks_mapping.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/seo_geo_gate.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/claim_audit_summary.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/dry_run_report.json",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/readback_checklist.md",
  "generated/iq-method-pages-zh-cn-v0.2/cms-dry-run/sha256_manifest.json",
  "tests/contracts/iq-method-pages-cms-dry-run-01.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "generated/pr-train-sidecar-issues/sidecar_issues.md",
  "generated/pr-train-sidecar-issues/sidecar_issues.json",
]);

export function isIqMethodPagesCmsDryRun01AllowedFile(file: string): boolean {
  if (CURRENT_BRANCH !== "codex/iq-method-pages-cms-dry-run-01") {
    return true;
  }

  return IQ_METHOD_PAGES_CMS_DRY_RUN_01_ALLOWED_FILES.has(file);
}
