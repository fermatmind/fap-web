import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { RelatedContent } from "@/components/content/RelatedContent";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import {
  getCmsArticleSeoWithLastKnownGood,
  getCmsArticleWithLastKnownGood,
  type CmsArticle,
  type CmsArticleSeoPayload,
} from "@/lib/cms/articles";
import { findLandingCta } from "@/lib/landing/landingSurface";
import type { RelatedContentItem } from "@/lib/content";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
} from "@/lib/seo/generateSchema";
import { resolveArticleJsonLdAuthority } from "@/lib/seo/articlePersonalityAuthority";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const ARTICLE_AUTHOR_NAME = "Fermat Institute";

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

function normalizeArticleJsonLdAuthor(data: unknown): unknown | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  return {
    ...data,
    author: {
      "@type": "Organization",
      name: ARTICLE_AUTHOR_NAME,
    },
  };
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return localizedPath(`/articles/${slug}`, locale);
}

function articleAlternateLanguages(seo: CmsArticleSeoPayload | null): Record<string, string> {
  const languages: Record<string, string> = {};

  if (seo?.meta.alternates.en) {
    languages.en = seo.meta.alternates.en;
  }

  if (seo?.meta.alternates["zh-CN"]) {
    languages["zh-CN"] = seo.meta.alternates["zh-CN"];
  }

  return languages;
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function renderArticleBody(article: CmsArticle) {
  if (article.contentHtml.trim()) {
    return <SanitizedCmsHtml html={article.contentHtml} />;
  }

  if (article.contentMd.trim()) {
    return renderSimpleMarkdown(article.contentMd) ?? <div className="whitespace-pre-wrap">{article.contentMd}</div>;
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
    getCmsArticleWithLastKnownGood(slug, locale)
      .then((result) => result.value)
      .catch(() => null),
    getCmsArticleSeoWithLastKnownGood(slug, locale)
      .then((result) => result.value)
      .catch(() => null),
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
  const articleImage = article.coverImageVariants.og?.url ?? article.coverImageVariants.hero?.url ?? article.coverImageUrl;

  const metadata = buildPageMetadata({
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? articleImage ?? undefined,
    seoSurface: seo?.surface,
    noindex: !seo?.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCanonicalPath(article.slug, "en"),
      zh: buildCanonicalPath(article.slug, "zh"),
      xDefault: "/",
    },
  });

  const canonical = seo?.surface?.canonicalUrl ?? seo?.meta.canonical ?? String(metadata.alternates?.canonical ?? "");
  const ogImage = seo?.surface?.og.image ?? seo?.meta.og.image ?? articleImage ?? null;

  const twitterImages = normalizeTwitterImages(
    seo?.surface?.twitter.image,
    seo?.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
      languages: articleAlternateLanguages(seo),
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
      ...metadata.twitter,
      card: resolveTwitterCard(seo?.surface?.twitter.card ?? seo?.meta.twitter.card),
      title: seo?.surface?.twitter.title || seo?.meta.twitter.title || title,
      description: seo?.surface?.twitter.description || seo?.meta.twitter.description || description,
      images: twitterImages,
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
    getCmsArticleWithLastKnownGood(slug, locale)
      .then((result) => result.value)
      .catch(() => null),
    getCmsArticleSeoWithLastKnownGood(slug, locale)
      .then((result) => result.value)
      .catch(() => null),
  ]);

  if (!article) {
    return notFound();
  }

  const canonicalPath = buildCanonicalPath(article.slug, locale);
  const cmsArticleSeoJsonLd = normalizeArticleJsonLdAuthor(seo?.jsonld);
  const articleJsonLdAuthority = resolveArticleJsonLdAuthority({
    cmsArticleSeoJsonLd,
    article,
  });
  const articleJsonLd = cmsArticleSeoJsonLd || (
    articleJsonLdAuthority.canRenderJsonLd
      ? buildArticleJsonLd({
        path: canonicalPath,
        title: article.title,
        description: article.excerpt,
        locale,
        datePublished: article.publishedAt ?? article.updatedAt ?? article.createdAt ?? new Date().toISOString(),
        dateModified: article.updatedAt ?? article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
        authorName: ARTICLE_AUTHOR_NAME,
      })
      : null
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "文章" : "Articles", path: localizedPath("/articles", locale) },
    { name: article.title, path: canonicalPath },
  ]);
  const faqItems = article.answerSurface?.faqBlocks.length
    ? article.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : [];

  const publishedAt = formatArticleDate(article.publishedAt, locale);
  const updatedAt = formatArticleDate(article.updatedAt, locale);
  const heroSummary = article.landingSurface?.summaryBlocks[0]?.body || article.excerpt;
  const badgeLabels = [
    article.category?.name ?? null,
    ...article.tags.map((tag) => tag.name).filter(Boolean),
  ].filter((label): label is string => Boolean(label)).slice(0, 5);

  const backToArticlesCta = findLandingCta(article.landingSurface, "back_to_articles");
  const topicHubCta = findLandingCta(article.landingSurface, "topic_hub");
  const startTestCta = findLandingCta(article.landingSurface, "start_test");

  const relatedArticles: RelatedContentItem[] = [];
  const relatedCareerGuides: RelatedContentItem[] = [];
  const relatedTypes: RelatedContentItem[] = [];

  return (
    <Container as="main" className="space-y-8 py-10">
      {articleJsonLd ? <JsonLd id={`article-jsonld-${slug}`} data={articleJsonLd} /> : null}
      <JsonLd id={`article-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
      {faqItems.length > 0 ? <JsonLd id={`article-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}

      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "文章" : "Articles", href: localizedPath("/articles", locale) },
          { label: article.title },
        ]}
      />

      <header id="what-it-is" className="space-y-5 border-b border-[var(--fm-border)] pb-7">
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
        <div className="max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {badgeLabels.length > 0 ? (
              badgeLabels.map((label) => <Badge key={`${slug}-hero-${label}`}>{label}</Badge>)
            ) : (
              <Badge>{dict.articles.kicker}</Badge>
            )}
          </div>
          <h1 className="m-0 font-serif text-4xl font-semibold leading-tight text-[var(--fm-text)]">{article.title}</h1>
          {heroSummary ? <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)]">{heroSummary}</p> : null}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">
              {locale === "zh" ? "作者" : "By"}: {ARTICLE_AUTHOR_NAME}
            </p>
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
            {article.readingMinutes ? (
              <p className="m-0">
                {locale === "zh" ? `阅读时间：${article.readingMinutes} 分钟` : `${article.readingMinutes} min read`}
              </p>
            ) : null}
            {article.reviewerName ? (
              <p className="m-0">
                {locale === "zh" ? "审核" : "Reviewed by"}: {article.reviewerName}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <AnswerSurfaceSection
        surface={article.answerSurface}
        locale={locale}
        testId="article-detail-answer-surface"
        pageFamily="article_detail"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,760px)_minmax(240px,1fr)] lg:items-start">
        <article
          id="how-it-works"
          data-testid="article-detail-content"
          className="space-y-5 text-base text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--fm-accent)] [&_blockquote]:bg-[var(--fm-surface-muted)] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-[var(--fm-text)] [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:mt-7 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_img]:rounded-lg [&_img]:border [&_img]:border-[var(--fm-border)] [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:leading-8 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        >
          {renderArticleBody(article)}
        </article>

        <aside className="space-y-5 border-t border-[var(--fm-border)] pt-5 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0">
          <section className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm text-[var(--fm-text-muted)] shadow-[var(--fm-shadow-sm)]">
            <p className="m-0 font-semibold text-[var(--fm-text)]">{locale === "zh" ? "继续探索" : "Keep exploring"}</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={backToArticlesCta?.href ?? localizedPath("/articles", locale)}
                className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {backToArticlesCta?.label || dict.articles.backToArticles}
              </Link>

              {topicHubCta ? (
                <Link href={topicHubCta.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {topicHubCta.label}
                </Link>
              ) : null}

              {startTestCta ? (
                <Link href={startTestCta.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {startTestCta.label}
                </Link>
              ) : null}
            </div>
          </section>

          <section
            id="limitations"
            className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm leading-6 text-[var(--fm-text-muted)]"
          >
            {locale === "zh"
              ? "本内容用于自我认知与教育参考，不构成医疗或法律建议。"
              : "This content is for self-discovery and educational use, not medical or legal advice."}
          </section>
        </aside>
      </div>

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
