import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/personality-agent-operations-next-batch-selection-2026-06-25.json";
const CSV_PATH = "docs/seo/personality/personality-agent-operations-next-batch-selection-2026-06-25.csv";

type BatchRow = {
  target_url: string;
  path: string;
  decision: string;
  query_rows_captured: number;
  qa_decision?: string;
  blocked_reason: string | null;
  recommended_next_task: string;
};

type Report = {
  final_decision: string;
  selection_policy: {
    mode: string;
    cms_write_policy: string;
    search_release_policy: string;
  };
  summary: {
    total_ranked_urls: number;
    selected_next_batch_count: number;
    held_waitlist_count: number;
    pilot_observation_baseline_count: number;
    measurement_backlog_count: number;
  };
  selected_next_batch: BatchRow[];
  held_waitlist: BatchRow[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-SELECTION-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("selects only the query-backed MBTI64 next batch candidates", () => {
    expect(report.final_decision).toBe("PASS_NEXT_BATCH_SELECTION_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary.total_ranked_urls).toBe(96);
    expect(report.summary.selected_next_batch_count).toBe(3);
    expect(report.selected_next_batch.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(report.selected_next_batch.every((row) => row.query_rows_captured > 0)).toBe(true);
    expect(report.selected_next_batch.every((row) => row.qa_decision === "PASS_READY_FOR_CMS_DRAFT")).toBe(true);
  });

  it("keeps suppressed evidence pages out of the selected batch", () => {
    expect(report.summary.held_waitlist_count).toBe(10);
    expect(report.held_waitlist).toHaveLength(10);
    expect(report.held_waitlist.every((row) => row.decision === "HOLD_QUERY_EVIDENCE_SUPPRESSED")).toBe(true);
    expect(report.held_waitlist.every((row) => row.blocked_reason === "query_evidence_suppressed")).toBe(true);

    const selectedUrls = new Set(report.selected_next_batch.map((row) => row.target_url));
    expect(report.held_waitlist.every((row) => !selectedUrls.has(row.target_url))).toBe(true);
    expect(report.summary.pilot_observation_baseline_count).toBe(8);
    expect(report.summary.measurement_backlog_count).toBe(75);
  });

  it("does not generate recommendations or mutate CMS/search surfaces", () => {
    expect(report.selection_policy.mode).toBe("candidate_selection_only_no_recommendation_generation");
    expect(report.selection_policy.cms_write_policy).toContain("never_from_selection");
    expect(report.selection_policy.search_release_policy).toContain("never_from_selection");

    expect(report.safety_boundary.recommendation_body_generated).toBe(false);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);

    expect(report.recommended_next_tasks.selected_next_batch).toBe(
      "PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-RECOMMENDATIONS-01",
    );
  });

  it("emits a stable CSV for spreadsheet review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "decision",
        "path",
        "target_url",
        "framework",
        "locale",
        "page_type",
        "mbti_type",
        "priority_rank",
        "priority_score",
        "evidence_quality",
        "query_rows_captured",
        "blocked_reason",
        "recommended_next_task",
      ].join(","),
    );
  });
});
