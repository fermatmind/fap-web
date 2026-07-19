import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { AttributedCmsLinkHydrator } from "@/components/content/AttributedCmsLinkHydrator";
import { AttributedSanitizedCmsHtml } from "@/components/content/AttributedSanitizedCmsHtml";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import {
  getCmsArticleSeoWithLastKnownGood,
  getCmsArticleWithLastKnownGood,
  resolveArticleRuntimeContract,
  type CmsArticle,
  type CmsArticleSeoPayload,
} from "@/lib/cms/articles";
import type { RelatedContentItem } from "@/lib/content";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { renderCjkPunctuationText } from "@/lib/content/textPunctuation";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
} from "@/lib/seo/generateSchema";
import { resolveArticleHreflangGate, resolveArticleJsonLdAuthority, resolveArticleSchemaGate } from "@/lib/seo/articlePersonalityAuthority";
import { ARTICLE_AUTHOR_NAME, normalizeArticleJsonLdAuthorityPayload } from "@/lib/seo/articleJsonLdAuthority";
import { buildI18nSeoPassport } from "@/lib/seo/i18nPassport";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type ArticleMetadataImage = {
  url: string;
  alt?: string;
};

function buildArticleMetadataImage(url: string | null | undefined, alt: string | null | undefined): string | ArticleMetadataImage | null {
  const normalizedUrl = String(url ?? "").trim();
  if (!normalizedUrl) {
    return null;
  }

  const normalizedAlt = String(alt ?? "").trim();
  return normalizedAlt ? { url: normalizedUrl, alt: normalizedAlt } : normalizedUrl;
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

function articleAlternateLanguages(seo: CmsArticleSeoPayload | null): Record<string, string> {
  const languages: Record<string, string> = {};
  const alternates = seo?.authority?.alternateEligibility.alternates;

  if (alternates?.en) {
    languages.en = alternates.en;
  }

  if (alternates?.["zh-CN"]) {
    languages["zh-CN"] = alternates["zh-CN"];
  }

  return languages;
}

function resolveArticleMetadataTitle(title: string): Metadata["title"] {
  const normalized = title.trim();
  const suffixPattern = /(?:\s*\|\s*FermatMind)+$/i;
  if (!suffixPattern.test(normalized)) {
    return normalized;
  }

  const baseTitle = normalized.replace(suffixPattern, "").trim();
  return {
    absolute: baseTitle ? `${baseTitle} | FermatMind` : "FermatMind",
  };
}

function hasArticleSeoAuthorityContract(
  seo: CmsArticleSeoPayload | null,
  resultSource: unknown,
): boolean {
  return typeof resultSource === "string"
    || (seo !== null && Object.prototype.hasOwnProperty.call(seo, "authority"));
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function renderArticleBody(article: CmsArticle, locale: Locale, canonicalPath: string) {
  if (article.contentHtml.trim()) {
    return (
      <AttributedSanitizedCmsHtml
        html={article.contentHtml}
        locale={locale}
        sourceRouteFamily="article_detail"
        sourceSlug={article.slug}
        sourcePath={canonicalPath}
        contentId={article.id}
        minimumHeadingLevel={2}
      />
    );
  }

  if (article.contentMd.trim()) {
    return (
      <AttributedCmsLinkHydrator
        locale={locale}
        sourceRouteFamily="article_detail"
        sourceSlug={article.slug}
        sourcePath={canonicalPath}
        contentId={article.id}
      >
        {renderSimpleMarkdown(article.contentMd, { locale, minimumHeadingLevel: 2 }) ?? <div className="whitespace-pre-wrap">{article.contentMd}</div>}
      </AttributedCmsLinkHydrator>
    );
  }

  return null;
}

function jsonLdContainsType(value: unknown, schemaType: string): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => jsonLdContainsType(item, schemaType));
  }

  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (type === schemaType || (Array.isArray(type) && type.includes(schemaType))) {
    return true;
  }

  return Object.values(record).some((item) => jsonLdContainsType(item, schemaType));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const article = await getCmsArticleWithLastKnownGood(slug, locale)
    .then((result) => result.value);

  if (!article) {
    notFound();
  }

  const seoResult = await getCmsArticleSeoWithLastKnownGood(slug, locale);
  const seo = seoResult.value;

  const canonicalPath = buildCanonicalPath(article.slug, locale);
  // Canonical authority now replaces the former pathFromCanonicalUrl page-level repair.
  const canonicalCandidate = seo?.surface?.canonicalUrl ?? seo?.meta.canonical;
  const title = seo?.surface?.title || seo?.meta.title || article.title;
  const description = seo?.surface?.description || seo?.meta.description || article.excerpt;
  const noindex = !article.isIndexable || shouldNoindex(seo?.meta.robots);
  const articleImage = article.coverImageVariants.og?.url ?? article.coverImageVariants.hero?.url ?? article.coverImageUrl;

  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    canonicalPathname: canonicalPath,
    canonicalCandidate,
    canonicalRouteFamily: "article_detail",
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

  const canonical = String(metadata.alternates?.canonical ?? "");
  const ogImage = seo?.surface?.og.image ?? seo?.meta.og.image ?? articleImage ?? null;
  const ogImageForMetadata = buildArticleMetadataImage(ogImage, article.coverImageAlt);
  const passport = buildI18nSeoPassport({
    canonical,
    currentLocale: locale,
    authorityAlternates: articleAlternateLanguages(seo),
    existingLanguages: metadata.alternates?.languages,
    fallbackXDefault: "/",
  });
  const hasProjectedAuthorityContract = hasArticleSeoAuthorityContract(seo, seoResult.source);
  const articleHreflangGate = resolveArticleHreflangGate({
    noindex,
    article,
    ...(hasProjectedAuthorityContract ? { projectedAuthority: seo?.authority ?? null } : {}),
  });

  const twitterImages = normalizeTwitterImages(
    buildArticleMetadataImage(seo?.surface?.twitter.image ?? seo?.meta.twitter.image ?? ogImage, article.coverImageAlt),
    metadata.twitter?.images,
  );
  const alternates = !articleHreflangGate.canRenderHreflang
    ? {
        canonical: passport.canonical,
      }
    : {
        ...metadata.alternates,
        canonical: passport.canonical,
        languages: passport.languages,
      };

  return {
    ...metadata,
    title: resolveArticleMetadataTitle(title),
    alternates,
    openGraph: {
      type: "article",
      url: canonical,
      title: seo?.surface?.og.title || seo?.meta.og.title || title,
      description: seo?.surface?.og.description || seo?.meta.og.description || description,
      images: ogImageForMetadata ? [ogImageForMetadata] : metadata.openGraph?.images,
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
  const article = await getCmsArticleWithLastKnownGood(slug, locale)
    .then((result) => result.value);

  if (!article) {
    return notFound();
  }

  const seoResult = await getCmsArticleSeoWithLastKnownGood(slug, locale);
  const seo = seoResult.value;

  const canonicalPath = buildCanonicalPath(article.slug, locale);
  const noindex = !article.isIndexable || shouldNoindex(seo?.meta.robots);
  const cmsArticleSeoJsonLd = normalizeArticleJsonLdAuthorityPayload(seo?.jsonld);
  const hasProjectedAuthorityContract = hasArticleSeoAuthorityContract(seo, seoResult.source);
  const articleJsonLdAuthority = resolveArticleJsonLdAuthority({
    cmsArticleSeoJsonLd,
    article,
  });
  const articleSchemaGate = resolveArticleSchemaGate({
    noindex,
    cmsArticleSeoJsonLd,
    article,
    ...(hasProjectedAuthorityContract ? { projectedAuthority: seo?.authority ?? null } : {}),
  });
  // Normalized production results always carry the projection contract. The
  // builders remain reachable only for legacy typed-test fixtures that omit it.
  const articleJsonLd = articleSchemaGate.canRenderArticleJsonLd ? (cmsArticleSeoJsonLd || (
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
  )) : null;

  const projectedBreadcrumbJsonLd = seo?.authority?.structuredDataFragments.breadcrumbList ?? null;
  const breadcrumbJsonLd = articleSchemaGate.canRenderBreadcrumbJsonLd
    ? hasProjectedAuthorityContract
      ? projectedBreadcrumbJsonLd
      : buildBreadcrumbJsonLd([
        { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
        { name: locale === "zh" ? "文章" : "Articles", path: localizedPath("/articles", locale) },
        { name: article.title, path: canonicalPath },
      ])
    : null;
  const faqItems = article.answerSurface?.faqBlocks.length
    ? article.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : [];
  const shouldRenderStandaloneFaqJsonLd =
    articleSchemaGate.canRenderFAQPageJsonLd &&
    faqItems.length > 0 &&
    !jsonLdContainsType(articleJsonLd, "FAQPage");

  const publishedAt = formatArticleDate(article.publishedAt, locale);
  const updatedAt = formatArticleDate(article.updatedAt, locale);
  const heroSummary = article.landingSurface?.summaryBlocks[0]?.body || article.excerpt;
  const badgeLabels = [
    article.category?.name ?? null,
    ...article.tags.map((tag) => tag.name).filter(Boolean),
  ].filter((label): label is string => Boolean(label)).slice(0, 5);

  const articleRuntimeContract = resolveArticleRuntimeContract(article);

  const relatedArticles: RelatedContentItem[] = [];
  const relatedCareerGuides: RelatedContentItem[] = [];
  const relatedTypes: RelatedContentItem[] = [];

  return (
    <Container as="main" className="space-y-8 py-10">
      {articleJsonLd ? <JsonLd id={`article-jsonld-${slug}`} data={articleJsonLd} /> : null}
      {breadcrumbJsonLd ? <JsonLd id={`article-breadcrumb-${slug}`} data={breadcrumbJsonLd} /> : null}
      {shouldRenderStandaloneFaqJsonLd ? <JsonLd id={`article-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}

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
          <h1 className="m-0 font-serif text-4xl font-semibold leading-tight text-[var(--fm-text)]">
            {renderCjkPunctuationText(article.title, "article-title")}
          </h1>
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
            <PublicReviewStatus review={article.publicReview} locale={locale} testId="article-public-review" />
          </div>
        </div>
      </header>

      <AnswerSurfaceSection
        surface={article.answerSurface}
        locale={locale}
        testId="article-detail-answer-surface"
        hideHeading
        hideSummaryBlocks
        hideCompareLabel
        expandSingleSummaryBlock
        pageFamily="article_detail"
        seoCtaAttribution={{
          locale,
          sourceRouteFamily: "article_detail",
          sourceSlug: article.slug,
          sourcePath: canonicalPath,
          contentId: article.id,
          translationGroupId: article.translationGroupId,
        }}
      />

      <div className="w-full">
        <article
          id="how-it-works"
          data-testid="article-detail-content"
          data-article-runtime-contract={articleRuntimeContract.version}
          data-article-runtime-page-family={articleRuntimeContract.pageFamily}
          className="space-y-5 text-base text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--fm-accent)] [&_blockquote]:bg-[var(--fm-surface-muted)] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-[var(--fm-text)] [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:mt-7 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_img]:rounded-lg [&_img]:border [&_img]:border-[var(--fm-border)] [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p]:leading-8 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        >
          {renderArticleBody(article, locale, canonicalPath)}
          {article.bodyVisual?.imageUrl ? (
            <ArticleResponsiveImage
              src={article.bodyVisual.imageUrl}
              alt={article.coverImageAlt ?? article.title}
              mode="hero"
              className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
            />
          ) : null}
        </article>
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
