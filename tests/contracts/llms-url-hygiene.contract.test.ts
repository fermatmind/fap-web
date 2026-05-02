import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function expectLlmsRouteHygiene(source: string): void {
  expect(source).toContain("LLMS_FINAL_PATH_DENY_PATTERNS");
  expect(source).not.toContain("LLMS_FINAL_PATH_ALLOW_PATTERNS");
  expect(source).toContain("isForbiddenFinalLlmsPath");
  expect(source).toContain('toCanonical(siteUrl, "/en/support")');
  expect(source).toContain('toCanonical(siteUrl, "/zh/support")');
  expect(source).not.toContain('toCanonical(siteUrl, "/zh")');
  expect(source).not.toContain('toCanonical(siteUrl, "/en/help")');
  expect(source).not.toContain('toCanonical(siteUrl, "/zh/help")');
  expect(source).not.toContain('toCanonical(siteUrl, "/en/career/jobs")');
  expect(source).not.toContain('toCanonical(siteUrl, "/zh/career/jobs")');
  expect(source).not.toContain('toCanonical(siteUrl, "/en/career/recommendations")');
  expect(source).not.toContain('toCanonical(siteUrl, "/zh/career/recommendations")');
  expect(source).toContain("career\\/recommendations\\/mbti");
  expect(source).toContain("career\\/guides");
  expect(source).toContain("personality\\/(");
  expect(source).toContain("result(?:\\/|$)");
  expect(source).toContain("orders(?:\\/|$)");
  expect(source).toContain("share(?:\\/|$)");
  expect(source).toContain("tests\\/[^/]+\\/take");
  expect(source).not.toContain("isCareerJobDetailDiscoverableByManifest");
  expect(source).not.toContain(".map((job) => job.href)");
  expect(source).not.toContain("fetchCareerJobIndex");
  expect(source).not.toContain("adaptCareerJobIndex");
}

describe("llms final URL hygiene contract", () => {
  it("llms.txt excludes forbidden final URL classes before formatting URLs", () => {
    expectLlmsRouteHygiene(read("app/llms.txt/route.ts"));
  });

  it("llms-full.txt excludes forbidden final URL classes while keeping enrichment URL-safe", () => {
    expectLlmsRouteHygiene(read("app/llms-full.txt/route.ts"));
  });
});
