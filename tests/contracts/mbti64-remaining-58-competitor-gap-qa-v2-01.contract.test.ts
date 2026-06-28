import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/validate-mbti64-remaining-58-competitor-gap-qa-v2.mjs";
const QA_JSON = "docs/seo/personality/mbti64-remaining-58-competitor-gap-qa-v2-2026-06-28.json";
const QA_MD = "docs/seo/personality/mbti64-remaining-58-competitor-gap-qa-v2-2026-06-28.md";
const PACKAGE_JSON = "docs/seo/personality/mbti64-remaining-58-competitor-gap-content-expansion-v2-2026-06-28.json";

const ALLOWED_FILES = new Set([
  SCRIPT_PATH,
  QA_JSON,
  QA_MD,
  "tests/contracts/mbti64-remaining-58-competitor-gap-qa-v2-01.contract.test.ts",
]);

function currentBranch(): string {
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

type GateResult = {
  status: "pass" | "fail";
  failures: string[];
};

type PageResult = {
  target_url: string;
  path: string;
  locale: string;
  page_type: string;
  type_code: string;
  section_count: number;
  faq_count: number;
  gates: Record<string, GateResult>;
  qa_decision: string;
  blocked_reason: string | null;
};

type QaReport = {
  artifact: string;
  input_artifact: string;
  final_decision: string;
  recommended_next_task: string;
  page_results: PageResult[];
  summary: {
    target_count: number;
    pass_count: number;
    blocked_count: number;
    variant_pages: number;
    comparison_pages: number;
    completed_v2_exclusion_count: number;
    section_count_min: number;
    section_count_max: number;
    faq_count_min: number;
    faq_count_max: number;
    duplicate_signature_group_count: number;
  };
  gate_totals: Record<string, { passed: number; failed: number }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
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

describe("MBTI64-REMAINING-58-COMPETITOR-GAP-QA-V2-01", () => {
  it("regenerates a pass QA-V2 artifact for the remaining 58 package", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      output_json: QA_JSON,
      output_md: QA_MD,
      final_decision: "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC",
      rows_evaluated: 58,
      rows_passed: 58,
      rows_blocked: 0,
    });
  });

  it("keeps the QA result bounded to remaining MBTI64 variant pages", () => {
    const report = readJson<QaReport>(QA_JSON);
    const excluded = new Set([
      "/zh/personality/intp-a",
      "/en/personality/intp-a",
      "/zh/personality/esfp-a",
      "/en/personality/esfp-a",
      "/en/personality/enfj-a",
      "/zh/personality/enfj-a",
    ]);

    expect(report.artifact).toBe("MBTI64-REMAINING-58-COMPETITOR-GAP-QA-V2-01");
    expect(report.input_artifact).toBe(PACKAGE_JSON);
    expect(report.final_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
    expect(report.recommended_next_task).toBe("MBTI64-REMAINING-58-COMPETITOR-GAP-ARTIFACT-SYNC-01");
    expect(report.blockers).toEqual([]);
    expect(report.summary).toMatchObject({
      target_count: 58,
      pass_count: 58,
      blocked_count: 0,
      variant_pages: 58,
      comparison_pages: 0,
      completed_v2_exclusion_count: 0,
      section_count_min: 8,
      section_count_max: 8,
      faq_count_min: 9,
      faq_count_max: 9,
      duplicate_signature_group_count: 0,
    });

    expect(report.page_results).toHaveLength(58);
    expect(report.page_results.some((row) => excluded.has(row.path))).toBe(false);
    expect(report.page_results.every((row) => row.page_type === "variant")).toBe(true);
    expect(report.page_results.every((row) => !row.path.includes("-vs-"))).toBe(true);
    expect(report.page_results.every((row) => row.qa_decision === "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC")).toBe(true);
  });

  it("passes all stricter QA-V2 gates without CMS/search/runtime mutation", () => {
    const report = readJson<QaReport>(QA_JSON);
    const expectedGates = [
      "inventory_gate",
      "structure_gate",
      "trademark_affiliation_gate",
      "deterministic_claim_gate",
      "clinical_recruiting_gate",
      "competitor_copy_gate",
      "duplicate_template_gate",
      "private_route_gate",
      "bilingual_structure_parity_gate",
    ];

    expect(Object.keys(report.gate_totals)).toEqual(expectedGates);
    for (const gate of expectedGates) {
      expect(report.gate_totals[gate]).toEqual({ passed: 58, failed: 0 });
    }

    for (const row of report.page_results) {
      expect(Object.keys(row.gates)).toEqual(expectedGates);
      expect(Object.values(row.gates).every((gate) => gate.status === "pass")).toBe(true);
      expect(row.blocked_reason).toBeNull();
    }

    expect(report.safety_boundary).toMatchObject({
      artifact_only: true,
      cms_write: false,
      approval_queue_write: false,
      live_promotion: false,
      publish_index_search: false,
      sitemap_llms_mutation: false,
      search_queue_mutation: false,
      indexnow_submit: false,
      frontend_runtime_change: false,
      url_truth_write: false,
      production_deploy: false,
      external_api_call: false,
    });
  });

  it("supports temporary output paths for dry-run validation", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti64-remaining-58-qa-v2-"));
    const outputJson = path.join(tempDir, "qa-v2.json");
    const outputMd = path.join(tempDir, "qa-v2.md");
    const stdout = execFileSync(
      "node",
      [SCRIPT_PATH, `--output-json=${outputJson}`, `--output-md=${outputMd}`],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(outputJson, "utf8")) as QaReport;

    expect(result.ok).toBe(true);
    expect(report.final_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
    expect(report.summary.target_count).toBe(58);
    expect(fs.existsSync(outputMd)).toBe(true);
  });

  it("keeps changed files inside the QA-V2 artifact-only scope", () => {
    if (currentBranch() !== "codex/mbti64-remaining-58-competitor-gap-qa-v2-01") {
      expect(currentBranch()).not.toBe("codex/mbti64-remaining-58-competitor-gap-qa-v2-01");
      return;
    }

    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(files.every((file) => ALLOWED_FILES.has(file)), files.join("\n")).toBe(true);
  });
});
