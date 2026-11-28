import { ArticleEditorialLayout } from "@/components/articles/ArticleEditorialLayout";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArticleAcademicFooter } from "@/components/articles/ArticleAcademicFooter";
import { ArticleClosing } from "@/components/articles/ArticleClosing";
import { ArticleLanguageNavigation } from "@/components/articles/ArticleLanguageNavigation";
import { ArticleFragmentNavigation } from "@/components/articles/ArticleFragmentNavigation";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { JsonLd } from "@/components/seo/JsonLd";
import { prepareArticleHtml } from "@/lib/cms/sanitizeCmsRichText";
import { buildArticleFrontendUrl, getCmsArticle, getCmsArticleSeo, normalizeArticleSlug } from "@/lib/cms/articles";
import { excludeFaqCopiesInMarkdown, getArticleEditorialFeatures, getSimpleMarkdownHeadings, renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { loadBlogArchive } from "@/lib/content/blogArchive";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import { resolveArticleHreflangGate, resolveArticleSchemaGate } from "@/lib/seo/articlePersonalityAuthority";

export const dynamic = "force-dynamic";

const locale = "zh-TW";
type RouteProps = { params: Promise<{ slug: string }> };

const loadArticle = cache(async (slug: string) => {
  if (normalizeArticleSlug(slug) !== slug) notFound();
  const article = await getCmsArticle(slug, locale);
  if (!article || (!article.contentMd.trim() && !article.contentHtml.trim())) notFound();
  return article;
});

const loadSeo = cache(async (slug: string) => {
  const article = await loadArticle(slug);
  const seo = await getCmsArticleSeo(slug, locale);
  const canonical = canonicalUrl(buildArticleFrontendUrl(locale, slug));
  const directives = new Set(seo?.meta.robots.toLowerCase().split(",").map((directive) => directive.trim()));
  const staging = isConfiguredStagingSiteUrl();
  const index = Boolean(seo && article.isIndexable && !staging && !directives.has("noindex") && !directives.has("none"));
  const authority = seo?.authority ?? null;
  const alternates = authority?.alternateEligibility.alternates;
  const gate = resolveArticleHreflangGate({ noindex: !index, article, projectedAuthority: authority });
  const languages = gate.canRenderHreflang && authority?.alternateEligibility.currentLocale === locale
    && alternates?.[locale] === canonical ? {
      [locale]: canonical,
      ...(alternates.en ? { en: alternates.en } : {}),
      ...(alternates["zh-CN"] ? { "zh-CN": alternates["zh-CN"] } : {}),
    } : null;

  return { article, seo, canonical, directives, staging, index, languages };
});

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const { article, seo, canonical, directives, staging, index, languages } = await loadSeo(slug);
  return {
    title: seo?.meta.title || article.title,
    description: seo?.meta.description || article.excerpt,
    alternates: { canonical, ...(languages ? { languages } : {}) },
    robots: {
      index,
      follow: !staging && !directives.has("nofollow") && !directives.has("none"),
    },
    openGraph: {
      type: "article",
      locale: "zh_TW",
      title: seo?.meta.og.title || article.title,
      description: seo?.meta.og.description || article.excerpt,
      url: canonical,
      images: seo?.meta.og.image ?? article.coverImageUrl ?? undefined,
    },
  };
}

const markdownOptions = {
  locale: "zh",
  minimumHeadingLevel: 2,
  headingIdPrefix: "article-body",
  scrollableTables: true,
  scrollableTableLabel: "可橫向捲動的表格",
  wrapPlainTextFences: true,
} as const;

