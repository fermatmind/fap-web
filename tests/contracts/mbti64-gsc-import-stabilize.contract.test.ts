import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const STABILIZE_PATH =
  "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-stabilize-2026-06-23.json";
const IMPORT_PATH = "docs/seo/personality/mbti64-seo-measurement-cohort-gsc-import-2026-06-23.json";
const PRIORITY_PATH = "docs/seo/personality/mbti64-agent-optimization-priority-selection-2026-06-23.json";
const QUERY_DECISION_PATH =
  "docs/seo/personality/mbti64-agent-visible-expansion-13-query-evidence-decision-2026-06-23.json";

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

type StabilizeReport = {
  final_decision: string;
  input_artifacts: Record<string, string>;
  stable_rerun_contract: Record<string, string | boolean>;
  evidence_summary: {
    cohort_url_count: number;
    page_level_gsc_imported_url_count: number;
    selected_for_agent_review_count: number;
    query_backed_ready_count: number;
    query_suppressed_hold_count: number;
  };
  selected_visible_13_decision: {
    ready_paths: string[];
    held_paths: string[];
    selected_paths_without_query_decision: string[];
  };
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  warnings: string[];
};

type ImportReport = {
  final_decision: string;
  summary: { total: number; with_gsc_rows: number; imported_no_row: number };
};

type PriorityReport = {
  final_decision: string;
  summary: { total_urls: number; selected_for_agent_review: number };
};

type QueryDecisionReport = {
  final_decision: string;
  summary: {
    target_url_count: number;
    ready_query_backed_low_risk_draft_review_count: number;
    hold_query_evidence_suppressed_count: number;
  };
};

describe("MBTI64-SEO-MEASUREMENT-COHORT-GSC-IMPORT-STABILIZE-01", () => {
  const report = readJson<StabilizeReport>(STABILIZE_PATH);
  const imported = readJson<ImportReport>(IMPORT_PATH);
  const priority = readJson<PriorityReport>(PRIORITY_PATH);
  const queryDecision = readJson<QueryDecisionReport>(QUERY_DECISION_PATH);

  it("stabilizes the GSC import, priority selection, and query-evidence decision chain", () => {
    expect(imported.final_decision).toBe("PASS_GSC_IMPORTED_PRIORITY_READY");
    expect(priority.final_decision).toBe("PASS_PRIORITY_SELECTION_READY");
    expect(queryDecision.final_decision).toBe("PASS_VISIBLE_13_QUERY_EVIDENCE_DECISION_READY");
    expect(report.final_decision).toBe("PASS_GSC_IMPORT_PRIORITY_PIPELINE_STABILIZED");
    expect(report.blockers).toEqual([]);

    expect(report.evidence_summary.cohort_url_count).toBe(96);
    expect(report.evidence_summary.page_level_gsc_imported_url_count).toBe(16);
    expect(report.evidence_summary.selected_for_agent_review_count).toBe(13);
    expect(report.evidence_summary.query_backed_ready_count).toBe(3);
    expect(report.evidence_summary.query_suppressed_hold_count).toBe(10);
    expect(imported.summary.total).toBe(96);
    expect(priority.summary.total_urls).toBe(96);
    expect(queryDecision.summary.target_url_count).toBe(13);
  });

  it("locks the ready and held visible expansion decisions", () => {
    expect(report.selected_visible_13_decision.ready_paths).toEqual([
      "/en/personality/enfj-a",
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
    ]);
    expect(report.selected_visible_13_decision.held_paths).toHaveLength(10);
    expect(report.selected_visible_13_decision.selected_paths_without_query_decision).toEqual([]);
  });

  it("keeps the stable rerun contract parameterized and non-mutating", () => {
    expect(report.stable_rerun_contract.page_level_import_command).toContain("--generated-date=YYYY-MM-DD");
    expect(report.stable_rerun_contract.page_level_import_command).toContain("--gsc-csv=/absolute/path/to/gsc-performance.csv");
    expect(report.stable_rerun_contract.priority_selection_command).toContain("--gsc-import=");
    expect(report.stable_rerun_contract.query_decision_command).toContain("--generated-date=YYYY-MM-DD");
    expect(report.stable_rerun_contract.missing_gsc_rows_are_not_zero_demand).toBe(true);

    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
  });
});
