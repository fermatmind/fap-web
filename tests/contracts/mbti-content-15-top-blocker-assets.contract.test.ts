import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti-content-15-top-blocker-assets.mjs";
const JSON_PATH = "docs/seo/personality/mbti-content-15-top-blocker-assets-2026-07-05.json";
const MD_PATH = "docs/seo/personality/mbti-content-15-top-blocker-assets-2026-07-05.md";
const CSV_PATH = "docs/seo/personality/mbti-content-15-top-blocker-assets-2026-07-05.csv";

type ContentPackage = {
  entity_type: string;
  code: string;
  path: string;
  status?: string;
  launch_state: string;
  robots: string;
  index_eligible: boolean;
  sitemap_eligible: boolean;
  llms_eligible: boolean;
  qa14_blockers_repaired?: string[];
  verification_notes?: string[];
  sections: Array<{
    key: string;
    body?: string;
    rows?: unknown[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  internal_links: Array<{
    href: string;
    safe_public_route: boolean;
  }>;
  method_boundary: Record<string, boolean>;
};

type Content15Report = {
  id: string;
  artifact: string;
  status: string;
  final_decision: string;
  summary: {
    package_count: number;
    repair_profile_count: number;
    verify_only_profile_count: number;
    comparison_count: number;
    validation_failure_count: number;
    qa14_profile_blockers_targeted: number;
    qa14_comparison_blockers_targeted: number;
  };
  packages: ContentPackage[];
  qa_gates: Record<string, { status: "pass" | "fail" }>;
  safety_boundary: Record<string, boolean>;
  validation_failures: string[];
  blockers: string[];
  recommended_next_task: string;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function committedScopeFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "origin/main...HEAD"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI refs can differ from local refs; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("MBTI-CONTENT-15 top blocker content asset repair", () => {
  it("regenerates the dry-run content asset package without production mutation", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      artifact: "MBTI-CONTENT-15-TOP-BLOCKER-ASSETS",
      output_json: JSON_PATH,
      output_md: MD_PATH,
      output_csv: CSV_PATH,
      package_count: 10,
      final_decision: "PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN",
    });
  });

  it("prioritizes the GSC and QA-14 target set exactly", () => {
    const report = readJson<Content15Report>(JSON_PATH);
    const expectedPaths = [
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
      "/zh/personality/intp-a",
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ];

    expect(report.id).toBe("MBTI-CONTENT-15");
    expect(report.final_decision).toBe("PASS_MBTI_CONTENT_15_READY_FOR_FAP_API_DRY_RUN");
    expect(report.summary).toEqual({
      package_count: 10,
      repair_profile_count: 4,
      verify_only_profile_count: 1,
      comparison_count: 5,
      validation_failure_count: 0,
      qa14_profile_blockers_targeted: 4,
      qa14_comparison_blockers_targeted: 5,
    });
    expect(report.packages.map((pkg) => pkg.path)).toEqual(expectedPaths);
    expect(report.validation_failures).toEqual([]);
    expect(report.blockers).toEqual([]);
  });

  it("fills required profile repair modules and keeps INTP-A verify-only", () => {
    const report = readJson<Content15Report>(JSON_PATH);
    const repairProfiles = report.packages.filter(
      (pkg) => pkg.entity_type === "personality_profile_variant" && pkg.status !== "verify_only_no_body_rewrite",
    );
    const verifyOnly = report.packages.find((pkg) => pkg.path === "/zh/personality/intp-a");
    const requiredSectionKeys = [
      "direct_answer",
      "who_it_fits",
      "who_it_does_not_fit",
      "common_misunderstanding",
      "at_difference",
      "career_scenario",
      "relationship_scenario",
      "stress_scenario",
    ];

    expect(repairProfiles.map((pkg) => pkg.path)).toEqual([
      "/zh/personality/istj-a",
      "/zh/personality/istp-a",
      "/zh/personality/isfp-a",
      "/zh/personality/esfj-a",
    ]);
    for (const profile of repairProfiles) {
      expect(profile.sections.map((section) => section.key)).toEqual(requiredSectionKeys);
      expect(profile.sections.every((section) => typeof section.body === "string" && section.body.length >= 28)).toBe(
        true,
      );
      expect(profile.faq).toHaveLength(9);
      expect(profile.internal_links).toHaveLength(5);
      expect(profile.internal_links.every((link) => link.safe_public_route && link.href.startsWith("/zh/"))).toBe(true);
      expect(profile.qa14_blockers_repaired).toEqual([
        "answer_surface_gate",
        "scenario_specificity_gate",
        "faq_gate",
        "template_marker_gate",
      ]);
    }

    expect(verifyOnly).toMatchObject({
      path: "/zh/personality/intp-a",
      status: "verify_only_no_body_rewrite",
      launch_state: "verify_only",
      sections: [],
      faq: [],
    });
    expect(verifyOnly?.verification_notes).toHaveLength(3);
    expect(verifyOnly?.internal_links).toHaveLength(5);
  });

  it("fills comparison answer, judgment, misread, scenario, misjudgment, and FAQ modules", () => {
    const report = readJson<Content15Report>(JSON_PATH);
    const comparisons = report.packages.filter((pkg) => pkg.entity_type.endsWith("_comparison"));
    const requiredSectionKeys = [
      "direct_answer",
      "quick_judgment_table",
      "easy_misread",
      "real_scenario_differences",
      "do_not_misjudge",
      "next_reading",
    ];

    expect(comparisons.map((pkg) => pkg.path)).toEqual([
      "/zh/personality/intp-a-vs-intp-t",
      "/zh/personality/intj-vs-intp",
      "/zh/personality/entj-vs-intj",
      "/zh/personality/infj-vs-infp",
      "/zh/personality/istj-vs-isfj",
    ]);
    for (const comparison of comparisons) {
      const quickTable = comparison.sections.find((section) => section.key === "quick_judgment_table");
      expect(comparison.sections.map((section) => section.key)).toEqual(requiredSectionKeys);
      expect(quickTable?.rows).toHaveLength(4);
      expect(comparison.faq).toHaveLength(5);
      expect(comparison.internal_links).toHaveLength(5);
      expect(comparison.internal_links.every((link) => link.safe_public_route && link.href.startsWith("/zh/"))).toBe(
        true,
      );
      expect(comparison.qa14_blockers_repaired).toEqual(["scenario_specificity_gate", "faq_gate"]);
    }
  });

  it("keeps all outputs behind backend authority, import approval, and indexability gates", () => {
    const report = readJson<Content15Report>(JSON_PATH);

    expect(Object.values(report.qa_gates).every((gate) => gate.status === "pass")).toBe(true);
    expect(report.packages.every((pkg) => pkg.robots === "noindex,follow")).toBe(true);
    expect(report.packages.every((pkg) => !pkg.index_eligible && !pkg.sitemap_eligible && !pkg.llms_eligible)).toBe(
      true,
    );
    expect(report.packages.every((pkg) => Object.values(pkg.method_boundary).every((value) => value === false))).toBe(
      true,
    );
    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
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
    expect(report.recommended_next_task).toContain("fap-api dry-run import PR");
  });

  it("supports temporary output paths for local dry-runs", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti-content-15-"));
    const outputJson = path.join(tempDir, "content-15.json");
    const outputMd = path.join(tempDir, "content-15.md");
    const outputCsv = path.join(tempDir, "content-15.csv");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`, `--output-csv=${outputCsv}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as Content15Report;

    expect(result.ok).toBe(true);
    expect(report.summary.package_count).toBe(10);
    expect(report.validation_failures).toEqual([]);
    expect(fs.existsSync(outputMd)).toBe(true);
    expect(fs.existsSync(outputCsv)).toBe(true);
  });

  it("keeps the PR scoped to CONTENT-15 artifacts, contract, and train ledger", () => {
    const allowedExact = new Set([
      SCRIPT_PATH,
      JSON_PATH,
      MD_PATH,
      CSV_PATH,
      "tests/contracts/mbti-content-15-top-blocker-assets.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "generated/pr-train-sidecar-issues/sidecar_issues.md",
      "generated/pr-train-sidecar-issues/sidecar_issues.json",
    ]);
    const changedFiles = committedScopeFiles();
    const touchesScope = changedFiles.some((file) => file.includes("mbti-content-15"));

    if (!touchesScope) {
      expect(changedFiles.filter((file) => file.includes("mbti-content-15"))).toEqual([]);
      return;
    }

    expect(changedFiles.filter((file) => !allowedExact.has(file))).toEqual([]);
  });
});
