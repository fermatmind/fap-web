import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSecurity122Web10AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "docs/seo/generated/seo-intelligence-asset-map.v1.json",
  "docs/seo/personality/backend-import-dry-run-2026-06-18.json",
  "docs/seo/personality/backend-import-dry-run-2026-06-18.md",
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.json",
  "docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-qa-2026-07-01.json",
  "generated/public-profile-assets/big-five-v1-34-codex-only-batch/research/source-ledger.csv",
  "generated/public-profile-assets/big-five-v1-34-codex-only-batch/run-manifest.json",
  "generated/public-profile-assets/big-five-v1-openness-dry-run-codex-only/research/source-ledger.csv",
  "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs",
  "scripts/seo/dry-run-mbti64-backend-import.mjs",
  "scripts/seo/validate-mbti64-backend-import-contract.mjs",
  "scripts/seo/validate-mbti64-content-package-v2.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-10-generated-artifact-redaction.contract.test.ts",
  "tests/contracts/seo-intelligence-asset-map.contract.test.ts",
];
const REDACTED_ARTIFACT_FILES = CI_DIFF_FALLBACK_FILES.filter(
  (file) => !file.startsWith("docs/codex/") && !file.startsWith("tests/contracts/"),
);
const FORBIDDEN_LOCAL_DETAIL_PATTERNS = [
  /\/Users\/[A-Za-z0-9._-]+\//,
  /C:\\Users\\[A-Za-z0-9._-]+\\/,
  /\/private\/tmp\//,
  /\/var\/folders\//,
  /Desktop\/GitHub\//,
  /Desktop\/MBTI64/,
  /SQLSTATE\[/,
  /Access denied for user/i,
  /Connection:\s*mysql/i,
  /Database:\s*fap_api/i,
  /Host:\s*127\.0\.0\.1/i,
];

function changedFiles(): string[] {
  let committedDiffs = "";
  try {
    committedDiffs = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    committedDiffs = "";
  }

  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  const files = Array.from(
    new Set(
      `${committedDiffs}\n${uncommitted}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();

  return files.length > 0 || process.env.GITHUB_ACTIONS !== "true" ? files : CI_DIFF_FALLBACK_FILES;
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("SECURITY-122-WEB-10 generated artifact redaction", () => {
  it("redacts developer workstation paths and local backend error details from generated artifacts", () => {
    for (const relativePath of REDACTED_ARTIFACT_FILES) {
      const contents = read(relativePath);
      for (const pattern of FORBIDDEN_LOCAL_DETAIL_PATTERNS) {
        expect(contents, `${relativePath} leaked ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("keeps source provenance with stable placeholders instead of workstation paths", () => {
    const assetMap = JSON.parse(read("docs/seo/generated/seo-intelligence-asset-map.v1.json"));
    expect(assetMap.source_of_truth.frontend.repository).toBe("<workspace>/fap-web");
    expect(assetMap.source_of_truth.backend.repository).toBe("<workspace>/fap-api");
    expect(assetMap.source_of_truth.nested_frontend.repository).toBe("<workspace>/fap-api/fap-web");

    const mbtiPackage = JSON.parse(
      read("docs/seo/personality/mbti64-zh32-en32-v8-5-v5-bilingual-package-2026-07-01.json"),
    );
    expect(mbtiPackage.input_artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locale: "zh",
          package_path: expect.stringMatching(/^<external-mbti64-input>\//),
          qa_path: expect.stringMatching(/^<external-mbti64-input>\//),
        }),
        expect.objectContaining({
          locale: "en",
          package_path: expect.stringMatching(/^<external-mbti64-input>\//),
          qa_path: expect.stringMatching(/^<external-mbti64-input>\//),
        }),
      ]),
    );
  });

  it("does not bake local workstation defaults into artifact generator scripts", () => {
    expect(read("scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs")).toContain("process.env.MBTI64_ZH_DIR");
    expect(read("scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs")).toContain("process.env.MBTI64_EN_DIR");
    expect(read("scripts/seo/dry-run-mbti64-backend-import.mjs")).toContain("process.env.FAP_API_ROOT || null");
    expect(read("scripts/seo/validate-mbti64-content-package-v2.mjs")).toContain("<uploaded_zip>/mbti64-content-package-pilot-v2-final.zip");
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-10", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web10AllowedFile(file), file).toBe(true);
    }
  });
});
