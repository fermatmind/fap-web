"use client";
import { useDeferredValue, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { ExploreHeroArtwork } from "@/components/tests/ExploreHeroArtwork";
import { DirectoryCover } from "@/components/tests/DirectoryCover";
import "@/components/tests/tests-catalog.css";

type StoryItem = { slug: string; category: string; title: string; description: string; href: string; hrefLang?: string; meta: string };
const normalize = (text: string) => text.normalize("NFKC").toLocaleLowerCase().replace(/[\p{White_Space}\p{Punctuation}]/gu, "");
export function StoryDirectory({ items, categories, locale, testToolCount }: {
  items: StoryItem[]; categories: Record<string, { en: string; zh: string; "zh-TW"?: string }>; locale: DisplayLocale; testToolCount: number;
}) {
  const zh = locale === "zh";
  const taiwan = locale === "zh-TW";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const deferred = useDeferredValue(normalize(query));
  const groups = Object.entries(categories).filter(([key]) => items.some((item) => item.category === key));
  const filtered = items.filter((item) => (!category || item.category === category) && normalize(`${item.title} ${item.description} ${item.slug}`).includes(deferred));
  return <section id="interactive-stories" className="catalog-workspace catalog-story-library" aria-labelledby="interactive-stories-title">
    <div className="catalog-container">
      <header className="catalog-more-heading">
        <div>
          <h2 id="interactive-stories-title">{taiwan ? "原創互動故事與趣味探索" : zh ? "原创互动故事与趣味探索" : "Original interactive stories and playful exploration"}</h2>
          <p>{taiwan ? "走進一段想像，選擇故事的走法。完整閱讀結局、並列畫像與創作點子；這些原創玩法屬於休閒探索，不作科學人格測量。" : zh ? "走进一段想象，选择故事的走法。完整阅读结局、并列画像与创作点子；这些原创玩法属于休闲探索，不作科学人格测量。" : "Step into an imagined scene and choose how it unfolds. Read complete endings, tied portraits and creative ideas. These original activities are recreational exploration, rather than scientific personality measures."}</p>
          <p className="catalog-story-counts"><a href="#more-tests">{taiwan ? `測驗／工具 ${testToolCount} 項` : zh ? `测试／工具 ${testToolCount}项` : `${testToolCount} tests / tools`}</a><span>{taiwan ? `互動故事 ${items.length} 項` : zh ? `互动故事 ${items.length}项` : `${items.length} interactive stories`}</span><span>{taiwan ? `合計 ${testToolCount + items.length} 個項目` : zh ? `合计 ${testToolCount + items.length}个产品` : `${testToolCount + items.length} products in total`}</span></p>
        </div>
      </header>
      <div className="catalog-category-bar">
        <nav aria-label={taiwan ? "互動故事分類" : zh ? "互动故事分类" : "Interactive story categories"}>
          <button aria-pressed={!category} onClick={() => setCategory("")}>{taiwan ? "全部故事" : zh ? "全部故事" : "All stories"}<small>{items.length}</small></button>
          {groups.map(([key, label]) => <button key={key} aria-pressed={category === key} onClick={() => setCategory((value) => value === key ? "" : key)}>{label[locale] ?? label.zh}<small>{items.filter((item) => item.category === key).length}</small></button>)}
        </nav>
        <label className="catalog-search"><Search size={20} aria-hidden="true" /><span className="sr-only">{taiwan ? "搜尋互動故事" : zh ? "搜索互动故事" : "Search interactive stories"}</span><input type="search" aria-label={taiwan ? "搜尋互動故事" : zh ? "搜索互动故事" : "Search interactive stories"} placeholder={taiwan ? "搜尋故事、週末、林間…" : zh ? "搜索故事、周末、林间…" : "Search stories, weekends, woodland…"} value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim()) setCategory(""); }} />{query && <button aria-label={taiwan ? "清除故事搜尋" : zh ? "清空故事搜索" : "Clear story search"} onClick={() => setQuery("")}><X size={18} /></button>}</label>
      </div>
      <p className="sr-only" role="status">{taiwan ? `找到 ${filtered.length} 項故事` : zh ? `找到${filtered.length}项故事` : `${filtered.length} matching stories`}</p>
      {filtered.length === 0 && <div className="catalog-empty"><h3>{taiwan ? "沒有找到匹配的故事" : zh ? "没有找到匹配的故事" : "No matching stories"}</h3><button onClick={() => { setQuery(""); setCategory(""); }}>{taiwan ? "查看全部故事" : zh ? "查看全部故事" : "Show all stories"}</button></div>}
      {groups.map(([key, label]) => {
        const entries = filtered.filter((item) => item.category === key);
        return entries.length ? <section key={key} className="catalog-group" aria-labelledby={`story-group-${key}`}>
          <div className="catalog-group-heading"><h3 id={`story-group-${key}`}>{label[locale] ?? label.zh}</h3><span>{entries.length}</span></div>
          <div className="catalog-item-grid">{entries.map((item) => <article key={item.slug} data-story-slug={item.slug} className={`catalog-item catalog-item-${key}`}>
            <DirectoryCover slug={item.slug}>
              <ExploreHeroArtwork slug={item.slug} category={key} />
            </DirectoryCover>
            <div className="catalog-item-body"><h4><a href={item.href} hrefLang={item.hrefLang}>{item.title}</a></h4><p>{item.description}</p><span className="catalog-item-meta">{item.meta}</span><a className="catalog-item-start" href={item.href} hrefLang={item.hrefLang} aria-label={`${taiwan ? "進入故事" : zh ? "进入故事" : "Open story"} · ${item.title}`}><span>{taiwan ? "進入故事" : zh ? "进入故事" : "Open story"}{taiwan && item.hrefLang === "zh-CN" ? "（簡體中文）" : ""}</span><ArrowRight size={16} aria-hidden="true" /></a></div>
          </article>)}</div>
        </section> : null;
      })}
    </div>
  </section>;
}
