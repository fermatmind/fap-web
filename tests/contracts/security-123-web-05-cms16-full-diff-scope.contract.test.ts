import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurity123Web05AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const CMS16_CONTRACT = "tests/contracts/mbti-cms-16-profile-dry-run-approval-package.contract.test.ts";

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const file of output.split("\n")) {
      if (file.trim()) files.add(file.trim());
    }
  }
  return [...files].sort();
}

describe("SECURITY-123-WEB-05 CMS-16 complete diff scope", () => {
  it("checks the complete committed diff instead of filtering to CMS-16 paths first", () => {
    const source = readFileSync(`${ROOT}/${CMS16_CONTRACT}`, "utf8");
    expect(source).toContain("const outsideScope = changed.filter");
    expect(source).not.toContain("cms16TouchedFiles");
    expect(source).toContain("security-123-web-05-");
  });

  it("keeps the complete WEB-05 diff inside the declared scope", () => {
    const changed = changedFiles();
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity123Web05AllowedFile), changed.join("\n")).toBe(true);
  });
});
