import Link from "next/link";
import { articleByline } from "@/lib/content/articleByline";
import { BlogFeedLink } from "@/components/articles/BlogFeedLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import type { CmsArticle, CmsBlog } from "@/lib/cms/articles";
import { articleCategoryLabel } from "@/lib/content/articleCategoryLabel";
import { blogArchivePath } from "@/lib/content/blogArchive";
import { getDictSync } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/generateSchema";

import type { MouseEvent } from "react";
import type { BlogArchiveState } from "@/lib/content/blogArchive";

function localizedLabel(value: string | null | undefined, locale: Locale) {
  return locale === "en" && value && /[\u3400-\u9fff]/u.test(value) ? null : value;
}

function ArchiveCard({ article, blog, locale, featured, label }: { article: CmsArticle; blog?: CmsBlog; locale: Locale; featured: boolean; label: string }) {
  const date = article.publishedAt ? new Date(article.publishedAt) : null;
  const published = date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date) : null;
  const badges = [articleCategoryLabel(article.category, blog, locale), ...article.tags.map((tag) => tag.name)]
    .map((value) => localizedLabel(value, locale)).filter((value): value is string => Boolean(value)).slice(0, 2);
  return <article data-testid={`articles-card-${article.slug}`} data-article-id={article.id ?? undefined} data-published-revision-id={article.publishedRevisionId ?? undefined} data-article-layout={featured ? "featured" : "archive"} className="group flex min-h-full flex-col">
    <Link href={localizedPath(`/articles/${article.slug}`, locale)} className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4">
      <ArticleResponsiveImage src={article.coverImageUrl} alt={localizedLabel(article.coverImageAlt, locale) || article.title}
        width={article.coverImageWidth} height={article.coverImageHeight} variants={article.coverImageVariants}
        className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]" imageClassName="transition-transform motion-reduce:transition-none group-hover:scale-[1.025]" />
      <div className="mt-4 flex flex-1 flex-col gap-3">
        {badges.length ? <div className="flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}</div> : null}
        <h3 className="m-0 font-serif text-xl font-semibold leading-snug text-[var(--fm-text)] group-hover:text-[var(--fm-accent)]">{article.title}</h3>
        {article.excerpt ? <p className="m-0 line-clamp-3 text-sm leading-6 text-[var(--fm-text-muted)]">{article.excerpt}</p> : null}
        <div className="flex flex-wrap gap-2 text-xs text-[var(--fm-text-muted)]">
          {published ? <time dateTime={article.publishedAt!}>{published}</time> : null}
          {article.readingMinutes ? <span>{locale === "zh" ? `${article.readingMinutes} 分钟` : `${article.readingMinutes} min read`}</span> : null}
          <span>{articleByline(article.authorName, locale).name}</span>
        </div>
        <span className="mt-auto pt-1 text-sm font-semibold text-[var(--fm-accent)]">{label}</span>
      </div>
    </Link>
  </article>;
}

