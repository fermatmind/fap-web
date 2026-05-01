import { readFileSync } from "node:fs";

describe("content release revalidation smoke contract", () => {
  it("exposes a packaged smoke script and deploy toggle for content release revalidation", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");
    const smokeScript = readFileSync("scripts/content_release_revalidate_smoke.sh", "utf8");

    expect(packageJson.scripts?.["cms:content-release:smoke"]).toBe("bash scripts/content_release_revalidate_smoke.sh");

    expect(smokeScript).toContain("CONTENT_RELEASE_REVALIDATE_URL");
    expect(smokeScript).toContain("CONTENT_RELEASE_REVALIDATE_TOKEN");
    expect(smokeScript).toContain("x-fm-content-release-token");
    expect(smokeScript).toContain('mktemp "${TMPDIR:-/tmp}/content-release-revalidate-curl.XXXXXX"');
    expect(smokeScript).toContain('chmod 600 "$curl_header_config"');
    expect(smokeScript).toContain('trap cleanup_header_config EXIT');
    expect(smokeScript).toContain('--config "$curl_header_config"');
    expect(smokeScript).not.toContain('-H "x-fm-content-release-token: ${REVALIDATE_TOKEN}"');
    expect(smokeScript).toContain("revalidated_paths");

    expect(deployScript).toContain('RUN_CONTENT_RELEASE_REVALIDATE_SMOKE="${RUN_CONTENT_RELEASE_REVALIDATE_SMOKE:-0}"');
    expect(deployScript).toContain("bash scripts/content_release_revalidate_smoke.sh");
    expect(deployScript).toContain("skip content release revalidation smoke");
  });

  it("documents the release-invalidation smoke and shared secret wiring", () => {
    const runbook = readFileSync("docs/ops/cms-api-environments-runbook.md", "utf8");

    expect(runbook).toContain("pnpm cms:content-release:smoke");
    expect(runbook).toContain("RUN_CONTENT_RELEASE_REVALIDATE_SMOKE=1");
    expect(runbook).toContain("CONTENT_RELEASE_REVALIDATE_TOKEN");
    expect(runbook).toContain("OPS_CONTENT_RELEASE_CACHE_INVALIDATION_URLS");
    expect(runbook).toContain("OPS_CONTENT_RELEASE_CACHE_INVALIDATION_SECRET");
  });
});
