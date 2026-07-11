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
      "WEB_NEXT_PUBLIC_API_URL",
      "WEB_NEXT_PUBLIC_SITE_URL",
      "WEB_NEXT_PUBLIC_ANALYTICS_ENABLED",
      "WEB_NEXT_PUBLIC_GA_MEASUREMENT_ID",
      "WEB_NEXT_PUBLIC_BAIDU_TONGJI_ID",
      "WEB_PRODUCTION_CORE_PUBLIC_PATH",
      "WEB_PRODUCTION_RUN_SITEMAP_HEALTH",
    ]) {
      expect(workflow).toContain(`\${{ secrets.${key} || vars.${key} }}`);
    }

    expect(workflow).toContain("test -n \"$DEPLOY_HOST\"");
    expect(workflow).toContain("test -n \"$DEPLOY_USER\"");
    expect(workflow).toContain("analytics_enabled=PASS");
    expect(workflow).toContain("ga_measurement_id=PASS");
    expect(workflow).toContain("baidu_tongji_id=PASS");
  });

  it("keeps manual risky deploys SHA-bound, check-gated, and protected-environment gated", () => {
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain("process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'");
    expect(workflow).toContain("Manual production deploy failed closed: deploy_sha is required.");
    expect(workflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:<40-character deploy SHA>");
    expect(workflow).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${deploySha}");
    expect(workflow).toContain("manual_risk_approval must exactly match the SHA-bound approval text");
    expect(workflow).toContain("expected exactly one merged main PR for range commit");
    expect(workflow).toContain('test "$DEPLOY_SHA" = "$LATEST_MAIN_SHA"');
    for (const requiredCheck of [
      "build",
      "contracts",
      "verify-big5-contract-freeze",
      "verify-enneagram-contract-freeze",
    ]) {
      expect(workflow).toContain(`'${requiredCheck}'`);
    }
    expect(workflow).toContain("riskyLabelPatterns");
    expect(workflow).toContain("riskyPathPatterns");
    expect(workflow).toContain("Authorized manual risky production revision.");
    expect(workflow).toContain("protected production GitHub Environment");
    expect(workflow).toContain("fm-analytics-bootstrap");
    expect(workflow).toContain("private analytics smoke failed");
  });
});
