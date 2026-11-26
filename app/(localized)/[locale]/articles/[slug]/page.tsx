import { ArticleEditorialLayout } from "@/components/articles/ArticleEditorialLayout";
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleLanguageNavigation } from "@/components/articles/ArticleLanguageNavigation";
import { ArticleAcademicFooter } from "@/components/articles/ArticleAcademicFooter";
import { ArticleClosing } from "@/components/articles/ArticleClosing";
import { ArticleFragmentNavigation } from "@/components/articles/ArticleFragmentNavigation";
import { articleByline } from "@/lib/content/articleByline";
import { BlogFeedLink } from "@/components/articles/BlogFeedLink";
import { articleFeedAlternate } from "@/lib/cms/articleFeed";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { AttributedCmsLinkHydrator } from "@/components/content/AttributedCmsLinkHydrator";
import { AttributedSanitizedCmsHtml } from "@/components/content/AttributedSanitizedCmsHtml";
import { PublicTopicEdgeModule } from "@/components/public-topic-graph/PublicTopicEdgeRenderer";
import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCmsArticleSeoWithLastKnownGood,
  getCmsArticleWithLastKnownGood,
  resolveArticleRuntimeContract,
  type CmsArticle,
  type CmsArticleSeoPayload,
} from "@/lib/cms/articles";
import { prepareArticleHtml } from "@/lib/cms/sanitizeCmsRichText";
import { RIC_INTEREST_ARTICLE, RIC_INTEREST_PATH } from "@/lib/career/interestDirectoryRoutes";
import { withoutEditorialBoilerplate } from "@/lib/content/articleEditorial";
import { articleCategoryCompareBlocks, articleCategoryLabel } from "@/lib/content/articleCategoryLabel";
import { loadBlogArchive } from "@/lib/content/blogArchive";
import { excludeFaqCopiesInMarkdown, getArticleEditorialFeatures, getSimpleMarkdownHeadings, getSimpleMarkdownIntroJumps, renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, toApiLocale, type Locale } from "@/lib/i18n/locales";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
} from "@/lib/seo/generateSchema";
import { resolveArticleHreflangGate, resolveArticleJsonLdAuthority, resolveArticleSchemaGate } from "@/lib/seo/articlePersonalityAuthority";
import { normalizeArticleJsonLdAuthorityPayload } from "@/lib/seo/articleJsonLdAuthority";
import { buildI18nSeoPassport } from "@/lib/seo/i18nPassport";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const BIG_FIVE_FACET_JUMP_TARGETS = {
  "article-body-markdown-block-3": {
    heading: "Where the 30 Facets Come From: The NEO-PI-R’s 240 Items and 6×5 Structure",
    label: "full list of 30 NEO-PI-R facets",
  },
  "article-body-markdown-block-17": {
    heading: "Not Every Big Five Instrument Uses 30 Facets: BFI-2’s 15 and BFAS’s 10",
    label: "compare the NEO-PI-R, BFI-2, and BFAS structures",
  },
};

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

