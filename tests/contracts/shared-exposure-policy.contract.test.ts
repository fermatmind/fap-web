import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PRIVATE_FLOW_ROUTE_EXCLUDES,
  isSharedDiscoverabilityDeniedPath,
  stripDiscoverabilityLocalePrefix,
} from "@/lib/seo/discoverabilityExposurePolicy";
import { shouldIncludeInSitemap, shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("shared discoverability exposure policy", () => {
  it("centralizes private-flow and shared final deny path detection", () => {
    expect(PRIVATE_FLOW_ROUTE_EXCLUDES).toEqual([
      "/result/*",
      "/orders/*",
      "/share/*",
      "/pay/*",
      "/payment/*",
      "/history/*",
      "/tests/*/take",
    ]);

    for (const sample of [
      "/en/tests/mbti-personality-test-16-personality-types/take",
      "/zh/tests/mbti-personality-test-16-personality-types/take?step=1",
      "/en/result/example",
      "/zh/results/lookup",
      "/en/orders/example",
      "/zh/share/example",
      "/en/pay/wait",
      "/zh/payment/stripe/success",
      "/api/health",
    ]) {
      expect(isSharedDiscoverabilityDeniedPath(sample), sample).toBe(true);
      expect(shouldNoindex(sample, sample.startsWith("/zh/") ? "zh" : "en"), sample).toBe(true);
      expect(shouldIncludeInSitemap(sample), sample).toBe(false);
    }
  });

  it("does not classify public acquisition pages as shared deny paths", () => {
    for (const sample of [
      "/en/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/mbti-personality-test-16-personality-types",
      "/en/personality/intj-a",
      "/zh/topics/mbti",
      "/en/support",
    ]) {
      expect(stripDiscoverabilityLocalePrefix(sample), sample).toMatch(/^\/(tests|personality|topics|support)/);
      expect(isSharedDiscoverabilityDeniedPath(sample), sample).toBe(false);
    }
  });

  it("keeps sitemap, llms, and indexing surfaces wired to the shared policy", () => {
    const sitemapConfig = read("next-sitemap.config.js");
    const sitemapAdapters = read("lib/seo/sitemapAuthorityAdapters.cjs");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");
    const indexingPolicy = read("lib/seo/indexingPolicy.ts");
    const cjsIndexingPolicy = read("lib/seo/indexingPolicy.cjs");

    expect(sitemapConfig).toContain("sitemapAuthorityAdapters.cjs");
    expect(sitemapAdapters).toContain("PRIVATE_FLOW_ROUTE_EXCLUDES");
    expect(sitemapConfig).toContain("isSharedDiscoverabilityDeniedPath");
    expect(llms).toContain("isSharedDiscoverabilityDeniedPath");
    expect(llmsFull).toContain("isSharedDiscoverabilityDeniedPath");
    expect(indexingPolicy).toContain("SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS");
    expect(cjsIndexingPolicy).toContain("SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS");
  });
});
