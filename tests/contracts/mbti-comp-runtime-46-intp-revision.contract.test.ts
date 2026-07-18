import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/build-mbti-comp-runtime-46-intp-revision.mjs";
const OUTPUT = "docs/seo/personality/mbti-comp-runtime-46-intp-revision-2026-07-19.json";
const HASHES = "docs/seo/personality/mbti-comp-runtime-46-intp-revision-2026-07-19-hash-manifest.json";
const SECTION_KEYS = ["biggest_difference", "quick_judgment_table", "easy_misread", "work_scenarios", "relationship_scenarios", "stress_scenarios", "do_not_misjudge", "common_ground", "usage_boundary"];

describe("MBTI-COMP-RUNTIME-46 INTP revision package", () => {
  it("builds one exact fail-closed record without production authorization", () => {
    const output = JSON.parse(execFileSync("node", [SCRIPT], { cwd: ROOT, encoding: "utf8" }));
    expect(output).toMatchObject({ ok: true, target_path: "/zh/personality/intp-a-vs-intp-t", record_count: 1 });
    expect(output.exact_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(output.source_package_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(output.authorization_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("locks the exact nine-section repair and forbids publication/discoverability mutation", () => {
    const report = JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8"));
    const hashes = JSON.parse(fs.readFileSync(path.join(ROOT, HASHES), "utf8"));
    expect(report.repair_records).toHaveLength(1);
    const record = report.repair_records[0];
    expect(record.slug).toBe("intp-a-vs-intp-t");
    expect(record.import_payload.content_sections.map((section: { key: string }) => section.key)).toEqual(SECTION_KEYS);
    expect(record.import_payload.content.quick_judgment_table).toHaveLength(4);
    expect(record.import_payload.faq).toHaveLength(5);
    expect(record.import_payload.internal_links).toHaveLength(5);
    expect(record.revision_scope.forbidden_fields).toEqual(expect.arrayContaining(["status", "is_public", "is_indexable", "sitemap_eligible", "llms_eligible", "canonical"]));
    expect(record.manual_review).toMatchObject({ production_write_authorized: false, public_promotion_authorized: false });
    expect(report.safety_boundary).toMatchObject({ cms_write_attempted: false, database_mutation_attempted: false, publication_mutation_attempted: false, indexability_mutation_attempted: false, sitemap_llms_mutation_attempted: false, search_submission_attempted: false });
    expect(hashes.exact_payload_sha256).toBe(record.exact_payload_sha256);
    expect(hashes.source_package_sha256).toBe(report.exact_package.source_package_sha256);
    expect(hashes.authorization_payload_sha256).toBe(report.exact_package.authorization_payload_sha256);
  });

  it("pins rollback and readback to the single revision and current production fingerprint", () => {
    const report = JSON.parse(fs.readFileSync(path.join(ROOT, OUTPUT), "utf8"));
    const record = report.repair_records[0];
    expect(report.source_manifest.production_pre_state.sections_sha256).toBe("719df14a8b79159aaf889237c714774582e07cc731ccc95d2000209b8f4ce359");
    expect(record.rollback_expectations.atomic_record_required).toBe(true);
    expect(record.readback_expectations.required_section_keys).toEqual(SECTION_KEYS);
    expect(record.readback_expectations).toMatchObject({ publication_unchanged: true, indexability_unchanged: true, sitemap_unchanged: true, llms_unchanged: true });
  });
});
