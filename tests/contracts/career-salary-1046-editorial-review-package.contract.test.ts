import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PACKAGE_DIR = "generated/career-salary-v3-6-1046-editorial-review-package";
const APPROVAL_MANIFEST_PATH = `${PACKAGE_DIR}/approval_manifest.json`;
const EDITORIAL_REPORT_PATH = `${PACKAGE_DIR}/editorial_qa_report.json`;
const SHA_MANIFEST_PATH = `${PACKAGE_DIR}/sha256_manifest.json`;

type ApprovalManifest = {
  artifact_type: string;
  version: string;
  source_asset: {
    path: string;
    sha256: string;
    row_count: number;
    slug_count: number;
    locale_counts: Record<string, number>;
  };
  gate_results: {
    independent_qa_conclusion: string;
    known_good_10slug_pass: boolean;
    projection_ready_rows: number;
    projection_blocked_rows: number;
    staging_api_smoke_status: string;
    staging_api_ready_rows: number;
    staging_api_failed_rows: number;
    staging_preview_summary_conclusion: string;
  };
  editorial_review: {
    status: string;
    approved_for_next_state: string;
    production_import_approved: boolean;
    rejected_count: number;
    rejected_slugs: string[];
    high_risk_reviewed_slug_count: number;
    reviewed_categories: string[];
    manual_approval_required_for_production_import: boolean;
  };
  approved_slugs: string[];
};

type EditorialReport = {
  decision: string;
  source_asset_sha256: string;
  row_count: number;
  slug_count: number;
  rejected_count: number;
  blocked_count: number;
  production_import_approved: boolean;
  high_risk_reviewed_slug_count: number;
  approval_manifest_sha256: string;
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("career salary 1046 editorial review package", () => {
  const approval = readJson<ApprovalManifest>(APPROVAL_MANIFEST_PATH);
  const report = readJson<EditorialReport>(EDITORIAL_REPORT_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("locks the v3.6 1046 salary asset source identity without embedding the asset JSONL", () => {
    expect(approval.artifact_type).toBe("career_salary_1046_editorial_review_approval_manifest");
    expect(approval.version).toBe("v3.6.1046.editorial_review.1");
    expect(approval.source_asset.path).toBe(
      "generated/career-salary-v3-6-1046-reader-repair-final-2092/career_job_salary_assets_1046_v3_6_reader_repaired.jsonl"
    );
    expect(approval.source_asset.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(approval.source_asset.row_count).toBe(2092);
    expect(approval.source_asset.slug_count).toBe(1046);
    expect(approval.source_asset.locale_counts).toEqual({ "zh-CN": 1046, en: 1046 });
    expect(approval.approved_slugs).toHaveLength(1046);
    expect(new Set(approval.approved_slugs).size).toBe(1046);
  });

  it("requires independent QA and full staging API smoke before approval-state transition", () => {
    expect(approval.gate_results.independent_qa_conclusion).toBe("READY_FOR_EXPANDED_STAGING_PREVIEW");
    expect(approval.gate_results.known_good_10slug_pass).toBe(true);
    expect(approval.gate_results.projection_ready_rows).toBe(2092);
    expect(approval.gate_results.projection_blocked_rows).toBe(0);
    expect(approval.gate_results.staging_api_smoke_status).toBe("pass");
    expect(approval.gate_results.staging_api_ready_rows).toBe(2092);
    expect(approval.gate_results.staging_api_failed_rows).toBe(0);
    expect(approval.gate_results.staging_preview_summary_conclusion).toBe("EXPANDED_STAGING_PREVIEW_1046_PASS");
  });

  it("approves editorial review only, while keeping production import blocked", () => {
    expect(approval.editorial_review.status).toBe("editorial_review_pass");
    expect(approval.editorial_review.approved_for_next_state).toBe("approved");
    expect(approval.editorial_review.production_import_approved).toBe(false);
    expect(approval.editorial_review.manual_approval_required_for_production_import).toBe(true);
    expect(approval.editorial_review.rejected_count).toBe(0);
    expect(approval.editorial_review.rejected_slugs).toEqual([]);
    expect(approval.editorial_review.high_risk_reviewed_slug_count).toBeGreaterThanOrEqual(50);
    expect(approval.editorial_review.reviewed_categories).toEqual(
      expect.arrayContaining([
        "military_or_command",
        "variable_pay_or_performance",
        "medical_or_health",
        "teacher_or_education",
        "wildlife_or_environment",
        "trade_or_service",
        "engineering_or_software",
      ])
    );
  });

  it("keeps the report aligned with the approval manifest", () => {
    expect(report.decision).toBe("EDITORIAL_QA_PASS");
    expect(report.source_asset_sha256).toBe(approval.source_asset.sha256);
    expect(report.row_count).toBe(2092);
    expect(report.slug_count).toBe(1046);
    expect(report.rejected_count).toBe(0);
    expect(report.blocked_count).toBe(0);
    expect(report.production_import_approved).toBe(false);
    expect(report.high_risk_reviewed_slug_count).toBe(approval.editorial_review.high_risk_reviewed_slug_count);
    expect(report.approval_manifest_sha256).toBe(sha256(APPROVAL_MANIFEST_PATH));
  });

  it("records stable SHA-256 hashes for every review package artifact", () => {
    expect(shaManifest["approval_manifest.json"]).toBe(sha256(APPROVAL_MANIFEST_PATH));
    expect(shaManifest["editorial_qa_report.json"]).toBe(sha256(EDITORIAL_REPORT_PATH));
    expect(shaManifest["high_risk_editorial_sample.csv"]).toMatch(/^[a-f0-9]{64}$/);
    expect(shaManifest["approve_reject_manifest.csv"]).toMatch(/^[a-f0-9]{64}$/);
    expect(shaManifest["editorial_qa_report.md"]).toMatch(/^[a-f0-9]{64}$/);
  });
});
