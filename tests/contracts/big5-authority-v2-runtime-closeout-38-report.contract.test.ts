import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-big5-authority-v2-runtime-closeout-38-report.mjs";
const evidencePath = "docs/seo/personality/big5-authority-v2-runtime-closeout-38-live-evidence-2026-07-15.json";
const reportPath = "docs/seo/personality/big5-authority-v2-runtime-closeout-38-report-2026-07-15.json";

type Assessment = "PASS" | "FAIL" | "UNKNOWN";

function readReport() {
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

describe("BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38", () => {
  it("locks the authorized import identity and exact collision-safe readback counts", () => {
    const report = readReport();

    expect(report.source_identity).toEqual({
      deploy_sha: "d023ddc2819ce6f2a271795c6e0b5a807c364ba1",
      pr37_merge_sha: "af99ac41406a2967b9f4778dc9da07b920bfbb7f",
      authority_package_sha256: "fb67edc033e679da3f134b34db30901465c7b44e0585818b23613fab83bf9162",
      draft_import_package_sha256: "80f95a73d497f28a74197b5af7dc1849af35ec9c15958ac898b29b669b997154",
      collision_contract_sha256: "fffcd07c97a7adbefc9d63c03b6523233f4b9f3c6a0c5733249da591254f3b49",
      preflight_fingerprint: "2a5e26986fae52e04481623d6b0ed166876091116861a942f39638f0ea807a9f",
    });
    expect(report.exact_counts).toEqual({
      package_assets: 231,
      new_fail_closed_primary: 106,
      new_primary_with_public_product_shell_preserved: 2,
      existing_public_primary_with_isolated_revision: 125,
      publicly_withheld_new_content_primary: 104,
      working_or_draft_revisions: 229,
      public_content_overwrites: 0,
    });
    expect(report.production_import_readback).toMatchObject({
      status: "PASS_COLLISION_SAFE_DRAFT_REVISION_IMPORT",
      writes_committed: true,
      public_release_count: 0,
      indexability_change_count: 0,
      sitemap_change_count: 0,
      llms_change_count: 0,
      media_write_count: 0,
      cache_invalidation_count: 0,
      search_submission_count: 0,
    });
    expect(report.production_import_readback.public_runtime_fingerprint_before)
      .toBe(report.production_import_readback.public_runtime_fingerprint_after);
  });

  it("proves all 104 publicly withheld content routes remain fail-closed and absent from feeds", () => {
    const report = readReport();
    const drafts = report.records.filter((record: { expected_runtime_class: string }) =>
      record.expected_runtime_class === "NEW_FAIL_CLOSED_DRAFT_PRIMARY");

    expect(drafts).toHaveLength(104);
    for (const record of drafts) {
      expect(record.assessment.draft_non_public_boundary).toBe("PASS");
      expect(record.assessment.http_runtime).toBe("FAIL");
      expect(record.assessment.sitemap).toBe("PASS");
      expect(record.assessment.llms).toBe("PASS");
      expect(record.assessment.llms_full).toBe("PASS");
      expect(record.observed.robots).toContain("noindex");
      expect(Object.values(record.observed.feed_membership)).toEqual([false, false, false]);
    }
    expect(report.summary.critical_draft_boundary_failures).toBe(0);
  });

  it("records every applicable runtime surface as PASS, FAIL, or UNKNOWN without hiding findings", () => {
    const report = readReport();
    const allowed = new Set<Assessment>(["PASS", "FAIL", "UNKNOWN"]);

    expect(report.records).toHaveLength(231);
    for (const record of report.records) {
      for (const value of Object.values(record.assessment) as Assessment[]) {
        expect(allowed.has(value)).toBe(true);
      }
    }
    expect(report.final_decision).toBe("FAIL_CLOSED_PUBLIC_RUNTIME_FINDINGS_RECORDED");
    expect(report.summary).toMatchObject({
      records_with_failures: 231,
      records_with_network_unknown: 0,
      public_http_200: 127,
      private_feed_url_leaks: 0,
    });
    expect(report.summary.failure_breakdown).toEqual({
      media_og: 116,
      http_runtime: 104,
      visible_date: 82,
      faq_json_ld: 9,
      visible_reviewer: 7,
      json_ld: 4,
      visible_author: 3,
      visible_source: 3,
      hreflang: 3,
      llms: 3,
    });
    expect(report.stop_report.status).toBe("RECORDED_FINDINGS_NO_RUNTIME_REPAIR_AUTHORIZED");
    expect(report.stop_report.failed_asset_ids).toHaveLength(231);
    expect(report.summary).toMatchObject({
      legacy_redirect_passes: 10,
      legacy_redirect_failures: 0,
      legacy_redirect_unknown: 0,
      withheld_soft_404_http_200: 104,
    });
  });

  it("commits reproducible visual QA hashes for public, withheld-draft, and product-shell samples", () => {
    const report = readReport();

    expect(report.visual_qa).toHaveLength(5);
    expect(report.stop_report.failed_visual_samples).toEqual(["existing-en-article", "existing-en-topic"]);
    expect(report.visual_qa.find((sample: { id: string }) => sample.id === "existing-en-topic")).toMatchObject({
      console_error_count: 49,
      assessment: { layout: "FAIL", visible_content: "FAIL", media: "UNKNOWN", draft_boundary: "UNKNOWN" },
    });
    expect(report.visual_qa.find((sample: { id: string }) => sample.id === "new-draft-soft-404")).toMatchObject({
      assessment: { layout: "PASS", visible_content: "PASS", media: "UNKNOWN", draft_boundary: "PASS" },
    });

    for (const sample of report.visual_qa) {
      const raw = fs.readFileSync(sample.screenshot);
      expect(crypto.createHash("sha256").update(raw).digest("hex")).toBe(sample.screenshot_sha256);
      expect(raw.length).toBe(sample.screenshot_bytes);
      expect(sample.viewport).toEqual({ width: 1440, height: 1000 });
    }
  });

  it("rebuilds only committed artifacts by default and keeps the closeout read-only", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
    const source = fs.readFileSync(script, "utf8");

    expect(stdout).toContain("FAIL_CLOSED_PUBLIC_RUNTIME_FINDINGS_RECORDED");
    expect(stdout).toContain("ASSETS=231/231");
    expect(stdout).toContain("CRITICAL_DRAFT_BOUNDARY_FAILURES=0");
    expect(source).toContain('const ALLOW_NETWORK = process.argv.includes("--allow-network")');
    expect(source).toContain("if (ALLOW_NETWORK)");
    expect(evidence.safety_boundary).toEqual({
      read_only_scan: true,
      production_write_attempted_by_closeout: false,
      deploy_attempted_by_closeout: false,
      cms_mutation_attempted_by_closeout: false,
      indexability_mutation_attempted_by_closeout: false,
      sitemap_or_llms_mutation_attempted_by_closeout: false,
      media_or_cache_mutation_attempted_by_closeout: false,
      search_submission_attempted_by_closeout: false,
    });
    expect(evidence.private_feed_url_leaks).toEqual([]);
  });
});
