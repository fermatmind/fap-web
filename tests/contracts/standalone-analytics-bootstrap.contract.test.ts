import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertAnalyticsBootstrapHtml,
  createRuntimeEnv,
} from "../../scripts/release/verify-standalone-analytics-bootstrap.mjs";

describe("standalone analytics bootstrap contract", () => {
  it("removes runtime analytics env without removing unrelated runtime config", () => {
    const env = createRuntimeEnv({
      NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST1234",
      KEEP_ME: "yes",
    }, 4321);

    expect(env.NEXT_PUBLIC_ANALYTICS_ENABLED).toBeUndefined();
    expect(env.NEXT_PUBLIC_GA_MEASUREMENT_ID).toBeUndefined();
    expect(env.KEEP_ME).toBe("yes");
    expect(env.PORT).toBe("4321");
    expect(env.NODE_ENV).toBe("production");
  });

  it("requires the public bootstrap in a successful standalone response", () => {
    expect(() =>
      assertAnalyticsBootstrapHtml(200, '<script id="fm-analytics-bootstrap"></script>')
    ).not.toThrow();
    expect(() => assertAnalyticsBootstrapHtml(200, "<html></html>")).toThrow(
      "omitted the build-time analytics bootstrap"
    );
    expect(() => assertAnalyticsBootstrapHtml(503, "<html></html>")).toThrow(
      "returned HTTP 503"
    );
  });

  it("runs the no-runtime-env standalone probe after build and before packaging", () => {
    const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const build = workflow.indexOf("- run: pnpm build");
    const probe = workflow.indexOf("node scripts/release/verify-standalone-analytics-bootstrap.mjs");
    const packaging = workflow.indexOf("- name: Package and verify immutable standalone release");

    expect(build).toBeGreaterThan(-1);
    expect(probe).toBeGreaterThan(build);
    expect(packaging).toBeGreaterThan(probe);
  });
});
