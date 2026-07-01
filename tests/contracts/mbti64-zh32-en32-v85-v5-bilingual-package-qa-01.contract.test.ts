import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs";
const PACKAGE_JSON =
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.json";
const PACKAGE_MD =
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.md";
const QA_JSON = "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-2026-07-01.json";
const QA_MD = "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-2026-07-01.md";

const ALLOWED_FILES = new Set([
  SCRIPT_PATH,
  PACKAGE_JSON,
  PACKAGE_MD,
  QA_JSON,
  QA_MD,
  "tests/contracts/mbti64-zh32-en32-v85-v5-bilingual-package-qa-01.contract.test.ts",
]);

const TYPES = [
  "intj",
  "intp",
  "entj",
  "entp",
  "infj",
  "infp",
  "enfj",
  "enfp",
  "istj",
  "isfj",
  "estj",
  "esfj",
  "istp",
  "isfp",
  "estp",
  "esfp",
];

type GateResult = { status: "pass" | "fail"; failures: string[] };
type Recommendation = {
  target_url: string;
  path: string;
  locale: "zh" | "en";
  framework: string;
  page_type: string;
  type_code: string;
  variant: "a" | "t";
  h1: string;
  seo: {
    title: string;
    description: string;
    primary_keywords: string[];
    search_intents: string[];
  };
  geo_summary: Record<string, unknown>;
  reader_experience: Record<string, unknown>;
  modules: Array<Record<string, unknown>>;
  faq: Array<Record<string, unknown>>;
  internal_links: Array<Record<string, unknown>>;
  source_ledger: Array<Record<string, unknown>>;
};
type PackageArtifact = {
  artifact: string;
  status: string;
  target_count: number;
  final_decision: string;
  package_sha256: string;
  summary: {
    zh_pages: number;
    en_pages: number;
    variant_pages: number;
    comparison_pages: number;
    qa_pass_count: number;
    qa_blocked_count: number;
  };
  safety_boundary: Record<string, boolean>;
  recommendations: Recommendation[];
  blockers: string[];
};
type QaArtifact = {
  artifact: string;
  input_artifact: string;
  input_package_sha256: string;
  final_decision: string;
  recommended_next_task: string;
  summary: {
    target_count: number;
    pass_count: number;
    blocked_count: number;
    zh_pages: number;
    en_pages: number;
    variant_pages: number;
    comparison_pages: number;
    source_qa_pass: boolean;
  };
  gate_totals: Record<string, { passed: number; failed: number }>;
  page_results: Array<{
    path: string;
    locale: string;
    page_type: string;
    type_code: string;
    variant: string;
    gates: Record<string, GateResult>;
    qa_decision: string;
    blocked_reason: string | null;
  }>;
  safety_boundary: Record<string, boolean>;
  blockers: string[];
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

function currentBranch(): string {
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
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
      // Local and CI ref availability can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

function expectedPaths(): string[] {
  return ["zh", "en"].flatMap((locale) =>
    TYPES.flatMap((type) => ["a", "t"].map((variant) => `/${locale}/personality/${type}-${variant}`)),
  );
}

describe("MBTI64-ZH32-EN32-V8_5-V5-BILINGUAL-PACKAGE-QA-01", () => {
  it("regenerates the bilingual package and QA artifacts", () => {
    const stdout = execFileSync("node", [SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const result = JSON.parse(stdout);

    expect(result).toMatchObject({
      ok: true,
      package_json: PACKAGE_JSON,
      package_md: PACKAGE_MD,
      qa_json: QA_JSON,
      qa_md: QA_MD,
      rows_evaluated: 64,
      rows_passed: 64,
      rows_blocked: 0,
      final_decision: "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC",
    });
  });

  it("contains exactly the zh32 and en32 MBTI64 variant inventory", () => {
    const artifact = readJson<PackageArtifact>(PACKAGE_JSON);
    const paths = artifact.recommendations.map((row) => row.path).sort();

    expect(artifact.artifact).toBe("MBTI64-ZH32-EN32-V8_5-V5-BILINGUAL-PACKAGE-QA-01");
    expect(artifact.status).toBe("pass");
    expect(artifact.final_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
    expect(artifact.target_count).toBe(64);
    expect(artifact.blockers).toEqual([]);
    expect(artifact.summary).toMatchObject({
      zh_pages: 32,
      en_pages: 32,
      variant_pages: 64,
      comparison_pages: 0,
      qa_pass_count: 64,
      qa_blocked_count: 0,
    });
    expect(paths).toEqual(expectedPaths().sort());
    expect(paths.every((pagePath) => !pagePath.includes("-vs-"))).toBe(true);
  });

  it("keeps zh/en type and variant pairs aligned", () => {
    const artifact = readJson<PackageArtifact>(PACKAGE_JSON);
    const zhKeys = new Set(
      artifact.recommendations
        .filter((row) => row.locale === "zh")
        .map((row) => `${row.type_code}-${row.variant}`),
    );
    const enKeys = new Set(
      artifact.recommendations
        .filter((row) => row.locale === "en")
        .map((row) => `${row.type_code}-${row.variant}`),
    );

    expect(zhKeys).toEqual(enKeys);
    expect(zhKeys.size).toBe(32);
  });

  it("preserves SEO, GEO, modules, FAQ, links, source ledger, and reader blocks", () => {
    const artifact = readJson<PackageArtifact>(PACKAGE_JSON);

    for (const row of artifact.recommendations) {
      expect(row.framework).toBe("mbti64");
      expect(row.page_type).toBe("variant");
      expect(row.target_url).toBe(`https://fermatmind.com${row.path}`);
      expect(row.h1.length).toBeGreaterThan(6);
      expect(row.seo.title.length).toBeGreaterThan(20);
      expect(row.seo.description.length).toBeGreaterThan(60);
      expect(row.seo.primary_keywords.length).toBeGreaterThanOrEqual(5);
      expect(row.seo.search_intents.length).toBeGreaterThanOrEqual(4);
      expect(row.geo_summary.direct_answer).toBeTruthy();
      expect(row.reader_experience.thirty_second_overview).toBeTruthy();
      expect(row.reader_experience.ai_search_answer).toBeTruthy();
      expect(row.reader_experience.strengths).toBeTruthy();
      expect(row.reader_experience.watch_outs).toBeTruthy();
      expect(row.modules).toHaveLength(10);
      expect(row.faq.length).toBeGreaterThanOrEqual(10);
      expect(row.faq.length).toBeLessThanOrEqual(12);
      expect(row.internal_links.length).toBeGreaterThanOrEqual(6);
      expect(row.source_ledger.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("passes all QA gates without mutation or publication side effects", () => {
    const artifact = readJson<PackageArtifact>(PACKAGE_JSON);
    const qa = readJson<QaArtifact>(QA_JSON);

    expect(qa.final_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
    expect(qa.recommended_next_task).toBe("MBTI64-ZH32-EN32-V8_5-V5-ARTIFACT-SYNC-01");
    expect(qa.input_artifact).toBe(PACKAGE_JSON);
    expect(qa.input_package_sha256).toBe(artifact.package_sha256);
    expect(qa.summary).toMatchObject({
      target_count: 64,
      pass_count: 64,
      blocked_count: 0,
      zh_pages: 32,
      en_pages: 32,
      variant_pages: 64,
      comparison_pages: 0,
      source_qa_pass: true,
    });
    expect(qa.blockers).toEqual([]);

    for (const totals of Object.values(qa.gate_totals)) {
      expect(totals).toEqual({ passed: 64, failed: 0 });
    }
    for (const row of qa.page_results) {
      expect(row.qa_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
      expect(row.blocked_reason).toBeNull();
      expect(Object.values(row.gates).every((gate) => gate.status === "pass")).toBe(true);
    }

    expect(artifact.safety_boundary).toMatchObject({
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
    expect(qa.safety_boundary).toMatchObject(artifact.safety_boundary);
  });

  it("supports temporary dry-run output paths", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mbti64-bilingual-package-"));
    const packageJson = path.join(dir, "package.json");
    const packageMd = path.join(dir, "package.md");
    const qaJson = path.join(dir, "qa.json");
    const qaMd = path.join(dir, "qa.md");
    const stdout = execFileSync(
      "node",
      [
        SCRIPT_PATH,
        `--output-package=${packageJson}`,
        `--output-package-md=${packageMd}`,
        `--output-qa=${qaJson}`,
        `--output-qa-md=${qaMd}`,
      ],
      { cwd: ROOT, encoding: "utf8" },
    );
    const result = JSON.parse(stdout);
    const qa = JSON.parse(fs.readFileSync(qaJson, "utf8")) as QaArtifact;

    expect(result.ok).toBe(true);
    expect(fs.existsSync(packageJson)).toBe(true);
    expect(fs.existsSync(packageMd)).toBe(true);
    expect(fs.existsSync(qaMd)).toBe(true);
    expect(qa.summary.target_count).toBe(64);
    expect(qa.summary.pass_count).toBe(64);
  });

  it("keeps changed files inside the declared artifact-only scope", () => {
    if (currentBranch() !== "codex/mbti64-zh32-en32-v8-5-v5-bilingual-package-qa-01") {
      expect(currentBranch()).not.toBe("codex/mbti64-zh32-en32-v8-5-v5-bilingual-package-qa-01");
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
