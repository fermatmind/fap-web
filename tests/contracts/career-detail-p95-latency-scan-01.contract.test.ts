import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = path.join(ROOT, "docs/seo/generated/career-detail-p95-latency-scan-01.v1.json");

type LatencySourceClassification = {
  source: string;
};

type CareerDetailLatencyScanReport = {
  task: string;
  mode: string;
  sample_slug_count: number;
  sample_page_count: number;
  page_latency_ms: { p95: number };
  api_latency_ms: { p95: number };
  html_bytes: { p95: number };
  outlier_slug_list: unknown[];
  latency_source_classification: LatencySourceClassification[];
  metadata_integrity: {
    all_sampled_pages_200: boolean;
    all_sampled_api_200: boolean;
    no_sampled_noindex_drift: boolean;
    no_sampled_page_not_found: boolean;
  };
  no_mutation_performed: boolean;
  search_channel_action_performed: boolean;
  url_submission_performed: boolean;
  external_search_api_call_performed: boolean;
  next_fix_recommendation: { task: string };
  final_decision: string;
};

function readReport() {
  return JSON.parse(fs.readFileSync(REPORT_PATH, "utf8")) as CareerDetailLatencyScanReport;
}

describe("CAREER-DETAIL-P95-LATENCY-SCAN-01", () => {
  it("records the read-only 100 slug x EN/ZH career detail latency scan", () => {
    const report = readReport();

    expect(report.task).toBe("CAREER-DETAIL-P95-LATENCY-SCAN-01");
    expect(report.mode).toBe("read_only_production_observation");
    expect(report.sample_slug_count).toBe(100);
    expect(report.sample_page_count).toBe(200);
    expect(report.page_latency_ms.p95).toBeGreaterThan(0);
    expect(report.api_latency_ms.p95).toBeGreaterThan(0);
    expect(report.html_bytes.p95).toBeGreaterThan(0);
    expect(Array.isArray(report.outlier_slug_list)).toBe(true);
    expect(Array.isArray(report.latency_source_classification)).toBe(true);
    expect(report.latency_source_classification.map((item) => item.source)).toEqual(
      expect.arrayContaining([
        "dynamic_html_response_not_edge_cached",
        "multiple_backend_fetches_per_detail_request",
        "serial_bundle_then_seo_authority_fetch",
      ])
    );
  });

  it("keeps URL Truth and safety boundaries intact", () => {
    const report = readReport();

    expect(report.metadata_integrity).toMatchObject({
      all_sampled_pages_200: true,
      all_sampled_api_200: true,
      no_sampled_noindex_drift: true,
      no_sampled_page_not_found: true,
    });
    expect(report.no_mutation_performed).toBe(true);
    expect(report.search_channel_action_performed).toBe(false);
    expect(report.url_submission_performed).toBe(false);
    expect(report.external_search_api_call_performed).toBe(false);
    expect(report.next_fix_recommendation.task).toBe("CAREER-DETAIL-CACHE-BUDGET-REPAIR-01");
    expect(report.final_decision).toBe("career_detail_p95_latency_scan_completed_ready_for_cache_budget_repair");
  });

  it("keeps this PR scoped to report, generated artifact, contract, and train metadata", () => {
    for (const file of [
      "docs/seo/career-detail-p95-latency-scan-01.md",
      "docs/seo/generated/career-detail-p95-latency-scan-01.v1.json",
      "tests/contracts/career-detail-p95-latency-scan-01.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
