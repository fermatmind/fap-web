import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-06-comparison-content-assets.mjs";
const PACKAGE_JSON = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json";
const PACKAGE_MD = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.md";
const PACKAGE_CSV = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.csv";

type ComparisonAsset = {
  path: string;
  target_url: string;
  framework: string;
  locale: string;
  page_type: "at_comparison" | "hot_comparison";
  comparison_pair: {
    left: string;
    right: string;
    left_label: string;
    right_label: string;
  };
  cms_fields: {
    title: string;
    h1: string;
    meta_description: string;
    answer_block: string;
    modules: Array<{ key: string; required: boolean; body: string; rows?: Array<Record<string, string>> }>;
    quick_judgment_table: Array<{ dimension: string; left: string; right: string }>;
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
    at_comparison_pages: number;
    hot_comparison_pages: number;
    modules_per_page: number;
    faq_per_page: number;
    quick_judgment_rows_per_page: number;
    internal_links_min: number;
  };
  assets: ComparisonAsset[];
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

describe("MBTI-CMS-06-COMPARISON-CONTENT-ASSETS", () => {
  it("regenerates the non-production comparison content asset package", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-06-COMPARISON-CONTENT-ASSETS",
      output_json: PACKAGE_JSON,
      output_md: PACKAGE_MD,
      output_csv: PACKAGE_CSV,
      target_count: 20,
      at_comparison_pages: 16,
      hot_comparison_pages: 4,
      final_decision: "PASS_NON_PRODUCTION_COMPARISON_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
    });
  });

  it("packages all 16 A/T comparison pages and the requested hot comparisons", () => {
    const report = readJson<Package>(PACKAGE_JSON);

    expect(report.artifact).toBe("MBTI-CMS-06-COMPARISON-CONTENT-ASSETS");
    expect(report.final_decision).toBe("PASS_NON_PRODUCTION_COMPARISON_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      target_count: 20,
      at_comparison_pages: 16,
      hot_comparison_pages: 4,
      modules_per_page: 6,
      faq_per_page: 5,
      quick_judgment_rows_per_page: 4,
    });

    const paths = report.assets.map((item) => item.path);
    expect(paths.filter((item) => item.includes("-a-vs-") && item.endsWith("-t"))).toHaveLength(16);
    expect(paths).toEqual(
      expect.arrayContaining([
        "/zh/personality/intj-a-vs-intj-t",
        "/zh/personality/intp-a-vs-intp-t",
        "/zh/personality/entj-a-vs-entj-t",
        "/zh/personality/enfp-a-vs-enfp-t",
        "/zh/personality/istp-a-vs-istp-t",
        "/zh/personality/esfp-a-vs-esfp-t",
        "/zh/personality/intj-vs-intp",
        "/zh/personality/entj-vs-intj",
        "/zh/personality/infj-vs-infp",
        "/zh/personality/istj-vs-isfj",
      ]),
    );
  });

  it("requires every comparison asset to include GEO-ready CMS fields", () => {
    const report = readJson<Package>(PACKAGE_JSON);
    const requiredModules = [
      "biggest_difference",
      "quick_judgment_table",
      "easy_misread",
      "real_scenario_differences",
      "do_not_misjudge",
      "faq",
    ];

    for (const item of report.assets) {
      expect(item.framework).toBe("mbti_comparison");
      expect(item.locale).toBe("zh-CN");
      expect(item.target_url).toBe(`https://fermatmind.com${item.path}`);
      expect(item.cms_fields.title.length).toBeGreaterThan(35);
      expect(item.cms_fields.h1.length).toBeGreaterThan(16);
      expect(item.cms_fields.meta_description.length).toBeGreaterThan(80);
      expect(item.cms_fields.answer_block.length).toBeGreaterThan(140);
      expect(item.cms_fields.modules.map((module) => module.key)).toEqual(requiredModules);
      expect(item.cms_fields.modules.every((module) => module.required && module.body.length > 60)).toBe(true);
      expect(item.cms_fields.quick_judgment_table).toHaveLength(4);
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
      expect(item.handoff_policy.frontend_local_editorial_fallback_added).toBe(false);
    }
  });

  it("emits reviewable markdown and CSV side outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, PACKAGE_MD), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, PACKAGE_CSV), "utf8");

    expect(md).toContain("# MBTI-CMS-06 Comparison Content Assets");
    expect(md).toContain("Non-production CMS review package only.");
    expect(md).toContain("/zh/personality/entj-vs-intj");
    expect(csv.split("\n")[0]).toBe(
      [
        "priority_rank",
        "path",
        "page_type",
        "left",
        "right",
        "module_count",
        "faq_count",
        "quick_judgment_rows",
        "internal_link_count",
      ].join(","),
    );
  });
});
