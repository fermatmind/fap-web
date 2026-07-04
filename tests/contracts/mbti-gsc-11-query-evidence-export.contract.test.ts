import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.json";
const CSV_PATH = "docs/seo/personality/mbti-gsc-11-query-evidence-export-2026-07-04.csv";
const IMPORT_TEMPLATE_PATH = "docs/seo/personality/mbti-gsc-11-query-evidence-import-template-2026-07-04.csv";

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

type Gsc11Report = {
  final_decision: string;
  summary: {
    normalized_query_tracking_rows: number;
    captured_query_rows: number;
    pending_manual_or_api_query_export_rows: number;
    operator_seed_requires_confirmation_rows: number;
    import_template_rows: number;
    profile_queue_size: number;
    comparison_queue_size: number;
  };
  evidence_policy: {
    captured_query_rows_can_inform_title_faq_answer_block: boolean;
    pending_rows_cannot_inform_serp_copy_until_imported: boolean;
    operator_seed_queries_require_gsc_metric_confirmation: boolean;
    missing_query_rows_are_not_zero_demand: boolean;
    frontend_editorial_fallback_allowed: boolean;
  };
  normalized_rows: Array<{
    path: string;
    query: string | null;
    query_status: string;
    source: string;
    next_action: string;
  }>;
  import_template: {
    columns: string[];
    rows: Array<Record<string, string>>;
  };
  safety_boundary: Record<string, boolean>;
  next_gates: Record<string, string>;
  blockers: string[];
};

describe("MBTI-GSC-11 query evidence export", () => {
  const report = readJson<Gsc11Report>(REPORT_PATH);
  const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");
  const importTemplate = fs.readFileSync(path.join(ROOT, IMPORT_TEMPLATE_PATH), "utf8");

  it("stabilizes the OPS08 query evidence queue into captured, pending, and operator seed rows", () => {
    expect(report.final_decision).toBe("PASS_MBTI_GSC_11_QUERY_EVIDENCE_EXPORT_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      normalized_query_tracking_rows: 19,
      captured_query_rows: 3,
      pending_manual_or_api_query_export_rows: 10,
      operator_seed_requires_confirmation_rows: 6,
      import_template_rows: 16,
      profile_queue_size: 10,
      comparison_queue_size: 10,
    });

    expect(report.normalized_rows.filter((row) => row.query_status === "captured_query_row").map((row) => row.query)).toEqual([
      "enfj-a",
      "intp-a",
      "esfp-a",
    ]);
    expect(report.normalized_rows.filter((row) => row.query_status === "pending_manual_or_api_query_export")).toHaveLength(10);
    expect(report.normalized_rows.filter((row) => row.query_status === "operator_seed_requires_gsc_confirmation")).toHaveLength(6);
  });

  it("blocks speculative SERP copy changes until rows are verified", () => {
    expect(report.evidence_policy).toEqual({
      captured_query_rows_can_inform_title_faq_answer_block: true,
      pending_rows_cannot_inform_serp_copy_until_imported: true,
      operator_seed_queries_require_gsc_metric_confirmation: true,
      missing_query_rows_are_not_zero_demand: true,
      frontend_editorial_fallback_allowed: false,
    });
    expect(report.next_gates.MBTI_CMS_12).toContain("captured or imported query-verified rows");
    expect(report.next_gates.MBTI_CMS_13).toContain("captured or imported query-verified rows");
    expect(report.next_gates.MBTI_QA_14).toContain("query evidence is pending");
  });

  it("keeps the GSC handoff non-mutating and import-template only", () => {
    expect(report.safety_boundary.gsc_api_call_attempted).toBe(false);
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.search_submit_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.production_import_attempted).toBe(false);
    expect(report.safety_boundary.production_deploy_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);

    expect(csv.split(/\r?\n/)[0]).toBe(
      "path,target_url,locale,page_type,query,query_status,clicks,impressions,ctr,position,source,next_action",
    );
    expect(importTemplate.split(/\r?\n/)[0]).toBe(report.import_template.columns.join(","));
    expect(importTemplate).toContain("expected_status_after_import");
  });
});
