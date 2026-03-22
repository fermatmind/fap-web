import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCmsArticles } from "@/lib/cms/articles";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { findLandingCta } from "@/lib/landing/landingSurface";

export const dynamic = "force-dynamic";

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(String(raw ?? "1"), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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
  const { items, pagination, landingSurface } = await getCmsArticles({
    locale,
    page: requestedPage,
  });
  const currentPage = pagination.currentPage > 0 ? pagination.currentPage : requestedPage;
  const lastPage = Math.max(1, pagination.lastPage);
  const heroTitle = landingSurface?.summaryBlocks[0]?.title || dict.articles.title;
  const heroSummary = landingSurface?.summaryBlocks[0]?.body || dict.articles.subtitle;
  const featuredArticleCta = findLandingCta(landingSurface, "featured_article");
  const topicHubCta = findLandingCta(landingSurface, "topic_hub");
  const startTestCta = findLandingCta(landingSurface, "start_test");
  const pageLink = (page: number) => (page <= 1 ? withLocale("/articles") : `${withLocale("/articles")}?page=${page}`);
  const publishedLabel = locale === "zh" ? "发布于" : "Published";
  const emptyTitle = locale === "zh" ? "暂无已发布文章" : "No published articles yet";
  const emptyDescription =
    locale === "zh"
      ? "CMS 当前没有返回可展示的文章内容，或当前环境尚未提供文章接口数据。"
      : "The CMS did not return any article content for this locale, or this environment does not expose article data yet.";

  return (
    <Container as="main" className="space-y-6 py-10">
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: dict.articles.title },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{dict.articles.kicker}</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{heroTitle}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{heroSummary}</p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? `第 ${currentPage} / ${lastPage} 页，共 ${pagination.total} 篇`
            : `Page ${currentPage} of ${lastPage}, ${pagination.total} total`}
        </p>
        {featuredArticleCta || topicHubCta || startTestCta ? (
          <div className="flex flex-wrap gap-3">
            {[featuredArticleCta, topicHubCta, startTestCta]
              .filter((item): item is NonNullable<typeof item> => Boolean(item))
              .map((cta) => (
                <Link
                  key={cta.key}
                  href={cta.href}
                  className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {cta.label}
                </Link>
              ))}
          </div>
        ) : null}
      </section>

      {items.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((article) => {
            const publishedAt = formatArticleDate(article.publishedAt ?? article.updatedAt, locale);
            const badgeLabels = [
              article.category?.name ?? null,
              ...article.tags.map((tag) => tag.name).filter(Boolean),
            ].slice(0, 4);

            return (
              <Card
                key={`${article.locale}:${article.slug}`}
                data-testid={`articles-card-${article.slug}`}
                className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)] transition hover:shadow-[var(--fm-shadow-md)]"
              >
                <CardHeader className="space-y-3">
                  <CardTitle className="font-serif text-[var(--fm-text)]">
                    <Link href={withLocale(`/articles/${article.slug}`)} className="hover:text-[var(--fm-accent)]">
                      {article.title}
                    </Link>
                  </CardTitle>
                  <p className="m-0 text-sm text-[var(--fm-text-muted)]">{article.excerpt || "-"}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {badgeLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {badgeLabels.map((label) => (
                        <Badge key={`${article.slug}-${label}`}>{label}</Badge>
                      ))}
                    </div>
                  ) : null}
                  {publishedAt ? (
                    <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                      {publishedLabel}: {publishedAt}
                    </p>
                  ) : null}
                  <Link
                    href={withLocale(`/articles/${article.slug}`)}
                    className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                  >
                    {dict.articles.readArticle}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">{emptyTitle}</CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">{emptyDescription}</p>
          </CardHeader>
        </Card>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm text-[var(--fm-text-muted)] shadow-[var(--fm-shadow-sm)]">
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
