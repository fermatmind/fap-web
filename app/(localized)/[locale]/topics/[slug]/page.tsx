import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getTopicCluster, listTopicSlugs } from "@/lib/topics";

export function generateStaticParams() {
  return listTopicSlugs().flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const topic = getTopicCluster(slug, locale);

  if (!topic) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? `/zh/topics/${topic.slug}` : `/en/topics/${topic.slug}`,
    title: topic.title,
    description: topic.summary,
    alternatesByLocale: {
      en: `/en/topics/${topic.slug}`,
      zh: `/zh/topics/${topic.slug}`,
      xDefault: "/",
    },
  });
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const topic = getTopicCluster(slug, locale);

  if (!topic) return notFound();

  const canonicalPath = locale === "zh" ? `/zh/topics/${topic.slug}` : `/en/topics/${topic.slug}`;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: topic.title,
    description: topic.summary,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "主题" : "Topics", path: locale === "zh" ? "/zh/topics" : "/en/topics" },
    { name: topic.title, path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`topic-webpage-${topic.slug}`} data={webPageJsonLd} />
      <JsonLd id={`topic-breadcrumb-${topic.slug}`} data={breadcrumbJsonLd} />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "SEO Topic Cluster" : "SEO Topic Cluster"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{topic.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{topic.summary}</p>
      </section>

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-2">
          <CardTitle className="font-serif text-[var(--fm-text)]">
            {locale === "zh" ? "主题说明" : "Cluster overview"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[var(--fm-text-muted)]">
          <p className="m-0">{topic.description}</p>
          <div className="flex flex-wrap gap-2">
            {topic.featuredTests.map((test) => (
              <Link
                key={test.href}
                href={test.href}
                className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
              >
                {test.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <RelatedContent
        title={locale === "zh" ? "相关文章" : "Related articles"}
        items={topic.articles}
      />
      <RelatedContent
        title={locale === "zh" ? "相关职业内容" : "Related career content"}
        items={topic.careers}
      />
      <RelatedContent title={topic.personalitySectionTitle} items={topic.personalities} />
    </Container>
  );
}
