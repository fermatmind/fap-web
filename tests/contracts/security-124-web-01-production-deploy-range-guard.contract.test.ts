import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-production.yml";

describe("SECURITY-124-WEB-01 production deploy range guard", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");

  it("reads the previous successful production deployment as the range baseline", () => {
    expect(workflow).toContain("deployments: read");
    expect(workflow).toContain("listDeployments");
    expect(workflow).toContain("environment: 'production-web-auto'");
    expect(workflow).toContain("automaticDeployments.length > 0");
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

  it("treats a superseded automatic SHA as a successful skip", () => {
    expect(workflow).toContain("Skipping automatic production deploy because");
    expect(workflow).toContain("core.setOutput('auto_deploy_allowed', 'false')");
  });

  it("covers every merged PR in the complete baseline-to-target range", () => {
    expect(workflow).toContain("for (const commit of commits)");
    expect(workflow).toContain("pullsByNumber.set");
    expect(workflow).toContain("const pulls = [...pullsByNumber.values()]");
    expect(workflow).toContain("pulls.map((pull) => pull.number).join(',')");
    expect(workflow).not.toContain("riskyLabelPatterns");
    expect(workflow).not.toContain("riskyPathPatterns");
  });

  it("allows a complete range whose commits all map unambiguously to merged PRs", () => {
    expect(workflow).toContain("Production auto-deploy policy passed for the complete verified main change range.");
    expect(workflow).toContain("core.setOutput('auto_deploy_allowed', 'true')");
    expect(workflow).toContain("isManualDispatch ? 'manual_sha_bound_recovery' : 'automatic_merged_pr'");
    expect(workflow).toContain("Production deploy range:");
    expect(workflow).toContain("Associated PRs:");
  });

  it("fails closed for automatic direct-main commits and ambiguous PRs while permitting exact manual recovery", () => {
    expect(workflow).toContain("const directMainCommits = []");
    expect(workflow).toContain("mergedMainPulls.length > 1");
    expect(workflow).toContain("mergedMainPulls.length === 0");
    expect(workflow).toContain("if (!isManualDispatch)");
    expect(workflow).toContain("directMainCommits.push(commit.sha)");
    expect(workflow).toContain("Direct main commits covered by exact SHA approval");
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
    expect(workflow).toContain("environment:\n      name: production-web-auto");
    expect(workflow).toContain("needs.manual-recovery-approval.result == 'success'");
  });
});
