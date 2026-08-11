import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const production = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const protectedOperationalWorkflows = [
  ".github/workflows/content-release-revalidation-runtime-config.yml",
  ".github/workflows/llms-feed-cache-ops.yml",
  ".github/workflows/web-production-worktree-recovery.yml",
  ".github/workflows/web-public-ingress.yml",
].map((path) => readFileSync(path, "utf8"));

describe("fap-web automatic production for every merged PR", () => {
  it("promotes each successful exact-main staging receipt without a human approval gate", () => {
    expect(production).toContain('workflows: ["Deploy Web Staging"]');
    expect(production).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(production).toContain("github.event.workflow_run.event == 'push'");
    expect(production).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(production).toContain("expected exactly one merged main PR for range commit");
    expect(production).toContain("isManualDispatch ? 'manual_sha_bound_recovery' : 'automatic_merged_pr'");
    expect(production).toContain("needs.policy-guard.outputs.authorization_mode == 'automatic_merged_pr'");
    expect(production).toContain("environment:\n      name: production-web-auto");
    expect(production).not.toContain("automatic_benign");
    expect(production).not.toContain("riskyLabelPatterns");
    expect(production).not.toContain("riskyPathPatterns");
  });

  it("keeps CI, artifact attestation, staging receipt, and latest-main gates fail closed", () => {
    for (const requiredCheck of [
      "build",
      "contracts",
      "verify-big5-contract-freeze",
      "verify-enneagram-contract-freeze",
    ]) {
      expect(production).toContain(`'${requiredCheck}'`);
    }
    expect(production).toContain("Triggering staging run must contain one ${expectedName} receipt");
    expect(production).toContain("Receipt-bound artifact digest does not match the CI artifact digest");
    expect(production).toContain("gh attestation verify");
    expect(production).toContain('test "$DEPLOY_SHA" = "$LATEST_MAIN_SHA"');
    expect(production).toContain("Skipping automatic production deploy because");
  });

  it("keeps manual recovery on the protected production Environment", () => {
    expect(production).toContain("name: Approve manual production recovery");
    expect(production).toContain("needs.policy-guard.outputs.authorization_mode == 'manual_sha_bound_recovery'");
    expect(production).toContain("environment:\n      name: production");
    expect(production).toContain("needs.manual-recovery-approval.result == 'success'");
    expect(production).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${deploySha}");
  });

  it("does not automatically rerun, redispatch, or roll back a failed or ambiguous deployment", () => {
    expect(production.match(/workflow_run:/g)).toHaveLength(1);
    expect(production.match(/workflow_dispatch:/g)).toHaveLength(1);
    expect(production).not.toMatch(/repository_dispatch|workflow_call/);
    expect(production).not.toMatch(/gh workflow (?:run|rerun)|actions\.createWorkflowDispatch/);
    expect(production).not.toMatch(/rollback-production|automatic rollback|auto-rollback/i);
    expect(production).toContain("cancel-in-progress: false");
  });

  it("records the logical production target and automatic control-plane Environment", () => {
    expect(production).toContain('environment: "production"');
    expect(production).toContain("control_plane_environment: process.env.DEPLOYMENT_ENVIRONMENT");
    expect(production).toContain("authorization_mode: process.env.AUTHORIZATION_MODE");
    expect(production).toContain("DEPLOYMENT_ENVIRONMENT: production-web-auto");
  });

  it("does not move recovery, ingress, content release, or llms operations off protected production", () => {
    for (const workflow of protectedOperationalWorkflows) {
      expect(workflow).toContain("environment:\n      name: production");
      expect(workflow).not.toContain("production-web-auto");
    }
  });
});
