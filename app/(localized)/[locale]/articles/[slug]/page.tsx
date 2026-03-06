import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isBlogSlugIndexableInLocale,
  listBlogSlugs,
  listRelatedArticlesForPost,
  listRelatedCareerGuidesForPost,
  listRelatedTypesForPost,
  resolveBlogPostBySlug,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listBlogSlugs().flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const resolved = resolveBlogPostBySlug(slug, locale);
  const post = resolved.post;

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const hasIndexableEnglish = isBlogSlugIndexableInLocale(slug, "en");
  const enforceEnglishNoindex = locale === "en" && (!resolved.hasLocalizedContent || !hasIndexableEnglish);
  const canonicalPath = enforceEnglishNoindex ? `/zh/articles/${slug}` : localizedPath(`/articles/${slug}`, locale);

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: post.title,
    description: post.summary,
    noindex: enforceEnglishNoindex,
    alternatesByLocale: {
      en: `/en/articles/${slug}`,
      zh: `/zh/articles/${slug}`,
      xDefault: "/",
    },
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const resolved = resolveBlogPostBySlug(slug, locale);
  const post = resolved.post;
  const usedFallback = resolved.usedFallback && locale === "en";

  if (!post) return notFound();

  const relatedArticles = listRelatedArticlesForPost(post, locale);
  const relatedCareerGuides = listRelatedCareerGuidesForPost(post, locale);
  const relatedTypes = listRelatedTypesForPost(post, locale);

  const canonicalPath = usedFallback ? `/zh/articles/${slug}` : localizedPath(`/articles/${slug}`, locale);
  const articleJsonLd = buildArticleJsonLd({
    path: canonicalPath,
    title: post.title,
    description: post.summary,
    locale: usedFallback ? "zh" : locale,
    datePublished: post.publishedAt ?? post.updatedAt,
    dateModified: post.updatedAt,
    authorName: post.author || "FermatMind Editorial",
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "文章" : "Articles", path: locale === "zh" ? "/zh/articles" : "/en/articles" },
    { name: post.title, path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`article-jsonld-${slug}`} data={articleJsonLd} />
      <JsonLd id={`article-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "文章" : "Articles", href: localizedPath("/articles", locale) },
          { label: post.title },
        ]}
      />
      <section id="what-it-is" className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {dict.articles.kicker}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{post.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{post.summary}</p>
        {usedFallback ? (
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">
            English translation is in progress. This localized fallback is not indexed.
          </p>
        ) : null}
      </section>

      <section id="when-to-use" className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "何时阅读这篇文章" : "When to use this article"}
        </h2>
        <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "当你希望把测评结果转为可执行行动时，先阅读方法与边界，再结合个人情境做小步验证。"
            : "Read this when you want to convert test output into practical actions. Start with method and limits, then validate through small experiments."}
        </p>
      </section>

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-3">
          <CardTitle className="font-serif text-[var(--fm-text)]">{post.title}</CardTitle>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{post.summary}</p>
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">
            {dict.articles.updatedLabel}: {post.updatedAt}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{dict.articles.voiceLabels[post.voice]}</Badge>
            {(post.tags ?? []).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <article
            id="how-it-works"
            data-testid="article-detail-content"
            className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_h2]:mt-7 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
          >
            {renderVeliteMdx(post.body)}
          </article>
          <section id="limitations" className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "本内容用于自我认知与教育参考，不构成医疗或法律建议。"
              : "This content is for self-discovery and educational use, not medical or legal advice."}
          </section>
          <section id="faq" className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
            <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">FAQ</h2>
            <ul className="mb-0 mt-3 list-disc space-y-2 pl-5">
              <li>
                {locale === "zh"
                  ? "问：这篇文章能代替专业诊断吗？答：不能，仅供教育与自助参考。"
                  : "Q: Can this article replace professional diagnosis? A: No, it is educational guidance only."}
              </li>
              <li>
                {locale === "zh"
                  ? "问：如何用得更有效？答：结合你的真实场景做 2-4 周小实验并复盘。"
                  : "Q: How should I apply it effectively? A: Run 2-4 week small experiments in real scenarios and review results."}
              </li>
            </ul>
          </section>
          <section id="references" className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
            <h2 className="m-0 text-base font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "参考资料" : "References"}
            </h2>
            {(post.citations ?? []).length > 0 ? (
              <ul className="mb-0 mt-3 list-disc space-y-2 pl-5">
                {(post.citations ?? []).map((citation) => (
                  <li key={citation}>{citation}</li>
                ))}
              </ul>
            ) : (
              <p className="mb-0 mt-3">
                {locale === "zh"
                  ? "参考来源请见正文中的文献与公开资料。"
                  : "Please refer to citations and public references listed in the article."}
              </p>
            )}
          </section>
          <Link
            href={localizedPath("/articles", locale)}
            className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
          >
            {dict.articles.backToArticles}
          </Link>
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
