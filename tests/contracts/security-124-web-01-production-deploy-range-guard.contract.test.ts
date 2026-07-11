import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-production.yml";

describe("SECURITY-124-WEB-01 production deploy range guard", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");

  it("reads the previous successful production deployment as the range baseline", () => {
    expect(workflow).toContain("deployments: read");
    expect(workflow).toContain("listDeployments");
    expect(workflow).toContain("environment: 'production'");
    expect(workflow).toContain("listDeploymentStatuses");
    expect(workflow).toContain("status.state === 'success'");
    expect(workflow).toContain("no previous successful production deployment baseline was found");
  });

  it("requires latest main and an ancestor baseline before inspecting the complete range", () => {
    expect(workflow).toContain("getBranch({ owner, repo, branch: 'main' })");
    expect(workflow).toContain("deploySha !== latestMainSha");
    expect(workflow).toContain("compareCommitsWithBasehead");
    expect(workflow).toContain("comparison.data.status !== 'ahead'");
    expect(workflow).toContain("comparison.data.behind_by !== 0");
    expect(workflow).toContain("is not an ancestor");
    expect(workflow).toContain("commits.at(-1)?.sha !== deploySha");
  });

  it("blocks a risky PR even when a later PR in the deployment range is benign", () => {
    expect(workflow).toContain("for (const commit of commits)");
    expect(workflow).toContain("pullsByNumber.set");
    expect(workflow).toContain("const pulls = [...pullsByNumber.values()]");
    expect(workflow).toContain("const labels = pulls");
    expect(workflow).toContain(".flatMap((pull) => (pull.labels || []).map(normalizeLabelName))");
    expect(workflow).toContain("for (const pull of pulls)");
    expect(workflow).toContain("riskyLabels.length > 0 || riskyFiles.length > 0");
    expect(workflow).toContain("const normalizeLabelName = (label)");
    expect(workflow).toContain("typeof label === 'string'");
    expect(workflow).toContain("String(label?.name || '').toLowerCase()");
    expect(workflow).toContain(".filter(Boolean)");
  });

  it("allows only a complete range whose associated PRs are all benign", () => {
    expect(workflow).toContain("Production auto-deploy policy passed for the complete verified main change range.");
    expect(workflow).toContain("core.setOutput('auto_deploy_allowed', 'true')");
    expect(workflow).toContain("Production deploy range:");
    expect(workflow).toContain("Associated PRs:");
  });

  it("fails closed for direct main commits, missing or ambiguous PRs, and GitHub API errors", () => {
    expect(workflow).toContain("mergedMainPulls.length !== 1");
    expect(workflow).toContain("expected exactly one merged main PR for range commit");
    expect(workflow).toContain("found ${mergedMainPulls.length}");
    expect(workflow).toContain("catch (error)");
    expect(workflow).toContain("failed closed after a GitHub API error");
  });

  it("preserves input injection, SHA-bound authorization, and protected environment boundaries", () => {
    expect(workflow).toContain("context.payload.inputs?.deploy_sha");
    expect(workflow).not.toMatch(/\$\{\{\s*github\.event\.inputs\.deploy_sha\s*\}\}/);
    expect(workflow).toContain("MANUAL_RISK_APPROVAL: ${{ github.event.inputs.manual_risk_approval }}");
    expect(workflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${deploySha}");
    expect(workflow).toContain("process.env.MANUAL_RISK_APPROVAL !== expectedManualApproval");
    expect(workflow).not.toContain("manual_risk_approval === 'true'");
    expect(workflow).toContain("environment:\n      name: production");
  });
});
