import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/generate-mbti64-agent-expansion-88.mjs";
const CODEQL_HYGIENE_BRANCHES = new Set([
  "codex/codeql-hygiene-alerts",
  "codex/codeql-mbti64-agent-offline-surface",
  "codex/codeql-hygiene-unused-conditionals",
]);

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function currentBranch(): string {
  if (process.env.GITHUB_HEAD_REF) {
    return process.env.GITHUB_HEAD_REF;
  }

  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }

  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

describe("MBTI64 agent expansion 88 security contract", () => {
  it("uses offline indexation audit surfaces and performs no outbound fetch", () => {
    const source = readSource(SCRIPT_PATH);

    expect(source).toContain('const INDEXATION_AUDIT_PATH = "docs/seo/personality/indexation-audit-2026-06-18.json";');
    expect(source).toContain("function currentSurfaceFromAudit(node, auditRowsByPath)");
    expect(source).toContain('cms_or_api_snapshot: "offline_indexation_audit"');
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("fetchCurrentSurface");
  });

  it("keeps the CodeQL hygiene repair within the registered scope guard files when that scope is active", () => {
    if (!CODEQL_HYGIENE_BRANCHES.has(currentBranch())) {
      expect(CODEQL_HYGIENE_BRANCHES.has(currentBranch())).toBe(false);
      return;
    }

    const allowedFiles = [SCRIPT_PATH, "tests/contracts/helpers/currentPrScope.ts", "tests/contracts/mbti64-agent-expansion-88-security.contract.test.ts"];

    for (const file of allowedFiles) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
