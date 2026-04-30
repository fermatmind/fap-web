import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listTopics } from "@/lib/cms/topics";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

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
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_index",
    sourcePageType: "topic_index",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_index",
    sourcePageType: "topic_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_index",
    sourcePageType: "topic_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPersonalityHubHref = withLocale("/personality");
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "主题内容聚合" : "Topic Clusters",
    description:
      locale === "zh"
        ? "把文章、测试与人格相关内容串成结构化主题簇。"
        : "Structured topic hubs that connect articles, tests, and personality-led guidance.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "主题" : "Topics", path: canonicalPath },
  ]);
  const emptyTitle = locale === "zh" ? "暂无已发布主题" : "No published topics yet";
  const emptyDescription =
    locale === "zh"
      ? "CMS 当前没有返回可展示的 topic profile，或当前环境尚未提供 topics 数据。"
      : "The CMS did not return any published topic profiles for this locale, or this environment does not expose topics yet.";

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
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
          {locale === "zh" ? "主题中心" : "Topics CMS"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "主题内容聚合" : "Topic clusters"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {landingSurface?.summaryBlocks[0]?.body || (locale === "zh"
            ? "围绕核心测评主题组织文章、测试与人格相关内容，减少孤立页面。"
            : "Organize articles, tests, and personality-led content around core assessment topics.")}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1" data-testid="mbti-topics-index-entry-cta-group">
          <TrackedEntryCtaLink
            href={mbtiPrimaryCtaHref}
            prefetch
            data-testid="mbti-topics-index-primary-cta"
            eventProperties={mbtiPrimaryCtaTrackingProps}
            className={buttonVariants({ size: "lg" })}
          >
            {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
          </TrackedEntryCtaLink>
          <Link
            href={mbtiPersonalityHubHref}
            data-testid="mbti-topics-index-secondary-cta"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {locale === "zh" ? "查看人格类型" : "Browse personality types"}
          </Link>
        </div>
        {landingSurface?.ctaBundle.length ? (
          <div className="flex flex-wrap gap-2 pt-1" data-testid="topics-index-landing-cta">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <MbtiSceneEntrySection locale={locale} sourcePageType="topic_index" testId="topics-index-scene-entry" />

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
