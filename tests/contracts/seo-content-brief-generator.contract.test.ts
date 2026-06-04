import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/seo-content-brief-generator-contract.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/seo-content-brief-generator.v1.json");

type BriefContract = {
  version: string;
  scope: string;
  status: string;
  run_mode: string;
  live_data_collected: boolean;
  network_access_enabled: boolean;
  authority_boundary: Record<string, string | boolean>;
  allowed_inputs: Array<{ source: string; artifact: string; authority_rule: string }>;
  brief_record_schema: {
    required: string[];
    forbidden: string[];
    allowed_intents: string[];
    allowed_target_page_families: string[];
  };
  manual_serp_sample_policy: {
    allowed_fields: string[];
    forbidden_fields: string[];
    live_serp_api_allowed: boolean;
    scraping_allowed: boolean;
    network_access_allowed: boolean;
  };
  output_policy: Record<string, string | boolean>;
  risk_flags: string[];
  sample_briefs: Array<Record<string, unknown>>;
  risk_boundary: Record<string, boolean>;
  deferred_work: string[];
  recommended_follow_up: string;
};

function readArtifact(): BriefContract {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as BriefContract;
}

function readDoc(): string {
  return fs.readFileSync(DOC_PATH, "utf8");
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI checkout shapes differ; use whichever diff source is available.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return (
    [
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "docs/seo/seo-content-brief-generator-contract.md",
      "docs/seo/generated/seo-content-brief-generator.v1.json",
      "tests/contracts/seo-content-brief-generator.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ].includes(file) || isCurrentRiasecPack12AllowedFile(file)
  );
}

describe("SEO content brief generator contract", () => {
  it("declares a contract-only offline sample scope", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("seo_content_brief_generator.v1");
    expect(artifact.scope).toBe("SEO-BRIEF-00");
    expect(artifact.status).toBe("contract_design");
    expect(artifact.run_mode).toBe("contract_sample");
    expect(artifact.live_data_collected).toBe(false);
    expect(artifact.network_access_enabled).toBe(false);
  });

  it("keeps CMS, URL truth, search, and article copy authority outside the brief artifact", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(artifact.authority_boundary.brief_is_advisory_only).toBe(true);
    expect(artifact.authority_boundary.cms_content_authority).toBe("fap_api_cms_backend");
    expect(artifact.authority_boundary.may_create_cms_draft).toBe(false);
    expect(artifact.authority_boundary.may_mutate_cms).toBe(false);
    expect(artifact.authority_boundary.may_publish).toBe(false);
    expect(artifact.authority_boundary.may_submit_search_urls).toBe(false);
    expect(artifact.authority_boundary.may_generate_publishable_article_copy).toBe(false);
    expect(artifact.authority_boundary.may_call_live_serp_api).toBe(false);
    expect(doc).toContain("It is not:");
    expect(doc).toContain("a final article title, H1, FAQ, CTA, or body generator");
  });

  it("accepts only sanitized existing artifacts and mock or manual samples as inputs", () => {
    const artifact = readArtifact();
    const sources = artifact.allowed_inputs.map((input) => input.source);

    expect(sources).toEqual([
      "url_truth",
      "competitor_url_inventory",
      "seo_issue_queue",
      "internal_link_graph",
      "cms_status_sample",
      "manual_serp_sample",
    ]);
    expect(artifact.allowed_inputs.find((input) => input.source === "manual_serp_sample")?.authority_rule).toContain(
      "no live provider calls"
    );
    expect(artifact.allowed_inputs.find((input) => input.source === "competitor_url_inventory")?.authority_rule).toContain(
      "may not create CMS drafts"
    );
  });

  it("defines brief fields while forbidding publishable copy, CMS payloads, raw SERP data, and secrets", () => {
    const artifact = readArtifact();

    expect(artifact.brief_record_schema.required).toEqual(
      expect.arrayContaining([
        "brief_id",
        "target_keyword",
        "locale",
        "intent",
        "target_page_family",
        "table_stakes",
        "value_add_opportunities",
        "internal_link_suggestions",
        "schema_hints",
        "risk_flags",
        "editorial_review_required",
        "sample_only",
      ])
    );
    expect(artifact.brief_record_schema.forbidden).toEqual(
      expect.arrayContaining([
        "article_body",
        "final_article_title",
        "final_h1",
        "faq_copy",
        "cta_copy",
        "cms_draft_payload",
        "publish_action",
        "search_submit_url",
        "raw_cookie",
        "raw_serp_html",
        "copied_competitor_body",
      ])
    );
    expect(artifact.output_policy.markdown_may_include_outline).toBe(true);
    expect(artifact.output_policy.markdown_may_include_publishable_body).toBe(false);
    expect(artifact.output_policy.final_article_copy_allowed).toBe(false);
    expect(artifact.output_policy.cms_import_payload_allowed).toBe(false);
  });

  it("locks manual SERP samples to sanitized non-network observations", () => {
    const artifact = readArtifact();

    expect(artifact.manual_serp_sample_policy.allowed_fields).toEqual(
      expect.arrayContaining(["rank", "result_domain", "normalized_result_path", "observed_heading_theme"])
    );
    expect(artifact.manual_serp_sample_policy.forbidden_fields).toEqual(
      expect.arrayContaining(["raw_cookie", "raw_header", "account_specific_url", "copied_article_body"])
    );
    expect(artifact.manual_serp_sample_policy.live_serp_api_allowed).toBe(false);
    expect(artifact.manual_serp_sample_policy.scraping_allowed).toBe(false);
    expect(artifact.manual_serp_sample_policy.network_access_allowed).toBe(false);
  });

  it("requires safety, CMS authority, and locale parity risk flags", () => {
    const artifact = readArtifact();

    expect(artifact.risk_flags).toEqual(
      expect.arrayContaining([
        "claim_safety_review",
        "psychology_or_assessment_boundary",
        "medical_or_clinical_boundary",
        "pii_or_consent_boundary",
        "cms_authority_required",
        "locale_parity_required",
      ])
    );
    expect(artifact.sample_briefs.every((brief) => brief.sample_only === true)).toBe(true);
    expect(artifact.sample_briefs.every((brief) => brief.editorial_review_required === true)).toBe(true);
    expect(artifact.sample_briefs.every((brief) => Array.isArray(brief.table_stakes))).toBe(true);
    expect(artifact.sample_briefs.every((brief) => Array.isArray(brief.value_add_opportunities))).toBe(true);
  });

  it("forbids runtime, CMS, search, API, deploy, and final article side effects", () => {
    const artifact = readArtifact();

    expect(artifact.risk_boundary.read_only).toBe(true);
    expect(artifact.risk_boundary.sample_only).toBe(true);
    expect(artifact.risk_boundary.cms_writes).toBe(false);
    expect(artifact.risk_boundary.cms_draft_creation).toBe(false);
    expect(artifact.risk_boundary.publish_actions).toBe(false);
    expect(artifact.risk_boundary.search_submission).toBe(false);
    expect(artifact.risk_boundary.sitemap_mutation).toBe(false);
    expect(artifact.risk_boundary.llms_mutation).toBe(false);
    expect(artifact.risk_boundary.live_serp_api).toBe(false);
    expect(artifact.risk_boundary.scraping).toBe(false);
    expect(artifact.risk_boundary.dataforseo_integration).toBe(false);
    expect(artifact.risk_boundary.apify_integration).toBe(false);
    expect(artifact.risk_boundary.production_deploy).toBe(false);
    expect(artifact.risk_boundary.final_article_body_generation).toBe(false);
  });

  it("points the next step to SEO-BRIEF-01 without implementing a generator in this PR", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(artifact.deferred_work).toEqual(expect.arrayContaining(["SEO-BRIEF-01 read-only offline generator"]));
    expect(artifact.recommended_follow_up).toContain("SEO-BRIEF-01");
    expect(doc).toContain("After this contract is merged, `SEO-BRIEF-01` may add a read-only offline");
  });

  it("keeps current PR scope limited to the SEO brief contract and metadata", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"]));
    expect(files.every(isAllowedFile), files.join("\n")).toBe(true);
  });
});
