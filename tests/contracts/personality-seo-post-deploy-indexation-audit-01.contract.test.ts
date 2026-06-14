import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DOC_PATH = path.join(ROOT, "docs/seo/personality-seo-post-deploy-indexation-audit-01.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/personality-seo-post-deploy-indexation-audit-01.v1.json");

type AuditArtifact = {
  version: string;
  pr_id: string;
  status: string;
  authority_boundary: Record<string, boolean>;
  target_surface: {
    hub_urls: string[];
    detail_url_count: number;
    comparison_url_count: number;
    total_public_urls_scanned: number;
    expected_base_types: string[];
  };
  public_http_summary: {
    urls_scanned: number;
    ok_200: number;
    non_200: unknown[];
    scan_errors: number;
  };
  indexability_summary: {
    canonical_missing: number;
    hreflang_missing: number;
    robots_noindex_count: number;
  };
  discoverability_summary: {
    sitemap_xml: { status: number; detail_urls_present: number; comparison_urls_present: number };
    llms_txt: { status: number; detail_urls_present: number; comparison_urls_present: number };
    llms_full_txt: {
      status: number;
      detail_urls_present: number;
      comparison_urls_present: number;
      status_label: string;
      blocking_pr_url: string;
    };
  };
  structured_data_summary: {
    faq_page_jsonld_missing: number;
    comparison_collection_page_jsonld_present: boolean;
  };
  gsc_sampling: {
    status: string;
    required_sample_size: number;
    sample_urls: string[];
  };
  findings: Array<{ id: string; severity: string; status: string }>;
  repository_rule_impact: Record<string, boolean>;
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
      // Local and CI checkout shapes differ; use whichever diff source is available.
    }
  }
  return [...files].sort();
}

describe("PERSONALITY-SEO-POST-DEPLOY-INDEXATION-AUDIT-01", () => {
  it("freezes an audit-only post-deploy personality SEO baseline", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("personality_seo_post_deploy_indexation_audit.v1");
    expect(artifact.pr_id).toBe("PERSONALITY-SEO-POST-DEPLOY-INDEXATION-AUDIT-01");
    expect(artifact.status).toBe("audit_snapshot");
    expect(artifact.authority_boundary.audit_only).toBe(true);
    expect(artifact.authority_boundary.runtime_behavior_changed).toBe(false);
    expect(artifact.authority_boundary.frontend_editorial_content_added).toBe(false);
    expect(artifact.authority_boundary.cms_mutation_performed).toBe(false);
    expect(artifact.authority_boundary.backend_is_personality_content_authority).toBe(true);
  });

  it("covers the 2 hub, 64 detail, and 32 comparison URL surface", () => {
    const artifact = readArtifact();

    expect(artifact.target_surface.hub_urls).toEqual([
      "https://fermatmind.com/zh/personality",
      "https://fermatmind.com/en/personality",
    ]);
    expect(artifact.target_surface.expected_base_types).toHaveLength(16);
    expect(artifact.target_surface.detail_url_count).toBe(64);
    expect(artifact.target_surface.comparison_url_count).toBe(32);
    expect(artifact.target_surface.total_public_urls_scanned).toBe(98);
    expect(artifact.public_http_summary.urls_scanned).toBe(98);
    expect(artifact.public_http_summary.ok_200).toBe(98);
    expect(artifact.public_http_summary.non_200).toEqual([]);
    expect(artifact.public_http_summary.scan_errors).toBe(0);
  });

  it("records indexability and discoverability truth across sitemap, llms, and llms-full", () => {
    const artifact = readArtifact();

    expect(artifact.indexability_summary.canonical_missing).toBe(0);
    expect(artifact.indexability_summary.hreflang_missing).toBe(0);
    expect(artifact.indexability_summary.robots_noindex_count).toBe(0);

    expect(artifact.discoverability_summary.sitemap_xml.status).toBe(200);
    expect(artifact.discoverability_summary.sitemap_xml.detail_urls_present).toBe(64);
    expect(artifact.discoverability_summary.sitemap_xml.comparison_urls_present).toBe(32);
    expect(artifact.discoverability_summary.llms_txt.detail_urls_present).toBe(64);
    expect(artifact.discoverability_summary.llms_txt.comparison_urls_present).toBe(32);
    expect(artifact.discoverability_summary.llms_full_txt.detail_urls_present).toBe(64);
    expect(artifact.discoverability_summary.llms_full_txt.comparison_urls_present).toBe(0);
    expect(artifact.discoverability_summary.llms_full_txt.status_label).toBe("repair_merged_not_live");
    expect(artifact.discoverability_summary.llms_full_txt.blocking_pr_url).toBe(
      "https://github.com/fermatmind/fap-web/pull/1144"
    );
  });

  it("keeps GSC sampling explicit instead of fabricating authenticated Search Console evidence", () => {
    const artifact = readArtifact();
    const doc = readDoc();

    expect(artifact.gsc_sampling.status).toBe("not_executed_in_repo_pr");
    expect(artifact.gsc_sampling.required_sample_size).toBe(12);
    expect(artifact.gsc_sampling.sample_urls).toHaveLength(12);
    expect(doc).toContain("No runtime behavior change.");
    expect(doc).toContain("No CMS mutation.");
    expect(doc).toContain("No frontend editorial fallback content.");
    expect(doc).toContain("Run URL Inspection for these 12 URLs");
  });

  it("preserves the open follow-up gaps for future SEO work", () => {
    const artifact = readArtifact();
    const findings = new Map(artifact.findings.map((finding) => [finding.id, finding]));

    expect(findings.get("live_llms_full_missing_comparison_urls")?.severity).toBe("high");
    expect(findings.get("live_llms_full_missing_comparison_urls")?.status).toBe("repair_merged_not_live");
    expect(findings.get("gsc_url_inspection_not_sampled")?.status).toBe("requires_authenticated_search_console");
    expect(findings.get("faq_semantic_surface_missing")?.severity).toBe("high");
    expect(findings.get("personality_images_missing_from_live_html")?.severity).toBe("high");
    expect(artifact.structured_data_summary.faq_page_jsonld_missing).toBe(98);
    expect(artifact.structured_data_summary.comparison_collection_page_jsonld_present).toBe(true);
  });

  it("documents repository rule impact without changing runtime authority", () => {
    const artifact = readArtifact();

    expect(artifact.repository_rule_impact.content_authority_changed).toBe(false);
    expect(artifact.repository_rule_impact.sitemap_or_llms_enumeration_changed).toBe(false);
    expect(artifact.repository_rule_impact.frontend_fallback_behavior_changed).toBe(false);
    expect(artifact.repository_rule_impact.runtime_behavior_changed).toBe(false);
    expect(artifact.repository_rule_impact.rules_update_required).toBe(false);
  });

  it("keeps the current PR scoped to audit docs, generated artifact, contract, and PR-train metadata", () => {
    const outsideScope = changedFiles().filter((file) => !isCurrentRiasecPack12AllowedFile(file));

    expect(outsideScope).toEqual([]);
  });
});
