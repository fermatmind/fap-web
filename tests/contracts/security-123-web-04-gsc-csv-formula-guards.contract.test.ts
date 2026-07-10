import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurity123Web04AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPTS = [
  "scripts/seo/build-mbti-gsc-11-query-evidence-export.mjs",
  "scripts/seo/build-mbti-gsc-19-submission-monitoring.mjs",
  "scripts/seo/build-mbti-ops-08-gsc-priority-monitoring.mjs",
];

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

describe("SECURITY-123-WEB-04 GSC CSV formula guards", () => {
  it("uses the shared spreadsheet-safe CSV boundary in all three GSC generators", () => {
    for (const script of SCRIPTS) {
      const source = readFileSync(`${ROOT}/${script}`, "utf8");
      expect(source, script).toContain("./artifactSafety.mjs");
      expect(source, script).toContain("csvEscape");
      expect(source, script).not.toMatch(/function\s+csvEscape\s*\(/);
    }
  });

  it("prefixes formula-like cells while preserving CSV quoting modes", () => {
    const output = execFileSync(
      "node",
      [
        "--input-type=module",
        "-e",
        `import { csvEscape } from "./scripts/seo/artifactSafety.mjs";
         if (csvEscape("=cmd", { quoteAlways: false }) !== "'=cmd") process.exit(1);
         if (csvEscape("+SUM(A1:A2)", { quoteAlways: false }) !== "'+SUM(A1:A2)") process.exit(2);
         if (csvEscape("@cmd", { quoteAlways: false }) !== "'@cmd") process.exit(3);
         if (csvEscape("a,b", { quoteAlways: false }) !== '"a,b"') process.exit(4);
         process.stdout.write("ok");`,
      ],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toBe("ok");
  });

  it("keeps the complete WEB-04 diff inside the declared scope", () => {
    const changed = changedFiles();
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity123Web04AllowedFile), changed.join("\n")).toBe(true);
  });
});
