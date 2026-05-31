import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function catalogResponse(items: unknown[]): Response {
  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("llms test authority contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("routes llms test enumeration through the backend discoverability source", () => {
    const llmsRoute = readSource("app/llms.txt/route.ts");
    const llmsFullRoute = readSource("app/llms-full.txt/route.ts");

    for (const source of [llmsRoute, llmsFullRoute]) {
      expect(source).toContain("listBackendDiscoverabilityTestEntries");
      expect(source).not.toContain("getAllTests");
      expect(source).not.toContain("filterVisiblePublicTestEntries");
      expect(source).not.toContain("resolveTestTitleByLocale");
    }
  });

  it("uses backend catalog entries gated by sitemap/indexability and public visibility rules", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("locale=zh-CN")) {
        return catalogResponse([
          {
            slug: "mbti-personality-test-16-personality-types",
            title: "MBTI Test",
            title_i18n: { en: "MBTI Test", "zh-CN": "MBTI 性格测试" },
            description: "中文 MBTI summary.",
            scale_code: "MBTI_93",
            highlight_excerpt_i18n: { "zh-CN": "中文摘录" },
            is_public: true,
            is_active: true,
            is_indexable: true,
          },
        ]);
      }

      return catalogResponse([
        {
          slug: "mbti-personality-test-16-personality-types",
          title: "MBTI Test",
          title_i18n: { en: "MBTI Test", "zh-CN": "MBTI 性格测试" },
          description: "English MBTI summary.",
          scale_code: "MBTI_93",
          highlight_excerpt_i18n: { en: "English excerpt" },
          is_public: true,
          is_active: true,
          is_indexable: true,
        },
        {
          slug: "clinical-depression-anxiety-assessment-professional-edition",
          title: "Clinical depression-anxiety screening",
          description: "Hidden public screening summary.",
          scale_code: "CLINICAL_COMBO_68",
          is_public: true,
          is_active: true,
          is_indexable: true,
        },
        {
          slug: "draft-test",
          title: "Draft test",
          description: "Draft summary.",
          scale_code: "DRAFT",
          is_public: true,
          is_active: true,
          is_indexable: false,
        },
        {
          slug: "private-test",
          title: "Private test",
          description: "Private summary.",
          scale_code: "PRIVATE",
          is_public: false,
          is_active: true,
          is_indexable: true,
        },
      ]);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { listBackendDiscoverabilityTestEntries } = await import("@/lib/seo/backendTestDiscoverabilitySource");
    const entries = await listBackendDiscoverabilityTestEntries();

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/v0.3/scales/catalog?locale=en"),
        expect.stringContaining("/v0.3/scales/catalog?locale=zh-CN"),
        expect.stringContaining("/v0.5/landing-surfaces/tests"),
      ])
    );
    expect(entries.map((entry) => entry.path)).toEqual([
      "/en/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/mbti-personality-test-16-personality-types",
    ]);
    expect(entries.find((entry) => entry.locale === "zh")?.title).toBe("MBTI 性格测试");
    expect(entries.map((entry) => entry.slug)).not.toEqual(
      expect.arrayContaining([
        "clinical-depression-anxiety-assessment-professional-edition",
        "draft-test",
        "private-test",
      ])
    );
  });

  it("does not fall back to local test authority when backend catalog is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("backend unavailable");
      })
    );

    const { listBackendDiscoverabilityTestEntries } = await import("@/lib/seo/backendTestDiscoverabilitySource");

    await expect(listBackendDiscoverabilityTestEntries()).resolves.toEqual([]);
  });
});
