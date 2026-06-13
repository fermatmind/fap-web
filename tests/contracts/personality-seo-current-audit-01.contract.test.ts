import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPersonalitySeoCurrentAudit01AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/personality-seo-current-audit-01.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/personality-seo-current-audit-01.v1.json");

type AuditArtifact = {
  version: string;
  pr_id: string;
  status: string;
  authority_boundary: Record<string, boolean>;
  target_surface: {
    hub_urls: string[];
    detail_url_count: number;
    expected_detail_locales: string[];
    expected_base_types: string[];
    expected_variants_per_base: string[];
  };
  coverage_summary: {
    urls_scanned: number;
    ok_200: number;
    hub_pages: number;
    detail_pages: number;
    scan_errors: number;
  };
  discoverability_summary: {
    sitemap: { status: number; loc_count: number; sample_at_urls_present: boolean };
    llms_txt: { status: number; sample_at_urls_present: boolean };
    llms_full_txt: { status: number; sample_at_urls_present: boolean };
  };
  hub_summary: Array<{
    url: string;
    item_list_json_ld_present: boolean;
    personality_image_count: number;
    mentions_32: number;
    mentions_16: number;
  }>;
  detail_summary: {
    detail_pages_scanned: number;
    json_ld_types_present: string[];
    faq_page_json_ld_missing: number;
    personality_image_missing: number;
    at_difference_marker_missing: number;
    duplicate_what_type_heading: number;
    min_main_text_length: number;
  };
  hard_gaps: Array<{
    id: string;
    severity: string;
    url: string;
    evidence: Record<string, unknown>;
    recommended_pr: string;
    blocks: string[];
  }>;
  at_similarity_findings: {
    method: string;
    english_pairs_show_template_risk: boolean;
    top_similar_pairs: Array<{ locale: string; base_type: string; similarity: number }>;
  };
  issue_matrix: Array<{ issue_type: string; affected_pages: number; severity: string; recommended_pr: string }>;
  planned_pr_sequence: string[];
  repository_rule_impact: Record<string, boolean>;
  deferred_items: string[];
};

function readArtifact(): AuditArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as AuditArtifact;
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
      // Local and CI checkout shapes differ; use whichever scoped source is available.
    }
  }
  return [...files].sort();
}

