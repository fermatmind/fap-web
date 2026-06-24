import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.json";
const CSV_PATH = "docs/seo/personality/mbti64-gsc-query-api-or-manual-csv-export-10-2026-06-24.csv";

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

type ExportPacket = {
  final_decision: string;
  target_url_count: number;
  required_csv_columns: string[];
  targets: Array<{
    target_url: string;
    path: string;
    previous_decision: string;
    query_evidence_status: string;
    gsc_api_request_template: {
      siteUrl: string;
      request: {
        dimensions: string[];
        dimensionFilterGroups: Array<{ filters: Array<{ dimension: string; operator: string; expression: string }> }>;
      };
    };
  }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

describe("MBTI64-GSC-QUERY-API-OR-MANUAL-CSV-EXPORT-10-01", () => {
  const report = readJson<ExportPacket>(REPORT_PATH);
  const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

  it("locks the 10 query-suppressed held URLs for external query export", () => {
    expect(report.final_decision).toBe("READY_FOR_MANUAL_CSV_OR_GSC_API_QUERY_EXPORT_10");
    expect(report.blockers).toEqual([]);
    expect(report.target_url_count).toBe(10);
    expect(report.targets.map((target) => target.path)).toEqual([
      "/en/personality/esfj-t",
      "/en/personality/enfp-a",
      "/zh/personality/istp-a",
      "/zh/personality/intp-a-vs-intp-t",
      "/en/personality/esfj-a",
      "/zh/personality/esfj-a",
      "/en/personality/intp-a",
      "/en/personality/istp-a",
      "/en/personality/entj-a",
      "/en/personality/estp-t",
    ]);
    expect(report.targets.every((target) => target.previous_decision === "HOLD_QUERY_EVIDENCE_SUPPRESSED")).toBe(true);
    expect(report.targets.every((target) => target.query_evidence_status === "pending_export")).toBe(true);
  });

  it("requires stable CSV columns and exact page equality filters", () => {
    expect(report.required_csv_columns).toEqual([
      "target_url",
      "path",
      "query",
      "clicks",
      "impressions",
      "ctr",
      "position",
      "date_range",
      "source",
      "exported_at",
    ]);
    expect(csv.split(/\r?\n/)[0]).toBe(report.required_csv_columns.join(","));

    for (const target of report.targets) {
      const request = target.gsc_api_request_template.request;
      expect(request.dimensions).toEqual(["page", "query"]);
      const [filter] = request.dimensionFilterGroups[0].filters;
      expect(filter).toEqual({
        dimension: "page",
        operator: "equals",
        expression: target.target_url,
      });
    }
  });

  it("keeps the packet artifact-only and non-mutating", () => {
    expect(report.safety_boundary.gsc_request_indexing_attempted).toBe(false);
    expect(report.safety_boundary.search_submit_attempted).toBe(false);
    expect(report.safety_boundary.search_queue_mutation_attempted).toBe(false);
    expect(report.safety_boundary.cms_write_attempted).toBe(false);
    expect(report.safety_boundary.publish_attempted).toBe(false);
    expect(report.safety_boundary.sitemap_llms_mutation_attempted).toBe(false);
    expect(report.safety_boundary.frontend_runtime_change_attempted).toBe(false);
  });
});
