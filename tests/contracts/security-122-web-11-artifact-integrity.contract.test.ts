import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isSecurity122Web11AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CI_DIFF_FALLBACK_FILES = [
  "docs/codex/pr-train-state.json",
  "docs/codex/pr-train.yaml",
  "scripts/seo/artifactSafety.mjs",
  "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs",
  "scripts/seo/build-personality-agent-next-batch-6-handoff.mjs",
  "scripts/seo/dry-run-mbti64-backend-import.mjs",
  "scripts/seo/generate-duplicate-title-governance-report.mjs",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "scripts/seo/generate-url-inventory.mjs",
  "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
  "scripts/seo/rank-mbti64-agent-priorities.mjs",
  "scripts/seo/validate-mbti64-backend-import-contract.mjs",
  "scripts/seo/validate-mbti64-content-package-v2.mjs",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/security-122-web-11-artifact-integrity.contract.test.ts",
];
const GUARDED_SCRIPTS = [
  "scripts/seo/build-mbti64-zh32-en32-v85-v5-bilingual-package.mjs",
  "scripts/seo/build-personality-agent-next-batch-6-handoff.mjs",
  "scripts/seo/dry-run-mbti64-backend-import.mjs",
  "scripts/seo/generate-duplicate-title-governance-report.mjs",
  "scripts/seo/generate-seo-agent-fapweb-code-pr-writer.mjs",
  "scripts/seo/generate-url-inventory.mjs",
  "scripts/seo/personality-agent-recommendation-auto-runner.mjs",
  "scripts/seo/rank-mbti64-agent-priorities.mjs",
  "scripts/seo/validate-mbti64-backend-import-contract.mjs",
  "scripts/seo/validate-mbti64-content-package-v2.mjs",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

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

function runNodeModuleCheck(source: string): string {
  return execFileSync("node", ["--input-type=module", "-e", source], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

describe("SECURITY-122-WEB-11 artifact integrity, traversal, and CSV guards", () => {
  it("keeps shared artifact safety helpers fail-closed for path traversal, date slugs, and spreadsheet formulas", () => {
    const output = runNodeModuleCheck(`
      import os from "node:os";
      import { csvEscape, resolveOutputDir, resolveRepoPath, sanitizeDateSlug } from "./scripts/seo/artifactSafety.mjs";
      const root = process.cwd();
      const expectThrow = (fn, label) => {
        let threw = false;
        try { fn(); } catch { threw = true; }
        if (!threw) throw new Error(label);
      };
      expectThrow(() => resolveRepoPath(root, "../outside.json", "output"), "repo escape accepted");
      expectThrow(() => sanitizeDateSlug("../2026-07-03", "AUDIT_DATE"), "date traversal accepted");
      expectThrow(() => resolveOutputDir(root, "/etc", "artifact directory"), "arbitrary artifact dir accepted");
      if (!resolveOutputDir(root, os.tmpdir(), "artifact directory").startsWith(os.tmpdir())) throw new Error("tmp dir rejected");
      if (csvEscape("=HYPERLINK(\\"https://evil.example\\")") !== "\\"'=HYPERLINK(\\"\\"https://evil.example\\"\\")\\"") {
        throw new Error("formula was not text-prefixed");
      }
      process.stdout.write("ok");
    `);

    expect(output).toBe("ok");
  });

  it("rejects repo-relative output traversal from URL inventory generation", () => {
    const escapedPath = path.join(os.tmpdir(), "security-122-web-11-url-inventory-escape.json");
    fs.rmSync(escapedPath, { force: true });

    expect(() =>
      execFileSync(
        "node",
        [
          "scripts/seo/generate-url-inventory.mjs",
          "--sitemap",
          "tests/contracts/fixtures/seo/public-sitemap-snapshot.xml",
          "--output",
          "../security-122-web-11-url-inventory-escape.json",
        ],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      ),
    ).toThrow();
    expect(fs.existsSync(escapedPath)).toBe(false);
  });

  it("uses shared guards in WEB-11 artifact output scripts", () => {
    for (const script of GUARDED_SCRIPTS) {
      const contents = read(script);
      expect(contents, `${script} must import artifact safety helpers`).toContain("./artifactSafety.mjs");
      expect(contents, `${script} must not write args.output through raw path.resolve`).not.toMatch(
        /path\.resolve\(ROOT,\s*args\.(?:output|csv)\)/,
      );
    }
  });

  it("keeps tracked diff scope inside SECURITY-122-WEB-11", () => {
    for (const file of changedFiles()) {
      expect(isSecurity122Web11AllowedFile(file), file).toBe(true);
    }
  });
});
