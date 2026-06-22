import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.json";
const CSV_PATH = "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.csv";

type RankedRecord = {
  rank: number;
  target_url: string;
  path: string;
  action_bucket: string;
  allowed_next_action: string;
  blocked_reason: string | null;
  evidence_quality: string;
  priority_score: number;
  score_inputs: {
    impressions: number;
    clicks: number;
    ctr: number;
    average_position: number | null;
    query_rows_captured: number;
  };
};

type Report = {
  final_decision: string;
  ranker_policy: Record<string, boolean | string[]>;
  summary: {
    total_urls: number;
    ready_query_backed_low_risk_draft_review: number;
    hold_query_evidence_suppressed: number;
    observe_optimized_pilot: number;
    discovery_backlog_gsc_no_row: number;
    page_level_gsc_imported_url_count: number;
    query_rows_total: number;
  };
  ready_queue: RankedRecord[];
  hold_queue: RankedRecord[];
  ranked_records: RankedRecord[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  warnings: string[];
  recommended_next_tasks: Record<string, string>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("MBTI64-AGENT-PRIORITY-RANKER-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("ranks all 96 MBTI64 URLs with locked ready and hold queues", () => {
    expect(report.final_decision).toBe("PASS_AGENT_PRIORITY_RANKER_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary.total_urls).toBe(96);
    expect(report.ranked_records).toHaveLength(96);

    expect(report.summary.ready_query_backed_low_risk_draft_review).toBe(3);
    expect(report.ready_queue.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(report.ready_queue.every((row) => row.action_bucket === "READY_QUERY_BACKED_LOW_RISK_DRAFT_REVIEW")).toBe(
      true,
    );
    expect(report.ready_queue.every((row) => row.score_inputs.query_rows_captured > 0)).toBe(true);

    expect(report.summary.hold_query_evidence_suppressed).toBe(10);
    expect(report.hold_queue).toHaveLength(10);
    expect(report.hold_queue.every((row) => row.blocked_reason === "query_evidence_suppressed")).toBe(true);
  });

  it("keeps ranker policy conservative for missing GSC rows and optimized pilot pages", () => {
    expect(report.ranker_policy.missing_gsc_rows_are_not_zero_demand).toBe(true);
    expect(report.ranker_policy.query_level_evidence_required_before_serp_copy_rewrite).toBe(true);
    expect(report.ranker_policy.optimized_pilot_pages_are_observation_baselines).toBe(true);
    expect(report.ranker_policy.ranker_outputs_are_recommendations_not_cms_truth).toBe(true);

    expect(report.summary.observe_optimized_pilot).toBe(8);
    expect(report.summary.discovery_backlog_gsc_no_row).toBe(75);
    expect(report.summary.page_level_gsc_imported_url_count).toBe(16);
    expect(report.summary.query_rows_total).toBe(3);
  });

  it("does not permit writes, search mutations, or direct publishing from the ranker output", () => {
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);

    expect(report.recommended_next_tasks.ready_queue).toBe("MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01");
    expect(report.recommended_next_tasks.hold_queue).toBe("MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01");
    expect(report.recommended_next_tasks.operating_loop).toBe("MBTI64-AGENT-RECOMMENDATION-RERUN-LOOP-01");
  });

  it("emits a stable CSV for spreadsheet review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "rank",
        "path",
        "target_url",
        "locale",
        "page_type",
        "mbti_type",
        "variant",
        "cohort_group",
        "action_bucket",
        "allowed_next_action",
        "blocked_reason",
        "evidence_quality",
        "priority_score",
        "impressions",
        "clicks",
        "ctr",
        "average_position",
        "query_rows_captured",
        "recommended_next_task",
      ].join(","),
    );
  });
});
