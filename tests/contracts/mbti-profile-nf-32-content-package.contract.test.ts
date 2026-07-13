import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-profile-nf-32-content-package.mjs";
const OUTPUT = "docs/seo/personality/mbti-profile-nf-32-content-package-2026-07-13.json";
const EXPECTED_PATHS = [
  "/zh/personality/infj-a", "/zh/personality/infj-t", "/zh/personality/infp-a", "/zh/personality/infp-t",
  "/zh/personality/enfj-a", "/zh/personality/enfj-t", "/zh/personality/enfp-a", "/zh/personality/enfp-t",
];

type Asset = { path: string; locale: string; mbti_type: string; variant: string; cms_fields: { direct_answer: string; sections: Array<{ key: string; body: string }>; faq: Array<{ question: string; answer: string }>; internal_links: Array<{ href: string; safe_public_route: boolean }> }; claim_boundary: Record<string, boolean>; handoff_policy: Record<string, boolean> };
type Package = { artifact: string; final_decision: string; summary: { target_count: number; group: string }; safety_boundary: Record<string, boolean>; assets: Asset[] };

function readPackage() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8")) as Package;
}

describe("MBTI-PROFILE-NF-32 content package", () => {
  it("builds exactly eight Chinese NF profile candidates", () => {
    const stdout = execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" });
    expect(JSON.parse(stdout)).toMatchObject({ ok: true, artifact: "MBTI-PROFILE-NF-32-CONTENT-PACKAGE", target_count: 8 });
    const report = readPackage();
    expect(report.final_decision).toBe("PASS_NON_PRODUCTION_NF_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA");
    expect(report.summary).toMatchObject({ target_count: 8, group: "NF" });
    expect(report.assets.map((asset) => asset.path)).toEqual(EXPECTED_PATHS);
  });

  it("keeps every profile answerable, distinct, internally linked, and boundary-safe", () => {
    const report = readPackage();
    const answers = new Set(report.assets.map((asset) => asset.cms_fields.direct_answer));
    expect(answers.size).toBe(8);
    for (const asset of report.assets) {
      expect(asset.locale).toBe("zh");
      expect(asset.cms_fields.direct_answer.length).toBeGreaterThanOrEqual(100);
      expect(asset.cms_fields.sections.map((section) => section.key)).toEqual(["definition", "suitable_for", "not_suitable_for", "common_misread", "base16_difference", "at_difference", "career_scenarios", "relationship_scenarios", "stress_scenarios"]);
      expect(asset.cms_fields.faq).toHaveLength(6);
      expect(asset.cms_fields.internal_links).toHaveLength(5);
      expect(asset.cms_fields.internal_links.every((link) => link.safe_public_route && link.href.startsWith("/zh/") && !/\/(result|attempt|report|order|payment|history|share)/.test(link.href))).toBe(true);
      expect(JSON.stringify(asset.cms_fields)).not.toMatch(/官方MBTI|临床级|保证职业|决定命运/);
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