export function BlogArchiveView({ locale, state, category = "", page = 1, preview = false, onNavigate }: {
  locale: Locale; state: BlogArchiveState; category?: string; page?: number; preview?: boolean;
  onNavigate?: (category: string, page: number) => void;
}) {
  const dict = getDictSync(locale);
  const navigate = (slug: string, targetPage: number) => onNavigate ? (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault(); onNavigate(slug, targetPage);
  } : undefined;
  const blog = state.data?.blog;
  const configured = blog?.configurationState === "published";
  const activeCategory = configured ? blog.categories.find((item) => item.slug === category) : undefined;
  const unavailable = state.failed || Boolean(category && !activeCategory);
  const title = category ? activeCategory?.name || dict.articles.title : blog?.title || dict.articles.title;
  const visibleTitle = page > 1 ? `${title} · ${locale === "zh" ? `第 ${page} 页` : `Page ${page}`}` : title;
  const description = category ? activeCategory?.description : blog?.description;
  const path = blogArchivePath(locale, category, page);
  const items = state.data?.items || [];
  const featured = configured && !category && page === 1 ? blog.featuredItems : [];
  const pagination = state.data?.pagination;
  const breadcrumbs = [{ name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    ...(category ? [{ name: dict.articles.title, path: localizedPath("/articles", locale) }] : []), { name: visibleTitle, path }];
  return <Container as="main" className="space-y-10 py-10 md:space-y-14 md:py-16">
    {!unavailable && !preview ? <>
      <JsonLd id={`articles-collection-${locale}`} data={buildCollectionPageJsonLd({ path, title: visibleTitle, description: description || "", locale })} />
      <JsonLd id={`articles-breadcrumb-${locale}`} data={buildBreadcrumbJsonLd(breadcrumbs)} />
    </> : null}
    <Breadcrumb items={breadcrumbs.map((item, index) => ({ label: item.name, ...(index < breadcrumbs.length - 1 ? { href: item.path } : {}) }))} />
    <header className="max-w-3xl space-y-4 border-b border-[var(--fm-border)] pb-8">
      {category ? <p className="m-0 text-sm text-[var(--fm-text-muted)]">{dict.articles.title}</p> : null}
      <h1 className="m-0 font-serif text-4xl font-semibold leading-tight text-[var(--fm-text)] md:text-5xl">{visibleTitle}</h1>
      {description ? <p className="m-0 text-lg leading-8 text-[var(--fm-text-muted)]">{description}</p> : null}
      <BlogFeedLink locale={locale} />
    </header>
    {state.stale ? <p role="status" data-testid="blog-stale" className="rounded-lg border border-[var(--fm-border)] p-4 text-sm">{dict.articles.stale}</p> : null}
    {unavailable ? <div role="alert" data-testid="blog-error" className="space-y-3 rounded-lg border border-[var(--fm-border)] p-6"><p>{dict.articles.unavailable}</p><Link href={path}>{dict.articles.retry}</Link></div> : <>
      {!category && !configured ? <p role="status" data-testid="blog-configuration-state">{blog?.configurationState === "invalid" ? dict.articles.configurationError : dict.articles.configurationPending}</p> : null}
      {configured && blog.categories.length ? <nav aria-label={dict.articles.categories} className="flex flex-wrap gap-3" data-testid="blog-categories">
        <Link onClick={navigate("", 1)} href={blogArchivePath(locale)} aria-current={!category ? "page" : undefined} className="rounded-full border border-[var(--fm-border)] px-4 py-2 text-sm">{dict.articles.allArticles}</Link>
        {blog.categories.map((item) => <Link onClick={navigate(item.slug, 1)} key={item.slug} href={blogArchivePath(locale, item.slug)} aria-current={category === item.slug ? "page" : undefined} className="rounded-full border border-[var(--fm-border)] px-4 py-2 text-sm">{item.name} <span className="text-[var(--fm-text-muted)]">({item.articleCount})</span></Link>)}
      </nav> : null}
      {featured.length ? <section aria-labelledby="blog-featured-title" className="space-y-6">
        <h2 id="blog-featured-title" className="font-serif text-2xl font-semibold">{dict.articles.featured}</h2>
        <div data-testid="articles-featured-grid" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">{featured.map((article) => <ArchiveCard key={article.slug} article={article} blog={blog} locale={locale} featured label={dict.articles.readArticle} />)}</div>
      </section> : null}
      <section aria-labelledby="blog-latest-title" className="space-y-6" data-layout-mode={page === 1 ? "first-page" : "archive-page"}>
        <h2 id="blog-latest-title" className="font-serif text-2xl font-semibold">{category ? dict.articles.allArticles : dict.articles.latest}</h2>
        {items.length ? <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{items.map((article) => <ArchiveCard key={article.slug} article={article} blog={blog} locale={locale} featured={false} label={dict.articles.readArticle} />)}</div>
          : <p data-testid="blog-empty" className="rounded-lg border border-[var(--fm-border)] p-6">{dict.articles.empty}</p>}
      </section>
      {pagination && pagination.lastPage > 1 ? <nav aria-label={dict.articles.pagination} className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--fm-border)] pt-6">
        {page > 1 ? <Link onClick={navigate(category, page - 1)} rel="prev" href={blogArchivePath(locale, category, page - 1)}>{dict.articles.previousPage}</Link> : <span />}
        <span>{locale === "zh" ? `第 ${page} 页 / 共 ${pagination.lastPage} 页` : `Page ${page} of ${pagination.lastPage}`}</span>
        {page < Math.min(pagination.lastPage, 100) ? <Link onClick={navigate(category, page + 1)} rel="next" href={blogArchivePath(locale, category, page + 1)}>{dict.articles.nextPage}</Link> : <span />}
      </nav> : null}
    </>}
  </Container>;
}
