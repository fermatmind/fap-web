import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/personality-agent-operations-next-batch-qa-2026-06-25.json";
const CSV_PATH = "docs/seo/personality/personality-agent-operations-next-batch-qa-2026-06-25.csv";

type PageResult = {
  path: string;
  target_url: string;
  decision: string;
  gates: Record<string, string>;
  blockers: string[];
  warnings: string[];
};

type Report = {
  final_decision: string;
  scope: string;
  summary: {
    checked_recommendation_count: number;
    pass_ready_for_approval_review_count: number;
    blocked_count: number;
    duplicate_signature_group_count: number;
  };
  gate_rollup: Record<string, number>;
  page_results: PageResult[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
  recommended_next_task: string;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("PERSONALITY-AGENT-OPERATIONS-NEXT-BATCH-QA-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("passes the 3 query-backed next-batch recommendations for approval review", () => {
    expect(report.final_decision).toBe("PASS_READY_FOR_APPROVAL_REVIEW");
    expect(report.blockers).toEqual([]);
    expect(report.summary.checked_recommendation_count).toBe(3);
    expect(report.summary.pass_ready_for_approval_review_count).toBe(3);
    expect(report.summary.blocked_count).toBe(0);
    expect(report.summary.duplicate_signature_group_count).toBe(0);
    expect(report.page_results.map((row) => row.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
    ]);
    expect(report.page_results.every((row) => row.decision === "PASS_READY_FOR_APPROVAL_REVIEW")).toBe(true);
  });

  it("keeps all QA gates green", () => {
    for (const count of Object.values(report.gate_rollup)) {
      expect(count).toBe(0);
    }
    for (const result of report.page_results) {
      expect(result.blockers).toEqual([]);
      expect(result.gates).toMatchObject({
        schema_validation: "pass",
        trademark_claim_gate: "pass",
        claim_risk_gate: "pass",
        duplicate_template_gate: "pass",
        private_route_gate: "pass",
        result_page_leakage_gate: "pass",
        seo_projection_gate: "pass",
        bilingual_consistency_gate: "pass",
      });
    }
  });

  it("documents the no-write boundary and approval queue handoff", () => {
    expect(report.scope).toContain("No CMS write");
    expect(report.scope).toContain("no promotion");
    expect(report.scope).toContain("no publish");
    expect(report.scope).toContain("no index/search release");
    expect(report.scope).toContain("no sitemap/llms mutation");

    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.cms_live_promotion_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.live_search_submit_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
    expect(report.recommended_next_task).toBe("PERSONALITY-AGENT-HUMAN-APPROVAL-QUEUE-01");
  });

  it("emits a stable CSV for approval review", () => {
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
    expect(csv.split("\n")[0]).toBe(
      [
        "path",
        "target_url",
        "locale",
        "page_type",
        "decision",
        "blocker_count",
        "warning_count",
        "recommended_next_task",
      ].join(","),
    );
  });
});
