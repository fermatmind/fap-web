import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPrFdnSeo01ReadinessAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/pr-fdn-seo-01-readiness.v1.json";

type Report = {
  task?: string;
  final_decision?: string;
  runtime_state?: {
    pages?: Array<{ status?: number; canonical?: string; url?: string; robots?: string; json_ld_count?: number }>;
  };
  api_state?: {
    records_endpoint?: { status?: number; public_record_count?: number };
    months_endpoint?: { status?: number; public_month_count?: number };
    backend_authority_available?: boolean;
    frontend_fallback_authority_used?: boolean;
  };
  current_seo_state?: {
    daily_giving_pages_noindex?: boolean;
    daily_giving_json_ld_present?: boolean;
    sitemap_hit_count?: number;
    llms_hit_count?: number;
    llms_full_hit_count?: number;
    search_channel_action_detected?: boolean;
  };
  recommended_implementation?: {
    task?: string;
    item_list_requires_public_records?: boolean;
    no_frontend_fallback_records?: boolean;
  };
  no_runtime_code_change?: boolean;
  no_frontend_fallback_content?: boolean;
  no_cms_mutation?: boolean;
  no_deploy?: boolean;
  no_search_channel_action?: boolean;
  no_url_submission?: boolean;
  no_external_api_call?: boolean;
  next_task?: string;
};

function readJson(relativePath: string): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Report;
}

describe("PR-FDN-SEO-01-READINESS", () => {
  it("records guarded Foundation Daily Giving SEO readiness", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("PR-FDN-SEO-01-READINESS");
    expect(report.final_decision).toBe("pr_fdn_seo_01_readiness_completed_ready_for_guarded_implementation");

    const pages = report.runtime_state?.pages ?? [];
    expect(pages).toHaveLength(4);
    for (const page of pages) {
      expect(page.status).toBe(200);
      expect(page.canonical).toBe(page.url);
      expect(page.robots).toContain("noindex");
      expect(page.json_ld_count).toBe(0);
    }

    expect(report.api_state?.records_endpoint?.status).toBe(200);
    expect(report.api_state?.months_endpoint?.status).toBe(200);
    expect(report.api_state?.backend_authority_available).toBe(true);
    expect(report.api_state?.frontend_fallback_authority_used).toBe(false);
  });

  it("keeps implementation gated by backend public records and out of current mutation scope", () => {
    const report = readJson(REPORT_PATH);

    expect(report.current_seo_state?.daily_giving_pages_noindex).toBe(true);
    expect(report.current_seo_state?.daily_giving_json_ld_present).toBe(false);
    expect(report.current_seo_state?.sitemap_hit_count).toBe(0);
    expect(report.current_seo_state?.llms_hit_count).toBe(0);
    expect(report.current_seo_state?.llms_full_hit_count).toBe(0);
    expect(report.current_seo_state?.search_channel_action_detected).toBe(false);

    expect(report.recommended_implementation?.task).toBe("PR-FDN-SEO-01-IMPLEMENTATION");
    expect(report.recommended_implementation?.item_list_requires_public_records).toBe(true);
    expect(report.recommended_implementation?.no_frontend_fallback_records).toBe(true);

    expect(report.no_runtime_code_change).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.no_cms_mutation).toBe(true);
    expect(report.no_deploy).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.no_external_api_call).toBe(true);
    expect(report.next_task).toBe("PR-FDN-SEO-01-IMPLEMENTATION");
  });

  it("limits this readiness PR to documentation, generated report, focused contract, and train metadata", () => {
    const changedFiles = [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/pr-fdn-seo-01-readiness.v1.json",
      "docs/seo/pr-fdn-seo-01-readiness.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-seo-01-readiness.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isPrFdnSeo01ReadinessAllowedFile(file), file).toBe(true);
    }
  });
});
