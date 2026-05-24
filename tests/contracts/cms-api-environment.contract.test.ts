import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { performance } from "node:perf_hooks";

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

  it("keeps the abort timeout active while JSON response bodies are parsed", async () => {
    const server = createServer((request, response) => {
      response.writeHead(200, { "content-type": "application/json" });

      if (request.url?.startsWith("/api/v0.5/articles")) {
        response.flushHeaders();
        setTimeout(() => response.end(JSON.stringify({ items: [] })), 1000);
        return;
      }

      response.end(JSON.stringify({ surface: { page_blocks: [], payload_json: {} } }));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
      server.close();
      throw new Error("test server did not bind to a TCP port");
    }

    const startedAt = performance.now();
    const child = spawn(process.execPath, ["scripts/check-cms-api-health.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: `http://127.0.0.1:${address.port}`,
        CMS_API_HEALTH_TIMEOUT_MS: "50",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    const result = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
      child.once("exit", (code, signal) => resolve({ code, signal }));
    });

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    expect(result.signal).toBeNull();
    expect(result.code).toBe(1);
    expect(performance.now() - startedAt).toBeLessThan(700);
    expect(stdout).toBe("");
    expect(stderr).toContain("Request timed out after 50ms");
  });
});
