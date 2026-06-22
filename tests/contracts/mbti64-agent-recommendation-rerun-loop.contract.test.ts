import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.json";
const CSV_PATH = "docs/seo/personality/mbti64-agent-recommendation-rerun-loop-2026-06-23.csv";

type RerunRecord = {
  target_url: string;
  path: string;
  rerun_lane: string;
  rerun_allowed: boolean;
  blocked_reason: string | null;
  query_rows_captured: number;
  recommendation_artifact_present: boolean;
  qa_decision: string | null;
};

type Report = {
  final_decision: string;
  operating_policy: {
    mode: string;
    stop_gates: string[];
    cms_write_policy: string;
    search_release_policy: string;
  };
  summary: {
    total_urls: number;
    active_rerun_queue_count: number;
    query_evidence_waitlist_count: number;
    pilot_observation_baseline_count: number;
    measurement_backlog_count: number;
    recommendation_artifact_count: number;
    qa_pass_count: number;
  };
  active_rerun_queue: RerunRecord[];
  query_evidence_waitlist: RerunRecord[];
  rerun_candidates: RerunRecord[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("MBTI64-AGENT-RECOMMENDATION-RERUN-LOOP-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("locks the recommendation-only operating loop around the ranker output", () => {
    expect(report.final_decision).toBe("PASS_RECOMMENDATION_RERUN_LOOP_READY");
    expect(report.blockers).toEqual([]);
    expect(report.operating_policy.mode).toBe("recommendation_only_no_cms_write");
    expect(report.summary.total_urls).toBe(96);
    expect(report.rerun_candidates).toHaveLength(96);

    expect(report.summary.active_rerun_queue_count).toBe(3);
    expect(report.active_rerun_queue.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(report.active_rerun_queue.every((row) => row.rerun_allowed)).toBe(true);
    expect(report.active_rerun_queue.every((row) => row.query_rows_captured > 0)).toBe(true);
    expect(report.active_rerun_queue.every((row) => row.qa_decision === "PASS_READY_FOR_CMS_DRAFT")).toBe(true);
  });

  it("keeps suppressed query evidence and pilot pages out of the active rerun queue", () => {
    expect(report.summary.query_evidence_waitlist_count).toBe(10);
    expect(report.query_evidence_waitlist).toHaveLength(10);
    expect(report.query_evidence_waitlist.every((row) => row.rerun_allowed === false)).toBe(true);
    expect(report.query_evidence_waitlist.every((row) => row.blocked_reason === "query_evidence_suppressed")).toBe(
      true,
    );

    expect(report.summary.pilot_observation_baseline_count).toBe(8);
    expect(report.summary.measurement_backlog_count).toBe(75);
    expect(report.summary.recommendation_artifact_count).toBe(88);
    expect(report.summary.qa_pass_count).toBe(88);
  });

  it("requires QA and keeps CMS/search mutation outside the loop", () => {
    expect(report.operating_policy.stop_gates).toContain("qa_gate_failure");
    expect(report.operating_policy.stop_gates).toContain("private_route_or_result_page_leakage");
    expect(report.operating_policy.cms_write_policy).toContain("separate dry-run/write approval");
    expect(report.operating_policy.search_release_policy).toContain("separate gates");

    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);

    expect(report.recommended_next_tasks.active_rerun_queue).toBe(
      "MBTI64-CMS-PROJECTION-DRAFT-VISIBLE-3-DRY-RUN-01",
    );
  });

  it("emits a stable CSV for operations review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "rank",
        "path",
        "target_url",
        "locale",
        "page_type",
        "mbti_type",
        "cohort_group",
        "action_bucket",
        "rerun_lane",
        "rerun_allowed",
        "blocked_reason",
        "evidence_quality",
        "priority_score",
        "query_rows_captured",
        "impressions",
        "clicks",
        "ctr",
        "average_position",
        "qa_decision",
        "recommended_next_task",
      ].join(","),
    );
  });
});
