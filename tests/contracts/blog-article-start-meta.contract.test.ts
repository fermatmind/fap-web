import { describe, expect, it } from "vitest";
import { buildPublicArticleStartMeta } from "@/lib/tracking/publicArticleStartMeta";
import { appendSeoCtaContextParamsToHref, extractSeoCtaContextParamsFromSearchParams } from "@/lib/tracking/seoCtaAttribution";

const source = { source_page_type: "article_detail", source_slug: "big-five-vs-riasec-personality-traits-and-career-interests", content_id: "240", landing_path: "/en/articles/big-five-vs-riasec-personality-traits-and-career-interests" };
describe("public article source on future Big5 attempt creation", () => {
  it.each(["en", "zh"] as const)("preserves only validated %s public article dimensions through the existing landing/take link", locale => {
    const input = new URLSearchParams({ ...source, landing_path: `/${locale}/articles/${source.source_slug}`, token: "fixture-private", email: "fixture@example.test", attempt_id: "fixture-attempt" });
    const href = appendSeoCtaContextParamsToHref(`/${locale}/tests/big-five-personality-test-ocean-model/take?form=big5_90`, extractSeoCtaContextParamsFromSearchParams(input));
    const meta = buildPublicArticleStartMeta(new URL(href, "https://fermatmind.com").searchParams, locale);
    expect(meta).toEqual({ ...source, landing_path: `/${locale}/articles/${source.source_slug}` });
    expect(Object.keys(meta).sort()).toEqual(["content_id", "landing_path", "source_page_type", "source_slug"]);
    expect(JSON.stringify(meta)).not.toContain("fixture-private");
  });
  it("keeps ordinary non-article starts unchanged and supports the backend's public slug fallback", () => {
    expect(buildPublicArticleStartMeta(new URLSearchParams(), "en")).toEqual({});
    const query = new URLSearchParams(source);query.delete("content_id");
    expect(buildPublicArticleStartMeta(query,"en")).toEqual({ source_page_type: source.source_page_type, source_slug: source.source_slug, landing_path: source.landing_path });
  });
  it.each(["en", "zh"] as const)("normalizes legitimate UTM and discards private query/fragment values on %s article CTAs", locale => {
    const publicPath = `/${locale}/articles/${source.source_slug}`;
    const query = new URLSearchParams({ ...source, landing_path: publicPath + "?utm_source=legacy_qa&token=fixture-private&attempt_id=fixture-attempt#fixture-result" });
    const href = appendSeoCtaContextParamsToHref(`/${locale}/tests/big-five-personality-test-ocean-model/take?form=big5_90`, extractSeoCtaContextParamsFromSearchParams(query));
    const meta = buildPublicArticleStartMeta(new URL(href, "https://fermatmind.com").searchParams, locale);
    expect(meta).toEqual({ ...source, landing_path: publicPath });
    expect(buildPublicArticleStartMeta(query, locale)).toEqual(meta);
    expect(JSON.stringify(meta)).not.toMatch(/legacy_qa|fixture-private|fixture-attempt|fixture-result/);
  });
  it.each([{ content_id: "-1" }, { content_id: "9007199254740992" }, { source_slug: "../private" }, { landing_path: "/zh/articles/source" }, { landing_path: "https://evil.test" + source.landing_path }, { landing_path: "//fermatmind.com" + source.landing_path }, { landing_path: "/en/result/fixture-private?utm_source=fixture" }, { landing_path: "/en/result/../articles/" + source.source_slug }, { landing_path: source.landing_path.replace("/articles/", "/%61rticles/") }, { landing_path: source.landing_path + "\\?utm_source=fixture" }, { landing_path: source.landing_path + "?token=fixture\nprivate" }])("rejects invalid, private, external, and mismatched sources: %j", change => {
    expect(buildPublicArticleStartMeta(new URLSearchParams({ ...source, ...change }),"en")).toEqual({});
  });
});
