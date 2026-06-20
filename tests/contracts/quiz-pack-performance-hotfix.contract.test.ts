import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isQuizPackPerformanceHotfixAllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

const ALLOWED_FILES = [
  "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
  "tests/e2e/big5-flow.spec.ts",
  "tests/e2e/mbti-locked-unlock.spec.ts",
  "tests/e2e/mbti-share.spec.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/quiz-pack-performance-hotfix.contract.test.ts",
  "tests/contracts/riasec-guest-token-parity.contract.test.ts",
];

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function currentChangedFiles(): string[] {
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
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

describe("quiz pack performance hotfix scope", () => {
  it("keeps the current performance diff inside the declared take-flow and contract scope", () => {
    const files = currentChangedFiles();

    if (files.length === 0) {
      return;
    }

    expect(files.every((file) => ALLOWED_FILES.includes(file)), files.join("\n")).toBe(true);
  });

  it("registers the active branch allowlist for legacy scope guard contracts", () => {
    const helper = read("tests/contracts/helpers/currentPrScope.ts");

    expect(helper).toContain("QUIZ_PACK_PERFORMANCE_HOTFIX_ALLOWED_FILES");
    expect(helper).toContain('CURRENT_BRANCH === "codex/quiz-pack-performance-hotfix"');
    for (const file of ALLOWED_FILES) {
      expect(isQuizPackPerformanceHotfixAllowedFile(file), file).toBe(true);
    }
  });

  it("keeps first question rendering out of bootstrap token failure handling", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx");
    const bootstrapTokenEffect = source.slice(
      source.indexOf("void ensureFmTokenReady()"),
      source.indexOf("const runWithAuthRetry = useCallback")
    );

    expect(source).toContain('runWithAuthRetry("questions"');
    expect(source).toContain('trackEvent("first_question_ready"');
    expect(bootstrapTokenEffect).not.toContain("setAuthBlockError(resolveNoTokenServiceMessage");
  });
});
