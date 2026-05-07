import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LLMS_ROUTE_ARTICLE_MAX_PAGES,
  LLMS_ROUTE_LIMITS,
  LLMS_ROUTE_SOURCE_TIMEOUT_MS,
  limitLlmsRouteEntries,
  withLlmsRouteBudget,
} from "@/lib/seo/llmsRouteBudget";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("llms route fanout budget contract", () => {
  it("bounds public llms route source waits and enumerable API surfaces", async () => {
    const fallback = await withLlmsRouteBudget(
      () => new Promise<string>((resolve) => setTimeout(() => resolve("late"), 25)),
      "fallback",
      { timeoutMs: 1 }
    );

    expect(fallback).toBe("fallback");
    expect(LLMS_ROUTE_SOURCE_TIMEOUT_MS).toBeLessThanOrEqual(1500);
    expect(LLMS_ROUTE_ARTICLE_MAX_PAGES).toBe(1);
    expect(LLMS_ROUTE_LIMITS.articles).toBeLessThanOrEqual(40);
    expect(LLMS_ROUTE_LIMITS.careerGuides).toBeLessThanOrEqual(24);
    expect(LLMS_ROUTE_LIMITS.careerJobs).toBeLessThanOrEqual(80);
    expect(limitLlmsRouteEntries([1, 2, 3], 2)).toEqual([1, 2]);
  });

  it("keeps both llms routes wired through the shared fanout budget", () => {
    for (const sourcePath of ["app/llms.txt/route.ts", "app/llms-full.txt/route.ts"]) {
      const source = readSource(sourcePath);

      expect(source).toContain("withLlmsRouteBudget");
      expect(source).toContain("limitLlmsRouteEntries");
      expect(source).toContain("LLMS_ROUTE_LIMITS");
      expect(source).toContain("LLMS_ROUTE_ARTICLE_MAX_PAGES");
      expect(source).toContain("maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES");
      expect(source).toContain("perPage: LLMS_ROUTE_LIMITS.articles");
    }
  });

  it("keeps llms-full detail enrichment bounded separately from list enumeration", () => {
    const source = readSource("app/llms-full.txt/route.ts");

    expect(source).toContain("const ENRICHMENT_CONCURRENCY = 4");
    expect(source).toContain("limitLlmsRouteEntries(articles, LLMS_ROUTE_LIMITS.articles)");
    expect(source).toContain("withLlmsRouteBudget(() => enrichArticleEntry(entry, siteUrl), entry)");
    expect(source).toContain("withLlmsRouteBudget(() => enrichPersonalityEntry(entry, siteUrl), entry)");
    expect(source).toContain("withLlmsRouteBudget(() => enrichTopicEntry(entry, siteUrl), entry)");
    expect(source).toContain("withLlmsRouteBudget(() => enrichCareerGuideEntry(entry, siteUrl), entry)");
  });
});
