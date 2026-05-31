import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { clearLastKnownGoodForTests } from "@/lib/cms/last-known-good";
import { getCmsArticlesWithLastKnownGood } from "@/lib/cms/articles";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  clearLastKnownGoodForTests();
});

describe("public CMS surface LKG coverage", () => {
  it("keeps article and trust/content public surfaces on LKG wrappers while help detail stays on the direct CMS surface", () => {
    const articleIndex = read("app/(localized)/[locale]/articles/page.tsx");
    const articleDetail = read("app/(localized)/[locale]/articles/[slug]/page.tsx");
    const testDetail = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const contentPageRoute = read("app/(localized)/[locale]/contentPageRoute.tsx");
    const helpDetail = read("app/(localized)/[locale]/help/[slug]/page.tsx");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(articleIndex).toContain("getCmsArticlesWithLastKnownGood");
    expect(articleDetail).toContain("getCmsArticleWithLastKnownGood");
    expect(articleDetail).toContain("getCmsArticleSeoWithLastKnownGood");
    expect(testDetail).toContain("getCmsArticlesWithLastKnownGood");
    expect(contentPageRoute).toContain("getContentPageWithLastKnownGood");
    expect(helpDetail).toContain("getContentPage(");
    expect(helpDetail).not.toContain("getContentPageWithLastKnownGood");
    expect(llms).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llms).toContain("listDiscoverableContentPagesWithLastKnownGood");
    expect(llmsFull).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llmsFull).toContain("listDiscoverableContentPagesWithLastKnownGood");
  });

  it("does not use stale article list data when a later fresh response is empty", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        ok: true,
        items: [
          {
            slug: "lkg-article",
            locale: "zh-CN",
            title: "LKG article",
            excerpt: "Cached CMS article.",
            is_public: true,
            is_indexable: true,
            status: "published",
            published_revision_id: 31,
          },
        ],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 1,
          last_page: 1,
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCmsArticlesWithLastKnownGood({ locale: "zh" })).resolves.toMatchObject({
      source: "fresh",
      value: { items: [{ slug: "lkg-article" }] },
    });

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        ok: true,
        items: [],
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 0,
          last_page: 1,
        },
      })
    );

    await expect(getCmsArticlesWithLastKnownGood({ locale: "zh" })).resolves.toMatchObject({
      source: "fresh",
      stale: false,
      error: null,
      value: { items: [] },
    });
  });

  it("does not use stale article list data when the CMS API later fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          ok: true,
          items: [
            {
              slug: "stable-article",
              locale: "en",
              title: "Stable article",
              excerpt: "Cached CMS article.",
              is_public: true,
              is_indexable: true,
              status: "published",
              published_revision_id: 41,
            },
          ],
          pagination: {
            current_page: 1,
            per_page: 20,
            total: 1,
            last_page: 1,
          },
        })
      )
      .mockRejectedValueOnce(new Error("cms unavailable"));
    vi.stubGlobal("fetch", fetchMock);

    await getCmsArticlesWithLastKnownGood({ locale: "en" });

    await expect(getCmsArticlesWithLastKnownGood({ locale: "en" })).rejects.toThrow("cms unavailable");
  });
});
