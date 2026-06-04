import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/generate-seo-content-briefs.mjs";
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/seo-content-briefs.v1.json");
const MARKDOWN_PATH = path.join(ROOT, "docs/seo/generated/seo-content-briefs.v1.md");

type SeoContentBriefsArtifact = {
  version: string;
  scope: string;
  run_mode: string;
  read_only: boolean;
  live_data_collected: boolean;
  network_access_enabled: boolean;
  source_artifacts: Record<string, string>;
  summary: {
    total_briefs: number;
    sample_only_briefs: number;
    editorial_review_required: number;
    briefs_by_target_page_family: Record<string, number>;
  };
  briefs: Array<Record<string, unknown>>;
  risk_boundary: Record<string, boolean>;
};

function runGenerator(args: string[] = []): SeoContentBriefsArtifact {
  return JSON.parse(execFileSync("node", [SCRIPT, ...args], { cwd: ROOT, encoding: "utf8" })) as SeoContentBriefsArtifact;
}

function readArtifact(): SeoContentBriefsArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as SeoContentBriefsArtifact;
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
      // CI and local checkout shapes differ; use whichever scoped diff source is available.
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
      "docs/seo/generated/seo-content-briefs.v1.json",
      "docs/seo/generated/seo-content-briefs.v1.md",
      "scripts/seo/generate-seo-content-briefs.mjs",
      "tests/contracts/seo-content-brief-generator-readonly.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
    ].includes(file) || isCurrentRiasecPack12AllowedFile(file)
  );
}

describe("SEO content brief read-only generator", () => {
  it("emits offline sample briefs from existing artifacts without network or mutation authority", () => {
    const artifact = runGenerator();

    expect(artifact.version).toBe("seo_content_briefs.v1");
    expect(artifact.scope).toBe("SEO-BRIEF-01");
    expect(artifact.run_mode).toBe("offline_sample");
    expect(artifact.read_only).toBe(true);
    expect(artifact.live_data_collected).toBe(false);
    expect(artifact.network_access_enabled).toBe(false);
    expect(artifact.source_artifacts).toMatchObject({
      contract: "docs/seo/generated/seo-content-brief-generator.v1.json",
      issue_queue: "docs/seo/generated/seo-issue-queue.v1.json",
      competitor_url_inventory: "docs/seo/generated/competitor-url-inventory-generator.v1.json",
      url_inventory: "docs/seo/generated/url-inventory.v1.json",
      internal_link_graph: "docs/seo/generated/internal-link-graph.v1.json",
      manual_serp_sample: "embedded_sanitized_mock_sample",
    });
    expect(artifact.summary.total_briefs).toBeGreaterThanOrEqual(3);
    expect(artifact.summary.sample_only_briefs).toBe(artifact.summary.total_briefs);
    expect(artifact.summary.editorial_review_required).toBe(artifact.summary.total_briefs);
    expect(artifact.summary.briefs_by_target_page_family).toEqual(
      expect.objectContaining({
        test_detail: expect.any(Number),
      })
    );
  });

  it("keeps each brief advisory, sample-only, reviewed, and linked to sanitized issue evidence", () => {
    const artifact = runGenerator();

    expect(artifact.briefs.every((brief) => brief.sample_only === true)).toBe(true);
    expect(artifact.briefs.every((brief) => brief.editorial_review_required === true)).toBe(true);
    expect(artifact.briefs.every((brief) => Array.isArray(brief.source_issue_ids))).toBe(true);
    expect(artifact.briefs.every((brief) => Array.isArray(brief.table_stakes))).toBe(true);
    expect(artifact.briefs.every((brief) => Array.isArray(brief.value_add_opportunities))).toBe(true);
    expect(artifact.briefs.every((brief) => Array.isArray(brief.internal_link_suggestions))).toBe(true);
    expect(artifact.briefs.some((brief) => (brief.competitor_source_domains as string[]).length > 0)).toBe(true);
    expect(artifact.briefs.every((brief) => (brief.risk_flags as string[]).includes("cms_authority_required"))).toBe(true);
  });

  it("forbids CMS writes, publish actions, search submission, live APIs, and final article generation", () => {
    const artifact = runGenerator();
    const forbiddenFields = [
      "article_body",
      "final_article_title",
      "final_h1",
      "faq_copy",
      "cta_copy",
      "cms_draft_payload",
      "publish_action",
      "search_submit_url",
      "raw_serp_html",
      "copied_competitor_body",
      "token",
      "api_key",
      "secret",
    ];

    expect(artifact.risk_boundary.cms_writes).toBe(false);
    expect(artifact.risk_boundary.cms_draft_creation).toBe(false);
    expect(artifact.risk_boundary.publish_actions).toBe(false);
    expect(artifact.risk_boundary.search_submission).toBe(false);
    expect(artifact.risk_boundary.live_serp_api).toBe(false);
    expect(artifact.risk_boundary.scraping).toBe(false);
    expect(artifact.risk_boundary.final_article_body_generation).toBe(false);
    expect(artifact.risk_boundary.production_deploy).toBe(false);

    for (const brief of artifact.briefs) {
      for (const field of forbiddenFields) {
        expect(brief).not.toHaveProperty(field);
      }
      expect(String(brief.target_url_or_path)).not.toMatch(/\/(account|orders|payment|result|share|token)(\/|$)/);
    }
  });

  it("writes JSON and markdown artifacts locally while keeping markdown as an outline only", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "seo-content-briefs-"));
    const jsonPath = path.join(dir, "briefs.json");
    const markdownPath = path.join(dir, "briefs.md");

    const generated = runGenerator(["--output", jsonPath, "--markdown", markdownPath, "--pretty"]);
    const written = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as SeoContentBriefsArtifact;
    const markdown = fs.readFileSync(markdownPath, "utf8");

    expect(written.summary.total_briefs).toBe(generated.summary.total_briefs);
    expect(markdown).toContain("# SEO Content Briefs v1");
    expect(markdown).toContain("advisory brief outline export");
    expect(markdown).not.toMatch(/final title|final h1|article body copy/i);
    expect(markdown).not.toMatch(/cms_draft_payload|publish_action|search_submit_url/i);
  });

  it("keeps checked-in JSON and markdown aligned with the generator output", () => {
    const generated = runGenerator();
    const checkedIn = readArtifact();
    const markdown = fs.readFileSync(MARKDOWN_PATH, "utf8");

    expect(checkedIn).toEqual(generated);
    expect(markdown).toContain(checkedIn.briefs[0].brief_id as string);
    expect(markdown).toContain("Read only: true");
    expect(markdown).not.toMatch(/cms_draft_payload|publish_action|search_submit_url/i);
  });

  it("keeps current PR scope limited to the read-only brief generator and metadata", () => {
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
