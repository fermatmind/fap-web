import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-cms-22-import-dry-run-final.mjs";
const JSON_PATH = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-cms-22-import-dry-run-final-2026-07-05.csv";

type RecordGate = {
  target_path: string;
  kind: "profile" | "comparison";
  locale: string;
  slug: string;
  cms_resource: "personality_profile" | "personality_comparison";
  cms_key: Record<string, string>;
  exact_payload_sha256: string;
  schema_validation: {
    status: "pass" | "fail";
    errors: string[];
    section_keys: string[];
    faq_count: number;
    seo_title_present: boolean;
    canonical_matches_target_url: boolean;
    indexability_held: boolean;
  };
};

type Report = {
  id: string;
  artifact: string;
  final_decision: string;
  summary: {
    import_record_count: number;
    profile_import_count: number;
    comparison_import_count: number;
    verify_only_record_count: number;
    validation_failure_count: number;
  };
  final_import_scope: {
    profiles: string[];
    comparisons: string[];
    verify_only_not_imported: string[];
  };
  exact_package: {
    package_id: string;
    package_sha256: string;
    production_write_allowed: boolean;
    records: Array<{ exact_payload_sha256: string }>;
  };
  safety_boundary: Record<string, boolean>;
  records: RecordGate[];
  verify_only_records: Array<{ target_path: string; no_body_rewrite: boolean }>;
  blockers: string[];
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function changedScopeFiles(): string[] {
  const files = [
    ...execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
    ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" }).split("\n"),
  ];
  const ignoredRunnerDrift = [
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
    "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
  ];

  return [...new Set(files.map((line) => line.trim()).filter(Boolean))]
    .filter((file) => !ignoredRunnerDrift.includes(file))
    .sort();
}

describe("MBTI-CMS-22 import dry-run final", () => {
  it("regenerates the final CMS dry-run package", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CMS-22-CMS-IMPORT-DRY-RUN-FINAL",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      import_record_count: 9,
      profile_import_count: 4,
      comparison_import_count: 5,
      verify_only_record_count: 1,
      final_decision: "PASS_CMS_IMPORT_DRY_RUN_FINAL_READY_FOR_AUTHORIZATION_PACKAGE",
    });
  });

  it("keeps the exact import scope to approved profiles and comparisons", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.id).toBe("MBTI-CMS-22");
    expect(report.summary).toEqual({
      import_record_count: 9,
      profile_import_count: 4,
      comparison_import_count: 5,
      verify_only_record_count: 1,
      validation_failure_count: 0,
    });
    expect(report.final_import_scope.profiles).toEqual([
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
    ]);
    expect(report.final_import_scope.comparisons).toEqual([
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    expect(report.final_import_scope.verify_only_not_imported).toEqual(["/zh/personality/intp-a"]);
    expect(report.verify_only_records).toEqual([
      expect.objectContaining({ target_path: "/zh/personality/intp-a", no_body_rewrite: true }),
    ]);
  });

  it("validates schema, slug, locale, section keys, FAQ, SEO, and indexability for every import record", () => {
    const report = readJson<Report>(JSON_PATH);

    for (const record of report.records) {
      expect(record.locale).toBe("zh-CN");
      expect(record.target_path).toBe(`/zh/personality/${record.slug}`);
      expect(record.schema_validation.status).toBe("pass");
      expect(record.schema_validation.errors).toEqual([]);
      expect(record.schema_validation.seo_title_present).toBe(true);
      expect(record.schema_validation.canonical_matches_target_url).toBe(true);
      expect(record.schema_validation.indexability_held).toBe(true);
      expect(record.exact_payload_sha256).toMatch(/^[a-f0-9]{64}$/);
      if (record.kind === "profile") {
        expect(record.cms_resource).toBe("personality_profile");
        expect(record.schema_validation.faq_count).toBeGreaterThanOrEqual(8);
        expect(record.schema_validation.section_keys).toEqual([
          "direct_answer",
          "who_it_fits",
          "who_it_does_not_fit",
          "common_misunderstanding",
          "at_difference",
          "career_scenario",
          "relationship_scenario",
          "stress_scenario",
        ]);
      } else {
        expect(record.cms_resource).toBe("personality_comparison");
        expect(record.schema_validation.faq_count).toBeGreaterThanOrEqual(5);
        expect(record.schema_validation.section_keys).toEqual([
          "direct_answer",
          "quick_judgment_table",
          "easy_misread",
          "real_scenario_differences",
          "do_not_misjudge",
          "next_reading",
        ]);
      }
    }
    expect(report.blockers).toEqual([]);
  });

  it("emits an exact package with stable payload hashes and no production write permission", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.exact_package.package_id).toBe("mbti-cms-22-final-dry-run-2026-07-05");
    expect(report.exact_package.package_sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(report.exact_package.production_write_allowed).toBe(false);
    expect(report.exact_package.records).toHaveLength(9);
    expect(report.exact_package.records.every((record) => /^[a-f0-9]{64}$/.test(record.exact_payload_sha256))).toBe(true);
  });

  it("keeps CMS writes, frontend fallback, indexability mutation, GSC, and deploy out of scope", () => {
    const report = readJson<Report>(JSON_PATH);

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      final_dry_run_package_only: true,
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
  });

  it("emits readable markdown and CSV outputs", () => {
    const md = fs.readFileSync(path.join(ROOT, MD_PATH), "utf8");
    const csv = fs.readFileSync(path.join(ROOT, CSV_PATH), "utf8");

    expect(md).toContain("# MBTI-CMS-22 CMS Import Dry-Run Final");
    expect(md).toContain("Final decision: PASS_CMS_IMPORT_DRY_RUN_FINAL_READY_FOR_AUTHORIZATION_PACKAGE");
    expect(md).toContain("## Exact Package");
    expect(md).toContain("## Import Scope");
    expect(md).toContain("- /zh/personality/intp-a");
    expect(csv.split("\n")[0]).toBe(
      [
        "target_path",
        "kind",
        "cms_resource",
        "locale",
        "slug",
        "code",
        "schema_status",
        "error_count",
        "payload_sha256",
      ].join(","),
    );
  });

  it("supports temporary output paths for local dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-cms-22-"));
    const outputJson = path.join(tempDir, "cms-22.json");
    const outputMd = path.join(tempDir, "cms-22.md");
    const outputCsv = path.join(tempDir, "cms-22.csv");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`, `--output-csv=${outputCsv}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as Report;

    expect(result.ok).toBe(true);
    expect(report.summary.import_record_count).toBe(9);
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
  });

  it("keeps the current worktree scoped to CMS-22 artifacts, script, test, and train ledger", () => {
    const state = readJson<{ current_pr?: string }>("docs/codex/pr-train-state.json");
    if (state.current_pr !== "MBTI-CMS-22") {
      expect(state.current_pr).toMatch(/^MBTI-/);
      return;
    }

    const changed = changedScopeFiles();
    const allowed = [
      /^docs\/codex\/pr-train-state\.json$/,
      /^docs\/codex\/pr-train\.yaml$/,
      /^docs\/seo\/personality\/mbti-cms-22-/,
      /^scripts\/seo\/build-mbti-cms-22-/,
      /^tests\/contracts\/mbti-cms-22-/,
      /^tests\/contracts\/mbti-cms-21-comparison-approval-review\.contract\.test\.ts$/,
      /^generated\/pr-train-sidecar-issues\//,
    ];

    expect(changed.every((file) => allowed.some((pattern) => pattern.test(file)))).toBe(true);
  });
});
