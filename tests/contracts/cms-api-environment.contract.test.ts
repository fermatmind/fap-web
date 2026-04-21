import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

describe("CMS API environment operations", () => {
  it("runs a non-blocking CMS health check before the dev server starts", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.predev).toBe("node ./scripts/check-cms-api-health.mjs");
    expect(packageJson.scripts?.["check:cms-api"]).toBe("node ./scripts/check-cms-api-health.mjs");
  });

  it("documents staging as the daily frontend default and localhost as integration-only", () => {
    const envExample = readFileSync(".env.example", "utf8");
    const runbook = readFileSync("docs/ops/cms-api-environments-runbook.md", "utf8");

    expect(envExample).toContain("Daily frontend development");
    expect(envExample).toContain("NEXT_PUBLIC_API_URL=https://staging-api.fermatmind.com");
    expect(envExample).toContain("NEXT_PUBLIC_API_URL=http://127.0.0.1:8000");
    expect(runbook).toContain("Use staging API for normal frontend work");
    expect(runbook).toContain("Use local API only for backend/CMS integration");
    expect(runbook).toContain("Do not add local article JSON, MDX, or static public images");
  });

  it("warns and exits successfully when the configured CMS API is unreachable", () => {
    const result = spawnSync("node", ["scripts/check-cms-api-health.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:9",
        CMS_API_HEALTH_TIMEOUT_MS: "50",
      },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("[check-cms-api] Warning: CMS API health check failed");
    expect(result.stderr).toContain("homepage recommended articles");
    expect(result.stderr).toContain("Use a stable staging API for daily frontend work");
  });
});
