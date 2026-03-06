import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { listTopicClusters } from "@/lib/topics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return buildPageMetadata({
    locale,
    pathname: isZh ? "/zh/topics" : "/en/topics",
    title: isZh ? "主题内容聚合" : "Topic Clusters",
    description: isZh
      ? "把文章、职业发展和人格相关内容串成结构化主题簇。"
      : "Structured SEO clusters that connect articles, career content, and personality-led recommendations.",
    alternatesByLocale: {
      en: "/en/topics",
      zh: "/zh/topics",
      xDefault: "/",
    },
  });
}

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const topics = listTopicClusters(locale);
  const canonicalPath = locale === "zh" ? "/zh/topics" : "/en/topics";
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "主题内容聚合" : "Topic Clusters",
    description:
      locale === "zh"
        ? "把文章、职业发展和人格相关内容串成结构化主题簇。"
        : "Structured SEO clusters that connect articles, career content, and personality-led recommendations.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "主题" : "Topics", path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id="topics-webpage" data={webPageJsonLd} />
      <JsonLd id="topics-breadcrumb" data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "主题" : "Topics" },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "SEO Topic Engine" : "SEO Topic Engine"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "主题内容聚合" : "Topic clusters"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "围绕核心测评主题组织文章、职业发展与推荐内容，减少孤立页面。"
            : "Organize articles, career content, and recommendation pages around core assessment themes."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.slug} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
            <CardHeader className="space-y-3">
              <CardTitle className="font-serif text-[var(--fm-text)]">{topic.title}</CardTitle>
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">{topic.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh" ? "内容覆盖" : "Coverage"}: {topic.articles.length}{" "}
                {locale === "zh" ? "篇文章" : "articles"} · {topic.careers.length}{" "}
                {locale === "zh" ? "个职业内容" : "career items"} · {topic.personalities.length}{" "}
                {locale === "zh" ? "个人格画像" : "profiles"}
              </p>
              <Link
                href={withLocale(`/topics/${topic.slug}`)}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {locale === "zh" ? "查看主题页" : "View topic page"}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
