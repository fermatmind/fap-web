import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-04-top-profile-content-assets.mjs";
const PACKAGE_JSON = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json";
const PACKAGE_MD = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md";
const PACKAGE_CSV = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.csv";

type ProfileAsset = {
  path: string;
  target_url: string;
  framework: string;
  locale: string;
  page_type: string;
  mbti_type: string;
  variant: "A" | "T";
  cms_fields: {
    title: string;
    h1: string;
    meta_description: string;
    answer_block: string;
    modules: Array<{ key: string; required: boolean; body: string }>;
    faq: Array<{ question: string; answer: string }>;
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
  };
  handoff_policy: Record<string, boolean>;
};

type Package = {
  artifact: string;
  final_decision: string;
  summary: {
    target_count: number;
    variant_pages: number;
    comparison_pages: number;
    modules_per_page: number;
    faq_per_page: number;
    internal_links_min: number;
  };
  assets: ProfileAsset[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("MBTI-CMS-04-TOP-PROFILE-CONTENT-ASSETS", () => {
  it("regenerates the non-production content asset package", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-04-TOP-PROFILE-CONTENT-ASSETS",
      output_json: PACKAGE_JSON,
      output_md: PACKAGE_MD,
      output_csv: PACKAGE_CSV,
      target_count: 10,
      final_decision: "PASS_NON_PRODUCTION_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
    });
  });

  it("packages exactly the Top 10 exposed single personality targets", () => {
    const report = readJson<Package>(PACKAGE_JSON);

    expect(report.artifact).toBe("MBTI-CMS-04-TOP-PROFILE-CONTENT-ASSETS");
    expect(report.final_decision).toBe("PASS_NON_PRODUCTION_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      target_count: 10,
      variant_pages: 10,
      comparison_pages: 0,
      modules_per_page: 9,
      faq_per_page: 5,
    });

    expect(report.assets.map((item) => item.path)).toEqual([
      "/zh/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/enfj-a",
      "/zh/personality/istp-a",
      "/zh/personality/esfj-a",
      "/en/personality/esfj-t",
      "/en/personality/intp-a",
      "/en/personality/istp-a",
      "/en/personality/enfp-a",
      "/zh/personality/istj-a",
    ]);
    expect(report.assets.every((item) => item.page_type === "variant")).toBe(true);
    expect(report.assets.every((item) => !item.path.includes("-vs-"))).toBe(true);
  });

  it("requires every profile asset to include GEO-ready CMS fields", () => {
    const report = readJson<Package>(PACKAGE_JSON);
    const requiredModules = [
      "definition",
      "suitable_for",
      "not_suitable_for",
      "common_misread",
      "base16_difference",
      "at_difference",
      "career_scenarios",
      "relationship_scenarios",
      "stress_scenarios",
    ];

    for (const item of report.assets) {
      expect(item.framework).toBe("mbti64");
      expect(item.cms_fields.title.length).toBeGreaterThan(30);
      expect(item.cms_fields.h1.length).toBeGreaterThan(8);
      expect(item.cms_fields.meta_description.length).toBeGreaterThan(80);
      expect(item.cms_fields.answer_block.length).toBeGreaterThan(120);
      expect(item.cms_fields.modules.map((module) => module.key)).toEqual(requiredModules);
      expect(item.cms_fields.modules.every((module) => module.required && module.body.length > 60)).toBe(true);
      expect(item.cms_fields.faq).toHaveLength(5);
      expect(item.cms_fields.faq.every((faq) => faq.question.length > 10 && faq.answer.length > 40)).toBe(true);
      expect(item.cms_fields.internal_links.length).toBeGreaterThanOrEqual(5);
      expect(item.cms_fields.internal_links.every((link) => link.safe_public_route)).toBe(true);
    }
  });

  it("keeps the package outside CMS writes, production import, runtime, sitemap and deploy mutation", () => {
    const report = readJson<Package>(PACKAGE_JSON);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    });
    for (const item of report.assets) {
      expect(item.handoff_policy.cms_write_attempted).toBe(false);
      expect(item.handoff_policy.production_import_attempted).toBe(false);
      expect(item.handoff_policy.frontend_runtime_change_attempted).toBe(false);
    }
  });

  it("emits reviewable markdown and CSV side outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, PACKAGE_MD), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, PACKAGE_CSV), "utf8");

    expect(md).toContain("# MBTI-CMS-04 Top Exposed Personality Content Assets");
    expect(md).toContain("Non-production CMS review package only.");
    expect(csv.split("\n")[0]).toBe(
      [
        "priority_rank",
        "path",
        "locale",
        "mbti_type",
        "variant",
        "archetype",
        "impressions",
        "clicks",
        "average_position",
        "module_count",
        "faq_count",
        "internal_link_count",
      ].join(","),
    );
  });
});