export default async function TraditionalArticlePage({ params }: RouteProps) {
  const { slug } = await params;
  const { article, seo, canonical, index, languages } = await loadSeo(slug);
  const relatedState = article.category?.slug ? await loadBlogArchive(locale, 1, article.category.slug) : undefined;
  const authority = seo?.authority ?? null;
  const schemaGate = resolveArticleSchemaGate({
    noindex: !index,
    cmsArticleSeoJsonLd: seo?.jsonld ?? null,
    article,
    projectedAuthority: authority,
  });
  const fragments = authority?.structuredDataFragments;
  const editorial = !article.contentHtml.trim() ? getArticleEditorialFeatures(article.contentMd) : { enabled: false, sources: false };
  const options = { ...markdownOptions, editorial: editorial.enabled ? { locale, slug, part: "body" } as const : undefined, highlightEditorialConclusions: true, articleTableLocale: locale } as const;
  const preparedHtml = article.contentHtml.trim() ? prepareArticleHtml(article.contentHtml) : null;
  const headings = preparedHtml?.headings ?? getSimpleMarkdownHeadings(article.contentMd, options);
  const faqItems = article.answerSurface?.faqBlocks ?? [];
  const standaloneFaq = preparedHtml ? faqItems : excludeFaqCopiesInMarkdown(faqItems, article.contentMd, {
    locale: "zh", matchLeadingAnswerParagraphs: true,
  });
  // Reviewed article links retain the public assessment's source-language route.
  const assessmentLinks = (article.landingSurface?.ctaBundle ?? []).filter(
    (item) => item.kind === "start_test" && /^\/(?:en|zh)\/tests\/[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.href),
  );

  return (
    <ArticleEditorialLayout locale={locale} article={article} relatedState={relatedState} headings={headings}
      editorial={editorial.enabled} sourceChecked={editorial.sources && article.publicReview?.reviewState === "approved"}
      schema={<>
      {schemaGate.canRenderArticleJsonLd && fragments?.article
        ? <JsonLd id={`article-jsonld-${slug}`} data={fragments.article} /> : null}
      {schemaGate.canRenderBreadcrumbJsonLd && fragments?.breadcrumbList
        ? <JsonLd id={`article-breadcrumb-${slug}`} data={fragments.breadcrumbList} /> : null}
      {schemaGate.canRenderFAQPageJsonLd && faqItems.length > 0
        ? <JsonLd id={`article-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      </>}
      navigation={<>
      {article.readerLanguageSlugs ? <ArticleLanguageNavigation article={article} /> : languages ? <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
        {languages["zh-CN"] ? <Link href={new URL(languages["zh-CN"]).pathname} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link> : null}
        {languages.en ? <Link href={new URL(languages.en).pathname} lang="en" className="min-h-11 py-2 underline">English</Link> : null}
      </nav> : null}
      </>}>
      <ArticleFragmentNavigation className="w-full min-w-0 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24 [&_h4]:scroll-mt-24">
        <article data-testid="article-detail-content" className="fm-article-prose">
          {preparedHtml
            ? <div dangerouslySetInnerHTML={{ __html: preparedHtml.html }} className="fm-article-body-flow" />
            : renderSimpleMarkdown(article.contentMd, options)}
          {article.bodyVisual?.imageUrl ? (
            <ArticleResponsiveImage
              src={article.bodyVisual.imageUrl}
              alt={article.bodyVisual.imageUrl === article.coverImageUrl
                ? (article.coverImageAlt ?? article.title)
                : article.title}
              mode="hero"
              className="aspect-[16/9] rounded-lg"
            />
          ) : null}
        </article>
      </ArticleFragmentNavigation>
      {assessmentLinks.length > 0 ? (
        <nav aria-label="相關測驗" className="flex flex-wrap gap-4">
          {assessmentLinks.map((item) => (
            <Link key={item.key} href={item.href} className="min-h-11 py-2 font-medium underline">{item.label}</Link>
          ))}
        </nav>
      ) : null}
      {standaloneFaq.length > 0 ? (
        <section aria-labelledby="article-faq">
          <h2 id="article-faq" className="text-xl font-semibold">常見問題</h2>
          {standaloneFaq.map((item) => (
            <details key={item.key} className="border-b py-3">
              <summary className="font-medium">{item.question}</summary>
              <div className="fm-content-page-prose">{renderSimpleMarkdown(item.answer, markdownOptions)}</div>
            </details>
          ))}
        </section>
      ) : null}
      <ArticleAcademicFooter title={article.title} authorName={article.authorName} publishedAt={article.publishedAt} canonicalUrl={canonical}
        locale={locale} slug={slug} sources={editorial.enabled ? renderSimpleMarkdown(article.contentMd, { ...options, editorial: { locale, part: "academic" } }) : null} />
      <ArticleClosing key={canonical} locale={locale} url={canonical} />
    </ArticleEditorialLayout>
  );
}
