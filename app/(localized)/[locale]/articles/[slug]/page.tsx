import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCmsArticle, getCmsArticleSeo, type CmsArticle } from "@/lib/cms/articles";
import { findLandingCta } from "@/lib/landing/landingSurface";
import type { RelatedContentItem } from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function pathFromCanonicalUrl(value: string | null | undefined, fallbackPath: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallbackPath;
  }

  try {
    return new URL(normalized).pathname || fallbackPath;
  } catch {
    return normalized.startsWith("/") ? normalized : fallbackPath;
  }
}

function formatArticleDate(value: string | null, locale: Locale): string | null {
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

function buildCanonicalPath(slug: string, locale: Locale): string {
  return localizedPath(`/articles/${slug}`, locale);
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function resolveTwitterCard(value: string | null | undefined): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function renderArticleBody(article: CmsArticle) {
  if (article.contentHtml.trim()) {
    return <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />;
  }

  const renderedMarkdown = renderVeliteMdx(article.contentMd);
  if (renderedMarkdown) {
    return renderedMarkdown;
  }

  if (article.contentMd.trim()) {
    return <div className="whitespace-pre-wrap">{article.contentMd}</div>;
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [article, seo] = await Promise.all([
    getCmsArticle(slug, locale),
    getCmsArticleSeo(slug, locale),
  ]);

  if (!article) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildCanonicalPath(article.slug, locale);
  const seoCanonicalPath = pathFromCanonicalUrl(seo?.surface?.canonicalUrl ?? seo?.meta.canonical, canonicalPath);
  const title = seo?.surface?.title || seo?.meta.title || article.title;
  const description = seo?.surface?.description || seo?.meta.description || article.excerpt;
  const noindex = !article.isIndexable || shouldNoindex(seo?.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? article.coverImageUrl ?? undefined,
    seoSurface: seo?.surface,
    noindex: !seo?.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCanonicalPath(article.slug, "en"),
      zh: buildCanonicalPath(article.slug, "zh"),
      xDefault: "/",
    },
  });
  const canonical = seo?.surface?.canonicalUrl ?? seo?.meta.canonical ?? String(metadata.alternates?.canonical ?? "");
  const ogImage = seo?.surface?.og.image ?? seo?.meta.og.image ?? article.coverImageUrl ?? null;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
      languages: {
        ...metadata.alternates?.languages,
        en: seo?.meta.alternates.en ?? metadata.alternates?.languages?.en,
        "zh-CN": seo?.meta.alternates["zh-CN"] ?? metadata.alternates?.languages?.["zh-CN"],
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: seo?.surface?.og.title || seo?.meta.og.title || title,
      description: seo?.surface?.og.description || seo?.meta.og.description || description,
      images: ogImage ? [ogImage] : metadata.openGraph?.images,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(seo?.surface?.twitter.card ?? seo?.meta.twitter.card),
      title: seo?.surface?.twitter.title || seo?.meta.twitter.title || title,
      description: seo?.surface?.twitter.description || seo?.meta.twitter.description || description,
      images: (seo?.surface?.twitter.image ?? seo?.meta.twitter.image ?? ogImage)
        ? [seo?.surface?.twitter.image ?? seo?.meta.twitter.image ?? ogImage]
        : metadata.twitter?.images,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const [article, seo] = await Promise.all([
    getCmsArticle(slug, locale),
    getCmsArticleSeo(slug, locale),
  ]);

  if (!article) {
    return notFound();
  }

  const canonicalPath = buildCanonicalPath(article.slug, locale);
  const articleJsonLd =
    seo?.jsonld ||
    buildArticleJsonLd({
      path: canonicalPath,
      title: article.title,
      description: article.excerpt,
      locale,
      datePublished: article.publishedAt ?? article.updatedAt ?? article.createdAt ?? new Date().toISOString(),
      dateModified: article.updatedAt ?? article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
      authorName: "FermatMind Editorial",
    });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "文章" : "Articles", path: localizedPath("/articles", locale) },
    { name: article.title, path: canonicalPath },
  ]);
  const publishedAt = formatArticleDate(article.publishedAt, locale);
  const updatedAt = formatArticleDate(article.updatedAt, locale);
  const heroSummary = article.landingSurface?.summaryBlocks[0]?.body || article.excerpt;
  const badgeLabels = [
    article.category?.name ?? null,
    ...article.tags.map((tag) => tag.name).filter(Boolean),
  ].slice(0, 5);
  const backToArticlesCta = findLandingCta(article.landingSurface, "back_to_articles");
  const topicHubCta = findLandingCta(article.landingSurface, "topic_hub");
  const startTestCta = findLandingCta(article.landingSurface, "start_test");
  const relatedArticles: RelatedContentItem[] = [];
  const relatedCareerGuides: RelatedContentItem[] = [];
  const relatedTypes: RelatedContentItem[] = [];

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`article-jsonld-${slug}`} data={articleJsonLd} />
      <JsonLd id={`article-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "文章" : "Articles", href: localizedPath("/articles", locale) },
          { label: article.title },
        ]}
      />
      <section id="what-it-is" className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {dict.articles.kicker}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{article.title}</h1>
        {heroSummary ? <p className="m-0 text-[var(--fm-text-muted)]">{heroSummary}</p> : null}
      </section>

      <AnswerSurfaceSection surface={article.answerSurface} locale={locale} testId="article-answer-surface" />

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-3">
          <CardTitle className="font-serif text-[var(--fm-text)]">{article.title}</CardTitle>
          {article.excerpt ? <p className="m-0 text-sm text-[var(--fm-text-muted)]">{article.excerpt}</p> : null}
          <div className="space-y-1 text-xs text-[var(--fm-text-muted)]">
            {publishedAt ? (
              <p className="m-0">
                {locale === "zh" ? "发布于" : "Published"}: {publishedAt}
              </p>
            ) : null}
            {updatedAt ? (
              <p className="m-0">
                {dict.articles.updatedLabel}: {updatedAt}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {badgeLabels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badgeLabels.map((label) => (
                <Badge key={`${slug}-${label}`}>{label}</Badge>
              ))}
            </div>
          ) : null}
          <article
            id="how-it-works"
            data-testid="article-detail-content"
            className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:font-semibold [&_img]:rounded-xl [&_img]:border [&_img]:border-[var(--fm-border)] [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5"
          >
            {renderArticleBody(article)}
          </article>
          <section id="limitations" className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "本内容用于自我认知与教育参考，不构成医疗或法律建议。"
              : "This content is for self-discovery and educational use, not medical or legal advice."}
          </section>
          <section id="references" className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
            <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "参考资料" : "References"}
            </h2>
            <p className="mb-0 mt-3">
              {locale === "zh"
                ? "参考来源请见正文中的文献与公开资料。"
                : "Please refer to citations and public references listed in the article."}
            </p>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link
              href={backToArticlesCta?.href ?? localizedPath("/articles", locale)}
              className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {backToArticlesCta?.label || dict.articles.backToArticles}
            </Link>
            {topicHubCta ? (
              <Link
                href={topicHubCta.href}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {topicHubCta.label}
              </Link>
            ) : null}
            {startTestCta ? (
              <Link
                href={startTestCta.href}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {startTestCta.label}
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <RelatedContent
          title={locale === "zh" ? "相关文章" : "Related articles"}
          items={relatedArticles}
        />
        <RelatedContent
          title={locale === "zh" ? "相关职业发展内容" : "Related career guides"}
          items={relatedCareerGuides}
        />
        <RelatedContent
          title={locale === "zh" ? "相关人格画像" : "Related personality profiles"}
          items={relatedTypes}
        />
      </div>
    </Container>
  );
}
