import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-cms-approval-39-exact-package.mjs";
const OUTPUT = "docs/seo/personality/mbti-cms-approval-39-exact-package-2026-07-13.json";
const HASH_MANIFEST = "docs/seo/personality/mbti-cms-approval-39-hash-manifest-2026-07-13.json";
const URL_LIST = "docs/seo/personality/mbti-cms-approval-39-exact-url-list-2026-07-13.txt";
const VERIFY_ONLY = new Set([
  "/zh/personality/istj-a",
  "/zh/personality/esfj-a",
  "/zh/personality/istp-a",
  "/zh/personality/isfp-a",
  "/zh/personality/intp-a-vs-intp-t",
  "/zh/personality/intj-vs-intp",
  "/zh/personality/entj-vs-intj",
  "/zh/personality/infj-vs-infp",
  "/zh/personality/istj-vs-isfj",
]);

type ApprovalRecord = {
  target_path: string;
  target_url: string;
  locale: string;
  slug: string;
  entity_kind: "profile" | "at_comparison";
  exact_payload_sha256: string;
  expected_pre_state: object;
  expected_post_state: object;
  field_mapping: object;
  rollback_expectations: object;
  readback_expectations: object;
  manual_review: { decision: string; production_import_authorized: boolean };
};
type Report = {
  id: string;
  final_decision: string;
  summary: { repair_record_count: number; profile_repair_record_count: number; at_comparison_repair_record_count: number; verify_only_record_count: number; approved_count: number; needs_revision_count: number };
  exact_package: { source_package_sha256: string; authorization_payload_sha256: string; production_import_authorized: boolean };
  repair_records: ApprovalRecord[];
  verify_only_records: Array<{ target_path: string }>;
  manual_review: { approved: string[]; needs_revision: string[]; production_import_authorized: boolean };
  safety_boundary: object;
};

function report(): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8")) as Report;
}

describe("MBTI-CMS-APPROVAL-39 exact approval package", () => {
  it("builds an exact 43-record repair package without production authorization", () => {
    const output = JSON.parse(execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" }));
    expect(output).toMatchObject({ ok: true, repair_record_count: 43, profile_repair_record_count: 28, at_comparison_repair_record_count: 15, verify_only_record_count: 9 });
    expect(output.source_package_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(output.authorization_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("locks every importer precondition, payload, rollback expectation, and manual decision", () => {
    const value = report();
    expect(value.id).toBe("MBTI-CMS-APPROVAL-39");
    expect(value.final_decision).toBe("APPROVED_43_REPAIR_RECORDS_FOR_FAIL_CLOSED_IMPORTER_PREFLIGHT_NO_PRODUCTION_IMPORT_EXECUTED");
    expect(value.summary).toMatchObject({ repair_record_count: 43, profile_repair_record_count: 28, at_comparison_repair_record_count: 15, verify_only_record_count: 9, approved_count: 43, needs_revision_count: 0 });
    expect(new Set(value.repair_records.map((record) => record.target_path)).size).toBe(43);
    expect(value.repair_records.every((record) => record.locale === "zh-CN" && /^[a-f0-9]{64}$/.test(record.exact_payload_sha256))).toBe(true);
    expect(value.repair_records.every((record) => Object.keys(record.expected_pre_state).length > 0 && Object.keys(record.expected_post_state).length > 0 && Object.keys(record.field_mapping).length > 0 && Object.keys(record.rollback_expectations).length > 0 && Object.keys(record.readback_expectations).length > 0)).toBe(true);
    expect(value.repair_records.every((record) => record.manual_review.decision === "approved_for_fail_closed_importer_preflight" && record.manual_review.production_import_authorized === false)).toBe(true);
    expect(value.exact_package.production_import_authorized).toBe(false);
    expect(value.manual_review.production_import_authorized).toBe(false);
  });

  it("excludes the exact nine verify-only records from the repair manifest", () => {
    const value = report();
    expect(value.verify_only_records).toHaveLength(9);
    expect(new Set(value.verify_only_records.map((record) => record.target_path))).toEqual(VERIFY_ONLY);
    expect(value.repair_records.some((record) => VERIFY_ONLY.has(record.target_path))).toBe(false);
  });

  it("writes traceable hash and URL artifacts and stays artifact-only", () => {
    const value = report();
    const hashes = JSON.parse(fs.readFileSync(path.join(ROOT, HASH_MANIFEST), "utf8"));
    const urls = fs.readFileSync(path.join(ROOT, URL_LIST), "utf8").trim().split("\n");
    expect(hashes.source_package_sha256).toBe(value.exact_package.source_package_sha256);
    expect(hashes.authorization_payload_sha256).toBe(value.exact_package.authorization_payload_sha256);
    expect(hashes.records).toHaveLength(43);
    expect(urls).toHaveLength(43);
    expect(urls.every((url) => url.startsWith("https://fermatmind.com/zh/personality/"))).toBe(true);
    expect(value.safety_boundary).toMatchObject({ artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false });
  });
});
