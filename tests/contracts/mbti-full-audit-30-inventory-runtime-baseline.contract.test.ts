import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-full-audit-30-inventory-runtime-baseline.mjs";
const output = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";

describe("MBTI-FULL-AUDIT-30 inventory and runtime baseline", () => {
  it("locks the Chinese 52 URL scope and repair classification", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(stdout).toContain("PASS_MBTI_FULL_AUDIT_30_BASELINE_READY");
    expect(report.scope).toEqual({
      locale: "zh-CN",
      profile_count: 32,
      at_comparison_count: 16,
      hot_cross_type_count: 4,
      total_count: 52,
    });
    expect(report.summary).toMatchObject({
      needs_content_repair_count: 43,
      verify_only_count: 9,
      unknown_count: 0,
    });
    expect(report.records).toHaveLength(52);
  });

  it("keeps the fixed content routing and does not expand into arbitrary comparisons", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));
    const routes = report.records.map((record: { route: string }) => record.route);

    expect(report.task_routing.NT).toHaveLength(8);
    expect(report.task_routing.NF).toHaveLength(8);
    expect(report.task_routing.SJ).toHaveLength(8);
    expect(report.task_routing.SP).toHaveLength(8);
    expect(report.task_routing.at_comparisons).toHaveLength(16);
    expect(report.task_routing.cross_type_verify_only).toEqual([
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(routes.some((route: string) => route.startsWith("/en/"))).toBe(false);
    expect(routes.some((route: string) => route.includes("result") || route.includes("report"))).toBe(false);
  });

  it("uses committed evidence by default and only reads production when explicitly asked", () => {
    const source = fs.readFileSync(script, "utf8");
    const evidence = JSON.parse(fs.readFileSync("docs/seo/personality/mbti-full-audit-30-live-evidence-2026-07-13.json", "utf8"));

    expect(source).toContain('const ALLOW_NETWORK = process.argv.includes("--allow-network")');
    expect(source).toContain("if (ALLOW_NETWORK)");
    expect(evidence.safety_boundary).toMatchObject({
      cms_write_attempted: false,
      deploy_attempted: false,
      gsc_mutation_attempted: false,
      credential_data_recorded: false,
    });
    expect(evidence.private_url_leaks).toEqual([]);
  });

  it("publishes the shared baseline artifact atomically for parallel package builders", () => {
    const source = fs.readFileSync(script, "utf8");

    expect(source).toContain("const temporaryPath = `${absolutePath}.${process.pid}.tmp`");
    expect(source).toContain("fs.renameSync(temporaryPath, absolutePath)");
    expect(source).not.toContain("fs.writeFileSync(absolutePath, value);");
  });
});
