import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/personality-agent-auto-runner-scheduler-2026-06-24.json";
const CSV_PATH = "docs/seo/personality/personality-agent-auto-runner-scheduler-2026-06-24.csv";
const SCRIPT_PATH = "scripts/seo/run-personality-agent-auto-runner.mjs";

type QueueRow = {
  path: string;
  target_url: string;
  lane: string;
  query_rows_captured: number;
  blocked_reason: string | null;
  recommended_next_task: string;
};

type Report = {
  artifact: string;
  framework: string;
  final_decision: string;
  runner_contract: {
    mode: string;
    enabled_frameworks_v1: string[];
    future_framework_slots: string[];
    scheduler_activation: string;
  };
  summary: {
    cohort_url_count: number;
    optimized_reference_pages: number;
    recommendation_artifact_count: number;
    qa_pass_count: number;
    ready_draft_review_count: number;
    hold_for_query_evidence_count: number;
    pilot_observation_baseline_count: number;
    measurement_backlog_count: number;
  };
  ready_draft_review_queue: QueueRow[];
  hold_for_query_evidence_queue: QueueRow[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_tasks: Record<string, string>;
};

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("creates a scheduler-ready runner manifest without enabling unattended cron", () => {
    expect(fs.existsSync(path.join(ROOT, SCRIPT_PATH))).toBe(true);
    expect(report.artifact).toBe("PERSONALITY-AGENT-AUTO-RUNNER-SCHEDULER-01");
    expect(report.framework).toBe("mbti64");
    expect(report.final_decision).toBe("PASS_MANUAL_SCHEDULER_READY_NO_UNATTENDED_CRON");
    expect(report.blockers).toEqual([]);

    expect(report.runner_contract.mode).toBe("manual_scheduler_ready_artifact_only");
    expect(report.runner_contract.enabled_frameworks_v1).toEqual(["mbti64"]);
    expect(report.runner_contract.future_framework_slots).toEqual(["big_five", "enneagram"]);
    expect(report.runner_contract.scheduler_activation).toBe("not_enabled_in_this_pr");
  });

  it("keeps GSC evidence suppression out of the active draft queue", () => {
    expect(report.summary.cohort_url_count).toBe(96);
    expect(report.summary.optimized_reference_pages).toBe(8);
    expect(report.summary.recommendation_artifact_count).toBe(88);
    expect(report.summary.qa_pass_count).toBe(88);
    expect(report.summary.ready_draft_review_count).toBe(3);
    expect(report.summary.hold_for_query_evidence_count).toBe(10);
    expect(report.summary.pilot_observation_baseline_count).toBe(8);
    expect(report.summary.measurement_backlog_count).toBe(75);

    expect(report.ready_draft_review_queue.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(report.ready_draft_review_queue.every((row) => row.query_rows_captured > 0)).toBe(true);
    expect(report.ready_draft_review_queue.every((row) => row.blocked_reason === null)).toBe(true);

    expect(report.hold_for_query_evidence_queue).toHaveLength(10);
    expect(report.hold_for_query_evidence_queue.every((row) => row.blocked_reason === "query_evidence_suppressed")).toBe(
      true,
    );
  });

  it("does not mutate CMS, runtime, sitemap, Search Queue, GSC indexing, or deploy state", () => {
    expect(report.safety_boundary.artifact_only).toBe(true);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
    expect(report.safety_boundary.unattended_cron_enabled).toBe(false);

    expect(report.recommended_next_tasks.approval_queue).toBe("PERSONALITY-AGENT-HUMAN-APPROVAL-QUEUE-01");
  });

  it("emits a compact operations CSV for ready and held pages only", () => {
    const csv = read(CSV_PATH);
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(14);
    expect(lines[0]).toBe(
      [
        "path",
        "target_url",
        "locale",
        "page_type",
        "lane",
        "evidence_quality",
        "query_rows_captured",
        "priority_score",
        "allowed_next_action",
        "blocked_reason",
        "recommended_next_task",
      ].join(","),
    );
  });
});
