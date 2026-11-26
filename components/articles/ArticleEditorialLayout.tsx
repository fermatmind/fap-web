import type { ReactNode } from "react";
import Link from "next/link";
import type { CmsArticle } from "@/lib/cms/articles";
import { articleCategoryLabel } from "@/lib/content/articleCategoryLabel";
import { editorialDeck, editorialReadingMinutes, editorialRelated, editorialScope } from "@/lib/content/articleEditorial";
import { blogArchivePath, type BlogArchiveState } from "@/lib/content/blogArchive";
import { renderCjkPunctuationText } from "@/lib/content/textPunctuation";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { ArticleByline } from "./ArticleByline";
import { ArticleReadingNavigation, type ArticleHeading } from "./ArticleReadingNavigation";
import "@/app/article-editorial.css";

const copy = {
  zh: { home: "首页", blog: "费马博客", all: "全部", career: "职业发展", personality: "人格测评", growth: "自我探索", tests: "免费测评", metadata: "文章信息", update: "更新", read: "阅读", author: "作者", check: "核对", checked: "依据一手来源核对", scope: "适用", tags: "标签", related: "相关文章", minutes: (n: number) => `约 ${n} 分钟` },
  en: { home: "Home", blog: "FermatMind Blog", all: "All", career: "Careers", personality: "Personality", growth: "Self-exploration", tests: "Free tests", metadata: "Article details", update: "Updated", read: "Reading time", author: "Author", check: "Review", checked: "Checked against primary sources", scope: "Scope", tags: "Tags", related: "Related articles", minutes: (n: number) => `${n} min read` },
  "zh-TW": { home: "首頁", blog: "費馬部落格", all: "全部", career: "職涯發展", personality: "人格測驗", growth: "自我探索", tests: "免費測驗", metadata: "文章資訊", update: "更新", read: "閱讀", author: "作者", check: "核對", checked: "依一手來源核對", scope: "適用", tags: "標籤", related: "相關文章", minutes: (n: number) => `約 ${n} 分鐘` },
};

type Props = {
  locale: DisplayLocale;
  article: CmsArticle;
  archive?: BlogArchiveState | null;
  relatedState?: BlogArchiveState;
  headings: ArticleHeading[];
  sourceChecked: boolean;
  editorial: boolean;
  schema: ReactNode;
  navigation: ReactNode;
  children: ReactNode;
};

function ArticleImage({ article, mode }: { article: CmsArticle; mode: "card" | "hero" }) {
  if (!article.coverImageUrl && !article.coverImageVariants?.[mode]) return null;
  return <ArticleResponsiveImage src={article.coverImageUrl} alt={article.coverImageAlt ?? article.title}
    width={article.coverImageWidth} height={article.coverImageHeight}
    variants={article.coverImageVariants} mode={mode} priority={mode === "hero"}
    className={mode === "hero" ? "fm-article-hero" : "fm-article-related-image"} />;
}

