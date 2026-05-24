import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("staging CMS baseline smoke invocation", () => {
  it("passes API and web URL args to the validator without a literal separator", () => {
    const smokeScript = readFileSync("scripts/staging_cms_baseline_smoke.sh", "utf8");
    const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");

    expect(smokeScript).toContain("pnpm cms:baseline:staging --api-url");
    expect(smokeScript).toContain('--web-url "$WEB_URL"');
    expect(smokeScript).not.toContain("-- --api-url");
    expect(smokeScript).not.toContain("pnpm cms:baseline:staging -- --");

    expect(deployScript).toContain("CMS_BASELINE_API_URL=\"$CMS_BASELINE_API_URL\"");
    expect(deployScript).toContain("CMS_BASELINE_WEB_URL=\"$CMS_BASELINE_WEB_URL\"");
    expect(deployScript).toContain("bash scripts/staging_cms_baseline_smoke.sh");
  });

  it("accepts the supported validator invocation shape used by smoke", () => {
    const result = spawnSync(
      "node",
      [
        "scripts/validate-staging-cms-baseline.mjs",
        "--dry-run",
        "--print-plan",
        "--json",
        "--api-url",
        "https://staging-api.example.test",
        "--web-url",
        "https://staging-web.example.test",
      ],
      { encoding: "utf8" }
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      dryRun: true,
      mutatesCms: false,
      mutatesFrontendContent: false,
    });
  });

  it("rejects unknown literal separator args instead of silently ignoring them", () => {
    const result = spawnSync(
      "node",
      [
        "scripts/validate-staging-cms-baseline.mjs",
        "--dry-run",
        "--print-plan",
        "--",
        "--api-url",
        "https://staging-api.example.test",
      ],
      { encoding: "utf8" }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Unknown argument: --");
  });
});
