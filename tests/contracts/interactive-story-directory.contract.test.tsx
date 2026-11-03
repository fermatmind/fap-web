import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteractiveStoryLibrary } from "@/components/entertainment/InteractiveStoryLibrary";
import { StoryDirectory } from "@/components/entertainment/StoryDirectory";
import { FUN_CATEGORIES, MORE_TEST_PRODUCT_COUNT } from "@/components/entertainment/MoreTests";
import catalog from "@/lib/entertainment/catalog.json";
import questionnaires from "@/lib/questionnaires/catalog.json";
import { directoryQuizzes, storyQuizzes } from "@/lib/entertainment/directory";
import { canonicalUrl } from "@/lib/site";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";

describe("384 distinct products with separate test and story directories", () => {
  it("keeps the 285/99 split without counting locales, six assessments or the two adapted identities twice", () => {
    const tests = ["friendship-quiz", ...questionnaires.map(q => q.slug), ...directoryQuizzes.filter(q => !questionnaires.some(n => n.slug === q.slug)).map(q => q.slug)];
    expect(MORE_TEST_PRODUCT_COUNT).toBe(285);
    expect(tests).toHaveLength(285);
    expect(storyQuizzes).toHaveLength(99);
    expect(storyQuizzes.map(q => q.slug).sort()).toEqual(catalog.filter(q => !["response-color", "relationship-values"].includes(q.slug)).map(q => q.slug).sort());
    expect(storyQuizzes.every(q => !tests.includes(q.slug))).toBe(true);
    expect(new Set([...tests, ...storyQuizzes.map(q => q.slug)]).size).toBe(384);
    expect(tests).not.toContain("mbti-personality-test-16-personality-types");
    expect(tests.filter(s => s === "relationship-values")).toHaveLength(1);
    expect(tests.filter(s => s === "response-color")).toHaveLength(1);
  });
  it.each(["en", "zh"] as const)("renders all 99 actual %s destinations and aligned structured data and sitemap entries", locale => {
    const dom = document.createElement("div"); dom.innerHTML = renderToStaticMarkup(<InteractiveStoryLibrary locale={locale} />);
    expect(dom.querySelectorAll("[data-story-slug]")).toHaveLength(99);
    const allIds = [...dom.querySelectorAll("[id]")].map(n => n.id); expect(new Set(allIds).size).toBe(allIds.length);
    const schema = JSON.parse(dom.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(schema["@type"]).toBe("ItemList"); expect(schema.numberOfItems).toBe(99);
    const sitemap = appendFunSitemapEntries([]);
    for (const q of storyQuizzes) {
      const path = `/${locale}/tests/play/${q.slug}`;
      const card = dom.querySelector(`[data-story-slug="${q.slug}"]`)!;
      expect(card.querySelector('h4 a')?.getAttribute('href')).toBe(path);
      expect(card.querySelector('.catalog-item-start')?.getAttribute('href')).toBe(path);
      expect(card.textContent).toContain(q.title[locale]); expect(card.textContent).toContain(q.description[locale]);
      expect(card.querySelector('.explore-hero-symbol svg')).not.toBeNull();
      expect(schema.itemListElement.some((item: {url:string}) => item.url === canonicalUrl(path))).toBe(true);
      expect(sitemap.some(item => item.loc === `https://fermatmind.com${path}`)).toBe(true);
    }
    expect(dom.textContent).toContain(locale === 'zh' ? '合计 384个产品' : '384 products in total');
    expect(dom.querySelector('h1')).toBeNull();
  });
  it("searches story titles and slugs, filters a category and recovers from an empty result", () => {
    const items=storyQuizzes.map(q=>({slug:q.slug,category:q.category,title:q.title.zh,description:q.description.zh,href:`/zh/tests/play/${q.slug}`,meta:'6次选择'}));
    const {container}=render(<StoryDirectory items={items} categories={FUN_CATEGORIES} locale="zh" testToolCount={285}/>);
    const search=screen.getByRole('searchbox',{name:'搜索互动故事'});
    fireEvent.change(search,{target:{value:'weather-in-a-bottle'}}); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(1);
    expect(container.querySelector('[data-story-slug]')?.getAttribute('data-story-slug')).toBe('weather-in-a-bottle');
    fireEvent.change(search,{target:{value:'不会匹配123456'}}); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:'查看全部故事'})); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(99);
    fireEvent.click(screen.getByRole('button',{name:/动物与自然/})); expect(container.querySelectorAll('[data-story-slug]')).toHaveLength(storyQuizzes.filter(q=>q.category==='nature').length);
  });
});
