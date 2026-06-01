import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPrFdnSocialLinkDisplayReview01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/pr-fdn-social-link-display-review-01.v1.json";

type SocialLinkDisplayReviewReport = {
  task?: string;
  final_decision?: string;
  frontend_adapter_state?: {
    parses_existing_social_url_fields?: boolean;
    missing_backend_fields?: string[];
  };
  display_component_state?: {
    renders_social_links?: boolean;
  };
  recommended_next_scope?: {
    task?: string;
    no_frontend_fallback_content?: boolean;
    no_external_social_api_call?: boolean;
    no_automatic_posting?: boolean;
  };
  no_runtime_code_change?: boolean;
  no_frontend_fallback_content?: boolean;
  no_cms_mutation?: boolean;
  no_deploy?: boolean;
  no_search_channel_action?: boolean;
  no_url_submission?: boolean;
  no_external_api_call?: boolean;
  no_credentials_handled?: boolean;
  no_automatic_posting?: boolean;
  next_task?: string;
};

function readJson(relativePath: string): SocialLinkDisplayReviewReport {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as SocialLinkDisplayReviewReport;
}

describe("PR-FDN-SOCIAL-LINK-DISPLAY-REVIEW-01", () => {
  it("records the current Daily Giving manual social link display gap", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("PR-FDN-SOCIAL-LINK-DISPLAY-REVIEW-01");
    expect(report.final_decision).toBe("pr_fdn_social_link_display_review_completed_with_display_gap");
    expect(report.frontend_adapter_state?.parses_existing_social_url_fields).toBe(false);
    expect(report.frontend_adapter_state?.missing_backend_fields).toEqual([
      "social_x_url",
      "social_linkedin_url",
      "social_weibo_url",
      "social_xiaohongshu_url",
      "social_other_links",
    ]);
    expect(report.display_component_state?.renders_social_links).toBe(false);
    expect(report.next_task).toBe("PR-FDN-SOCIAL-LINK-DISPLAY-IMPLEMENTATION-01");
  });

  it("keeps the review read-only and free of automatic posting scope", () => {
    const report = readJson(REPORT_PATH);

    expect(report.no_runtime_code_change).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.no_cms_mutation).toBe(true);
    expect(report.no_deploy).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.no_external_api_call).toBe(true);
    expect(report.no_credentials_handled).toBe(true);
    expect(report.no_automatic_posting).toBe(true);
    expect(report.recommended_next_scope?.task).toBe("PR-FDN-SOCIAL-LINK-DISPLAY-IMPLEMENTATION-01");
    expect(report.recommended_next_scope?.no_frontend_fallback_content).toBe(true);
    expect(report.recommended_next_scope?.no_external_social_api_call).toBe(true);
    expect(report.recommended_next_scope?.no_automatic_posting).toBe(true);
  });

  it("limits this review PR to approved documentation, ledger, and contract files", () => {
    const changedFiles = [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/generated/pr-fdn-social-link-display-review-01.v1.json",
      "docs/seo/pr-fdn-social-link-display-review-01.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/pr-fdn-social-link-display-review-01.contract.test.ts",
    ];

    for (const file of changedFiles) {
      expect(isPrFdnSocialLinkDisplayReview01AllowedFile(file), file).toBe(true);
    }
  });
});
