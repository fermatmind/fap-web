import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteractiveStoryLibrary } from "@/components/entertainment/InteractiveStoryLibrary";
import { StoryDirectory } from "@/components/entertainment/StoryDirectory";
import { MoreTests, FUN_CATEGORIES, MORE_TEST_PRODUCT_COUNT } from "@/components/entertainment/MoreTests";
import catalog from "@/lib/entertainment/catalog.json";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { directoryDescription, directoryQuizzes, globalHistoryStory, storyQuizzes } from "@/lib/entertainment/directory";
import directoryCopy from "@/lib/entertainment/directory-copy.json";
import { canonicalUrl } from "@/lib/site";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import coverSlugs from "@/components/tests/directory-cover-slugs.json";

describe("386 distinct products with separate test and story directories", () => {
  it("keeps the 285/101 split without counting locales, six assessments or the two adapted identities twice", () => {
    const tests = ["friendship-quiz", ...questionnaires.map(q => q.slug), ...directoryQuizzes.filter(q => !questionnaires.some(n => n.slug === q.slug)).map(q => q.slug)];
    expect(MORE_TEST_PRODUCT_COUNT).toBe(285);
    expect(tests).toHaveLength(285);
    expect(storyQuizzes).toHaveLength(101);
    expect(storyQuizzes.map(q => q.slug).sort()).toEqual([globalHistoryStory, ...catalog.filter(q => !["response-color", "relationship-values"].includes(q.slug))].map(q => q.slug).sort());
    expect(storyQuizzes.every(q => !tests.includes(q.slug))).toBe(true);
    expect(new Set([...tests, ...storyQuizzes.map(q => q.slug)]).size).toBe(386);
    expect(tests).not.toContain("mbti-personality-test-16-personality-types");
    expect(tests.filter(s => s === "relationship-values")).toHaveLength(1);
    expect(tests.filter(s => s === "response-color")).toHaveLength(1);
    expect(coverSlugs).toEqual([...tests, ...storyQuizzes.map(q => q.slug)].sort());
  });
  it("packages one distinct WebP asset per catalog identity", () => {
    const directory = join(process.cwd(), "public/images/test-covers");
    const files = coverSlugs.map(slug => `${slug}.webp`).sort();
    expect(readdirSync(directory).sort()).toEqual(files);
    const hashes = files.map(file => {
      const image = readFileSync(join(directory, file));
      expect(image.toString("ascii", 8, 12), file).toBe("WEBP");
      return createHash("sha256").update(image).digest("hex");
    });
    expect(new Set(hashes).size).toBe(files.length);
  });
  it("provides one concise, distinct synopsis in both languages for every catalog entry", () => {
    expect(Object.keys(directoryCopy).sort()).toEqual(coverSlugs);
    const descriptions = Object.values(directoryCopy);
    for (const locale of ["en", "zh"] as const) {
      expect(new Set(descriptions.map(copy => copy[locale])).size).toBe(coverSlugs.length);
    }
    for (const [slug, { zh, en }] of Object.entries(directoryCopy)) {
      expect(zh.trim().length, slug).toBeGreaterThan(8);
      expect(zh.length, slug).toBeLessThanOrEqual(64);
      expect(en.trim().split(/\s+/).length, slug).toBeGreaterThan(4);
      expect(en.trim().split(/\s+/).length, slug).toBeLessThanOrEqual(36);
    }
  });
  it.each(["en", "zh"] as const)("renders all 101 actual %s destinations and aligned structured data and sitemap entries", locale => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<InteractiveStoryLibrary locale={locale} />);
    expect(dom.querySelectorAll("[data-story-slug]")).toHaveLength(101);
    const allIds = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(allIds).size).toBe(allIds.length);
    const schema = JSON.parse(dom.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema["@type"]).toBe("ItemList"); expect(schema.numberOfItems).toBe(101);
    const sitemap = appendFunSitemapEntries([]);
    for (const q of storyQuizzes) {
      const path = `/${locale}/tests/play/${q.slug}`;
      const card = dom.querySelector(`[data-story-slug="${q.slug}"]`)!;
      expect(card.querySelector('h4 a')?.getAttribute('href')).toBe(path);
      expect(card.querySelector('.catalog-item-start')?.getAttribute('href')).toBe(path);
      expect(card.textContent).toContain(q.title[locale]);
      expect(card.querySelector('.catalog-item-body > p')?.textContent).toBe(directoryDescription(q)[locale]);
      expect(card.querySelector('[data-directory-cover] > img')?.getAttribute('src')).toBe(`/images/test-covers/${q.slug}.webp`);
      expect(schema.itemListElement.find((item: {url:string}) => item.url === canonicalUrl(path))?.description).toBe(directoryDescription(q)[locale]);
      expect(sitemap.some(item => item.loc === `https://fermatmind.com${path}`)).toBe(true);
    }
    expect(dom.textContent).toContain(locale === 'zh' ? '合计 386个产品' : '386 products in total');
    expect(dom.querySelector('h1')).toBeNull();
  });
  it.each(["en", "zh"] as const)("aligns the 285 visible %s test/tool cards with their structured data", locale => {
    const dom = document.createElement("div");
    dom.innerHTML = renderToStaticMarkup(<MoreTests locale={locale} />);
    const schema = JSON.parse(dom.querySelector('script[type="application/ld+json"]')!.textContent!);
    const links = [...dom.querySelectorAll('#more-tests h4 a')];
    expect(links).toHaveLength(285);
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.numberOfItems).toBe(285);
    const expected = links.map(a => ({ name: a.textContent, url: canonicalUrl(a.getAttribute("href")!) }));
    expect(schema.itemListElement.map((item: {name:string; url:string}) => ({ name:item.name, url:item.url }))).toEqual(expected);
    expect(new Set(expected.map(item => item.url)).size).toBe(285);
  });
  it("searches story titles and slugs, filters a category and recovers from an empty result", () => {
    const items=storyQuizzes.map(q=>({slug:q.slug,category:q.category,title:q.title.zh,description:q.description.zh,href:`/zh/tests/play/${q.slug}`,meta:'6次选择'}));
    const {container}=render(<StoryDirectory items={items} categories={FUN_CATEGORIES} locale="zh" testToolCount={285}/>);
    const search=screen.getByRole('searchbox',{name:'搜索互动故事'});
    fireEvent.change(search,{target:{value:'weather-in-a-bottle'}}); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(1);
    expect(container.querySelector('[data-story-slug]')?.getAttribute('data-story-slug')).toBe('weather-in-a-bottle');
    fireEvent.change(search,{target:{value:'不会匹配123456'}}); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:'查看全部故事'})); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(101);
    fireEvent.click(screen.getByRole('button',{name:/动物与自然/})); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(storyQuizzes.filter(q=>q.category==='nature').length);
  });
});
