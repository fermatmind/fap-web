import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnneagramLlmsCandidate } from "@/lib/cms/personality-public-content-assets";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";

const mocks = vi.hoisted(() => ({
  listCandidates: vi.fn(),
}));

vi.mock("@/lib/cms/personality-public-content-assets", () => ({
  listEnneagramLlmsCandidates: mocks.listCandidates,
}));

import {
  listEnneagramLlmsPaths,
  resetEnneagramLlmsSourceCacheForTests,
  selectExactEnneagramLlmsPaths,
} from "@/lib/seo/enneagramLlmsSource";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function exactCohort(llmsEligible = true): EnneagramLlmsCandidate[] {
  return (["en", "zh"] as const).flatMap((locale) =>
    ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.map((entry) => ({
      entityType: entry.entityType,
      code: entry.code,
      locale: locale === "zh" ? "zh-CN" : "en",
      canonicalPath: buildEnneagramPublicContentPath(locale, entry),
      robots: "index,follow" as const,
      isPublic: true,
      indexEligible: true,
      sitemapEligible: true,
      llmsEligible,
      launchState: "published",
    }))
  );
}

function mockApiCohort(candidates: EnneagramLlmsCandidate[]): void {
  mocks.listCandidates.mockImplementation(async (locale: string) =>
    candidates.filter((candidate) => candidate.locale === (locale === "zh" ? "zh-CN" : "en"))
  );
}

describe("ENNEAGRAM-LLMS-TXT-FRONTEND-ENUMERATION-01", () => {
  beforeEach(() => {
    mocks.listCandidates.mockReset();
    resetEnneagramLlmsSourceCacheForTests();
  });

  it("accepts only the exact 116 backend-gated canonical cohort", () => {
    const selected = selectExactEnneagramLlmsPaths(exactCohort());

    expect(selected).toHaveLength(116);
    expect(new Set(selected).size).toBe(116);
    expect(selected.filter((candidate) => candidate.startsWith("/en/"))).toHaveLength(58);
    expect(selected.filter((candidate) => candidate.startsWith("/zh/"))).toHaveLength(58);
    expect(selected).toContain("/en/personality/enneagram/wings/1w9");
    expect(selected).toContain("/zh/personality/enneagram/type-9/instincts/one-to-one");
  });

  it("keeps the complete 0-state hold closed and rejects every partial eligibility state", () => {
    expect(selectExactEnneagramLlmsPaths(exactCohort(false))).toEqual([]);

    const partial = exactCohort();
    partial[42] = { ...partial[42], llmsEligible: false };
    expect(selectExactEnneagramLlmsPaths(partial)).toEqual([]);
  });

  it("fails closed for duplicates, private or invalid canonicals, and invalid publication state", () => {
    const duplicate = exactCohort();
    duplicate[115] = { ...duplicate[0] };
    expect(selectExactEnneagramLlmsPaths(duplicate)).toEqual([]);

    const privatePath = exactCohort();
    privatePath[0] = { ...privatePath[0], canonicalPath: "/en/results/private" };
    expect(selectExactEnneagramLlmsPaths(privatePath)).toEqual([]);

    for (const patch of [
      { isPublic: false },
      { launchState: "content_ready" },
      { robots: "noindex,follow" as const },
      { indexEligible: false },
      { sitemapEligible: false },
    ]) {
      const invalid = exactCohort();
      invalid[0] = { ...invalid[0], ...patch };
      expect(selectExactEnneagramLlmsPaths(invalid)).toEqual([]);
    }
  });

  it("uses exact-cohort LKG only for transient API failure and revokes it on successful hold or invalid response", async () => {
    mocks.listCandidates.mockRejectedValue(new Error("api unavailable"));
    expect(await listEnneagramLlmsPaths()).toEqual([]);

    const released = exactCohort();
    mockApiCohort(released);
    expect(await listEnneagramLlmsPaths()).toHaveLength(116);

    mocks.listCandidates.mockRejectedValue(new Error("transient failure"));
    expect(await listEnneagramLlmsPaths()).toHaveLength(116);

    mockApiCohort(exactCohort(false));
    expect(await listEnneagramLlmsPaths()).toEqual([]);
    mocks.listCandidates.mockRejectedValue(new Error("after explicit hold"));
    expect(await listEnneagramLlmsPaths()).toEqual([]);

    const partial = exactCohort();
    partial[1] = { ...partial[1], llmsEligible: false };
    mockApiCohort(partial);
    expect(await listEnneagramLlmsPaths()).toEqual([]);
  });

  it("keeps llms.txt API-authoritative, preserves MBTI and Big Five, and leaves llms-full closed", () => {
    const adapter = read("lib/cms/personality-public-content-assets.ts");
    const source = read("lib/seo/enneagramLlmsSource.ts");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(adapter).toContain("/v0.5/personality-content-assets?locale=");
    expect(adapter).toContain("framework=enneagram&per_page=100&org_id=0");
    expect(source).toContain("listEnneagramLlmsCandidates");
    expect(source).not.toContain("listBackendSitemapEnneagram");
    expect(source).not.toMatch(/fallback.*personality\/enneagram/i);
    expect(llms).toContain("listEnneagramLlmsPaths");
    expect(llms).toContain("EXPECTED_ENNEAGRAM_LLMS_PATH_COUNT = 116");
    expect(llms).toContain("listBackendSitemapMbtiPersonalityPaths");
    expect(llms).toContain("listBackendSitemapBigFiveZhPaths");
    expect(llmsFull).toContain("listEnneagramLlmsFullEntries");
    expect(llmsFull).toContain("enneagramLlmsSource");
    expect(llmsFull).not.toContain("listEnneagramLlmsPaths");
    expect(llmsFull).not.toContain("listBackendSitemapEnneagram");
  });
});
