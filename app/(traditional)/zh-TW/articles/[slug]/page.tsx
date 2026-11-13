import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArticleClosing } from "@/components/articles/ArticleClosing";
import { ArticleLanguageNavigation } from "@/components/articles/ArticleLanguageNavigation";
import { ArticleFragmentNavigation } from "@/components/articles/ArticleFragmentNavigation";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";
import { buildArticleFrontendUrl, getCmsArticle, getCmsArticleSeo, normalizeArticleSlug } from "@/lib/cms/articles";
import { excludeFaqCopiesInMarkdown, getSimpleMarkdownHeadings, renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { blogArchivePath, loadBlogArchive } from "@/lib/content/blogArchive";
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
  const [{ article, seo, canonical, index, languages }, archive] = await Promise.all([loadSeo(slug), loadBlogArchive(locale, 1)]);
  const authority = seo?.authority ?? null;
  const schemaGate = resolveArticleSchemaGate({
    noindex: !index,
    cmsArticleSeoJsonLd: seo?.jsonld ?? null,
    article,
    projectedAuthority: authority,
  });
  const fragments = authority?.structuredDataFragments;
  const blog = archive.data?.blog;
  const publishedArchive = !archive.failed && !archive.stale && blog?.configurationState === "published";
  const category = publishedArchive ? blog.categories.find((item) => item.slug === article.category?.slug) : undefined;
  const headings = article.contentHtml.trim() ? [] : getSimpleMarkdownHeadings(article.contentMd, markdownOptions);
  const faq = excludeFaqCopiesInMarkdown(article.answerSurface?.faqBlocks ?? [], article.contentMd, { locale: "zh" });
  // Reviewed article links retain the public assessment's source-language route.
  const assessmentLinks = (article.landingSurface?.ctaBundle ?? []).filter(
    (item) => item.kind === "start_test" && /^\/(?:en|zh)\/tests\/[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.href),
  );

  return (
    <Container as="main" className="min-w-0 space-y-8 py-10">
      {schemaGate.canRenderArticleJsonLd && fragments?.article
        ? <JsonLd id={`article-jsonld-${slug}`} data={fragments.article} /> : null}
      {schemaGate.canRenderBreadcrumbJsonLd && fragments?.breadcrumbList
        ? <JsonLd id={`article-breadcrumb-${slug}`} data={fragments.breadcrumbList} /> : null}
      {article.readerLanguageSlugs ? <ArticleLanguageNavigation article={article} /> : languages ? <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
        {languages["zh-CN"] ? <Link href={new URL(languages["zh-CN"]).pathname} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link> : null}
        {languages.en ? <Link href={new URL(languages.en).pathname} lang="en" className="min-h-11 py-2 underline">English</Link> : null}
      </nav> : null}
      {publishedArchive ? <nav aria-label="部落格" className="flex flex-wrap gap-4 text-sm">
        <Link href={blogArchivePath(locale)} className="min-h-11 py-2 underline">返回文章列表</Link>
        {category ? <Link href={blogArchivePath(locale, category.slug)} className="min-h-11 py-2 underline">{category.name}</Link> : null}
      </nav> : null}
      <header className="space-y-5 border-b border-[var(--fm-border)] pb-7">
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
          <h1 className="m-0 font-serif text-4xl font-semibold leading-tight text-[var(--fm-text)] [overflow-wrap:anywhere]">{article.title}</h1>
          {article.excerpt ? <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)]">{article.excerpt}</p> : null}
          {article.authorName ? <p className="text-sm text-[var(--fm-text-muted)]">作者 {article.authorName}</p> : null}
        </div>
      </header>
      {headings.length > 1 ? (
        <nav aria-label="本文目錄" className="rounded-lg border p-5">
          <ol className="space-y-2">
            {headings.map((heading) => <li key={heading.id}><a href={`#${heading.id}`} className="underline">{heading.text}</a></li>)}
          </ol>
        </nav>
      ) : null}
      <ArticleFragmentNavigation className="w-full min-w-0 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24">
        <article data-testid="article-detail-content" className="fm-content-page-prose min-w-0 break-words">
          {article.contentHtml.trim()
            ? <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(article.contentHtml, { minimumHeadingLevel: 2 }) }} />
            : renderSimpleMarkdown(article.contentMd, markdownOptions)}
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
      {faq.length > 0 ? (
        <section aria-labelledby="article-faq">
          <h2 id="article-faq" className="text-xl font-semibold">常見問題</h2>
          {faq.map((item) => (
            <details key={item.key} className="border-b py-3">
              <summary className="font-medium">{item.question}</summary>
              <div className="fm-content-page-prose">{renderSimpleMarkdown(item.answer, markdownOptions)}</div>
            </details>
          ))}
        </section>
      ) : null}
      <ArticleClosing key={canonical} locale={locale} url={canonical} />
    </Container>
  );
}
