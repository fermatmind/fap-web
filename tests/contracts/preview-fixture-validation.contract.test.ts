import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const PHASE1_SPEC = "tests/e2e/enneagram-phase1b-rendered-preview.spec.ts";
const PHASE3_SPEC = "tests/e2e/enneagram-phase3b-1rd-partial-resonance-rendered-preview.spec.ts";

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function currentChangedFiles(): string[] {
  const unstaged = execFileSync("git", ["diff", "--name-only"], { cwd: ROOT, encoding: "utf8" });
  const staged = execFileSync("git", ["diff", "--cached", "--name-only"], { cwd: ROOT, encoding: "utf8" });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" });

  return Array.from(
    new Set(
      `${unstaged}\n${staged}\n${untracked}`
        .split("\n")
        .map((file) => file.trim())
        .filter((file) => file && !file.startsWith(".playwright-mcp/")),
    ),
  ).sort();
}

describe("preview fixture validation hard-fail contract", () => {
  const phase1Source = readSource(PHASE1_SPEC);
  const phase3Source = readSource(PHASE3_SPEC);

  it("keeps unset optional preview fixture env vars skippable", () => {
    expect(phase1Source).toContain(
      'skipReason: "PHASE1A_PREVIEW_PAYLOAD_DIR is not set; skipping optional Phase 1-B rendered preview QA."',
    );
    expect(phase3Source).toContain(
      'skipReason: "PHASE3A_PREVIEW_PAYLOAD_DIR is not set; skipping optional Phase 3-B rendered preview QA."',
    );
    expect(phase1Source).toContain("test.skip(skipReason !== null, skipReason ?? undefined);");
    expect(phase3Source).toContain("test.skip(skipReason !== null, skipReason ?? undefined);");
  });

  it("hard-fails configured missing preview fixture directories", () => {
    expect(phase1Source).toContain("throw new Error(`PHASE1A_PREVIEW_PAYLOAD_DIR does not exist: ${previewDir}`);");
    expect(phase3Source).toContain("throw new Error(`PHASE3A_PREVIEW_PAYLOAD_DIR does not exist: ${previewDir}`);");
    expect(phase1Source).not.toContain("skipReason: `PHASE1A_PREVIEW_PAYLOAD_DIR does not exist: ${previewDir}`");
    expect(phase3Source).not.toContain("skipReason: `PHASE3A_PREVIEW_PAYLOAD_DIR does not exist: ${previewDir}`");
  });

  it("hard-fails configured wrong preview fixture counts", () => {
    expect(phase1Source).toContain("throw new Error(`Expected 36 preview fixtures, received ${files.length} from ${previewDir}.`);");
    expect(phase3Source).toContain("throw new Error(`Expected 90 preview fixtures, received ${files.length} from ${previewDir}.`);");
    expect(phase1Source).not.toContain("skipReason: `Expected 36 preview fixtures");
    expect(phase3Source).not.toContain("skipReason: `Expected 90 preview fixtures");
  });

  it("keeps PR-WEB-SEC-33 changes inside the declared scope", () => {
    const changedFiles = currentChangedFiles();

    expect(changedFiles.filter((file) => !isCurrentRiasecPack12AllowedFile(file))).toEqual([]);
  });
});
