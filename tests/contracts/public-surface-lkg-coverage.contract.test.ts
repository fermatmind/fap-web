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
  it("routes article and content-page public surfaces through LKG wrappers", () => {
    const articleIndex = read("app/(localized)/[locale]/articles/page.tsx");
    const articleDetail = read("app/(localized)/[locale]/articles/[slug]/page.tsx");
    const testDetail = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const contentPageRoute = read("app/(localized)/[locale]/contentPageRoute.tsx");
    const helpIndex = read("app/(localized)/[locale]/help/page.tsx");
    const helpDetail = read("app/(localized)/[locale]/help/[slug]/page.tsx");
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");

    expect(articleIndex).toContain("getCmsArticlesWithLastKnownGood");
    expect(articleDetail).toContain("getCmsArticleWithLastKnownGood");
    expect(articleDetail).toContain("getCmsArticleSeoWithLastKnownGood");
    expect(testDetail).toContain("getCmsArticlesWithLastKnownGood");
    expect(contentPageRoute).toContain("getContentPageWithLastKnownGood");
    expect(helpIndex).toContain("listContentPagesWithLastKnownGood");
    expect(helpDetail).toContain("getContentPageWithLastKnownGood");
    expect(llms).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llms).toContain("listContentPagesWithLastKnownGood");
    expect(llmsFull).toContain("listCmsArticlesForLlmsWithLastKnownGood");
    expect(llmsFull).toContain("listContentPagesWithLastKnownGood");
  });

  it("keeps stale article list data when a later fresh response is empty", async () => {
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
      source: "last-known-good",
      stale: true,
      value: { items: [{ slug: "lkg-article" }] },
    });
  });

  it("keeps stale article list data when the CMS API later fails", async () => {
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

    await expect(getCmsArticlesWithLastKnownGood({ locale: "en" })).resolves.toMatchObject({
      source: "last-known-good",
      stale: true,
      value: { items: [{ slug: "stable-article" }] },
    });
  });
});
