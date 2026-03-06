import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTestBySlug,
  listBlogPosts,
  listBlogPostsGroupedByTest,
  resolveTestTitleByLocale,
} from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

const GROUPS_PER_PAGE = 2;

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(String(raw ?? "1"), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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
  const isZh = locale === "zh";
  const lastPage = Math.max(1, Math.ceil(listBlogPostsGroupedByTest(locale).length / GROUPS_PER_PAGE));
  const currentPage = Math.min(parsePage(query.page), lastPage);
  const pathnameBase = isZh ? "/zh/articles" : "/en/articles";
  const pathname = currentPage > 1 ? `${pathnameBase}?page=${currentPage}` : pathnameBase;
  const hasLocalizedContent = listBlogPosts(locale).length > 0;
  const title =
    currentPage > 1
      ? `${dict.articles.title} · ${isZh ? `第 ${currentPage} 页` : `Page ${currentPage}`}`
      : dict.articles.title;

  return buildPageMetadata({
    locale,
    pathname,
    title,
    description: dict.articles.subtitle,
    noindex: !isZh && !hasLocalizedContent,
    alternatesByLocale: {
      en: currentPage > 1 ? `/en/articles?page=${currentPage}` : "/en/articles",
      zh: currentPage > 1 ? `/zh/articles?page=${currentPage}` : "/zh/articles",
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
  const withLocale = (path: string) => localizedPath(path, locale);
  const groups = listBlogPostsGroupedByTest(locale);
  const lastPage = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  const currentPage = Math.min(parsePage(query.page), lastPage);
  const pagedGroups = groups.slice(
    (currentPage - 1) * GROUPS_PER_PAGE,
    currentPage * GROUPS_PER_PAGE
  );
  const pageLink = (page: number) => (page <= 1 ? withLocale("/articles") : `${withLocale("/articles")}?page=${page}`);

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
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.articles.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{dict.articles.subtitle}</p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">{dict.articles.groupedByTestTitle}</p>
      </section>

      {pagedGroups.map((group) => {
        const test = getTestBySlug(group.relatedTestSlug);
        const groupTitle = test ? resolveTestTitleByLocale(test, locale) : group.relatedTestSlug;

        return (
          <section key={group.relatedTestSlug} data-testid={`articles-group-${group.relatedTestSlug}`} className="space-y-3">
            <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{groupTitle}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {group.posts.map((post) => (
                <Card
                  key={post.slug}
                  data-testid={`articles-card-${post.slug}`}
                  className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)] transition hover:shadow-[var(--fm-shadow-md)]"
                >
                  <CardHeader className="space-y-3">
                    <CardTitle className="font-serif text-[var(--fm-text)]">{post.title}</CardTitle>
                    <p className="m-0 text-sm text-[var(--fm-text-muted)]">{post.summary}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{dict.articles.voiceLabels[post.voice]}</Badge>
                      {(post.tags ?? []).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                      {dict.articles.updatedLabel}: {post.updatedAt}
                    </p>
                    <Link
                      href={withLocale(`/articles/${post.slug}`)}
                      className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                    >
                      {dict.articles.readArticle}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

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
