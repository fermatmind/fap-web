import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-17-comparison-dry-run-approval-package.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-17-comparison-dry-run-approval-package-2026-07-05.csv";

type DryRunRecord = {
  target_path: string;
  comparison_pair: string[];
  comparison_kind: "at_comparison" | "hot_cross_type_comparison";
  cms_resource: string;
  dry_run_operation: string;
  approval_state: string;
  import_candidate: boolean;
  field_mapping: Record<string, string>;
  dry_run_payload: {
    comparison_pair: string[];
    sections: Array<{ key: string; rows?: unknown[] }>;
    faq: unknown[];
    internal_links: Array<{ href: string; safe_public_route: boolean }>;
  };
  validation: {
    status: "pass" | "fail";
    errors: string[];
    section_keys: string[];
    section_count: number;
    faq_count: number;
    internal_link_count: number;
    quick_judgment_rows: number;
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
    comparison_record_count: number;
    at_comparison_count: number;
    hot_cross_type_count: number;
    import_candidate_count: number;
    locale_count: number;
    validation_failure_count: number;
  };
  dependency_artifact: { id: string; path: string };
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
    next_allowed_task: string;
    still_forbidden: string[];
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

describe("MBTI-CMS-17 comparison dry-run approval package", () => {
  it("regenerates the comparison dry-run approval package without production mutation", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-17-COMPARISON-DRY-RUN-APPROVAL-PACKAGE",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      comparison_record_count: 5,
      at_comparison_count: 1,
      hot_cross_type_count: 4,
      validation_failure_count: 0,
      final_decision: "PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY",
    });
    expect(result.package_sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("maps only CONTENT-15 comparison assets into CMS dry-run records", () => {
    const report = readJson<DryRunReport>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-17");
    expect(report.final_decision).toBe("PASS_COMPARISON_DRY_RUN_APPROVAL_PACKAGE_READY");
    expect(report.dependency_artifact.id).toBe("MBTI-CMS-16");
    expect(report.summary).toEqual({
      comparison_record_count: 5,
      at_comparison_count: 1,
      hot_cross_type_count: 4,
      import_candidate_count: 5,
      locale_count: 1,
      validation_failure_count: 0,
    });
    expect(report.records.map((record) => record.target_path)).toEqual([
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(report.records.every((record) => record.cms_resource === "personality_comparison")).toBe(true);
    expect(report.records.every((record) => record.target_path.includes("-vs-"))).toBe(true);
    expect(report.blockers).toEqual([]);
  });

  it("keeps A/T and hot cross-type comparison queues separated", () => {
    const report = readJson<DryRunReport>(JSON_PATH);
    const atComparisons = report.records.filter((record) => record.comparison_kind === "at_comparison");
    const hotComparisons = report.records.filter((record) => record.comparison_kind === "hot_cross_type_comparison");

    expect(atComparisons.map((record) => record.target_path)).toEqual(["/zh/personality/intp-a-vs-intp-t"]);
    expect(hotComparisons.map((record) => record.target_path)).toEqual([
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(atComparisons[0]?.comparison_pair).toEqual(["INTP-A", "INTP-T"]);
    expect(hotComparisons[0]?.comparison_pair).toEqual(["INTJ", "INTP"]);
  });

  it("requires the GEO comparison sections, FAQ, links, and indexability hold for every record", () => {
    const report = readJson<DryRunReport>(JSON_PATH);
    const requiredSectionKeys = [
      "direct_answer",
      "quick_judgment_table",
      "easy_misread",
      "real_scenario_differences",
      "do_not_misjudge",
    ];

    for (const record of report.records) {
      expect(record.dry_run_operation).toBe("upsert_comparison_content_draft");
      expect(record.approval_state).toBe("pending_operator_review");
      expect(record.import_candidate).toBe(true);
      expect(record.required_approval_before_import).toBe(true);
      for (const key of requiredSectionKeys) {
        expect(record.validation.section_keys).toContain(key);
      }
      expect(record.validation).toMatchObject({
        status: "pass",
        errors: [],
        section_count: 6,
        faq_count: 5,
        private_result_boundary_ok: true,
        indexability_held: true,
      });
      expect(record.validation.quick_judgment_rows).toBeGreaterThanOrEqual(3);
      expect(record.validation.internal_link_count).toBeGreaterThanOrEqual(3);
      expect(record.dry_run_payload.internal_links.every((link) => link.safe_public_route)).toBe(true);
    }
  });

  it("contains explicit backend comparison field mapping and authority boundaries", () => {
    const report = readJson<DryRunReport>(JSON_PATH);

    expect(report.schema_mapping).toMatchObject({
      authority: "fap-api CMS personality_comparison import dry-run",
      source_of_truth_after_approval: "backend CMS/API",
      frontend_role: "render CMS/API output only",
    });
    expect(report.schema_mapping.required_payload_fields).toEqual([
      "title",
      "summary",
      "seo",
      "canonical",
      "robots",
      "comparison_pair",
      "sections",
      "faq",
      "internal_links",
      "method_boundary",
    ]);

    for (const record of report.records) {
      expect(record.field_mapping).toMatchObject({
        title: "seo.title",
        meta_description: "seo.meta_description",
        comparison_pair: "comparison.pair",
        direct_answer: "content_sections.direct_answer",
        quick_judgment_table: "content_sections.quick_judgment_table",
        easy_misread: "content_sections.easy_misread",
        real_scenario_differences: "content_sections.real_scenario_differences",
        do_not_misjudge: "content_sections.do_not_misjudge",
        faq: "faq_items[]",
        internal_links: "related_links[]",
      });
      expect(record.production_write_allowed).toBe(false);
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
    expect(report.approval_packet.approval_required_for).toHaveLength(5);
    expect(report.approval_packet.still_forbidden).toContain("sitemap/llms URL expansion");
    expect(report.recommended_next_task).toBe("MBTI-INDEX-18 sitemap / llms / indexability gate");
  });

  it("emits reviewable markdown and CSV side outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-17 Comparison Dry-Run Approval Package");
    expect(md).toContain("No CMS write.");
    expect(md).toContain("| /zh/personality/intp-a-vs-intp-t | INTP-A vs INTP-T | at_comparison |");
    expect(md).toContain("| /zh/personality/entj-vs-intj | ENTJ vs INTJ | hot_cross_type_comparison |");
    expect(csv.split("\n")[0]).toBe(
      [
        "target_path",
        "pair",
        "comparison_kind",
        "dry_run_operation",
        "approval_state",
        "section_count",
        "quick_judgment_rows",
        "faq_count",
        "internal_link_count",
        "validation_status",
      ].join(","),
    );
  });

  it("supports temporary output paths for local dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-cms-17-"));
    const outputJson = path.join(tempDir, "cms-17.json");
    const outputMd = path.join(tempDir, "cms-17.md");
    const outputCsv = path.join(tempDir, "cms-17.csv");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`, `--output-csv=${outputCsv}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as DryRunReport;

    expect(result.ok).toBe(true);
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
    expect(report.summary.comparison_record_count).toBe(5);
  });

  it("keeps committed file scope inside MBTI-CMS-17 allowlist", () => {
    const changed = committedScopeFiles();
    const touchesCms17Scope = changed.some((file) =>
      [
        /^docs\/seo\/personality\/mbti-cms-17-/,
        /^scripts\/seo\/build-mbti-cms-17-/,
        /^tests\/contracts\/mbti-cms-17-/,
      ].some((pattern) => pattern.test(file)),
    );
    if (!touchesCms17Scope) {
      expect(changed.length).toBeGreaterThanOrEqual(0);
      return;
    }
    const allowedPatterns = [
      /^docs\/seo\/personality\/mbti-cms-17-/,
      /^scripts\/seo\/build-mbti-cms-17-/,
      /^tests\/contracts\/mbti-cms-17-/,
      /^tests\/contracts\/mbti-cms-16-profile-dry-run-approval-package\.contract\.test\.ts$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/codex\/pr-train-state\.json$/,
      /^generated\/pr-train-sidecar-issues\//,
    ];

    for (const file of changed) {
      expect(allowedPatterns.some((pattern) => pattern.test(file))).toBe(true);
    }
  });
});
