import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTopics } from "@/lib/cms/topics";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname: isZh ? "/zh/topics" : "/en/topics",
    title: isZh ? "主题内容聚合" : "Topic Clusters",
    description: isZh
      ? "把文章、职业发展和人格相关内容串成结构化主题簇。"
      : "Structured topic hubs that connect articles, tests, and personality-led guidance.",
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
  const { items: topics, landingSurface } = await listTopics({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 100,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/topics" : "/en/topics";
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "topics-index",
    pageType: "hub",
    locale,
    canonicalPath,
    title: locale === "zh" ? "主题内容聚合" : "Topic Clusters",
    description:
      locale === "zh"
        ? "把文章、测试与人格相关内容串成结构化主题簇。"
        : "Structured topic hubs that connect articles, tests, and personality-led guidance.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "主题" : "Topics", path: canonicalPath },
    ],
  });
  const emptyTitle = locale === "zh" ? "暂无已发布主题" : "No published topics yet";
  const emptyDescription =
    locale === "zh"
      ? "CMS 当前没有返回可展示的 topic profile，或当前环境尚未提供 topics 数据。"
      : "The CMS did not return any published topic profiles for this locale, or this environment does not expose topics yet.";

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "主题" : "Topics" },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Topics CMS" : "Topics CMS"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "主题内容聚合" : "Topic clusters"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
            ? "围绕核心测评主题组织文章、测试与人格相关内容，减少孤立页面。"
            : "Organize articles, tests, and personality-led content around core assessment topics.")}
        </p>
        {landingSurface?.ctaBundle.length ? (
          <div className="flex flex-wrap gap-2 pt-1" data-testid="topics-index-landing-cta">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
          ? "主题页用于把文章、测试与人格内容组织成一个可导航的聚合入口，减少孤立内容和重复入口。"
          : "Topic pages organize articles, tests, and personality content into a navigable hub so public content does not fragment into isolated URLs.")}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "聚合口径" : "Hub scope"}
        body={locale === "zh"
          ? "本页优先输出主题范围、主题卡片和相关跳转的 HTML 文本，结构化数据只用于帮助搜索系统理解它是一个聚合页。"
          : "This page prioritizes visible HTML for topic scope, topic cards, and related routes. Structured data only helps search systems understand that this is a hub page."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      {topics.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Card key={`${topic.locale}:${topic.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
              <CardHeader className="space-y-3">
                <CardTitle className="font-serif text-[var(--fm-text)]">{topic.title}</CardTitle>
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">{topic.excerpt || topic.subtitle || "-"}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh" ? "主题代码" : "Topic code"}: {topic.topicCode || topic.slug}
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
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">{emptyTitle}</CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">{emptyDescription}</p>
          </CardHeader>
        </Card>
      )}
    </Container>
  );
}