export function ArticleEditorialLayout({ locale, article, archive, relatedState, headings, sourceChecked, editorial, schema, navigation, children }: Props) {
  const t = copy[locale];
  const archiveState = archive;
  const blog = archiveState?.data?.blog;
  const categories = blog?.configurationState === "published" && !archiveState?.stale && !archiveState?.failed ? blog.categories : [];
  const category = categories.find((entry) => entry.slug === article.category?.slug);
  const categoryLabel = locale === "zh-TW" ? category?.name || article.category?.name : articleCategoryLabel(article.category, blog, locale);
  const categoryLinks = [
    ["career-and-learning", t.career], ["personality-and-self-understanding", t.personality], ["communication-and-personal-growth", t.growth],
  ].flatMap(([key, label]) => {
    const entry = categories.find(({ lineKey }) => lineKey === key);
    return entry ? [{ label, href: blogArchivePath(locale, entry.slug) }] : [];
  });
  const related = relatedState && !relatedState.stale && !relatedState.failed
    ? editorialRelated(article, relatedState.data?.items ?? [], locale) : [];
  const date = article.updatedAt ?? article.publishedAt;
  const updated = date && /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : null;
  const minutes = t.minutes(editorialReadingMinutes(article.contentHtml.trim() || article.contentMd, locale));
  const deck = editorialDeck(article.landingSurface?.summaryBlocks[0]?.body || article.excerpt, locale);
  const scope = editorialScope(article.contentMd);
  const tags = [...new Set(article.tags.map(({ name }) => name.trim()).filter((name) => name && name !== categoryLabel))].slice(0, 3);
  const hasContents = headings.some(({ level }) => level === 2);
  const author = <ArticleByline authorName={article.authorName} locale={locale} />;
  return (
    <main className="fm-article-page" data-language={locale} data-editorial-blocks={editorial || undefined}>
      {schema}
      <nav className="fm-blog-channel" aria-label={t.blog}>
        <div>
          <Link className="fm-blog-channel-name" href={blogArchivePath(locale)}>{t.blog}</Link>
          <div className="fm-blog-channel-categories">
            <Link href={blogArchivePath(locale)}>{t.all}</Link>
            {categoryLinks.map(({ label, href }) => <Link key={href} href={href}>{label}</Link>)}
          </div>
          <Link className="fm-blog-channel-tests" href={`/${locale}/tests`}>{t.tests} <span aria-hidden="true">→</span></Link>
        </div>
      </nav>
      <header id="what-it-is" className="fm-article-page-header">
        <nav className="fm-article-crumbs" aria-label={locale === "en" ? "Breadcrumb" : locale === "zh" ? "面包屑" : "麵包屑"}>
          <Link href={`/${locale}`}>{t.home}</Link><span aria-hidden="true">/</span>
          <Link href={blogArchivePath(locale)}>{t.blog}</Link>
          {categoryLabel && <><span aria-hidden="true">/</span>{category
            ? <Link href={blogArchivePath(locale, category.slug)}>{categoryLabel}</Link> : <span>{categoryLabel}</span>}</>}
        </nav>
        {categoryLabel && <p className="fm-article-eyebrow">{categoryLabel}</p>}
        <h1>{renderCjkPunctuationText(article.title, "article-title")}</h1>
        {deck && <p className="fm-article-deck">{deck}</p>}
        <div className="fm-article-inline-meta">{author}{updated && <time dateTime={updated}>{updated}</time>}<span>{minutes}</span></div>
        {navigation && <div className="fm-article-extra-nav">{navigation}</div>}
      </header>
      <div className="fm-article-layout" data-contents={hasContents || undefined}>
        <ArticleReadingNavigation locale={locale} headings={headings} />
        <div className="fm-article-main">
          <ArticleImage article={article} mode="hero" />
          {children}
        </div>
        <aside className="fm-article-sidebar" aria-label={t.metadata}>
          <dl className="fm-article-meta">
            {updated && <div><dt>{t.update}</dt><dd><time dateTime={updated}>{updated}</time></dd></div>}
            <div><dt>{t.read}</dt><dd>{minutes}</dd></div>
            <div><dt>{t.author}</dt><dd>{author}</dd></div>
            {sourceChecked && <div><dt>{t.check}</dt><dd>{t.checked}</dd></div>}
            {scope && <div><dt>{t.scope}</dt><dd>{scope}</dd></div>}
            {tags.length > 0 && <div><dt>{t.tags}</dt><dd>{tags.join(locale === "en" ? " · " : "、")}</dd></div>}
          </dl>
          {related.length > 0 && <section className="fm-article-related" aria-label={t.related}>
            <h2>{t.related}</h2>
            {related.map((item) => <Link key={item.slug} href={`/${locale}/articles/${item.slug}`}>
              <ArticleImage article={item} mode="card" /><span>{item.title}</span>
            </Link>)}
          </section>}
        </aside>
      </div>
    </main>
  );
}
