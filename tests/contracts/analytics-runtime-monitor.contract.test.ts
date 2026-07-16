import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/analytics-runtime-monitor.yml", "utf8");
const monitor = readFileSync("scripts/analytics/monitor-runtime.mjs", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};
const repositorySha = "a".repeat(40);
const productionSha = "b".repeat(40);
const tempDirectory = mkdtempSync(path.join(tmpdir(), "analytics-runtime-monitor-"));
let fixture: ReturnType<typeof spawn> | undefined;
let fixtureOrigin = "";

async function reservePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Unable to reserve fixture port"));
        return;
      }
      server.close(() => resolve(address.port));
    });
  });
}

async function startFixture(): Promise<void> {
  const port = await reservePort();
  fixtureOrigin = `http://127.0.0.1:${port}`;
  fixture = spawn(process.execPath, ["scripts/analytics/runtime-smoke-fixture.mjs", "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Fixture did not become ready")), 5000);
    fixture?.once("error", reject);
    fixture?.stdout?.on("data", (chunk) => {
      if (!String(chunk).includes("analytics-runtime-smoke-fixture-ready")) return;
      clearTimeout(timeout);
      resolve();
    });
  });
}

function runMonitor(name: string, metadata: Record<string, unknown>) {
  const metadataPath = path.join(tempDirectory, `${name}-deployment.json`);
  const outputPath = path.join(tempDirectory, `${name}-report.json`);
  writeFileSync(metadataPath, `${JSON.stringify(metadata)}\n`, "utf8");
  const result = spawnSync(process.execPath, [
    "scripts/analytics/monitor-runtime.mjs",
    "--deployment-metadata",
    metadataPath,
    "--output",
    outputPath,
    "--fixture-base-url",
    fixtureOrigin,
  ], {
    encoding: "utf8",
    env: { ...process.env, GITHUB_SHA: repositorySha },
    timeout: 30_000,
  });
  const report = JSON.parse(readFileSync(outputPath, "utf8")) as Record<string, unknown>;
  return { result, report, serialized: JSON.stringify(report) };
}

beforeAll(startFixture);

afterAll(() => {
  fixture?.kill("SIGTERM");
  rmSync(tempDirectory, { recursive: true, force: true });
});

describe("analytics runtime monitor contract", () => {
  it("schedules one fixed production probe with minimal read-only permissions and bounded execution", () => {
    expect(workflow).toContain('cron: "*/15 * * * *"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("inputs:");
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("deployments: read");
    expect(workflow).not.toContain("issues: write");
    expect(workflow).toContain("timeout-minutes: 10");
    expect(workflow).toContain("group: analytics-runtime-monitor-production");
    expect(workflow).toContain("ANALYTICS_RUNTIME_MONITOR_TARGET: https://fermatmind.com");
    expect(workflow).not.toContain("${{ inputs.");
  });

  it("queries a real successful production deployment instead of relabeling the workflow SHA", () => {
    expect(workflow).toContain("github.rest.repos.listDeployments");
    expect(workflow).toContain("github.rest.repos.listDeploymentStatuses");
    expect(workflow).toContain("status.state === 'success'");
    expect(workflow).toContain("sha_source: 'github_deployments_api'");
    expect(workflow).toContain("production_deployment_lookup_failed");
    expect(workflow).not.toContain("production_deployment_sha: context.sha");
    expect(workflow).not.toContain("production_deployment_sha: '${{ github.sha }}'");
  });

  it("reuses the write-aborting probe and always emits a summary plus artifact", () => {
    expect(monitor).toContain('path.join(SCRIPT_DIR, "runtime-smoke.mjs")');
    expect(monitor).not.toContain("www.googletagmanager.com");
    expect(monitor).not.toContain("hm.baidu.com");
    expect(workflow).toContain("Write sanitized monitor summary");
    expect(workflow).toContain("Upload sanitized analytics runtime monitor report");
    expect(workflow.match(/if: always\(\)/g)).toHaveLength(2);
    expect(workflow).toContain("actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4");
    expect(packageJson.scripts?.["analytics:runtime-monitor"]).toBe("node scripts/analytics/monitor-runtime.mjs");
  });

  it("returns healthy with verified deployment provenance while preserving probe assertions", () => {
    const { result, report } = runMonitor("healthy", {
      schema_version: "1.0",
      deployment_id: 123456,
      environment: "production",
      queried_at: "2026-07-16T00:00:00.000Z",
      production_deployment_sha: productionSha,
      sha_source: "github_deployments_api",
      sha_status: "verified",
      sha_reason: null,
    });

    expect(result.status).toBe(0);
    expect(report).toMatchObject({
      schema_version: "1.0",
      target_host: new URL(fixtureOrigin).host,
      repository_sha: repositorySha,
      production_deployment_sha: productionSha,
      production_deployment_id: 123456,
      production_deployment_environment: "production",
      sha_source: "github_deployments_api",
      sha_status: "verified",
      csp_nonce_present: true,
      bootstrap_header_nonce_match: true,
      dynamic_script_nonce_match: true,
      ga_loader_attempted: true,
      baidu_loader_attempted: true,
      first_party_track_attempted: true,
      csp_blocking_error_count: 0,
      private_route_suppression: true,
      health_status: "healthy",
      failures: [],
    });
  });

  it("fails closed with unknown provenance and redacts identifiers, tokens, and query values", () => {
    const { result, report, serialized } = runMonitor("unknown", {
      schema_version: "1.0",
      deployment_id: null,
      environment: "production",
      queried_at: "2026-07-16T00:00:00.000Z",
      production_deployment_sha: "unknown",
      sha_source: "github_deployments_api",
      sha_status: "unknown",
      sha_reason: "token=super-secret cookie=session-secret G-LEAK1234 https://fermatmind.com/zh/result/private-id?email=person@example.com <html>dump</html>",
    });

    expect(result.status).toBe(1);
    expect(report).toMatchObject({
      production_deployment_sha: "unknown",
      production_deployment_id: null,
      production_deployment_queried_at: "2026-07-16T00:00:00.000Z",
      sha_status: "unknown",
      health_status: "unknown",
    });
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("session-secret");
    expect(serialized).not.toContain("G-LEAK1234");
    expect(serialized).not.toContain("person@example.com");
    expect(serialized).not.toContain("private-id");
    expect(serialized).not.toContain("<html>");
    expect(serialized).toContain("[redacted]");
    expect(serialized).toContain("[redacted-query]");
  });
});