describe("PERSONALITY-SEO-CURRENT-AUDIT-01", () => {
  it("freezes the audited personality SEO surface without changing authority", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("personality_seo_current_audit.v1");
    expect(artifact.pr_id).toBe("PERSONALITY-SEO-CURRENT-AUDIT-01");
    expect(artifact.status).toBe("audit_snapshot");

    expect(artifact.authority_boundary.audit_only).toBe(true);
    expect(artifact.authority_boundary.runtime_behavior_changed).toBe(false);
    expect(artifact.authority_boundary.frontend_editorial_content_added).toBe(false);
    expect(artifact.authority_boundary.cms_mutation_performed).toBe(false);
    expect(artifact.authority_boundary.backend_is_personality_content_authority).toBe(true);
    expect(artifact.authority_boundary.frontend_must_not_infer_personality_content).toBe(true);
  });

  it("records the expected 2 hub and 64 detail URL baseline", () => {
    const artifact = readArtifact();

    expect(artifact.target_surface.hub_urls).toEqual([
      "https://fermatmind.com/zh/personality",
      "https://fermatmind.com/en/personality",
    ]);
    expect(artifact.target_surface.detail_url_count).toBe(64);
    expect(artifact.target_surface.expected_detail_locales).toEqual(["zh", "en"]);
    expect(artifact.target_surface.expected_base_types).toHaveLength(16);
    expect(artifact.target_surface.expected_variants_per_base).toEqual(["a", "t"]);

    expect(artifact.coverage_summary.urls_scanned).toBe(66);
    expect(artifact.coverage_summary.ok_200).toBe(66);
    expect(artifact.coverage_summary.hub_pages).toBe(2);
    expect(artifact.coverage_summary.detail_pages).toBe(64);
    expect(artifact.coverage_summary.scan_errors).toBe(0);
  });

  it("documents sitemap and llms inclusion while preserving the follow-up gaps", () => {
    const artifact = readArtifact();

    expect(artifact.discoverability_summary.sitemap.status).toBe(200);
    expect(artifact.discoverability_summary.sitemap.loc_count).toBeGreaterThan(2000);
    expect(artifact.discoverability_summary.sitemap.sample_at_urls_present).toBe(true);
    expect(artifact.discoverability_summary.llms_txt.sample_at_urls_present).toBe(true);
    expect(artifact.discoverability_summary.llms_full_txt.sample_at_urls_present).toBe(true);

    for (const hub of artifact.hub_summary) {
      expect(hub.item_list_json_ld_present).toBe(true);
      expect(hub.personality_image_count).toBe(0);
      expect(hub.mentions_32).toBeGreaterThanOrEqual(1);
      expect(hub.mentions_16).toBe(0);
    }

    expect(artifact.detail_summary.detail_pages_scanned).toBe(64);
    expect(artifact.detail_summary.json_ld_types_present).toEqual(
      expect.arrayContaining(["AboutPage", "WebPage", "BreadcrumbList"])
    );
    expect(artifact.detail_summary.faq_page_json_ld_missing).toBe(64);
    expect(artifact.detail_summary.personality_image_missing).toBe(64);
    expect(artifact.detail_summary.at_difference_marker_missing).toBe(0);
    expect(artifact.detail_summary.duplicate_what_type_heading).toBe(63);
  });

  it("keeps zh ENTJ-T content coverage as a blocker for the next backend PR", () => {
    const artifact = readArtifact();
    const gap = artifact.hard_gaps.find((item) => item.id === "zh_entj_t_missing_body");

    expect(gap).toBeDefined();
    expect(gap?.severity).toBe("high");
    expect(gap?.url).toBe("https://fermatmind.com/zh/personality/entj-t");
    expect(gap?.evidence.visible_heading).toBe("内容暂未同步");
    expect(gap?.recommended_pr).toBe("PERSONALITY-DETAIL-CONTENT-COVERAGE-01");
    expect(gap?.blocks).toEqual(
      expect.arrayContaining([
        "PERSONALITY-AT-DIFFERENCE-SECTIONS-01",
        "PERSONALITY-DETAIL-FAQ-SEO-01",
        "PERSONALITY-SEO-TITLE-METADATA-01",
      ])
    );
  });

  it("records A/T duplicate risk and the ordered follow-up train", () => {
    const artifact = readArtifact();

    expect(artifact.at_similarity_findings.method).toBe(
      "8_character_shingle_jaccard_after_nav_footer_script_style_removal"
    );
    expect(artifact.at_similarity_findings.english_pairs_show_template_risk).toBe(true);
    expect(artifact.at_similarity_findings.top_similar_pairs[0].similarity).toBeGreaterThanOrEqual(0.65);

    expect(artifact.issue_matrix.map((issue) => issue.issue_type)).toEqual(
      expect.arrayContaining([
        "missing_visible_personality_image",
        "missing_faq_semantic_surface",
        "duplicate_section_heading",
        "at_variant_similarity_risk",
        "metadata_template_risk",
        "missing_at_comparison_long_tail_pages",
      ])
    );
    expect(artifact.planned_pr_sequence).toEqual([
      "PERSONALITY-SEO-CURRENT-AUDIT-01",
      "PERSONALITY-DETAIL-CONTENT-COVERAGE-01",
      "PERSONALITY-HUB-MEDIA-RENDER-VERIFY-01",
      "PERSONALITY-AT-DIFFERENCE-SECTIONS-01",
      "PERSONALITY-DETAIL-FAQ-SEO-01",
      "PERSONALITY-SEO-TITLE-METADATA-01",
      "PERSONALITY-COMPARISON-PAGES-01",
    ]);
  });

  it("documents repository rule impact and intentionally deferred work", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(artifact.repository_rule_impact.content_authority_changed).toBe(false);
    expect(artifact.repository_rule_impact.sitemap_or_llms_enumeration_changed).toBe(false);
    expect(artifact.repository_rule_impact.frontend_fallback_behavior_changed).toBe(false);
    expect(artifact.repository_rule_impact.rules_update_required).toBe(false);
    expect(artifact.deferred_items).toHaveLength(6);

    expect(doc).toContain("This document freezes the current FermatMind personality SEO baseline");
    expect(doc).toContain("No runtime behavior change.");
    expect(doc).toContain("No frontend editorial fallback content.");
    expect(doc).toContain("PERSONALITY-DETAIL-CONTENT-COVERAGE-01");
  });

  it("keeps the current PR scoped to audit docs, generated artifact, contract, and train metadata", () => {
    const files = changedFiles();
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      expect(isPersonalitySeoCurrentAudit01AllowedFile(file), file).toBe(true);
    }
  });
});
