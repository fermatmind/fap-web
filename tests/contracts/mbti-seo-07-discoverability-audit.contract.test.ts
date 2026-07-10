import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-seo-07-discoverability-audit.mjs";
const JSON_PATH = "docs/seo/personality/mbti-seo-07-discoverability-audit-2026-07-04.json";
const MD_PATH = "docs/seo/personality/mbti-seo-07-discoverability-audit-2026-07-04.md";
const MBTI_SEO_07_BRANCH = "codex/mbti-seo-07-llms-sitemap-discoverability";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(read(relativePath)) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();

  for (const args of [
    ["diff", "--name-only", "origin/main...HEAD"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI merge refs may not fetch origin/main in shallow checkouts. In that
      // case the local scope gate remains the source of truth.
    }
  }

  return [...files].sort();
}

function currentBranchName(): string {
  const githubHeadRef = process.env.GITHUB_HEAD_REF?.trim();
  if (githubHeadRef) {
    return githubHeadRef;
  }

  const githubRefName = process.env.GITHUB_REF_NAME?.trim();
  if (githubRefName && !/^\d+\/merge$/.test(githubRefName)) {
    return githubRefName;
  }

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

type Audit = {
  id: string;
  scope: {
    runtime_url_expansion: boolean;
    sitemap_url_expansion: boolean;
    llms_url_expansion: boolean;
    cms_write_or_import: boolean;
    production_deploy: boolean;
  };
  current_authority: {
    llms_txt: {
      source: string;
      fallback_policy: string;
    };
    llms_full_txt: {
      profile_cohort: string;
      comparison_cohort: string;
    };
    sitemap_xml: {
      hub_paths: string[];
      detail_paths: string;
      no_static_detail_expansion: boolean;
      invalid_base_type_policy: string;
    };
  };
  content_readiness_inputs: {
    top_profile_package: { asset_count: number };
    comparison_package: {
      asset_count: number;
      at_comparison_count: number;
      hot_cross_type_comparison_count: number;
    };
  };
  release_gates_before_url_expansion: string[];
};

describe("MBTI-SEO-07 discoverability audit", () => {
  it("generates a deterministic audit without changing runtime URL exposure", () => {
    execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const audit = readJson<Audit>(JSON_PATH);
    const markdown = read(MD_PATH);

    expect(audit.id).toBe("MBTI-SEO-07");
    expect(audit.scope).toMatchObject({
      runtime_url_expansion: false,
      sitemap_url_expansion: false,
      llms_url_expansion: false,
      cms_write_or_import: false,
      production_deploy: false,
    });
    expect(audit.content_readiness_inputs.top_profile_package.asset_count).toBeGreaterThanOrEqual(10);
    expect(audit.content_readiness_inputs.comparison_package).toMatchObject({
      asset_count: 20,
      at_comparison_count: 16,
      hot_cross_type_comparison_count: 4,
    });
    expect(markdown).toContain("Runtime URL expansion: no");
    expect(markdown).toContain("detail URLs must come from backend sitemap-source authority");
  });

  it("keeps personality llms routes CMS-authoritative and fail-closed", () => {
    const llmsRoute = read("app/llms.txt/route.ts");
    const llmsFullRoute = read("app/llms-full.txt/route.ts");

    expect(llmsRoute).toContain("listBackendSitemapMbtiPersonalityPaths");
    expect(llmsRoute).toContain("return dedupePaths([...mbtiPersonalityPaths, ...bigFiveZhPaths]);");
    expect(llmsRoute).not.toContain("listPersonalityProfiles");
    expect(llmsRoute).not.toContain("publishedPersonalityVariantSlugs");
    expect(llmsRoute).not.toContain("MBTI_BASE_TYPES.map");

    expect(llmsFullRoute).toContain("listBackendSitemapMbtiPersonalityPaths");
    expect(llmsFullRoute).toContain("function buildMbtiPersonalityAuthorityEntry(");
    expect(llmsFullRoute).toContain("hasExactMbtiPersonalityAuthorityCohort");
    expect(llmsFullRoute).toContain("expectedMbtiPersonalityPaths");
    expect(llmsFullRoute).not.toContain("personalityVariantEntriesFromBaseProfile");
    expect(llmsFullRoute).not.toContain("buildPersonalityComparisonSlugsFromProfiles");
  });

  it("keeps sitemap personality detail exposure backend-source gated", () => {
    const sitemapAdapters = read("lib/seo/sitemapAuthorityAdapters.cjs");
    const sitemapContract = read("tests/contracts/sitemap-indexability.contract.test.ts");

    expect(sitemapAdapters).toContain("\"/en/personality\"");
    expect(sitemapAdapters).toContain("\"/zh/personality\"");
    expect(sitemapAdapters).not.toContain("\"/en/personality/intj-a\"");
    expect(sitemapAdapters).not.toContain("\"/zh/personality/intj-a\"");
    expect(sitemapContract).toContain("frontend sitemap config keeps backend-owned MBTI personality A/T variant routes");
    expect(sitemapContract).toContain("/en/personality/intp-a");
    expect(sitemapContract).toContain("expect(locs).not.toContain(\"/en/personality/intp\")");
  });

  it("keeps the PR scoped to discoverability audit files", () => {
    const branch = currentBranchName();
    if (branch !== MBTI_SEO_07_BRANCH) {
      expect(branch).not.toBe(MBTI_SEO_07_BRANCH);
      return;
    }

    const allowedExact = new Set([
      SCRIPT_PATH,
      JSON_PATH,
      MD_PATH,
      "tests/contracts/mbti-seo-07-discoverability-audit.contract.test.ts",
      "docs/codex/pr-train-state.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
    ]);
    const outsideScope = committedScopeFiles().filter((file) => !allowedExact.has(file));

    expect(outsideScope).toEqual([]);
  });
});
