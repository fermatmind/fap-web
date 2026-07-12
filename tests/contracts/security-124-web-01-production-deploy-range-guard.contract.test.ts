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

  it("keeps automatic deploys on latest main and permits only main-contained manual revisions", () => {
    expect(workflow).toContain("getBranch({ owner, repo, branch: 'main' })");
    expect(workflow).toContain("if (isManualDispatch)");
    expect(workflow).toContain("basehead: `${deploySha}...${latestMainSha}`");
    expect(workflow).toContain("mainMembership.data.status === 'identical'");
    expect(workflow).toContain("mainMembership.data.status === 'ahead'");
    expect(workflow).toContain("mainMembership.data.behind_by === 0");
    expect(workflow).toContain("deploy SHA ${deploySha} is not contained in main ${latestMainSha}");
    expect(workflow).toContain("deploySha !== latestMainSha");
    expect(workflow).toContain("Production auto-deploy policy failed closed: deploy SHA ${deploySha} is not latest main ${latestMainSha}");
    expect(workflow).toContain("git merge-base --is-ancestor \"$DEPLOY_SHA\" origin/main");
    expect(workflow).toContain("compareCommitsWithBasehead");
    expect(workflow).toContain("comparison.data.status !== 'ahead'");
    expect(workflow).toContain("comparison.data.behind_by !== 0");
    expect(workflow).toContain("is not an ancestor");
    expect(workflow).toContain("commits.at(-1)?.sha !== deploySha");
    expect(workflow).toContain("const requiredCheckPollIntervalMs = 15_000");
    expect(workflow).toContain("const requiredCheckWaitTimeoutMs = 12 * 60 * 1_000");
    expect(workflow).toContain("Number(run.id) > Number(current.id)");
    expect(workflow).toContain("run.status !== 'completed'");
    expect(workflow).toContain("run.conclusion !== 'success'");
    expect(workflow).toContain("timed out waiting for required checks");
    expect(workflow).toContain("const refreshedMainSha = refreshedMain.data.commit.sha");
    expect(workflow).toContain("Skipping automatic production deploy because");
    expect(workflow).not.toContain("(response) => response.data.check_runs");
  });

  it("treats expected automatic policy denials as successful skips", () => {
    expect(workflow).toContain("core.notice([");
    expect(workflow).toContain("Production auto-deploy blocked by policy.");
    expect(workflow).toContain("Risky production revisions require SHA-bound workflow_dispatch authorization");
    expect(workflow).toContain("core.setOutput('auto_deploy_allowed', 'false')");
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
