import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/competitor-url-inventory-tracker.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/competitor-url-inventory-tracker.v1.json");

type Artifact = {
  version: string;
  run_mode: string;
  live_data_collected: boolean;
  competitors: Array<{ domain: string }>;
  taxonomy: Record<string, unknown>;
  discovery_policy: Record<string, unknown> & { order: string[] };
  normalization_policy: Record<string, unknown>;
  records_sample: Array<Record<string, unknown>>;
  fermatmind_alignment: Record<string, unknown> & { opportunity_types: string[] };
  output_schema: {
    json_top_level_fields: string[];
    csv_fields: string[];
    article_title_field_allowed: boolean;
    h1_field_allowed: boolean;
    faq_field_allowed: boolean;
    cta_copy_field_allowed: boolean;
  };
  risk_boundary: Record<string, boolean>;
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
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
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI checkout shapes differ; use any available scoped diff source.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/seo/competitor-url-inventory-tracker.md",
    "docs/seo/generated/competitor-url-inventory-tracker.v1.json",
    "tests/contracts/competitor-url-inventory-tracker.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("Competitor URL inventory tracker contract", () => {
  it("parses generated JSON and declares contract-sample mode without live data", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("competitor_url_inventory_tracker.v1");
    expect(artifact.run_mode).toBe("contract_sample");
    expect(artifact.live_data_collected).toBe(false);
  });

  it("contains the fixed first-version competitor domains", () => {
    const artifact = readArtifact();
    const domains = artifact.competitors.map((competitor) => competitor.domain).sort();

    expect(domains).toEqual([
      "123test.com",
      "16personalities.com",
      "brain-testing.org",
      "careerexplorer.com",
      "enneagraminstitute.com",
      "iqtest.club",
      "iqtest.com",
      "personalitymax.com",
      "truity.com",
      "verywellmind.com",
    ]);
  });

  it("defines the required URL family taxonomy", () => {
    const artifact = readArtifact();

    expect(Object.keys(artifact.taxonomy).sort()).toEqual([
      "article",
      "career_guide",
      "career_job",
      "support",
      "test_detail",
      "tool",
      "topic",
      "unknown",
    ]);
  });

  it("defines fail-closed sitemap discovery without crawler behavior", () => {
    const artifact = readArtifact();

    expect(artifact.discovery_policy.order).toEqual([
      "explicit_configured_sitemap_url",
      "robots_txt_sitemap_directive",
      "standard_sitemap_xml",
      "sitemap_index_expansion",
      "gzip_sitemap_parsing",
      "fail_closed_unavailable",
    ]);
    expect(artifact.discovery_policy.explicit_sitemap_supported).toBe(true);
    expect(artifact.discovery_policy.robots_sitemap_supported).toBe(true);
    expect(artifact.discovery_policy.standard_sitemap_xml_supported).toBe(true);
    expect(artifact.discovery_policy.sitemap_index_supported).toBe(true);
    expect(artifact.discovery_policy.gzip_sitemap_supported).toBe(true);
    expect(artifact.discovery_policy.fail_closed_if_unavailable).toBe(true);
    expect(artifact.discovery_policy.full_site_crawler_allowed).toBe(false);
  });

  it("locks URL normalization to strip noisy URL parts and stay same-domain only", () => {
    const artifact = readArtifact();

    expect(artifact.normalization_policy.strip_query).toBe(true);
    expect(artifact.normalization_policy.strip_hash).toBe(true);
    expect(artifact.normalization_policy.strip_tracking_params).toBe(true);
    expect(artifact.normalization_policy.same_domain_only).toBe(true);
    expect(artifact.normalization_policy.reject_cross_domain_urls).toBe(true);
    expect(artifact.normalization_policy.store_raw_url_separately).toBe(true);
    expect(artifact.normalization_policy.store_normalized_url_separately).toBe(true);
  });

  it("keeps competitor inventory read-only relative to FermatMind URL truth", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(artifact.fermatmind_alignment.competitor_inventory_is_fermatmind_sitemap_truth).toBe(false);
    expect(artifact.fermatmind_alignment.may_modify_fermatmind_url_truth).toBe(false);
    expect(artifact.fermatmind_alignment.may_modify_sitemap).toBe(false);
    expect(artifact.fermatmind_alignment.may_modify_llms).toBe(false);
    expect(artifact.fermatmind_alignment.may_create_cms_content).toBe(false);
    expect(artifact.fermatmind_alignment.may_publish).toBe(false);
    expect(artifact.fermatmind_alignment.may_search_submit).toBe(false);
    expect(doc).toContain("It is not:");
    expect(doc).toContain("FermatMind sitemap truth");
  });

  it("defines advisory opportunity types only", () => {
    const artifact = readArtifact();

    expect(artifact.fermatmind_alignment.opportunity_types).toEqual(
      expect.arrayContaining([
        "missing_test_family",
        "missing_career_cluster",
        "missing_article_topic",
        "missing_support_page",
        "thin_internal_coverage",
        "hreflang_gap",
        "locale_gap",
        "internal_link_gap",
        "schema_gap",
        "unknown",
      ])
    );
  });

  it("marks every sample record as sample-only and not as crawl evidence", () => {
    const artifact = readArtifact();

    expect(artifact.records_sample.length).toBeGreaterThan(0);
    expect(artifact.records_sample.every((record) => record.sample_only === true)).toBe(true);
    expect(artifact.records_sample.every((record) => record.status === "sample_only")).toBe(true);
    expect(artifact.records_sample.every((record) => record.sitemap_source === "contract_sample")).toBe(true);
  });

  it("forbids risky runtime, CMS, publish, search, sitemap, and content side effects", () => {
    const artifact = readArtifact();

    expect(artifact.risk_boundary.cms_writes).toBe(false);
    expect(artifact.risk_boundary.cms_draft_creation).toBe(false);
    expect(artifact.risk_boundary.publish_actions).toBe(false);
    expect(artifact.risk_boundary.search_submission).toBe(false);
    expect(artifact.risk_boundary.sitemap_mutation).toBe(false);
    expect(artifact.risk_boundary.auto_content_generation).toBe(false);
    expect(artifact.risk_boundary.runtime_changes).toBe(false);
    expect(artifact.risk_boundary.production_deploy).toBe(false);
    expect(artifact.risk_boundary.gsc_integration).toBe(false);
    expect(artifact.risk_boundary.baidu_integration).toBe(false);
    expect(artifact.risk_boundary.ga4_integration).toBe(false);
    expect(artifact.risk_boundary.dataforseo_integration).toBe(false);
    expect(artifact.risk_boundary.apify_integration).toBe(false);
  });

  it("does not recommend private target route families", () => {
    const artifact = readArtifact();
    const privateFragments = ["result", "orders", "share", "pay", "payment", "history", "token"];

    for (const record of artifact.records_sample) {
      const target = String(record.target_route_family ?? "");
      for (const fragment of privateFragments) {
        expect(target.includes(fragment)).toBe(false);
      }
    }
  });

  it("does not define fields for generated article titles, H1s, FAQs, or CTA copy", () => {
    const artifact = readArtifact();
    const forbiddenFields = ["article_title", "h1", "faq", "cta_copy"];
    const fields = [
      ...artifact.output_schema.json_top_level_fields,
      ...artifact.output_schema.csv_fields,
      ...Object.keys(artifact.records_sample[0] ?? {}),
    ];

    expect(artifact.output_schema.article_title_field_allowed).toBe(false);
    expect(artifact.output_schema.h1_field_allowed).toBe(false);
    expect(artifact.output_schema.faq_field_allowed).toBe(false);
    expect(artifact.output_schema.cta_copy_field_allowed).toBe(false);
    for (const field of forbiddenFields) {
      expect(fields).not.toContain(field);
    }
  });

  it("keeps the current PR file scope bounded", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    expect(files).toContain("docs/codex/pr-train.yaml");
    expect(files).toContain("docs/codex/pr-train-state.json");
    expect(files.every(isAllowedFile)).toBe(true);
  });
});
