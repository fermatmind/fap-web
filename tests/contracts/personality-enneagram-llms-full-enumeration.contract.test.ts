import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EnneagramLlmsFullCandidate } from "@/lib/cms/personality-public-content-assets";
import {
  buildEnneagramPublicContentPath,
  ENNEAGRAM_PUBLIC_ROUTE_ENTRIES,
} from "@/lib/personality/enneagramPublicRoutes";

const mocks = vi.hoisted(() => ({
  listCandidates: vi.fn(),
  listFullCandidates: vi.fn(),
}));

vi.mock("@/lib/cms/personality-public-content-assets", () => ({
  listEnneagramLlmsCandidates: mocks.listCandidates,
  listEnneagramLlmsFullCandidates: mocks.listFullCandidates,
}));

import {
  listEnneagramLlmsFullEntries,
  resetEnneagramLlmsSourceCacheForTests,
  selectExactEnneagramLlmsFullEntries,
} from "@/lib/seo/enneagramLlmsSource";
import { isCompleteLlmsFullText } from "@/app/llms-full.txt/route";

const ROOT = process.cwd();
const SITE_URL = "https://fermatmind.com";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function exactFullCohort(patch: Partial<EnneagramLlmsFullCandidate> = {}): EnneagramLlmsFullCandidate[] {
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
      llmsEligible: true,
      launchState: "published",
      title: `${locale} ${entry.code}`,
      summary: "Backend visible Enneagram content summary with enough context for llms-full inclusion.",
      faq: [{ question: "Is this a diagnosis?", answer: "No. It is a bounded personality explainer." }],
      methodBoundary: {
        summary: "Use as a reflection aid, not a diagnosis or screening decision.",
        notFor: ["diagnosis", "employment screening"],
      },
      evidenceNotes: [{ sourceType: "method_boundary", note: "Claims remain bounded to visible content evidence." }],
      sections: [{ key: "overview", title: "Overview", bodyMd: "Visible body section.", bodyHtml: "" }],
      updatedAt: "2026-07-12T00:00:00Z",
      ...patch,
    }))
  );
}

function mockApiCohort(candidates: EnneagramLlmsFullCandidate[]): void {
  mocks.listFullCandidates.mockImplementation(async (locale: string) =>
    candidates.filter((candidate) => candidate.locale === (locale === "zh" ? "zh-CN" : "en"))
  );
}

function llmsFullTextFor(paths: string[]): string {
  return [
    "# FermatMind llms-full.txt",
    "## Personality",
    ...paths.map((path) => [
      `### [${path.startsWith("/zh/") ? "zh" : "en"}] Enneagram | ${SITE_URL}${path}`,
      `- URL: ${SITE_URL}${path}`,
    ].join("\n")),
  ].join("\n");
}

