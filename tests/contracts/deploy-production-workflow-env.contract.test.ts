import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-production.yml";

describe("production deploy workflow environment contract", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");

  it("resolves production deploy target settings from GitHub Environment secrets before vars", () => {
    for (const key of [
      "WEB_NODE1_DEPLOY_HOST",
      "WEB_NODE1_DEPLOY_USER",
      "WEB_NODE1_DEPLOY_PORT",
      "WEB_NODE1_APP_DIR",
      "WEB_NODE1_APP_NAME",
      "WEB_NODE1_APP_PORT",
      "WEB_NODE1_APP_MANAGER",
      "WEB_NODE1_SYSTEMD_SERVICE",
      "WEB_PUBLIC_BASE_URL",
      "WEB_PRODUCTION_CORE_PUBLIC_PATH",
      "WEB_PRODUCTION_RUN_SITEMAP_HEALTH",
    ]) {
      expect(workflow).toContain(`\${{ secrets.${key} || vars.${key} }}`);
    }

    expect(workflow).toContain("test -n \"$DEPLOY_HOST\"");
    expect(workflow).toContain("test -n \"$DEPLOY_USER\"");
    expect(workflow).not.toContain("secrets.WEB_NEXT_PUBLIC_");
    expect(workflow).toContain("--require-production-config");
    expect(workflow).toContain("Receipt-bound artifact digest does not match");
  });

  it("auto-deploys verified merged PRs while keeping manual recovery protected", () => {
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain("process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'");
    expect(workflow).toContain("Manual production deploy failed closed: deploy_sha is required.");
    expect(workflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<40-character deploy SHA>");
    expect(workflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${deploySha}");
    expect(workflow).toContain("manual_risk_approval must exactly match the SHA-bound approval text");
    expect(workflow).toContain("expected exactly one merged main PR for range commit");
    expect(workflow).toContain('if [[ "$AUTHORIZATION_MODE" == "automatic_merged_pr" ]]');
    expect(workflow).toContain('test "$DEPLOY_SHA" = "$LATEST_MAIN_SHA"');
    expect(workflow).toContain('git merge-base --is-ancestor "$DEPLOY_SHA" origin/main');
    for (const requiredCheck of [
      "build",
      "contracts",
      "verify-big5-contract-freeze",
      "verify-enneagram-contract-freeze",
    ]) {
      expect(workflow).toContain(`'${requiredCheck}'`);
    }
    expect(workflow).not.toContain("riskyLabelPatterns");
    expect(workflow).not.toContain("riskyPathPatterns");
    expect(workflow).toContain("Authorized exact-SHA manual production recovery.");
    expect(workflow).toContain("manual recovery approval gate remains on the protected production GitHub Environment");
    expect(workflow).toContain("fm-analytics-bootstrap");
    expect(workflow).toContain("private analytics smoke failed");
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain("environment:\n      name: production-web-auto");
    expect(workflow).toContain("needs.manual-recovery-approval.result == 'success'");
  });
});
