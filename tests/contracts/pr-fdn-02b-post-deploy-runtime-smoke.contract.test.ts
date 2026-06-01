import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPrFdn02bPostDeployRuntimeSmokeAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/pr-fdn-02b-post-deploy-runtime-smoke.v1.json";

type RuntimePage = {
  url?: string;
  status?: number;
  canonical?: string;
  robots?: string;
  staging_canonical_detected?: boolean;
};

type Report = {
  task?: string;
  final_decision?: string;
  public_frontend_runtime?: {
    pages?: RuntimePage[];
  };
  public_api_runtime?: {
    records_endpoint?: { status?: number; public_item_count?: number };
    months_endpoint?: { status?: number; public_month_count?: number };
    frontend_fallback_records_used?: boolean;
  };
  discoverability_boundary?: {
    daily_giving_pages_remain_noindex?: boolean;
    sitemap_hit_count?: number;
    llms_hit_count?: number;
    llms_full_hit_count?: number;
    footer_nav_hit_count?: number;
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

describe("PR-FDN-02B-POST-DEPLOY-RUNTIME-SMOKE", () => {
  it("records healthy public Daily Giving frontend and API runtime", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("PR-FDN-02B-POST-DEPLOY-RUNTIME-SMOKE");
    expect(report.final_decision).toBe(
      "pr_fdn_02b_post_deploy_runtime_smoke_completed_ready_for_pr_fdn_seo_readiness"
    );

    const pages = report.public_frontend_runtime?.pages ?? [];
    expect(pages).toHaveLength(4);
    for (const page of pages) {
      expect(page.status).toBe(200);
      expect(page.canonical).toBe(page.url);
      expect(page.robots).toBe("noindex");
      expect(page.staging_canonical_detected).toBe(false);
    }

    expect(report.public_api_runtime?.records_endpoint?.status).toBe(200);
    expect(report.public_api_runtime?.months_endpoint?.status).toBe(200);
    expect(report.public_api_runtime?.frontend_fallback_records_used).toBe(false);
  });

  it("keeps Daily Giving out of discoverability and search-channel surfaces", () => {
    const report = readJson(REPORT_PATH);

    expect(report.discoverability_boundary?.daily_giving_pages_remain_noindex).toBe(true);
    expect(report.discoverability_boundary?.sitemap_hit_count).toBe(0);
    expect(report.discoverability_boundary?.llms_hit_count).toBe(0);
    expect(report.discoverability_boundary?.llms_full_hit_count).toBe(0);
    expect(report.discoverability_boundary?.footer_nav_hit_count).toBe(0);

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
    expect(report.next_task).toBe("PR-FDN-SEO-01-READINESS");
  });

  it("limits this smoke PR to documentation, generated report, focused contract, and train metadata", () => {
    const changedFiles = [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/pr-fdn-02b-post-deploy-runtime-smoke.v1.json",
      "docs/seo/pr-fdn-02b-post-deploy-runtime-smoke.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-02b-post-deploy-runtime-smoke.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isPrFdn02bPostDeployRuntimeSmokeAllowedFile(file), file).toBe(true);
    }
  });
});
