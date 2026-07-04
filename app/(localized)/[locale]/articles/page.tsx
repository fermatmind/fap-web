import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { getCmsArticlesWithLastKnownGood, normalizeArticleListPage } from "@/lib/cms/articles";
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
      <h1 className="sr-only">{articleIndexTitle}</h1>
      {items.length > 0 ? (
        <>
          <section className="grid gap-5 border-y border-[var(--fm-border)] py-6 lg:grid-cols-[1.2fr_0.8fr]">
            {items.slice(0, 1).map((article) => {
              const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
              const readTime = article.readingMinutes
                ? locale === "zh"
                  ? `阅读时间：${article.readingMinutes} 分钟`
                  : `${article.readingMinutes} min read`
                : null;

              return (
                <article key={`${article.locale}:${article.slug}:lead`} data-testid={`articles-card-${article.slug}`} className="group">
                  <Link href={withLocale(`/articles/${article.slug}`)} className="block">
                    <ArticleResponsiveImage
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt ?? article.title}
                      width={article.coverImageWidth}
                      height={article.coverImageHeight}
                      variants={article.coverImageVariants}
                      mode="hero"
                      priority
                      className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
                    />
                  </Link>
                  <div className="mt-4 max-w-3xl space-y-3">
                    {article.category?.name ? (
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                        {article.category.name}
                      </p>
                    ) : null}
                    <h2 className="m-0 font-serif text-3xl font-semibold leading-tight text-[var(--fm-text)]">
                      <Link href={withLocale(`/articles/${article.slug}`)} className="group-hover:text-[var(--fm-accent)]">
                        {article.title}
                      </Link>
                    </h2>
                    {article.excerpt ? <p className="m-0 text-base leading-7 text-[var(--fm-text-muted)]">{article.excerpt}</p> : null}
                    <p className="m-0 text-sm text-[var(--fm-text-muted)]">
                      {[`${locale === "zh" ? "作者：" : "By "}${ARTICLE_AUTHOR_NAME}`, publishedAt, readTime]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  </div>
                </article>
              );
            })}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {items.slice(1, 3).map((article) => {
                const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
                const readTime = article.readingMinutes
                  ? locale === "zh"
                    ? `${article.readingMinutes} 分钟`
                    : `${article.readingMinutes} min`
                  : null;

                return (
                  <article key={`${article.locale}:${article.slug}:secondary`} data-testid={`articles-card-${article.slug}`} className="group">
                    <Link href={withLocale(`/articles/${article.slug}`)} className="block">
                      <ArticleResponsiveImage
                        src={article.coverImageUrl}
                        alt={article.coverImageAlt ?? article.title}
                        width={article.coverImageWidth}
                        height={article.coverImageHeight}
                        variants={article.coverImageVariants}
                        className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
                      />
                    </Link>
                    <div className="mt-3 space-y-2">
                      {article.category?.name ? (
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                          {article.category.name}
                        </p>
                      ) : null}
                      <h3 className="m-0 font-serif text-xl font-semibold leading-snug text-[var(--fm-text)]">
                        <Link href={withLocale(`/articles/${article.slug}`)} className="group-hover:text-[var(--fm-accent)]">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="m-0 text-xs text-[var(--fm-text-muted)]">{[publishedAt, readTime].filter(Boolean).join(" / ")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.slice(3).map((article) => {
              const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
              const badgeLabels = [
                article.category?.name ?? null,
                ...article.tags.map((tag) => tag.name).filter(Boolean),
              ].filter((label): label is string => Boolean(label)).slice(0, 2);
              const readTime = article.readingMinutes
                ? locale === "zh"
                  ? `${article.readingMinutes} 分钟`
                  : `${article.readingMinutes} min`
                : null;

              return (
                <article
                  key={`${article.locale}:${article.slug}`}
                  data-testid={`articles-card-${article.slug}`}
                  className="group flex min-h-full flex-col"
                >
                  <Link href={withLocale(`/articles/${article.slug}`)} className="block">
                    <ArticleResponsiveImage
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt ?? article.title}
                      width={article.coverImageWidth}
                      height={article.coverImageHeight}
                      variants={article.coverImageVariants}
                      className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
                    />
                  </Link>
                  <div className="mt-3 flex flex-1 flex-col gap-2">
                    {badgeLabels.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {badgeLabels.map((label) => (
                          <Badge key={`${article.slug}-${label}`}>{label}</Badge>
                        ))}
                      </div>
                    ) : null}
                    <h3 className="m-0 font-serif text-xl font-semibold leading-snug text-[var(--fm-text)]">
                      <Link href={withLocale(`/articles/${article.slug}`)} className="group-hover:text-[var(--fm-accent)]">
                        {article.title}
                      </Link>
                    </h3>
                    <p className="m-0 text-xs text-[var(--fm-text-muted)]">{[publishedAt, readTime].filter(Boolean).join(" / ")}</p>
                    <Link
                      href={withLocale(`/articles/${article.slug}`)}
                      className="mt-auto pt-1 text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                    >
                      {dict.articles.readArticle}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
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