function renderArticleBody(article: CmsArticle, locale: Locale, canonicalPath: string, editorial: boolean) {
  if (article.contentHtml.trim()) {
    return (
      <AttributedSanitizedCmsHtml
        html={article.contentHtml}
        locale={locale}
        sourceRouteFamily="article_detail"
        sourceSlug={article.slug}
        sourcePath={canonicalPath}
        contentId={article.id}
        className="fm-article-body-flow"
        editorialHeadingAnchors
        minimumHeadingLevel={2}
      />
    );
  }

  if (article.contentMd.trim()) {
    const editorialOptions = editorial ? { locale, slug: article.slug, part: "body" } as const : undefined;
    return (
      <AttributedCmsLinkHydrator
        className="fm-article-body-flow"
        locale={locale}
        sourceRouteFamily="article_detail"
        sourceSlug={article.slug}
        sourcePath={canonicalPath}
        contentId={article.id}
      >
        {renderSimpleMarkdown(article.contentMd, {
          locale,
          minimumHeadingLevel: 2,
          headingIdPrefix: "article-body",
          scrollableTables: true,
          articleTableLocale: locale,
          wrapPlainTextFences: true,
          editorial: editorialOptions,
          highlightEditorialConclusions: true,
          compactMatrixHeaders: locale === "en" && article.slug === "iq-test-tool-guide"
            ? ["Row", "First cell", "Second cell", "Third cell"]
            : undefined,
        }) ?? <div className="whitespace-pre-wrap">{article.contentMd}</div>}
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

  const robotsTokens = (seo?.surface?.robotsPolicy || seo?.meta.robots || "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim());
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
    noindexFollow: robotsTokens.includes("follow") && !robotsTokens.includes("nofollow"),
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
  const localeAuthority = seo?.authority?.alternateEligibility;
  const traditionalAlternate = seoResult.source === "fresh"
    && !isConfiguredStagingSiteUrl()
    && localeAuthority?.currentLocale === toApiLocale(locale)
    ? localeAuthority.alternates["zh-TW"]
    : undefined;
  const alternates = !articleHreflangGate.canRenderHreflang
    ? {
        canonical: passport.canonical,
      }
    : {
        ...metadata.alternates,
        canonical: passport.canonical,
        languages: {
          ...passport.languages,
          ...(traditionalAlternate ? { "zh-TW": traditionalAlternate } : {}),
        },
      };

  return {
    ...metadata,
    title: resolveArticleMetadataTitle(title),
    alternates: { ...alternates, types: articleFeedAlternate(locale) },
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

  const [seoResult, blogState, relatedState] = await Promise.all([
    getCmsArticleSeoWithLastKnownGood(slug, locale),
    loadBlogArchive(locale, 1),
    article.category?.slug ? loadBlogArchive(locale, 1, article.category.slug) : undefined,
  ]);
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
    !hasProjectedAuthorityContract && articleJsonLdAuthority.canRenderJsonLd && article.authorName && article.publishedAt
      ? buildArticleJsonLd({
        path: canonicalPath,
        title: article.title,
        description: article.excerpt,
        locale,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        authorName: articleByline(article.authorName, locale).name,
      })
      : null
  )) : null;

  const projectedBreadcrumbJsonLd = seo?.authority?.structuredDataFragments.breadcrumbList ?? null;
  const breadcrumbJsonLd = articleSchemaGate.canRenderBreadcrumbJsonLd
    ? hasProjectedAuthorityContract
      ? projectedBreadcrumbJsonLd
      : buildBreadcrumbJsonLd([
        { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
        { name: dict.articles.title, path: localizedPath("/articles", locale) },
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

  const editorial = !article.contentHtml.trim() ? getArticleEditorialFeatures(article.contentMd) : { enabled: false, sources: false };
  const answerSurfaceWithVisibleFaq = article.answerSurface && !article.contentHtml.trim()
    ? {
        ...article.answerSurface,
        faqBlocks: excludeFaqCopiesInMarkdown(article.answerSurface.faqBlocks, article.contentMd, { locale }),
      }
    : article.answerSurface;
  const categoryLabel = articleCategoryLabel(article.category, blogState?.data?.blog, locale);
  const localizedAnswerSurface = answerSurfaceWithVisibleFaq
    ? {
        ...answerSurfaceWithVisibleFaq,
        compareBlocks: articleCategoryCompareBlocks(answerSurfaceWithVisibleFaq.compareBlocks, categoryLabel, locale),
      }
    : answerSurfaceWithVisibleFaq;
  const visibleAnswerSurface = editorial.enabled && localizedAnswerSurface
    ? withoutEditorialBoilerplate(localizedAnswerSurface, article.contentMd, locale)
    : localizedAnswerSurface;
  const articleRuntimeContract = resolveArticleRuntimeContract(article);
  const isRiasecOverview = article.slug === (locale === "zh"
    ? "riasec-holland-career-interest-test-explained"
    : "what-is-riasec-holland-code-career-interest-test");
  const headings = !article.contentHtml.trim()
    ? getSimpleMarkdownHeadings(article.contentMd, { locale, minimumHeadingLevel: 2, headingIdPrefix: "article-body", editorial: editorial.enabled ? { locale } : undefined })
    : prepareArticleHtml(article.contentHtml, locale).headings;

  const introJumps = article.id === 232 && locale === "en" && slug === "big-five-30-facets-explained-with-model-caveats"
    ? getSimpleMarkdownIntroJumps(article.contentMd, headings, BIG_FIVE_FACET_JUMP_TARGETS)
    : [];

  return (
    <ArticleEditorialLayout locale={locale} article={article} categoryLabel={categoryLabel} relatedState={relatedState} headings={headings}
      editorial={editorial.enabled} sourceChecked={editorial.sources && article.publicReview?.reviewState === "approved"}
      schema={<>
      {articleJsonLd ? <JsonLd id={`article-jsonld-${slug}`} data={articleJsonLd} /> : null}
      {breadcrumbJsonLd ? <JsonLd id={`article-breadcrumb-${slug}`} data={breadcrumbJsonLd} /> : null}
      {shouldRenderStandaloneFaqJsonLd ? <JsonLd id={`article-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      </>}
      navigation={<>
        <ArticleLanguageNavigation article={article} />
        {introJumps.length > 0 ? (
          <nav aria-label="Quick jumps" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {introJumps.map(({ href, label }) => (
              <a key={href} href={href} className="text-[var(--fm-accent)] underline underline-offset-4">{label}</a>
            ))}
          </nav>
        ) : null}

      </>}>
      <ArticleFragmentNavigation key={canonicalPath} className="w-full min-w-0 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
        <article
          id="how-it-works"
          data-testid="article-detail-content"
          data-article-runtime-contract={articleRuntimeContract.version}
          data-article-runtime-page-family={articleRuntimeContract.pageFamily}
          className="fm-article-prose"
        >
          {renderArticleBody(article, locale, canonicalPath, editorial.enabled)}
          {article.slug === RIC_INTEREST_ARTICLE ? (
            <Link href={localizedPath(RIC_INTEREST_PATH, locale)} className="inline-flex min-h-11 items-center font-semibold underline">
              {locale === "zh" ? "打开 RIC 职业目录，按准备度筛选" : "Browse RIC careers and filter by preparation"}
            </Link>
          ) : null}
          {isRiasecOverview ? (
            <section aria-label={locale === "zh" ? "职业探索下一步" : "Next step for career exploration"} className="rounded-lg border border-[var(--fm-border)] p-4">
              <p className="m-0">{locale === "zh" ? "把兴趣线索带到真实工作中，核对设计职业的任务、技能和入行条件。" : "Use your interest profile to compare real tasks, skills and entry requirements in design careers."}</p>
              <Link href={localizedPath("/career/compare", locale)} className="inline-flex min-h-11 items-center font-semibold underline">
                {locale === "zh" ? "比较两个设计职业" : "Compare two design careers"}
              </Link>
            </section>
          ) : null}
          {article.bodyVisual?.imageUrl ? (
            <ArticleResponsiveImage
              src={article.bodyVisual.imageUrl}
              alt={article.bodyVisual.imageUrl === article.coverImageUrl
                ? (article.coverImageAlt ?? article.title)
                : article.title}
              mode="hero"
              className="aspect-[16/9] rounded-lg border border-[var(--fm-border)]"
            />
          ) : null}
        </article>
      </ArticleFragmentNavigation>

      <AnswerSurfaceSection
        surface={visibleAnswerSurface}
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

      <ArticleAcademicFooter title={article.title} authorName={article.authorName} publishedAt={article.publishedAt}
        canonicalUrl={canonicalUrl(canonicalPath)} locale={locale} slug={slug}
        sources={editorial.enabled ? renderSimpleMarkdown(article.contentMd, { locale, editorial: { locale, part: "academic" } }) : null} />
      <ArticleClosing key={canonicalPath} locale={locale} url={canonicalUrl(canonicalPath)} />

      <Suspense fallback={null}>
        <AttributedCmsLinkHydrator locale={locale} sourceRouteFamily="article_detail"
          sourceSlug={article.slug} sourcePath={canonicalPath} contentId={article.id}>
        <PublicTopicEdgeModule
          source={article.id ? { type: "article", id: article.id, locale: toApiLocale(locale) } : null}
          entrySurface="article_detail"
        />
        </AttributedCmsLinkHydrator>
      </Suspense>

      {article.publicReview?.lastReviewedAt && !editorial.enabled
        ? <PublicReviewStatus review={article.publicReview} locale={locale} testId="article-public-review" /> : null}
      {!editorial.enabled && <BlogFeedLink locale={locale} />}
    </ArticleEditorialLayout>
  );
}
