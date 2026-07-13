import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-profile-sj-33-content-package.mjs";
const OUTPUT = "docs/seo/personality/mbti-profile-sj-33-content-package-2026-07-13.json";
const EXPECTED_PATHS = [
  "/zh/personality/istj-a", "/zh/personality/istj-t", "/zh/personality/isfj-a", "/zh/personality/isfj-t",
  "/zh/personality/estj-a", "/zh/personality/estj-t", "/zh/personality/esfj-a", "/zh/personality/esfj-t",
];

type CmsFields = { direct_answer: string; sections: Array<{ key: string; body: string }>; faq: Array<{ question: string; answer: string }>; internal_links: Array<{ href: string; safe_public_route: boolean }> };
type Asset = { path: string; locale: string; mbti_type: string; variant: string; change_mode: "repair" | "verify_only"; cms_update_fields: string[]; cms_fields: CmsFields | null; verification_contract?: { no_unjustified_rewrite: boolean; minimum_faq_count: number; minimum_internal_link_count: number }; claim_boundary: Record<string, boolean>; handoff_policy: Record<string, boolean> };
type Package = { artifact: string; final_decision: string; summary: { target_count: number; group: string; repair_count: number; verify_only_count: number }; safety_boundary: Record<string, boolean>; assets: Asset[] };

function readPackage() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8")) as Package;
}

describe("MBTI-PROFILE-SJ-33 content package", () => {
  it("builds exactly eight Chinese SJ profile candidates", () => {
    const stdout = execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" });
    expect(JSON.parse(stdout)).toMatchObject({ ok: true, artifact: "MBTI-PROFILE-SJ-33-CONTENT-PACKAGE", target_count: 8 });
    const report = readPackage();
    expect(report.final_decision).toBe("PASS_NON_PRODUCTION_SJ_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA");
    expect(report.summary).toMatchObject({ target_count: 8, group: "SJ", repair_count: 6, verify_only_count: 2 });
    expect(report.assets.map((asset) => asset.path)).toEqual(EXPECTED_PATHS);
  });

  it("repairs six profiles and verifies two existing assets without proposing an unjustified rewrite", () => {
    const report = readPackage();
    const repairAssets = report.assets.filter((asset) => asset.change_mode === "repair");
    const verifyOnlyAssets = report.assets.filter((asset) => asset.change_mode === "verify_only");
    expect(repairAssets).toHaveLength(6);
    expect(verifyOnlyAssets.map((asset) => asset.path)).toEqual(["/zh/personality/istj-a", "/zh/personality/esfj-a"]);
    const answers = new Set(repairAssets.map((asset) => asset.cms_fields?.direct_answer));
    expect(answers.size).toBe(6);
    for (const asset of report.assets) {
      expect(asset.locale).toBe("zh");
      if (asset.change_mode === "verify_only") {
        expect(asset.cms_fields).toBeNull();
        expect(asset.cms_update_fields).toEqual([]);
        expect(asset.verification_contract).toMatchObject({ no_unjustified_rewrite: true, minimum_faq_count: 6, minimum_internal_link_count: 5 });
        continue;
      }
      const fields = asset.cms_fields as CmsFields;
      expect(fields.direct_answer.length).toBeGreaterThanOrEqual(100);
      expect(fields.sections.map((section) => section.key)).toEqual(["definition", "suitable_for", "not_suitable_for", "common_misread", "base16_difference", "at_difference", "career_scenarios", "relationship_scenarios", "stress_scenarios"]);
      expect(fields.faq).toHaveLength(6);
      expect(fields.internal_links).toHaveLength(5);
      expect(fields.internal_links.every((link) => link.safe_public_route && link.href.startsWith("/zh/") && !/\/(result|attempt|report|order|payment|history|share)/.test(link.href))).toBe(true);
      expect(JSON.stringify(fields)).not.toMatch(/官方MBTI|临床级|保证职业|决定命运/);
    }
  });

  it("is artifact-only and does not change CMS or public runtime authority", () => {
    const report = readPackage();
    expect(report.safety_boundary).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, frontend_editorial_fallback_added: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
    for (const asset of report.assets) {
      expect(asset.claim_boundary).toMatchObject({ medical_diagnostic_claim: false, hiring_screen_claim: false, official_mbti_affiliation_claim: false, deterministic_career_claim: false, relationship_prediction_claim: false, frontend_editorial_fallback: false });
      expect(asset.handoff_policy).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
    }
  });
});