describe("ENNEAGRAM-LLMS-FULL-FRONTEND-ENUMERATION-01", () => {
  beforeEach(() => {
    mocks.listCandidates.mockReset();
    mocks.listFullCandidates.mockReset();
    resetEnneagramLlmsSourceCacheForTests();
  });

  it("accepts only the exact 116 evidence-gated backend public asset cohort", () => {
    const selected = selectExactEnneagramLlmsFullEntries(exactFullCohort());

    expect(selected).toHaveLength(116);
    expect(new Set(selected.map((entry) => entry.path)).size).toBe(116);
    expect(selected.filter((entry) => entry.locale === "en")).toHaveLength(58);
    expect(selected.filter((entry) => entry.locale === "zh")).toHaveLength(58);
    expect(selected).toContainEqual(expect.objectContaining({
      path: "/en/personality/enneagram/wings/1w9",
      type: "personality",
    }));
    expect(selected).toContainEqual(expect.objectContaining({
      path: "/zh/personality/enneagram/type-9/instincts/one-to-one",
      type: "personality",
    }));
  });

  it("fails closed for partial eligibility, duplicates, private canonicals, and invalid publication state", () => {
    const partial = exactFullCohort();
    partial[0] = { ...partial[0], llmsEligible: false };
    expect(selectExactEnneagramLlmsFullEntries(partial)).toEqual([]);

    const duplicate = exactFullCohort();
    duplicate[115] = { ...duplicate[0] };
    expect(selectExactEnneagramLlmsFullEntries(duplicate)).toEqual([]);

    const privatePath = exactFullCohort();
    privatePath[0] = { ...privatePath[0], canonicalPath: "/en/results/private?token=secret" };
    expect(selectExactEnneagramLlmsFullEntries(privatePath)).toEqual([]);

    for (const patch of [
      { isPublic: false },
      { launchState: "content_ready" },
      { robots: "noindex,follow" as const },
      { indexEligible: false },
      { sitemapEligible: false },
    ]) {
      const invalid = exactFullCohort();
      invalid[0] = { ...invalid[0], ...patch };
      expect(selectExactEnneagramLlmsFullEntries(invalid)).toEqual([]);
    }
  });

  it("requires visible summary, FAQ, and evidence boundary before llms-full inclusion", () => {
    for (const patch of [
      { summary: "" },
      { faq: [] },
      { methodBoundary: null, evidenceNotes: [], sections: [] },
    ]) {
      const thin = exactFullCohort();
      thin[0] = { ...thin[0], ...patch };
      expect(selectExactEnneagramLlmsFullEntries(thin)).toEqual([]);
    }
  });

  it("uses exact full-cohort LKG only for transient API failure and revokes it on successful invalid response", async () => {
    mocks.listFullCandidates.mockRejectedValue(new Error("api unavailable"));
    expect(await listEnneagramLlmsFullEntries()).toEqual([]);

    mockApiCohort(exactFullCohort());
    expect(await listEnneagramLlmsFullEntries()).toHaveLength(116);

    mocks.listFullCandidates.mockRejectedValue(new Error("transient failure"));
    expect(await listEnneagramLlmsFullEntries()).toHaveLength(116);

    mockApiCohort(exactFullCohort({ llmsEligible: false }));
    expect(await listEnneagramLlmsFullEntries()).toEqual([]);
    mocks.listFullCandidates.mockRejectedValue(new Error("after explicit hold"));
    expect(await listEnneagramLlmsFullEntries()).toEqual([]);
  });

  it("requires the exact 116 Enneagram cohort before caching llms-full as complete", () => {
    const paths = exactFullCohort().map((candidate) => candidate.canonicalPath);

    expect(isCompleteLlmsFullText(llmsFullTextFor(paths), SITE_URL)).toBe(true);
    expect(isCompleteLlmsFullText(llmsFullTextFor(paths.slice(1)), SITE_URL)).toBe(false);
    expect(isCompleteLlmsFullText(llmsFullTextFor([...paths.slice(1), "/en/results/private"]), SITE_URL)).toBe(false);
  });

  it("wires llms-full to Enneagram public API authority without using sitemap or editorial fallback", () => {
    const adapter = read("lib/cms/personality-public-content-assets.ts");
    const source = read("lib/seo/enneagramLlmsSource.ts");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(adapter).toContain("listEnneagramLlmsFullCandidates");
    expect(adapter).toContain("/v0.5/personality-content-assets?locale=");
    expect(source).toContain("listEnneagramLlmsFullCandidates");
    expect(source).toContain("selectExactEnneagramLlmsFullEntries");
    expect(source).not.toContain("listBackendSitemapEnneagram");
    expect(llms).toContain("listEnneagramLlmsPaths");
    expect(llms).not.toContain("listEnneagramLlmsFullEntries");
    expect(llmsFull).toContain("listEnneagramLlmsFullEntries");
    expect(llmsFull).not.toContain("listBackendSitemapEnneagram");
    expect(llmsFull).not.toMatch(new RegExp("fallback.*personality/enneagram", "i"));
  });
});
