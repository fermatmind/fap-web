import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-index-24r-release-gate-revalidation.mjs";
const output = "docs/seo/personality/mbti-index-24r-release-gate-revalidation-2026-07-12.json";

describe("MBTI-INDEX-24R release gate revalidation", () => {
  it("requires an explicit read-only network flag", () => {
    expect(() => execFileSync("node", [script], { encoding: "utf8", stdio: "pipe" })).toThrow();
  });

  it("records an exact 9/9 allow decision from production authority", () => {
    execFileSync("node", [script, "--allow-network"], { encoding: "utf8", stdio: "pipe" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(report.decision).toBe("ALLOW_URL_EXPANSION");
    expect(report.expansion_allowed).toBe(true);
    expect(report.gsc_dependency_unblocked).toBe(true);
    expect(report.records).toHaveLength(9);
    expect(report.records.filter((record: { kind: string }) => record.kind === "profile")).toHaveLength(4);
    expect(report.records.filter((record: { kind: string }) => record.kind === "comparison")).toHaveLength(5);
    expect(report.records.every((record: { result: string }) => record.result === "pass")).toBe(true);
    expect(report.metrics).toEqual({
      CMS_API: 9,
      CANONICAL: 9,
      ROBOTS: 9,
      JSONLD: 9,
      FAQ_PARITY: 9,
      SITEMAP: 9,
      LLMS: 9,
      LLMS_FULL: 9,
    });
    expect(report.private_url_leak_count).toBe(0);
  }, 60_000);

  it("keeps the verification read-only and fail-closed", () => {
    const source = fs.readFileSync(script, "utf8");
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(source).toContain("HOLD_NO_URL_EXPANSION");
    expect(source).toContain("PRIVATE_PATH_PATTERN");
    expect(source).toContain("SAFE_PUBLIC_ORDER_PATH_PATTERN");
    expect(source).toContain("MAX_READ_ATTEMPTS = 3");
    expect(source).not.toMatch(/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);
    expect(report.safety_boundary).toEqual(expect.objectContaining({
      read_only_network: true,
      cms_write_attempted: false,
      indexability_mutation_attempted: false,
      gsc_submission_attempted: false,
      production_deploy_attempted: false,
    }));
  });
});
