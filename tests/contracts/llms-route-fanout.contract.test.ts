import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  LLMS_ROUTE_ARTICLE_MAX_PAGES,
  LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS,
  LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS,
  LLMS_ROUTE_LIMITS,
  LLMS_ROUTE_SOURCE_TIMEOUT_MS,
  LLMS_FULL_DEGRADED_CAREER_JOB_TIMEOUT_MS,
  LLMS_FULL_ENRICHMENT_TIMEOUT_MS,
  LLMS_FULL_RESPONSE_DEADLINE_MS,
  limitLlmsRouteEntries,
  withLlmsRouteBudget,
} from "@/lib/seo/llmsRouteBudget";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("llms route fanout budget contract", () => {
  it("bounds public llms route source waits and enumerable API surfaces", async () => {
    let timedOutSignalAborted = false;
    const fallback = await withLlmsRouteBudget(
      (signal) =>
        new Promise<string>((resolve) => {
          signal.addEventListener("abort", () => {
            timedOutSignalAborted = true;
          });
          setTimeout(() => resolve("late"), 25);
        }),
      "fallback",
      { timeoutMs: 1 }
    );

    expect(fallback).toBe("fallback");
    expect(timedOutSignalAborted).toBe(true);
    expect(LLMS_ROUTE_SOURCE_TIMEOUT_MS).toBeLessThanOrEqual(1500);
    expect(LLMS_ROUTE_ARTICLE_MAX_PAGES).toBe(1);
    expect(LLMS_ROUTE_LIMITS.articles).toBeLessThanOrEqual(40);
    expect(LLMS_ROUTE_LIMITS.careerGuides).toBeLessThanOrEqual(24);
    expect(LLMS_ROUTE_LIMITS.careerJobs).toBeGreaterThanOrEqual(1046 * 2);
    expect(LLMS_ROUTE_LIMITS.careerJobs).toBeLessThanOrEqual(2200);
    expect(LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS).toBeLessThanOrEqual(30_000);
    expect(LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS).toBeGreaterThan(LLMS_ROUTE_SOURCE_TIMEOUT_MS);
    expect(LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS).toBeLessThanOrEqual(5_000);
    expect(LLMS_FULL_RESPONSE_DEADLINE_MS).toBeLessThan(30_000);
    expect(LLMS_FULL_DEGRADED_CAREER_JOB_TIMEOUT_MS).toBeLessThan(LLMS_FULL_RESPONSE_DEADLINE_MS);
    expect(LLMS_FULL_ENRICHMENT_TIMEOUT_MS).toBeLessThanOrEqual(500);
    expect(limitLlmsRouteEntries([1, 2, 3], 2)).toEqual([1, 2]);
  });

  it("keeps both llms routes wired through the shared fanout budget", () => {
    for (const sourcePath of ["app/llms.txt/route.ts", "app/llms-full.txt/route.ts"]) {
      const source = readSource(sourcePath);

      expect(source).toContain("withLlmsRouteBudget");
      expect(source).toContain("limitLlmsRouteEntries");
      expect(source).toContain("LLMS_ROUTE_LIMITS");
      expect(source).toContain("LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS");
      expect(source).toContain("LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS");
      expect(source).toContain("LLMS_ROUTE_ARTICLE_MAX_PAGES");
      expect(source).toContain("maxPages: LLMS_ROUTE_ARTICLE_MAX_PAGES");
      expect(source).toContain("perPage: LLMS_ROUTE_LIMITS.articles");
      expect(source).toContain("article.isIndexable && article.llmsEligible");
      expect(source).toContain("listBackendSitemapCareerJobPaths({ limit: LLMS_ROUTE_LIMITS.careerJobs, signal })");
      expect(source).toContain("{ timeoutMs: LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS }");
    }
  });

  it("keeps llms-full detail enrichment bounded separately from list enumeration", () => {
    const source = readSource("app/llms-full.txt/route.ts");

    expect(source).toContain("const ENRICHMENT_CONCURRENCY = 4");
    expect(source).toContain("getCachedLlmsFullText");
    expect(source).toContain("buildDegradedLlmsFullText");
    expect(source).toContain("X-FermatMind-LLMS-Full-Mode");
    expect(source).toContain("limitLlmsRouteEntries(articles, LLMS_ROUTE_LIMITS.articles)");
    expect(source).toContain("withLlmsRouteBudget(() => enrichArticleEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })");
    expect(source).toContain("withLlmsRouteBudget(() => enrichPersonalityEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })");
    expect(source).toContain("withLlmsRouteBudget(() => enrichTopicEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })");
    expect(source).toContain("withLlmsRouteBudget(() => enrichCareerGuideEntry(entry, siteUrl), entry, { timeoutMs: LLMS_FULL_ENRICHMENT_TIMEOUT_MS })");
  });

  it("keeps career llms enumeration on backend sitemap authority without full-index or per-detail fanout", () => {
    const source = readSource("lib/seo/backendSitemapSource.ts");

    expect(source).toContain("buildApiUrl(\"/v0.5/seo/sitemap-source\")");
    expect(source).toContain("extractBackendSitemapCareerJobPaths");
    expect(source).not.toContain("/v0.5/career/jobs?");
    expect(source).not.toContain("/v0.5/career-jobs/");
    expect(source).not.toContain("fetchCareerJobIndex");
    expect(source).not.toContain("fetchCareerJobSeoAuthority");
  });
});
