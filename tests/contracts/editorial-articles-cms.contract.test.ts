import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCmsArticle, getCmsArticleSeo } from "@/lib/cms/articles";
import { listBlogPosts } from "@/lib/content";

const ROOT = process.cwd();

const EDITORIAL_ARTICLE_SLUGS = [
  "how-personality-shapes-attitude-toward-ai",
  "which-love-script-fits-you-best",
  "are-infj-men-rare-or-socially-silenced",
  "best-valentines-date-by-personality-and-relationship-science",
  "how-16-personality-types-talk-to-an-ai-coach",
  "childhood-dream-job-still-shapes-career-choice",
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("editorial article CMS contract", () => {
  it("loads the six zh editorial articles through the existing blog authority", () => {
    const posts = listBlogPosts("zh").filter((post) => EDITORIAL_ARTICLE_SLUGS.includes(post.slug));

    expect(posts).toHaveLength(6);
    expect(new Set(posts.map((post) => post.slug)).size).toBe(6);

    for (const slug of EDITORIAL_ARTICLE_SLUGS) {
      const post = posts.find((item) => item.slug === slug);
      expect(post, slug).toBeDefined();

      const record = post as unknown as Record<string, unknown>;
      expect(record.locale).toBe("zh");
      expect(record.title).toEqual(expect.any(String));
      expect(record.seo_title).toEqual(expect.any(String));
      expect(record.meta_description).toEqual(expect.any(String));
      expect(record.excerpt).toEqual(expect.any(String));
      expect(record.summary).toEqual(expect.any(String));
      expect(record.cover_image).toEqual(`/static/articles/covers/${slug}.svg`);
      expect(record.cover_image_alt).toEqual(expect.any(String));
      expect(record.cover_image_prompt).toEqual(expect.any(String));
      expect(record.cover_image_style_tag).toBe("editorial-report-abstract-v1");
      expect(record.publish_status).toBe("published");
      expect(record.canonical_topic).toEqual(expect.any(String));
      expect(record.article_series).toBe("FermatMind 编辑部人格与关系科学");
      expect(record.voice).toBe("editorial");
      expect(Array.isArray(record.categories)).toBe(true);
      expect((record.categories as string[]).length).toBeGreaterThan(0);
      expect(Array.isArray(record.tags)).toBe(true);
      expect((record.tags as string[]).length).toBeGreaterThan(0);
      expect(Array.isArray(record.citations)).toBe(true);
      expect((record.citations as string[]).length).toBeGreaterThan(0);

      const sourcePath = path.join(ROOT, "content", "blog", slug, "zh.mdx");
      const source = fs.readFileSync(sourcePath, "utf8");
      expect(source).toContain("## 执行摘要");
      expect(source).toContain("## 参考文献");
      expect(source).not.toMatch(/^\[\d+\]\s+/m);
      expect(source).toMatch(/^【1】\s+/m);
      expect(source).toMatch(/^【1】[^\n]+\n\n【2】\s+/m);
      const coverPath = path.join(ROOT, "public", "static", "articles", "covers", `${slug}.svg`);
      expect(fs.existsSync(coverPath)).toBe(true);
      expect(fs.readFileSync(coverPath, "utf8")).toContain('width="1200" height="675"');
    }
  });

  it("maps local editorial fields into the CMS article fallback shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: false }), { status: 404 }))
    );

    const article = await getCmsArticle("how-personality-shapes-attitude-toward-ai", "zh");
    expect(article).not.toBeNull();
    expect(article?.coverImageUrl).toBe("/static/articles/covers/how-personality-shapes-attitude-toward-ai.svg");
    expect(article?.coverImageAlt).toContain("算法节点");
    expect(article?.category?.name).toBe("人工智能与人格");
    expect(article?.tags.map((tag) => tag.name)).toEqual(expect.arrayContaining(["人格心理学", "AI", "算法信任"]));

    const seo = await getCmsArticleSeo("how-personality-shapes-attitude-toward-ai", "zh");
    expect(seo).not.toBeNull();
    expect(seo?.meta.title).toContain("FermatMind");
    expect(seo?.meta.description).toContain("人格倾向");
    expect(seo?.meta.og.image).toBe("/static/articles/covers/how-personality-shapes-attitude-toward-ai.svg");
    expect(seo?.meta.twitter.image).toBe("/static/articles/covers/how-personality-shapes-attitude-toward-ai.svg");
  });
});
