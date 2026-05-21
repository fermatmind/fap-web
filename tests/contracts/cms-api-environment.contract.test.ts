import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

describe("CMS API environment operations", () => {
  it("runs a CMS content integrity check before the dev server starts", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };
    const healthScript = readFileSync("scripts/check-cms-api-health.mjs", "utf8");

    expect(packageJson.scripts?.predev).toBe("node ./scripts/check-cms-api-health.mjs");
    expect(packageJson.scripts?.["check:cms-api"]).toBe("node ./scripts/check-cms-api-health.mjs");
    expect(healthScript).toContain("const DEFAULT_TIMEOUT_MS = 10000");
    expect(healthScript).toContain("Request timed out after ${timeoutMs}ms");
    expect(healthScript).toContain("buildScaleQuestionsHealthUrl");
    expect(healthScript).toContain("mbti_144");
    expect(healthScript).toContain("mbti_93");
    expect(healthScript).toContain("questions?.items");
    expect(healthScript).toContain("buildStaticMediaHealthUrl");
    expect(healthScript).toContain("wechat-qr-official-258.jpg");
    expect(healthScript).toContain("Required backend static media assets are unavailable");
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

  it("fails closed when local API mode is configured but unreachable", () => {
    const result = spawnSync("node", ["scripts/check-cms-api-health.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:9",
        CMS_API_HEALTH_TIMEOUT_MS: "50",
      },
      encoding: "utf8",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("[check-cms-api] Error: required CMS API health check failed");
    expect(result.stderr).toContain("stale Next.js fetch cache");
    expect(result.stderr).toContain("start and seed the local backend");
  });

  it("can be explicitly downgraded for intentionally degraded product-shell work", () => {
    const result = spawnSync("node", ["scripts/check-cms-api-health.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:9",
        CMS_API_HEALTH_STRICT: "0",
        CMS_API_HEALTH_TIMEOUT_MS: "50",
      },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("[check-cms-api] Warning: CMS API health check found degraded content");
    expect(result.stderr).toContain("stale Next.js fetch cache");
    expect(result.stderr).toContain("CMS-backed content must come from backend CMS/API");
  });
});
