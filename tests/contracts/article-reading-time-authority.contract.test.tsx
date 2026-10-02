import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ArticlesPage from "@/app/(localized)/[locale]/articles/page";
import { apiClient } from "@/lib/api-client";
import { getCmsArticle, getCmsArticles } from "@/lib/cms/articles";

vi.mock("@/lib/api-client", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api-client")>("@/lib/api-client")),
  apiClient: { get: vi.fn(), getPublic: vi.fn() },
}));

afterEach(() => vi.clearAllMocks());

function publishedArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    slug: "reading-time-boundary",
    locale: "en",
    title: "Reading-time boundary",
    excerpt: "A short description of a longer article.",
    reading_minutes: null,
    content_md: null,
    content_html: null,
    status: "published",
    is_public: true,
    is_indexable: true,
    published_revision_id: 17,
    ...overrides,
  };
}

function serveArticle(overrides: Record<string, unknown> = {}) {
  const article = publishedArticle(overrides);
  const response = {
    ok: true,
    article,
    items: [article],
    pagination: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
  };
  vi.mocked(apiClient.get).mockResolvedValue(response);
  vi.mocked(apiClient.getPublic).mockResolvedValue(response);
}

describe("article reading-time authority", () => {
  it("keeps absent body duration unknown and hides the index label", async () => {
    serveArticle();
    const list = await getCmsArticles({ locale: "en", allowLocalFallback: false });
    expect(list.items).toHaveLength(1);
    expect(list.items[0].readingMinutes).toBeNull();
    expect((await getCmsArticle("reading-time-boundary", "en"))?.readingMinutes).toBeNull();
    const html = renderToStaticMarkup(await ArticlesPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    }));
    expect(html).toContain("Reading-time boundary");
    expect(html).not.toMatch(/\d+ min(?: read)?/);
  });

  it("preserves an explicit authoritative duration when the body is absent", async () => {
    serveArticle({ reading_minutes: 7 });
    expect((await getCmsArticles({ locale: "en", allowLocalFallback: false })).items[0].readingMinutes).toBe(7);
    expect((await getCmsArticle("reading-time-boundary", "en"))?.readingMinutes).toBe(7);
    const html = renderToStaticMarkup(await ArticlesPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    }));
    expect(html).toContain("7 min read");
  });

  it("still estimates duration from a returned body", async () => {
    serveArticle({ content_md: Array(660).fill("word").join(" ") });
    expect((await getCmsArticle("reading-time-boundary", "en"))?.readingMinutes).toBe(3);
  });
});
