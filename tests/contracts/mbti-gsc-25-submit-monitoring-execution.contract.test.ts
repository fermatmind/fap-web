import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-gsc-25-submit-monitoring-execution.mjs";
const output = "docs/seo/personality/mbti-gsc-25-submission-monitoring-execution-2026-07-12.json";

describe("MBTI-GSC-25 submission and monitoring execution", () => {
  it("locks the exact INDEX-24R cohort and records completed GSC actions", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(stdout).toContain("PASS_MBTI_GSC_25_SUBMITTED_MONITORING_READY");
    expect(report.property).toBe("sc-domain:fermatmind.com");
    expect(report.summary).toMatchObject({
      cohort_url_count: 9,
      profile_url_count: 4,
      comparison_url_count: 5,
      sitemap_success_count: 1,
      sitemap_resubmission_count: 0,
      inspection_record_count: 9,
      request_indexing_submitted_count: 9,
      request_indexing_remaining_count: 0,
      quota_or_permission_blocker_count: 0,
    });
    expect(report.records).toHaveLength(9);
    expect(report.records.every((record: { request_indexing_status: string }) => record.request_indexing_status === "submitted")).toBe(true);
  });

  it("captures the 28-day baseline and fixed monitoring windows", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(report.baseline).toMatchObject({ clicks: 13, impressions: 1409, ctr: 0.009, average_position: 9.2 });
    expect(report.monitoring.windows).toEqual([
      { label: "7d", date: "2026-07-19" },
      { label: "14d", date: "2026-07-26" },
      { label: "28d", date: "2026-08-09" },
    ]);
    expect(report.monitoring.cohort_rule).toContain("separate scoped content PR");
    expect(report.monitoring.automation_state).toBe("ready_to_schedule_after_pr_merge");
    expect(report.post_submission_index24r_recheck).toMatchObject({
      decision: "ALLOW_URL_EXPANSION",
      llms: "9/9",
      llms_full: "9/9",
      direct_llms_cohort_match_count: 9,
    });
    expect(report.post_submission_index24r_recheck.repeatability_runs).toHaveLength(2);
    expect(report.post_submission_index24r_recheck.repeatability_runs.every((run: { decision: string; llms: string; private_url_leaks: number }) => (
      run.decision === "ALLOW_URL_EXPANSION" && run.llms === "9/9" && run.private_url_leaks === 0
    ))).toBe(true);
  });

  it("preserves privacy and provider safety boundaries", () => {
    const source = fs.readFileSync(script, "utf8");
    const evidence = JSON.parse(fs.readFileSync("docs/seo/personality/mbti-gsc-25-live-evidence-2026-07-12.json", "utf8"));
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(source).not.toMatch(/fetch\(|googleapis|indexing\/v3|method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
    expect(Object.values(evidence.privacy_boundary).every((value) => value === false)).toBe(true);
    expect(report.safety_boundary).toMatchObject({
      sitemap_duplicate_submission_avoided: true,
      indexing_api_used: false,
      cms_write_attempted: false,
      deploy_attempted: false,
      account_or_credential_data_recorded: false,
    });
  });
});
