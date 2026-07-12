import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { evaluateDeployGuard, type GuardContext } from "@/scripts/ci/deploy-guard";

const workflow = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const SHA = "a".repeat(40);

function context(overrides: Partial<GuardContext> = {}): GuardContext {
  return {
    isManualDispatch: false,
    deploySha: SHA,
    manualRiskApproval: "",
    associatedPull: { number: 1, title: "normal app", labels: [], changedFiles: ["app/page.tsx"] },
    ...overrides,
  };
}

describe("AUDIT-PRR2-WEB-01 production recovery lane", () => {
  it("allows a normal application SHA while automatic risky revisions fail closed", () => {
    expect(evaluateDeployGuard(context()).allowed).toBe(true);
    expect(evaluateDeployGuard(context({
      associatedPull: { number: 2, title: "workflow", labels: [], changedFiles: [".github/workflows/deploy-production.yml"] },
    })).allowed).toBe(false);
  });

  it("allows the solo operator recovery lane only with the exact immutable SHA token", () => {
    const riskyPull = { number: 2, title: "workflow", labels: [], changedFiles: [".github/workflows/deploy-production.yml"] };
    expect(evaluateDeployGuard(context({ isManualDispatch: true, associatedPull: riskyPull })).allowed).toBe(false);
    expect(evaluateDeployGuard(context({
      isManualDispatch: true,
      associatedPull: riskyPull,
      manualRiskApproval: `APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${SHA}`,
    })).allowed).toBe(true);
    expect(evaluateDeployGuard(context({
      isManualDispatch: true,
      associatedPull: riskyPull,
      manualRiskApproval: `APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${"b".repeat(40)}`,
    })).allowed).toBe(false);
  });

  it("keeps automatic latest-main and manual main-ancestor checks alongside required checks", () => {
    expect(workflow).toContain("deploySha !== latestMainSha");
    expect(workflow).toContain("mainMembership.data.status === 'identical'");
    expect(workflow).toContain("mainMembership.data.status === 'ahead'");
    expect(workflow).toContain("git merge-base --is-ancestor \"$DEPLOY_SHA\" origin/main");
    expect(workflow).toContain("run?.conclusion === 'success'");
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain("authorization_mode: ${{ steps.evaluate.outputs.authorization_mode }}");
    expect(workflow).toContain("manual_sha_bound_recovery");
    expect(workflow).toContain("automatic_benign");
    expect(workflow).toContain("invalid production authorization mode");
  });

  it("keeps revision verification and smoke mandatory after deployment", () => {
    const deploy = workflow.indexOf("- name: Deploy production with PM2");
    const revision = workflow.indexOf("- name: Verify deployed revision");
    const smoke = workflow.indexOf("- name: Smoke production public surfaces");
    expect(deploy).toBeGreaterThan(0);
    expect(revision).toBeGreaterThan(deploy);
    expect(smoke).toBeGreaterThan(revision);
    expect(workflow.slice(revision, smoke)).toContain('test "$DEPLOYED_SHA" = "$DEPLOY_SHA"');
    expect(workflow.slice(deploy, smoke)).not.toContain("continue-on-error: true");
  });
});
