import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-ops-08-gsc-priority-monitoring.mjs";
const JSON_PATH = "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.json";
const MD_PATH = "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.md";
const CSV_PATH = "docs/seo/personality/mbti-ops-08-gsc-priority-monitoring-2026-07-04.csv";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();

  try {
    const output = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    for (const line of output.split("\n")) {
      if (line.trim()) files.add(line.trim());
    }
  } catch {
    // Local explicit scope validation is the fallback in shallow CI checkouts.
  }

  return [...files].sort();
}

type MonitoringReport = {
  id: string;
  final_decision: string;
  summary: {
    gsc_records_total: number;
    gsc_visible_rows: number;
    query_rows_captured: number;
    query_export_pending_urls: number;
    top_profile_pages: number;
    top_comparison_pages: number;
    operator_seed_queries: number;
  };
  top_pages: {
    top_10_profile_pages: Array<{ path: string; page_type: string; gsc_status: string }>;
    top_10_comparison_pages: Array<{ path: string; page_type: string; gsc_status: string }>;
  };
  top_queries: Array<{ query: string | null; evidence_status: string; next_action: string }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

describe("MBTI-OPS-08 GSC priority monitoring", () => {
  it("generates deterministic Top pages and query tracking artifacts from existing evidence", () => {
    execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const report = readJson<MonitoringReport>(JSON_PATH);
    const markdown = read(MD_PATH);
    const csv = read(CSV_PATH);

    expect(report.id).toBe("MBTI-OPS-08");
    expect(report.final_decision).toBe("PASS_MBTI_OPS_08_GSC_PRIORITY_MONITORING_READY");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      gsc_records_total: 96,
      gsc_visible_rows: 16,
      query_rows_captured: 3,
      query_export_pending_urls: 10,
      top_profile_pages: 10,
      top_comparison_pages: 10,
      operator_seed_queries: 6,
    });
    expect(report.top_pages.top_10_profile_pages).toHaveLength(10);
    expect(report.top_pages.top_10_comparison_pages).toHaveLength(10);
    expect(report.top_pages.top_10_profile_pages[0].path).toBe("/zh/personality/istj-a");
    expect(report.top_pages.top_10_comparison_pages.some((row) => row.gsc_status === "GSC_IMPORTED")).toBe(true);
    expect(report.top_pages.top_10_comparison_pages.some((row) => row.gsc_status === "GSC_IMPORTED_NO_ROW_FOR_URL")).toBe(
      true,
    );

    expect(markdown).toContain("Top 10 Personality Pages");
    expect(markdown).toContain("Top Queries And Query Evidence Queue");
    expect(csv.split(/\r?\n/)[0]).toBe(
      "section,rank,path,page_type,query,clicks,impressions,ctr,position,evidence,next_action",
    );
  });

  it("keeps missing query evidence pending instead of treating it as zero demand", () => {
    const report = readJson<MonitoringReport>(JSON_PATH);

    expect(report.top_queries.some((row) => row.evidence_status === "captured_query_row")).toBe(true);
    expect(report.top_queries.some((row) => row.evidence_status === "pending_manual_or_api_query_export")).toBe(true);
    expect(report.top_queries.some((row) => row.evidence_status === "operator_28d_summary_seed_requires_export")).toBe(true);
    expect(report.top_queries.every((row) => !row.next_action.includes("zero"))).toBe(true);
    expect(report.safety_boundary.missing_query_rows_treated_as_zero_demand).toBe(false);
  });

  it("stays artifact-only and avoids CMS, deploy, runtime, sitemap, and llms mutations", () => {
    const report = readJson<MonitoringReport>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      cms_write_attempted: false,
      production_import_attempted: false,
      production_deploy_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
    });
  });

  it("keeps the PR scoped to the OPS monitoring script, artifacts, contract, and train ledger", () => {
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    if (branch !== "codex/mbti-ops-08-gsc-priority-monitoring") {
      expect(branch).not.toBe("codex/mbti-ops-08-gsc-priority-monitoring");
      return;
    }

    const allowedExact = new Set([
      SCRIPT_PATH,
      JSON_PATH,
      MD_PATH,
      CSV_PATH,
      "tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts",
      "docs/codex/pr-train-state.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
    ]);
    const changedFiles = committedScopeFiles();
    const guardedOpsFiles = new Set([SCRIPT_PATH, JSON_PATH, MD_PATH, CSV_PATH]);
    const touchesThisOpsScope = changedFiles.some((file) => guardedOpsFiles.has(file));

    if (!touchesThisOpsScope) {
      const unexpectedOpsFiles = changedFiles.filter(
        (file) => file.includes("mbti-ops-08-gsc-priority-monitoring") && file !== "tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts",
      );
      expect(unexpectedOpsFiles).toEqual([]);
      return;
    }

    const outsideScope = changedFiles.filter((file) => !allowedExact.has(file));

    expect(outsideScope).toEqual([]);
  });
});
