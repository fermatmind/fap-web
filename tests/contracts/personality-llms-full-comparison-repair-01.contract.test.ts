import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
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
      // Local worktrees and CI checkouts expose different diff bases.
    }
  }

  return [...files].sort();
}

describe("PERSONALITY-LLMS-FULL-COMPARISON-REPAIR-01", () => {
  it("keeps llms-full personality comparison entries after the 64 detail URL cohort", () => {
    const route = read("app/llms-full.txt/route.ts");
    const scopeHelper = read("tests/contracts/helpers/currentPrScope.ts");
    const compactRoute = route.replace(/\s+/g, " ");

    expect(route).toContain("LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT = 32 * 2");
    expect(route).toContain("LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT = 16 * 2");
    expect(route).toContain(
      "LLMS_FULL_PERSONALITY_DETAIL_URL_COUNT + LLMS_FULL_PERSONALITY_COMPARISON_URL_COUNT"
    );
    expect(compactRoute).toContain("limitLlmsRouteEntries(personalityEntries, LLMS_FULL_PERSONALITY_ENTRY_LIMIT)");
    expect(compactRoute).not.toContain("limitLlmsRouteEntries(personalityEntries, LLMS_ROUTE_LIMITS.personalityProfiles)");
    expect(scopeHelper).toContain("GITHUB_EVENT_PATH");
    expect(scopeHelper).toContain("pull_request?.head?.ref");
    expect(scopeHelper).toContain("IS_GITHUB_PULL_REQUEST_MERGE_REF");
  });

  it("keeps the current PR scoped to the llms-full comparison repair", () => {
    const outsideScope = changedFiles().filter((file) => !isCurrentRiasecPack12AllowedFile(file));

    expect(outsideScope).toEqual([]);
  });
});
