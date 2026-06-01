import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isLegacySeoReconciliationScanAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/legacy-seo-reconciliation-scan.v1.json";
const MARKDOWN_PATH = "docs/seo/legacy-seo-reconciliation-scan.md";

type LegacyItemStatus = "covered" | "deferred_by_page_family";

type Report = {
  task?: string;
  final_decision?: string;
  legacy_items?: Record<
    string,
    {
      status?: LegacyItemStatus;
      decision?: string;
      evidence_files?: string[];
      deferred_page_family_work?: string[];
    }
  >;
  no_runtime_change?: boolean;
  no_content_change?: boolean;
  no_deploy?: boolean;
  no_cms_mutation?: boolean;
  no_search_channel_action?: boolean;
  no_url_submission?: boolean;
  no_external_api_call?: boolean;
  no_env_dns_nginx_edit?: boolean;
  no_frontend_fallback_content?: boolean;
  next_task?: string;
};

function readJson(relativePath: string): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Report;
}

describe("LEGACY-SEO-RECONCILIATION-SCAN", () => {
  it("records covered or page-family-deferred decisions for legacy SEO items", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("LEGACY-SEO-RECONCILIATION-SCAN");
    expect(report.final_decision).toBe("legacy_seo_reconciliation_scan_completed_no_broad_legacy_implementation_needed");

    expect(report.legacy_items?.["PR-08-RESULT-PRIVATE-FLOW-ISOLATION"]?.status).toBe("covered");
    expect(report.legacy_items?.["PR-01-NEXT-I18N-ROUTING-CANONICAL-GUARD"]?.status).toBe("covered");
    expect(report.legacy_items?.["PR-07-GEO-SCHEMA-FAQ-EVIDENCE"]?.status).toBe("deferred_by_page_family");

    expect(report.legacy_items?.["PR-08-RESULT-PRIVATE-FLOW-ISOLATION"]?.evidence_files).toEqual(
      expect.arrayContaining([
        "lib/seo/discoverabilityExposurePolicy.ts",
        "tests/contracts/shared-exposure-policy.contract.test.ts",
      ]),
    );
    expect(report.legacy_items?.["PR-01-NEXT-I18N-ROUTING-CANONICAL-GUARD"]?.evidence_files).toContain(
      "lib/seo/metadata.ts",
    );
    expect(report.legacy_items?.["PR-07-GEO-SCHEMA-FAQ-EVIDENCE"]?.deferred_page_family_work).toEqual(
      expect.arrayContaining(["test_detail", "article_detail", "career_job_detail"]),
    );
  });

  it("keeps the reconciliation inside the read-only safety boundary", () => {
    const report = readJson(REPORT_PATH);

    expect(report.no_runtime_change).toBe(true);
    expect(report.no_content_change).toBe(true);
    expect(report.no_deploy).toBe(true);
    expect(report.no_cms_mutation).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.no_external_api_call).toBe(true);
    expect(report.no_env_dns_nginx_edit).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.next_task).toBe("none_legacy_seo_reconciliation_complete");
  });

  it("keeps changed files within the declared report-only scope", () => {
    expect(fs.readFileSync(path.join(ROOT, MARKDOWN_PATH), "utf8")).toContain("PR-07 GEO Schema FAQ Evidence");

    const changedFiles = [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/legacy-seo-reconciliation-scan.v1.json",
      "docs/seo/legacy-seo-reconciliation-scan.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/legacy-seo-reconciliation-scan.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isLegacySeoReconciliationScanAllowedFile(file), file).toBe(true);
    }
  });
});
