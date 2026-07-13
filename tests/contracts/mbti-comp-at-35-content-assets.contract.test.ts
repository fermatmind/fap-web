import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-comp-at-35-content-assets.mjs";
const OUTPUT = "docs/seo/personality/mbti-comp-at-35-content-assets-2026-07-13.json";

type CmsFields = { direct_answer: string; sections: Array<{ key: string; body: string; rows?: Array<Record<string, string>> }>; quick_judgment_table: Array<Record<string, string>>; faq: Array<{ question: string; answer: string }>; internal_links: Array<{ href: string; safe_public_route: boolean }> };
type Asset = { path: string; change_mode: "repair" | "verify_only"; cms_fields: CmsFields | null; query_fit: { primary: string }; source_refs: string[]; duplicate_differentiation_note: string; verification_contract?: { no_unjustified_rewrite: boolean; minimum_quick_judgment_rows: number; minimum_faq_count: number; minimum_internal_link_count: number }; handoff_policy: Record<string, boolean> };
type Package = { artifact: string; final_decision: string; summary: { target_count: number; repair_count: number; verify_only_count: number }; safety_boundary: Record<string, boolean>; assets: Asset[] };

function readPackage() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8")) as Package;
}

describe("MBTI-COMP-AT-35 content assets", () => {
  it("builds exactly the fixed sixteen Chinese A/T comparison URLs", () => {
    const stdout = execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" });
    expect(JSON.parse(stdout)).toMatchObject({ ok: true, artifact: "MBTI-COMP-AT-35-CONTENT-ASSETS", target_count: 16, repair_count: 15, verify_only_count: 1 });
    const report = readPackage();
    expect(report.final_decision).toBe("PASS_NON_PRODUCTION_AT_COMPARISON_CONTENT_PACKAGE_READY_FOR_FULL_QA");
    expect(report.summary).toMatchObject({ target_count: 16, repair_count: 15, verify_only_count: 1 });
    expect(report.assets.map((asset) => asset.path)).toEqual(expect.arrayContaining(["/zh/personality/intj-a-vs-intj-t", "/zh/personality/intp-a-vs-intp-t", "/zh/personality/esfp-a-vs-esfp-t"]));
    expect(report.assets.some((asset) => /^(?!.*-a-vs-.*-t)/.test(asset.path))).toBe(false);
  });

  it("keeps INTP A/T verify-only and gives every repair asset answerable, differentiated comparison modules", () => {
    const report = readPackage();
    const repairs = report.assets.filter((asset) => asset.change_mode === "repair");
    const verifies = report.assets.filter((asset) => asset.change_mode === "verify_only");
    expect(repairs).toHaveLength(15);
    expect(verifies.map((asset) => asset.path)).toEqual(["/zh/personality/intp-a-vs-intp-t"]);
    expect(verifies[0].cms_fields).toBeNull();
    expect(verifies[0].verification_contract).toMatchObject({ no_unjustified_rewrite: true, minimum_quick_judgment_rows: 4, minimum_faq_count: 5, minimum_internal_link_count: 5 });
    expect(new Set(repairs.map((asset) => asset.cms_fields?.direct_answer)).size).toBe(15);
    const expectedSections = ["biggest_difference", "quick_judgment_table", "easy_misread", "work_scenarios", "relationship_scenarios", "stress_scenarios", "do_not_misjudge", "common_ground", "usage_boundary"];
    for (const asset of repairs) {
      const fields = asset.cms_fields as CmsFields;
      expect(fields.sections.map((section) => section.key)).toEqual(expectedSections);
      expect(fields.quick_judgment_table).toHaveLength(4);
      expect(fields.faq).toHaveLength(5);
      expect(fields.internal_links).toHaveLength(5);
      expect(fields.internal_links.every((link) => link.safe_public_route && link.href.startsWith("/zh/") && !/\/(result|attempt|report|order|payment|history|share)/.test(link.href))).toBe(true);
      expect(asset.query_fit.primary).toContain("区别");
      expect(asset.source_refs.length).toBeGreaterThanOrEqual(2);
      expect(asset.duplicate_differentiation_note.length).toBeGreaterThan(60);
      expect(JSON.stringify(fields)).not.toMatch(/官方MBTI|临床级|保证职业|决定命运/);
    }
  });

  it("remains an artifact-only handoff with no CMS, runtime, feed, deploy, or GSC mutation", () => {
    const report = readPackage();
    expect(report.safety_boundary).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, frontend_editorial_fallback_added: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
    for (const asset of report.assets) {
      expect(asset.handoff_policy).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
    }
  });
});
