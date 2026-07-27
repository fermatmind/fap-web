import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-gsc-53-full-cohort-monitoring.mjs";
const output = "docs/seo/personality/mbti-gsc-53-full-cohort-monitoring-2026-07-27.json";

describe("MBTI-GSC-53 full cohort read-only monitoring", () => {
  it("locks the exact 55-URL INDEX-52 cohort and only the three approved additions", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(stdout).toContain("PASS_MBTI_GSC_53_MONITORING_READY_WINDOWS_NOT_DUE");
    expect(report.summary).toMatchObject({
      cohort_url_count: 55,
      profile_url_count: 32,
      at_comparison_url_count: 16,
      cross_type_comparison_url_count: 7,
      prior_url_count: 52,
      added_url_count: 3,
      observation_window_count: 165,
      gsc_reads_executed_count: 0,
      search_mutations_executed_count: 0,
    });
    expect(new Set(report.records.map((record: { canonical: string }) => record.canonical)).size).toBe(55);
    expect(report.exact_additions).toEqual([
      "https://fermatmind.com/zh/personality/enfp-vs-entp",
      "https://fermatmind.com/zh/personality/estj-vs-entj",
      "https://fermatmind.com/zh/personality/isfp-vs-infp",
    ]);
  });

  it("uses actual 51/52 completion evidence and calculates exact 7/14/28-day windows", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(report.release_sources).toMatchObject({
      cross_publish_51: {
        merge_commit: "7c770c8741da48f666ea925c65dceb76f7a182a9",
        completed_at: "2026-07-26T14:24:59Z",
      },
      index_52: {
        merge_commit: "0239753b3df65f920a1ea0b9fc50401def893b95",
        completed_at: "2026-07-27T16:51:43Z",
      },
    });
    expect(report.release_at).toBe("2026-07-27T16:51:43Z");
    expect(report.monitoring_contract.windows).toEqual([
      { label: "day_7", due_at: "2026-08-03T16:51:43.000Z" },
      { label: "day_14", due_at: "2026-08-10T16:51:43.000Z" },
      { label: "day_28", due_at: "2026-08-24T16:51:43.000Z" },
    ]);
  });

  it("keeps every future window not_due with no fabricated observation", () => {
    const report = JSON.parse(fs.readFileSync(output, "utf8"));
    const windows = report.records.flatMap((record: { windows: Record<string, unknown> }) => Object.values(record.windows));

    expect(report.summary.observation_status_counts).toEqual({
      not_due: 165,
      pending: 0,
      observed: 0,
    });
    expect(windows.every((window: {
      observation_status: string;
      observed_at: string | null;
      coverage_status: string;
      indexing_status: string;
      evidence: unknown;
    }) => (
      window.observation_status === "not_due"
      && window.observed_at === null
      && window.coverage_status === "not_observed"
      && window.indexing_status === "not_observed"
      && window.evidence === null
    ))).toBe(true);
  });

  it("transitions not_due to pending only when due and to observed only with evidence time", () => {
    const stdout = execFileSync("node", [script, "--contract-probe=observation-status"], { encoding: "utf8" });
    expect(stdout).toContain("PASS_OBSERVATION_STATUS_PROBE");
  });

  it("cannot mutate GSC, search, CMS, feeds, indexability, or deployment state", () => {
    const source = fs.readFileSync(script, "utf8");
    const report = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(source).not.toMatch(/fetch\(|googleapis|indexing\/v3|searchconsole|method:\s*["'](?:POST|PUT|PATCH|DELETE)/);
    expect(report.safety_boundary).toMatchObject({
      read_only_monitoring_contract: true,
      authenticated_gsc_read_attempted: false,
      credentials_or_property_tokens_recorded: false,
      sitemap_submission_attempted: false,
      url_inspection_write_attempted: false,
      request_indexing_attempted: false,
      indexing_api_used: false,
      search_console_mutation_attempted: false,
      cms_or_database_mutation_attempted: false,
      publication_or_indexability_mutation_attempted: false,
      deploy_attempted: false,
      private_url_leak_count: 0,
    });
  });
});
