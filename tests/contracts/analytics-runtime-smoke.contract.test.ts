import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const smoke = readFileSync("scripts/analytics/runtime-smoke.mjs", "utf8");
const fixture = readFileSync("scripts/analytics/runtime-smoke-fixture.mjs", "utf8");
const workflow = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};

describe("analytics runtime smoke contract", () => {
  it("requires an explicit target and stable JSON output while pregranting consent", () => {
    expect(smoke).toContain('argument === "--base-url"');
    expect(smoke).toContain('argument === "--output"');
    expect(smoke).toContain('argument === "--resolve-to"');
    expect(smoke).toContain('`--host-resolver-rules=MAP ${new URL(args.baseUrl).hostname} ${args.resolveTo}`');
    expect(smoke).toContain('schema_version: SCHEMA_VERSION');
    expect(smoke).toContain('health_status: "unhealthy"');
    expect(smoke).toContain('window.localStorage.setItem("fm_consent_v1"');
    expect(packageJson.scripts?.["analytics:runtime-smoke"]).toBe("node scripts/analytics/runtime-smoke.mjs");
  });

  it("aborts all telemetry writes and records only provider attempt categories", () => {
    expect(smoke).toContain('requestUrl.hostname === "www.googletagmanager.com"');
    expect(smoke).toContain('requestUrl.hostname === "hm.baidu.com"');
    expect(smoke).toContain('requestUrl.pathname === "/api/track"');
    expect(smoke.match(/route\.abort\("blockedbyclient"\)/g)).toHaveLength(3);
    expect(smoke).not.toContain("postData()");
  });

  it("proves header/bootstrap/dynamic nonce agreement, nonce uniqueness, CSP safety, and private suppression", () => {
    expect(smoke).toContain('locator("#fm-analytics-bootstrap")');
    expect(smoke).toContain('document.querySelector("#fm-google-tag-script")?.nonce');
    expect(smoke).toContain('document.querySelector("#fm-baidu-tongji-script")?.nonce');
    expect(smoke).toContain("firstNonce !== secondNonce");
    expect(smoke).toContain("isCspScriptBlockingMessage");
    expect(smoke).toContain("private_route_suppression");
    expect(smoke).toContain("SYNTHETIC_DO_NOT_USE");
    expect(fixture).toContain('randomBytes(18).toString("base64url")');
    expect(fixture).toContain('script.nonce = scriptNonce');
  });

  it("wires the reusable write-aborting probe only after an authorized production deployment", () => {
    expect(workflow).toContain('workflow_run:');
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('name: Probe CSP-safe analytics collection without telemetry writes');
    expect(workflow).toContain('pnpm analytics:runtime-smoke --');
    expect(workflow).toContain('--base-url "$PUBLIC_BASE_URL"');
    expect(workflow).toContain('name: Upload analytics runtime smoke report');
    expect(workflow).toContain('if: always()');
  });
});
