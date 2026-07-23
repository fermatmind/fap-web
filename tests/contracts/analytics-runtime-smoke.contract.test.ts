import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const smoke = readFileSync("scripts/analytics/runtime-smoke.mjs", "utf8");
const fixture = readFileSync("scripts/analytics/runtime-smoke-fixture.mjs", "utf8");
const workflow = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts?: Record<string, string>;
};

describe("analytics runtime smoke contract", () => {
  it("uses root by default and emits the compatible consent-driven schema", () => {
    expect(smoke).toContain('argument === "--base-url"');
    expect(smoke).toContain('argument === "--output"');
    expect(smoke).toContain('argument === "--resolve-to"');
    expect(smoke).toContain('`--host-resolver-rules=MAP ${new URL(args.baseUrl).hostname} ${args.resolveTo}`');
    expect(smoke).toContain('"--no-proxy-server"');
    expect(smoke).toContain('"--ignore-certificate-errors"');
    expect(smoke).toContain("ignoreHTTPSErrors: Boolean(args.resolveTo)");
    expect(smoke).toContain('schema_version: SCHEMA_VERSION');
    expect(smoke).toContain('const SCHEMA_VERSION = "1.1"');
    expect(smoke).toContain('const DEFAULT_PUBLIC_PATH = "/"');
    expect(smoke).toContain('health_status: "unhealthy"');
    expect(smoke).toContain('getByTestId("cookie-banner-accept")');
    expect(smoke).toContain("consent_action_completed");
    expect(smoke).toContain("landing_pageview_marker_present");
    expect(smoke).not.toContain("context.addInitScript");
    expect(smoke).not.toContain("waitForFunction");
    expect(packageJson.scripts?.["analytics:runtime-smoke"]).toBe("node scripts/analytics/runtime-smoke.mjs");
  });

  it("aborts all telemetry requests without inspecting request bodies", () => {
    expect(smoke).toContain('requestUrl.hostname === "www.googletagmanager.com"');
    expect(smoke).toContain('requestUrl.hostname === "hm.baidu.com"');
    expect(smoke).toContain('requestUrl.pathname === "/api/track"');
    expect(smoke).toContain('await route.abort("blockedbyclient")');
    expect(smoke).toContain("all_telemetry_aborted");
    expect(smoke).toContain("telemetry_attempt_count");
    expect(smoke).toContain("telemetry_abort_count");
    expect(smoke).not.toContain("postData()");
  });

  it("proves header/bootstrap/dynamic nonce agreement, nonce uniqueness, CSP safety, and private suppression", () => {
    expect(smoke).toContain('locator("#fm-analytics-bootstrap")');
    expect(smoke).toContain('document.querySelector("#fm-google-tag-script")?.nonce');
    expect(smoke).toContain('document.querySelector("#fm-baidu-tongji-script")?.nonce');
    expect(smoke).toContain("firstNonce !== secondNonce");
    expect(smoke).toContain("const firstContext = await browser.newContext");
    expect(smoke).toContain("const secondContext = await browser.newContext");
    expect(smoke).toContain("isCspScriptBlockingMessage");
    expect(smoke).toContain("private_route_suppression");
    expect(smoke).toContain("SYNTHETIC_DO_NOT_USE");
    expect(fixture).toContain('randomBytes(18).toString("base64url")');
    expect(fixture).toContain('script.nonce = scriptNonce');
    expect(fixture).toContain('data-testid="cookie-banner-accept"');
    expect(fixture).toContain('window.dispatchEvent(new CustomEvent("fm:analytics-consent-updated"');
    expect(fixture).toContain('"fm_landing_pv_sent_v1:" + window.location.pathname');
    expect(fixture.indexOf('addEventListener("click"')).toBeLessThan(
      fixture.indexOf('window.dispatchEvent(new CustomEvent("fm:analytics-consent-updated"')
    );
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
