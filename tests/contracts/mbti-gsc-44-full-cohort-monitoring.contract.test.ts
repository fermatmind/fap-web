import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-gsc-44-full-cohort-monitoring.mjs";
const output = "docs/seo/personality/mbti-gsc-44-full-cohort-monitoring-2026-07-15.json";

describe("MBTI-GSC-44 full cohort monitoring", () => {
  it("locks the exact 52-URL INDEX-43 cohort and read-only baseline", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(stdout).toContain("PASS_MBTI_GSC_44_BASELINE_MONITORING_READY_NO_MUTATION");
    expect(report.property).toBe("sc-domain:fermatmind.com");
    expect(report.summary).toMatchObject({
      cohort_url_count: 52,
      profile_url_count: 32,
      at_comparison_url_count: 16,
      cross_type_comparison_url_count: 4,
      historical_request_indexing_count: 9,
      request_indexing_executed_count: 0,
    });
    expect(new Set(report.records.map((record: { canonical: string }) => record.canonical)).size).toBe(52);
    expect(report.records.every((record: { canonical: string }) => record.canonical.startsWith("https://fermatmind.com/zh/personality/"))).toBe(true);
  });

  it("preserves query/page evidence boundaries and monitoring windows", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(report.baseline).toMatchObject({ clicks: 32, impressions: 3106, ctr: 0.01, average_position: 9.1, query_row_count: 106 });
    expect(report.monitoring.windows).toEqual([
      { label: "7d", date: "2026-07-22" },
      { label: "14d", date: "2026-07-29" },
      { label: "28d", date: "2026-08-12" },
    ]);
    expect(report.summary.page_rows_observed_count + report.summary.page_rows_pending_count).toBe(52);
    expect(report.records.every((record: { page_baseline_status: string; impressions: number | null }) => (
      record.page_baseline_status === "observed_page_row" || record.impressions === null
    ))).toBe(true);
    expect(report.top_queries.some((row: { query: string; matched_slug: string }) => row.query === "intp-a" && row.matched_slug === "intp-a")).toBe(true);
  });

  it("cannot mutate GSC, CMS, feeds or deployment state", () => {
    const source = fs.readFileSync(script, "utf8");
    const evidence = JSON.parse(fs.readFileSync("docs/seo/personality/mbti-gsc-44-live-evidence-2026-07-15.json", "utf8"));
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(source).not.toMatch(/fetch\(|googleapis|indexing\/v3|method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
    expect(Object.values(evidence.external_action_boundary).every((value) => value === false)).toBe(true);
    expect(report.safety_boundary).toMatchObject({
      sitemap_submission_attempted: false,
      url_inspection_attempted: false,
      request_indexing_attempted: false,
      indexing_api_used: false,
      cms_or_runtime_mutation_attempted: false,
      deploy_attempted: false,
      account_or_credential_data_recorded: false,
      private_url_leak_count: 0,
    });
  });
});
