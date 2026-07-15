import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-index-43-full-52-release-gate.mjs";
const reportPath = "docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14.json";
const runOnePath = "docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14-run-1.json";
const runTwoPath = "docs/seo/personality/mbti-index-43-full-52-release-gate-2026-07-14-run-2.json";

describe("MBTI-INDEX-43 full 52 URL release gate", () => {
  it("requires explicit read-only network and run flags", () => {
    expect(() => execFileSync("node", [script], { encoding: "utf8", stdio: "pipe" })).toThrow();
    expect(() => execFileSync("node", [script, "--allow-network"], { encoding: "utf8", stdio: "pipe" })).toThrow();
  });

  it("records two identical, complete production runs before unblocking GSC", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const runOne = JSON.parse(fs.readFileSync(runOnePath, "utf8"));
    const runTwo = JSON.parse(fs.readFileSync(runTwoPath, "utf8"));

    expect(report.final_decision).toBe("ALLOW_MBTI_52_COMPLETE");
    expect(report.gsc_dependency_unblocked).toBe(true);
    expect(report.completed_consecutive_runs).toBe(2);
    expect(runOne.run_decision).toBe("PASS_MBTI_52_RUN");
    expect(runTwo.run_decision).toBe("PASS_MBTI_52_RUN");
    expect(runOne.evidence_signature).toBe(runTwo.evidence_signature);
    expect(report.records).toHaveLength(52);
    expect(report.records.filter((record: { kind: string }) => record.kind === "profile")).toHaveLength(32);
    expect(report.records.filter((record: { kind: string }) => record.kind === "at_comparison")).toHaveLength(16);
    expect(report.records.filter((record: { kind: string }) => record.kind === "cross_type_comparison")).toHaveLength(4);
    expect(report.metrics).toEqual({
      CMS_API: 52,
      HTTP_200: 52,
      CANONICAL: 52,
      ROBOTS: 52,
      JSONLD: 52,
      FAQ_PARITY: 52,
      SITEMAP: 52,
      LLMS: 52,
      LLMS_FULL: 52,
      API_TIMEOUTS: 0,
    });
    expect(report.private_url_leak_count).toBe(0);
  });

  it("keeps profile and comparison schema checks separate and remains read-only", () => {
    const source = fs.readFileSync(script, "utf8");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(source).toContain('kind === "profile"');
    expect(source).toContain('"CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"');
    expect(source).toContain("visiblePageText");
    expect(source).toContain("PRIVATE_PATH_PATTERN");
    expect(source).toContain("API_TIMEOUTS");
    expect(source).not.toMatch(/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);
    expect(report.safety_boundary).toMatchObject({
      read_only_network: true,
      cms_write_attempted: false,
      public_promotion_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      production_deploy_attempted: false,
      frontend_editorial_fallback_added: false,
    });
  });
});
