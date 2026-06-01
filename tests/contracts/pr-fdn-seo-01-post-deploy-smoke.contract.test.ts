import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPrFdnSeo01PostDeploySmokeAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/pr-fdn-seo-01-post-deploy-smoke.v1.json";

type Report = {
  task?: string;
  final_decision?: string;
  public_frontend_runtime?: {
    pages?: Array<{
      url?: string;
      status?: number;
      canonical?: string;
      robots?: string;
      staging_canonical_detected?: boolean;
      json_ld_types?: string[];
      item_list_json_ld_present?: boolean;
    }>;
  };
  public_api_runtime?: {
    backend_authority_available?: boolean;
    frontend_fallback_records_used?: boolean;
  };
  discoverability_gating?: {
    empty_public_ledger_detected?: boolean;
    daily_giving_pages_remain_noindex?: boolean;
    item_list_gated_off_without_public_records?: boolean;
    llms_exposure_gated_off_without_public_months?: boolean;
    sitemap_hit_count?: number;
    llms_hit_count?: number;
    llms_full_hit_count?: number;
    staging_host_leak_detected?: boolean;
  };
  search_channel_safety?: {
    search_channel_action_performed?: boolean;
    url_submission_performed?: boolean;
    external_search_api_call_performed?: boolean;
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

describe("PR-FDN-SEO-01-POST-DEPLOY-SMOKE", () => {
  it("records guarded Daily Giving SEO runtime after deploy", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("PR-FDN-SEO-01-POST-DEPLOY-SMOKE");
    expect(report.final_decision).toBe("pr_fdn_seo_01_post_deploy_smoke_completed_with_guarded_empty_ledger_state");

    const pages = report.public_frontend_runtime?.pages ?? [];
    expect(pages).toHaveLength(2);
    for (const page of pages) {
      expect(page.status).toBe(200);
      expect(page.canonical).toBe(page.url);
      expect(page.robots).toContain("noindex");
      expect(page.staging_canonical_detected).toBe(false);
      expect(page.json_ld_types).toEqual(["WebPage", "BreadcrumbList"]);
      expect(page.item_list_json_ld_present).toBe(false);
    }
  });

  it("keeps empty-ledger discoverability gated off without frontend fallback content", () => {
    const report = readJson(REPORT_PATH);

    expect(report.public_api_runtime?.backend_authority_available).toBe(true);
    expect(report.public_api_runtime?.frontend_fallback_records_used).toBe(false);
    expect(report.discoverability_gating?.empty_public_ledger_detected).toBe(true);
    expect(report.discoverability_gating?.daily_giving_pages_remain_noindex).toBe(true);
    expect(report.discoverability_gating?.item_list_gated_off_without_public_records).toBe(true);
    expect(report.discoverability_gating?.llms_exposure_gated_off_without_public_months).toBe(true);
    expect(report.discoverability_gating?.sitemap_hit_count).toBe(0);
    expect(report.discoverability_gating?.llms_hit_count).toBe(0);
    expect(report.discoverability_gating?.llms_full_hit_count).toBe(0);
    expect(report.discoverability_gating?.staging_host_leak_detected).toBe(false);
  });

  it("keeps smoke task inside the read-only safety boundary and declared scope", () => {
    const report = readJson(REPORT_PATH);

    expect(report.search_channel_safety?.search_channel_action_performed).toBe(false);
    expect(report.search_channel_safety?.url_submission_performed).toBe(false);
    expect(report.search_channel_safety?.external_search_api_call_performed).toBe(false);
    expect(report.no_runtime_code_change).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.no_cms_mutation).toBe(true);
    expect(report.no_deploy).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.no_external_api_call).toBe(true);
    expect(report.next_task).toBe("OPS-API-PUBLIC-TLS-PATH-FIX-01B-API-DOMAIN-SNI-EDGE-FIX");

    const changedFiles = [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/pr-fdn-seo-01-post-deploy-smoke.v1.json",
      "docs/seo/pr-fdn-seo-01-post-deploy-smoke.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-seo-01-post-deploy-smoke.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isPrFdnSeo01PostDeploySmokeAllowedFile(file), file).toBe(true);
    }
  });
});
