import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-16-profile-dry-run-approval-package.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-16-profile-dry-run-approval-package-2026-07-05.csv";

type DryRunRecord = {
  target_path: string;
  code: string;
  locale: string;
  cms_resource: string;
  dry_run_operation: string;
  approval_state: string;
  import_candidate: boolean;
  field_mapping: Record<string, string>;
  dry_run_payload: {
    sections?: unknown[];
    faq?: unknown[];
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
    no_body_rewrite?: boolean;
  };
  validation: {
    status: "pass" | "fail";
    errors: string[];
    section_count: number;
    faq_count: number;
    internal_link_count: number;
    private_result_boundary_ok: boolean;
    indexability_held: boolean;
  };
  required_approval_before_import: boolean;
  production_write_allowed: boolean;
};

type DryRunReport = {
  id: string;
  artifact: string;
  final_decision: string;
  summary: {
    profile_record_count: number;
    import_candidate_count: number;
    verify_only_count: number;
    validation_failure_count: number;
  };
  schema_mapping: {
    authority: string;
    source_of_truth_after_approval: string;
    frontend_role: string;
    required_payload_fields: string[];
  };
  qa_gates: Record<string, { status: "pass" | "fail" }>;
  safety_boundary: Record<string, boolean>;
  records: DryRunRecord[];
  blockers: string[];
  approval_packet: {
    approval_required_for: string[];
    verify_only_not_imported: string[];
    next_allowed_task: string;
  };
  recommended_next_task: string;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function committedScopeFiles(): string[] {
  try {
    return execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .sort();
  } catch {
    return [];
  }
}

describe("MBTI-CMS-16 profile dry-run approval package", () => {
  it("regenerates the profile dry-run approval package without production mutation", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-16-PROFILE-DRY-RUN-APPROVAL-PACKAGE",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      profile_record_count: 5,
      import_candidate_count: 4,
      verify_only_count: 1,
      final_decision: "PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY",
    });
  });

  it("maps only CONTENT-15 profile assets into reviewable CMS dry-run records", () => {
    const report = readJson<DryRunReport>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-16");
    expect(report.final_decision).toBe("PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY");
    expect(report.summary).toEqual({
      profile_record_count: 5,
      import_candidate_count: 4,
      verify_only_count: 1,
      locale_count: 1,
      validation_failure_count: 0,
    });
    expect(report.records.map((record) => record.target_path)).toEqual([
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
      "/zh/personality/intp-a",
    ]);
    expect(report.records.every((record) => record.cms_resource === "personality_profile")).toBe(true);
    expect(report.records.every((record) => !record.target_path.includes("-vs-"))).toBe(true);
    expect(report.blockers).toEqual([]);
  });

  it("separates import candidates from the INTP-A verify-only record", () => {
    const report = readJson<DryRunReport>(JSON_PATH);
    const candidates = report.records.filter((record) => record.import_candidate);
    const verifyOnly = report.records.find((record) => record.target_path === "/zh/personality/intp-a");

    expect(candidates.map((record) => record.target_path)).toEqual([
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
    ]);
    for (const record of candidates) {
      expect(record.dry_run_operation).toBe("upsert_profile_content_draft");
      expect(record.approval_state).toBe("pending_operator_review");
      expect(record.required_approval_before_import).toBe(true);
      expect(record.dry_run_payload.sections).toHaveLength(8);
      expect(record.dry_run_payload.faq).toHaveLength(9);
      expect(record.validation).toMatchObject({
        status: "pass",
        errors: [],
        section_count: 8,
        faq_count: 9,
        internal_link_count: 5,
        private_result_boundary_ok: true,
        indexability_held: true,
      });
    }

    expect(verifyOnly).toMatchObject({
      target_path: "/zh/personality/intp-a",
      dry_run_operation: "verify_existing_profile_projection_only",
      approval_state: "verify_only_not_import_candidate",
      import_candidate: false,
      required_approval_before_import: false,
    });
    expect(verifyOnly?.dry_run_payload.no_body_rewrite).toBe(true);
    expect(verifyOnly?.dry_run_payload.internal_links).toHaveLength(5);
  });

  it("contains explicit backend field mapping and authority boundaries", () => {
    const report = readJson<DryRunReport>(JSON_PATH);
    const requiredPayloadFields = [
      "title",
      "summary",
      "seo",
      "canonical",
      "robots",
      "sections",
      "faq",
      "internal_links",
      "method_boundary",
    ];

    expect(report.schema_mapping).toMatchObject({
      authority: "fap-api CMS personality_profile import dry-run",
      source_of_truth_after_approval: "backend CMS/API",
      frontend_role: "render CMS/API output only",
    });
    expect(report.schema_mapping.required_payload_fields).toEqual(requiredPayloadFields);

    for (const record of report.records) {
      expect(record.field_mapping).toMatchObject({
        title: "seo.title",
        meta_description: "seo.meta_description",
        h1: "display.heading",
        sections: "content_sections[]",
        faq: "faq_items[]",
        internal_links: "related_links[]",
      });
      expect(record.production_write_allowed).toBe(false);
      expect(record.dry_run_payload.internal_links.every((link) => link.safe_public_route)).toBe(true);
    }
  });

  it("keeps CMS writes, frontend fallback, indexability, GSC, and deploy out of scope", () => {
    const report = readJson<DryRunReport>(JSON_PATH);

    expect(Object.values(report.qa_gates).every((gate) => gate.status === "pass")).toBe(true);
    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      dry_run_package_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
      sitemap_llms_mutation_attempted: false,
      gsc_api_call_attempted: false,
      gsc_request_indexing_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
    });
    expect(report.approval_packet.approval_required_for).toHaveLength(4);
    expect(report.approval_packet.verify_only_not_imported).toEqual(["/zh/personality/intp-a"]);
    expect(report.recommended_next_task).toBe("MBTI-CMS-17 comparison dry-run approval package");
  });

  it("emits reviewable markdown and CSV side outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-16 Profile Dry-Run Approval Package");
    expect(md).toContain("No CMS write.");
    expect(md).toContain("| /zh/personality/istj-a | ISTJ-A | upsert_profile_content_draft |");
    expect(csv.split("\n")[0]).toBe(
      [
        "target_path",
        "code",
        "locale",
        "dry_run_operation",
        "approval_state",
        "import_candidate",
        "section_count",
        "faq_count",
        "internal_link_count",
        "validation_status",
      ].join(","),
    );
  });

  it("supports temporary output paths for local dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-cms-16-"));
    const outputJson = path.join(tempDir, "cms-16.json");
    const outputMd = path.join(tempDir, "cms-16.md");
    const outputCsv = path.join(tempDir, "cms-16.csv");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`, `--output-csv=${outputCsv}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as DryRunReport;

    expect(result.ok).toBe(true);
    expect(report.summary.profile_record_count).toBe(5);
    expect(report.blockers).toEqual([]);
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
  });

  it("keeps the PR scoped to CMS-16 artifacts, contract, and train ledger", () => {
    const changed = committedScopeFiles();
    const allowed = [
      /^docs\/codex\/pr-train-state\.json$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/seo\/personality\/mbti-cms-16-/,
      /^scripts\/seo\/build-mbti-cms-16-/,
      /^tests\/contracts\/mbti-cms-16-/,
      /^tests\/contracts\/security-123-web-05-/,
      /^tests\/contracts\/helpers\/currentPrScope\.ts$/,
      /^generated\/pr-train-sidecar-issues\//,
    ];

    const outsideScope = changed.filter((file) => !allowed.some((pattern) => pattern.test(file)));
    expect(outsideScope).toEqual([]);
  });
});
