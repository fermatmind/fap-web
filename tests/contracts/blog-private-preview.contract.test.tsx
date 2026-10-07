import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BlogArchiveView } from "@/components/articles/BlogArchiveView";
import { BLOG_PREVIEW_OPS_ORIGIN, loadBlogPreview, readBlogPreviewMessage, type BlogPreviewPayload } from "@/lib/content/blogPreview";
import { getBrowserAnalyticsSuppressionDecision } from "@/lib/tracking/browserAnalyticsSuppression";
import { isIndexablePath } from "@/lib/seo/indexingPolicy";

const { get, detail } = vi.hoisted(() => ({ get: vi.fn(), detail: vi.fn() }));
vi.mock("@/lib/cms/articles", async (original) => ({ ...await original<typeof import("@/lib/cms/articles")>(), getCmsArticles: get, getCmsArticle: detail }));

function payload(): BlogPreviewPayload {
  return { type: "fermatmind.blog-preview.v1", surface_id: 20, locale: "en", configuration_sha256: "a".repeat(64),
    binding: { source_sha256: "b".repeat(64), package_sha256: "c".repeat(64), candidate_sha256: "d".repeat(64), surface_state_sha256: "e".repeat(64), owner_admin_user_id: 1 },
    blog: { schema_version: 1, configuration_state: "published", is_indexable: false, title: "Private draft introduction", description: "<script>copy is text</script>",
      categories: [{ slug: "personality", line_key: "personality-and-self-understanding", name: "Personality", description: "Category explanation", article_count: 2 }],
      featured_items: [{ id: 204, slug: "public-old-article", locale: "en", published_revision_id: 722 }] } };
}

describe("authenticated CMS to native blog layout preview", () => {
  it("accepts only the actual Ops opener and matching locale, never another window or unbound payload", () => {
    const opener = {} as Window;
    const event = { origin: BLOG_PREVIEW_OPS_ORIGIN, source: opener, data: payload() };
    expect(readBlogPreviewMessage(event, opener, "en")).toEqual(payload());
    expect(readBlogPreviewMessage(event, null, "en")).toBeNull();
    expect(readBlogPreviewMessage({ ...event, source: {} as Window }, opener, "en")).toBeNull();
    expect(readBlogPreviewMessage({ ...event, origin: "https://ops.fermatmind.com.evil.test" }, opener, "en")).toBeNull();
    expect(readBlogPreviewMessage(event, opener, "zh")).toBeNull();
    expect(readBlogPreviewMessage({ ...event, data: { ...payload(), binding: undefined } }, opener, "en")).toBeNull();
    expect(readBlogPreviewMessage({ ...event, data: { ...payload(), blog: { ...payload().blog, featured_items: [{ id: 204, slug: "../../ops/private", locale: "en" }] } } }, opener, "en")).toBeNull();
  });

  it("uses authoritative public cards and preserves current revision boundaries rather than draft article data", async () => {
    get.mockResolvedValue({ items: [], pagination: { currentPage: 1, perPage: 20, total: 0, lastPage: 1 }, landingSurface: null });
    detail.mockResolvedValue({ id: 999, locale: "en", status: "published", isPublic: true, publishedRevisionId: 4, publishedAt: null, scheduledAt: null });
    const state = await loadBlogPreview(payload(), "en", "", 1);
    expect(state.data?.blog?.featuredItems).toEqual([]);
    expect(get).toHaveBeenCalledWith(expect.objectContaining({ allowLocalFallback: false, usePublicCache: false }));
    expect(detail).toHaveBeenCalledWith("public-old-article", "en", false);
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
    const html = renderToStaticMarkup(<BlogArchiveView locale="en" state={state} preview />);
    expect(html).toContain("Private draft introduction");
    expect(html).toContain("&lt;script&gt;copy is text&lt;/script&gt;");
    expect(html).not.toContain("application/ld+json");
    expect(html).not.toContain("canonical");
  });

  it("does not load unknown archive filters and keeps both locales private and out of discoverability", async () => {
    get.mockClear(); detail.mockClear();
    await expect(loadBlogPreview(payload(), "en", "unknown", 1)).rejects.toThrow("Unknown preview category");
    expect(get).not.toHaveBeenCalled();
    expect(detail).not.toHaveBeenCalled();
    for (const locale of ["en", "zh"]) {
      const path = `/${locale}/cms-preview/articles`;
      expect(getBrowserAnalyticsSuppressionDecision({ pathname: path })).toEqual({ suppressed: true, reason: "private_route" });
      expect(isIndexablePath(path)).toBe(false);
    }
  });
});
