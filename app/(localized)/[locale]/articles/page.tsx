import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import {
  getCmsArticlesWithLastKnownGood,
  normalizeArticleListPage,
  type CmsArticle,
} from "@/lib/cms/articles";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const ARTICLE_AUTHOR_NAME = "Fermat Institute";

function parsePage(value: string | string[] | undefined): number {
  return normalizeArticleListPage(value);
}

function formatArticleDate(value: string | null, locale: "en" | "zh"): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatArticleReadTime(minutes: number | null, locale: "en" | "zh", verbose = false): string | null {
  if (!minutes) {
    return null;
  }

  if (locale === "zh") {
    return verbose ? `阅读时间：${minutes} 分钟` : `${minutes} 分钟`;
  }

  return `${minutes} min${verbose ? " read" : ""}`;
}

function ArticleArchiveCard({
  article,
  locale,
  href,
  readArticleLabel,
}: {
  article: CmsArticle;
  locale: "en" | "zh";
  href: string;
  readArticleLabel: string;
}) {
  const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
  const readTime = formatArticleReadTime(article.readingMinutes, locale);
  const badgeLabels = [
    article.category?.name ?? null,
    ...article.tags.map((tag) => tag.name).filter(Boolean),
  ]
    .filter((label): label is string => Boolean(label))
    .slice(0, 2);

  return (
    <article
      data-testid={`articles-card-${article.slug}`}
      data-article-layout="archive"
      className="group flex min-h-full flex-col sm:col-span-2 lg:col-span-2"
    >
      <Link
        href={href}
        className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4"
      >
        <ArticleResponsiveImage
          src={article.coverImageUrl}
          alt={article.coverImageAlt ?? article.title}
          width={article.coverImageWidth}
          height={article.coverImageHeight}
          variants={article.coverImageVariants}
          className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
          imageClassName="transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none group-hover:scale-[1.025]"
        />
        <div className="mt-3 flex flex-1 flex-col gap-2">
          {badgeLabels.length > 0 ? (
            <div className="flex min-h-6 flex-wrap gap-2">
              {badgeLabels.map((label) => (
                <Badge key={`${article.slug}-${label}`}>{label}</Badge>
              ))}
            </div>
          ) : null}
          <h2 className="m-0 min-h-[4.5rem] line-clamp-3 font-serif text-xl font-semibold leading-snug text-[var(--fm-text)] transition-colors group-hover:text-[var(--fm-accent)]">
            {article.title}
          </h2>
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">{[publishedAt, readTime].filter(Boolean).join(" / ")}</p>
          <span className="mt-auto pt-1 text-sm font-semibold text-[var(--fm-accent)] transition-colors group-hover:text-[var(--fm-accent-strong)]">
            {readArticleLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const currentPage = parsePage(query.page);
  const pathname = currentPage > 1 ? `${localizedPath("/articles", locale)}?page=${currentPage}` : localizedPath("/articles", locale);
  const title =
    currentPage > 1
      ? `${dict.articles.title} · ${locale === "zh" ? `第 ${currentPage} 页` : `Page ${currentPage}`}`
      : dict.articles.title;

  return buildPageMetadata({
    locale,
    pathname,
    title,
    description: dict.articles.subtitle,
    alternatesByLocale: {
      en: currentPage > 1 ? "/en/articles?page=".concat(String(currentPage)) : "/en/articles",
      zh: currentPage > 1 ? "/zh/articles?page=".concat(String(currentPage)) : "/zh/articles",
      xDefault: "/",
    },
  });
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const requestedPage = parsePage(query.page);
  const withLocale = (path: string) => localizedPath(path, locale);
  const { items, pagination } = await getCmsArticlesWithLastKnownGood({
    locale,
    page: requestedPage,
  })
    .then((result) => result.value)
    .catch(() => ({
      items: [],
      pagination: {
        currentPage: requestedPage,
        perPage: 20,
        total: 0,
        lastPage: 1,
      },
      landingSurface: null,
    }));
  const currentPage = pagination.currentPage > 0 ? pagination.currentPage : requestedPage;
  const lastPage = Math.max(1, pagination.lastPage);
  const pageLink = (page: number) => (page <= 1 ? withLocale("/articles") : `${withLocale("/articles")}?page=${page}`);
  const articlesPath = pageLink(currentPage);
  const articleIndexTitle =
    currentPage > 1
      ? `${dict.articles.title} · ${locale === "zh" ? `第 ${currentPage} 页` : `Page ${currentPage}`}`
      : dict.articles.title;
  const collectionPageJsonLd = buildCollectionPageJsonLd({
    path: articlesPath,
    title: articleIndexTitle,
    description: dict.articles.subtitle,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: dict.articles.title, path: withLocale("/articles") },
  ]);
  const emptyTitle = locale === "zh" ? "暂无已发布文章" : "No published articles yet";
  const emptyDescription =
    locale === "zh"
      ? "CMS 当前没有返回可展示的文章内容，或当前环境尚未提供文章接口数据。"
      : "The CMS did not return any article content for this locale, or this environment does not expose article data yet.";
  const isFirstPage = currentPage === 1;
  const featuredArticles = isFirstPage ? items.slice(0, 4) : [];
  const featuredLead = featuredArticles[0] ?? null;
  const archiveArticles = isFirstPage ? items.slice(4) : items;

  return (
    <Container as="main" className="space-y-8 py-10">
      <JsonLd id={`articles-collection-${locale}`} data={collectionPageJsonLd} />
      <JsonLd id={`articles-breadcrumb-${locale}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: dict.articles.title },
        ]}
      />
      <h1 className={isFirstPage ? "sr-only" : "m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]"}>
        {articleIndexTitle}
      </h1>
      {items.length > 0 ? (
        <>
          {featuredLead ? (
            <section
              className="grid gap-6 border-y border-[var(--fm-border)] py-6 lg:grid-cols-[1.2fr_0.8fr]"
              data-testid="articles-featured-grid"
            >
              <article
                key={`${featuredLead.locale}:${featuredLead.slug}:lead`}
                data-testid={`articles-card-${featuredLead.slug}`}
                data-article-layout="featured-lead"
                className="group h-full"
              >
                <Link
                  href={withLocale(`/articles/${featuredLead.slug}`)}
                  className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4"
                >
                  <ArticleResponsiveImage
                    src={featuredLead.coverImageUrl}
                    alt={featuredLead.coverImageAlt ?? featuredLead.title}
                    width={featuredLead.coverImageWidth}
                    height={featuredLead.coverImageHeight}
                    variants={featuredLead.coverImageVariants}
                    mode="hero"
                    priority
                    className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
                    imageClassName="transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none group-hover:scale-[1.02]"
                  />
                  <div className="mt-4 flex flex-1 flex-col space-y-3">
                    {featuredLead.category?.name ? (
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                        {featuredLead.category.name}
                      </p>
                    ) : null}
                    <h2 className="m-0 max-w-3xl font-serif text-3xl font-semibold leading-tight text-[var(--fm-text)] transition-colors group-hover:text-[var(--fm-accent)]">
                      {featuredLead.title}
                    </h2>
                    {featuredLead.excerpt ? (
                      <p className="m-0 max-w-3xl text-base leading-7 text-[var(--fm-text-muted)]">{featuredLead.excerpt}</p>
                    ) : null}
                    <p className="m-0 pt-1 text-sm text-[var(--fm-text-muted)]">
                      {[
                        `${locale === "zh" ? "作者：" : "By "}${ARTICLE_AUTHOR_NAME}`,
                        formatArticleDate(featuredLead.publishedAt ?? featuredLead.updatedAt, locale),
                        formatArticleReadTime(featuredLead.readingMinutes, locale, true),
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  </div>
                </Link>
              </article>

              {featuredArticles.length > 1 ? (
                <div className="grid gap-5 sm:grid-cols-3 lg:auto-rows-fr lg:grid-cols-1">
                  {featuredArticles.slice(1).map((article) => {
                    const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
                    const readTime = formatArticleReadTime(article.readingMinutes, locale);

                    return (
                      <article
                        key={`${article.locale}:${article.slug}:secondary`}
                        data-testid={`articles-card-${article.slug}`}
                        data-article-layout="featured-secondary"
                        className="group h-full"
                      >
                        <Link
                          href={withLocale(`/articles/${article.slug}`)}
                          className="flex h-full flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4 lg:grid lg:grid-cols-[minmax(8rem,0.82fr)_minmax(0,1.18fr)] lg:gap-4"
                        >
                          <ArticleResponsiveImage
                            src={article.coverImageUrl}
                            alt={article.coverImageAlt ?? article.title}
                            width={article.coverImageWidth}
                            height={article.coverImageHeight}
                            variants={article.coverImageVariants}
                            className="aspect-[16/9] rounded-lg border border-[var(--fm-border)] lg:h-full lg:aspect-auto"
                            imageClassName="transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none group-hover:scale-[1.025]"
                          />
                          <div className="mt-3 flex min-w-0 flex-col gap-2 lg:mt-0 lg:py-1">
                            {article.category?.name ? (
                              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                                {article.category.name}
                              </p>
                            ) : null}
                            <h2 className="m-0 line-clamp-3 font-serif text-lg font-semibold leading-snug text-[var(--fm-text)] transition-colors group-hover:text-[var(--fm-accent)]">
                              {article.title}
                            </h2>
                            <p className="m-0 mt-auto text-xs text-[var(--fm-text-muted)]">
                              {[publishedAt, readTime].filter(Boolean).join(" / ")}
                            </p>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ) : null}

          {archiveArticles.length > 0 ? (
            <section
              className="grid auto-rows-fr grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-4 lg:grid-cols-8"
              data-testid="articles-archive-grid"
              data-layout-mode={isFirstPage ? "first-page" : "archive-page"}
            >
              {archiveArticles.map((article) => (
                <ArticleArchiveCard
                  key={`${article.locale}:${article.slug}`}
                  article={article}
                  locale={locale}
                  href={withLocale(`/articles/${article.slug}`)}
                  readArticleLabel={dict.articles.readArticle}
                />
              ))}
            </section>
          ) : null}
        </>
      ) : (
        <section className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{emptyTitle}</h2>
          <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{emptyDescription}</p>
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--fm-border)] pt-4 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">
          {locale === "zh"
            ? `第 ${currentPage} / ${lastPage} 页`
            : `Page ${currentPage} of ${lastPage}`}
        </p>
        <div className="flex items-center gap-4">
          {currentPage > 1 ? (
            <Link href={pageLink(currentPage - 1)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
              {locale === "zh" ? "上一页" : "Previous"}
            </Link>
          ) : null}
          {currentPage < lastPage ? (
            <Link href={pageLink(currentPage + 1)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
              {locale === "zh" ? "下一页" : "Next"}
            </Link>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
