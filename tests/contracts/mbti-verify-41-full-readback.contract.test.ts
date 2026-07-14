import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-verify-41-full-readback.mjs";
const reportPath = "docs/seo/personality/mbti-verify-41-full-readback-2026-07-14.json";
const cmsEvidencePath = "docs/seo/personality/mbti-verify-41-cms-draft-readback-2026-07-14.json";

describe("MBTI-VERIFY-41 full CMS/API readback", () => {
  it("passes the exact 52 URL read-only authority gate", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(stdout).toContain("PASS_MBTI_VERIFY_41_FULL_READBACK");
    expect(report.final_decision).toBe("PASS_MBTI_VERIFY_41_FULL_READBACK");
    expect(report.summary).toMatchObject({
      total_count: 52,
      passed_count: 52,
      failed_count: 0,
      repair_draft_count: 43,
      verify_only_count: 9,
      cms_draft_readback_count: 43,
      public_api_readback_count: 52,
    });
    expect(report.failed_records).toEqual([]);
  });

  it("matches all 43 imported draft fingerprints without treating import as promotion", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const repairRecords = report.records.filter((record: { disposition: string }) => record.disposition === "repair_draft_readback");

    expect(repairRecords).toHaveLength(43);
    for (const record of repairRecords) {
      expect(record.content_authority).toBe("production_cms_draft_revision");
      expect(record.expected_content_fingerprint).toMatch(/^[a-f0-9]{64}$/);
      expect(record.observed_content_fingerprint).toBe(record.expected_content_fingerprint);
      expect(record.checks).toMatchObject({
        cms_draft_record_exists: true,
        cms_draft_fingerprint_matches: true,
        cms_draft_only: true,
        public_projection_not_promoted: true,
        discoverability_not_mutated: true,
      });
    }
  });

  it("proves the nine verify-only records were not overwritten", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const cmsEvidence = JSON.parse(fs.readFileSync(cmsEvidencePath, "utf8"));
    const verifyOnlyRecords = report.records.filter((record: { disposition: string }) => record.disposition === "verify_only_existing_authority");
    const importedPaths = new Set(cmsEvidence.records.map((record: { target_path: string }) => record.target_path));

    expect(verifyOnlyRecords).toHaveLength(9);
    for (const record of verifyOnlyRecords) {
      expect(record.content_authority).toBe("existing_public_api_authority");
      expect(record.checks.verify_only_not_overwritten).toBe(true);
      expect(importedPaths.has(record.route)).toBe(false);
    }
  });

  it("keeps the task read-only and the frontend outside editorial authority", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const source = fs.readFileSync(script, "utf8");

    expect(source).toContain('const ALLOW_NETWORK = process.argv.includes("--allow-network")');
    expect(report.frontend_authority_checks).toEqual({
      profile_uses_backend_projection: true,
      comparison_uses_backend_projection: true,
      comparison_declares_no_editorial_fallback: true,
      no_frontend_gateway_fallback: true,
    });
    expect(report.safety_boundary).toMatchObject({
      read_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      public_promotion_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      production_deploy_attempted: false,
      frontend_editorial_fallback_added: false,
    });
  });
});
