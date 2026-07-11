import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const WORKFLOW_PATH = ".github/workflows/deploy-staging.yml";

describe("staging deploy workflow analytics wiring", () => {
  const workflow = readFileSync(WORKFLOW_PATH, "utf8");

  it("resolves staging analytics settings with an explicit shared fallback", () => {
    for (const key of [
      "NEXT_PUBLIC_ANALYTICS_ENABLED",
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
      "NEXT_PUBLIC_BAIDU_TONGJI_ID",
    ]) {
      expect(workflow).toContain(`secrets.WEB_STAGING_${key}`);
      expect(workflow).toContain(`vars.WEB_STAGING_${key}`);
      expect(workflow).toContain(`secrets.WEB_${key}`);
      expect(workflow).toContain(`vars.WEB_${key}`);
      expect(workflow).toContain(`test -n "$${key}"`);
      expect(workflow).toContain(`${key}='$${key}'`);
    }
  });
});
