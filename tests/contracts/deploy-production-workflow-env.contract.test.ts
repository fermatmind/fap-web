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
      "WEB_PRODUCTION_CORE_PUBLIC_PATH",
      "WEB_PRODUCTION_RUN_SITEMAP_HEALTH",
    ]) {
      expect(workflow).toContain(`\${{ secrets.${key} || vars.${key} }}`);
    }

    expect(workflow).toContain("test -n \"$DEPLOY_HOST\"");
    expect(workflow).toContain("test -n \"$DEPLOY_USER\"");
  });

  it("keeps manual production deploys pinned to an exact verified main revision and fail-closed risk policy", () => {
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain("process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'");
    expect(workflow).toContain("Manual production deploy failed closed: deploy_sha is required.");
    expect(workflow).toContain("expected exactly one merged main PR");
    expect(workflow).toContain('test "$DEPLOY_SHA" = "$LATEST_MAIN_SHA"');
    expect(workflow).not.toContain("manual_risk_approval");
    expect(workflow).toContain("riskyLabelPatterns");
    expect(workflow).toContain("riskyPathPatterns");
    expect(workflow).toContain("Risky production revisions cannot be waived by workflow input.");
  });
});
