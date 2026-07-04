import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listTopics } from "@/lib/cms/topics";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type TopicNavigationItem = {
  label: string;
  description: string;
  href: string;
};

type TopicNavigationGroup = {
  title: string;
  description: string;
  items: TopicNavigationItem[];
};

function buildTopicNavigationGroups(locale: Locale, withLocale: (pathname: string) => string): TopicNavigationGroup[] {
  const isZh = locale === "zh";

  return [
    {
      title: isZh ? "测试文章分类" : "Test article categories",
      description: isZh
        ? "按核心测评模型进入文章、指南与解释内容。"
        : "Browse articles and guides by core assessment model.",
      items: [
        {
          label: isZh ? "MBTI 文章" : "MBTI articles",
          description: isZh ? "类型、偏好、沟通与职业场景。" : "Types, preferences, communication, and career use cases.",
          href: withLocale("/topics/mbti"),
        },
        {
          label: isZh ? "大五人格文章" : "Big Five articles",
          description: isZh ? "五维特质、分数解释与行动建议。" : "Trait dimensions, score interpretation, and action cues.",
          href: withLocale("/topics/big-five"),
        },
        {
          label: isZh ? "IQ 文章" : "IQ articles",
          description: isZh ? "认知能力、推理表现与解释边界。" : "Cognitive ability, reasoning performance, and interpretation boundaries.",
          href: withLocale("/topics/iq-eq#iq"),
        },
        {
          label: isZh ? "EQ 文章" : "EQ articles",
          description: isZh ? "情绪能力、沟通场景与解释边界。" : "Emotional skills, communication contexts, and interpretation boundaries.",
          href: withLocale("/topics/iq-eq#eq"),
        },
      ],
    },
    {
      title: isZh ? "人格文章" : "Personality articles",
      description: isZh
        ? "从类型库、人格主题和长期成长内容继续阅读。"
        : "Continue through type profiles, personality topics, and growth content.",
      items: [
        {
          label: isZh ? "人格类型库" : "Personality type library",
          description: isZh ? "查看 MBTI 类型与人格画像入口。" : "Open MBTI type profiles and personality portraits.",
          href: withLocale("/personality"),
        },
        {
          label: isZh ? "全部文章" : "All articles",
          description: isZh ? "浏览已发布的公开文章列表。" : "Browse the full published article list.",
          href: withLocale("/articles"),
        },
      ],
    },
    {
      title: isZh ? "职业文章" : "Career articles",
      description: isZh
        ? "围绕职业方向、岗位判断和兴趣结构继续探索。"
        : "Explore career direction, role judgment, and interest structure.",
      items: [
        {
          label: isZh ? "职业指南" : "Career guides",
          description: isZh ? "查看职业发展与岗位选择文章。" : "Read career development and role-choice guides.",
          href: withLocale("/career/guides"),
        },
        {
          label: isZh ? "职业库" : "Career library",
          description: isZh ? "进入职业页面与岗位内容。" : "Open career and role pages.",
          href: withLocale("/career"),
        },
      ],
    },
  ];
}

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
    title: isZh ? "主题中心" : "Topics",
    description: isZh
      ? "按测试文章分类、人格文章和职业文章浏览费马测试内容入口。"
      : "Browse FermatMind content by test article categories, personality articles, and career articles.",
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
  const { items: topics } = await listTopics({ locale }).catch(() => ({
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
  const navigationGroups = buildTopicNavigationGroups(locale, withLocale);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "主题中心" : "Topics",
    description:
      locale === "zh"
        ? "按测试文章分类、人格文章和职业文章浏览费马测试内容入口。"
        : "Browse FermatMind content by test article categories, personality articles, and career articles.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "主题" : "Topics", path: canonicalPath },
  ]);
  const emptyTitle = locale === "zh" ? "暂无已发布主题" : "No published topics yet";
  const emptyDescription =
    locale === "zh"
      ? "CMS 当前没有返回可展示的主题页面。"
      : "The CMS did not return published topic pages for this locale.";

  return (
    <Container as="main" className="space-y-10 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={{ page_type: "topics_index", locale }} />
      <JsonLd id="topics-webpage" data={webPageJsonLd} />
      <JsonLd id="topics-breadcrumb" data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "主题" : "Topics" },
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-3" aria-label={locale === "zh" ? "主题分类入口" : "Topic category entry points"}>
        {navigationGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <div className="space-y-2">
              <h2 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{group.title}</h2>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{group.description}</p>
            </div>
            <div className="divide-y divide-[var(--fm-border)] border-y border-[var(--fm-border)]">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-4 transition hover:bg-[var(--fm-surface-muted)]"
                >
                  <span className="block text-base font-semibold text-[var(--fm-text)]">{item.label}</span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--fm-text-muted)]">{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--fm-border)] pb-3">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "已发布主题" : "Published topics"}
            </h2>
          </div>
        </div>

        {topics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <Card key={`${topic.locale}:${topic.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
                <CardHeader className="space-y-3">
                  <CardTitle className="font-serif text-[var(--fm-text)]">{topic.title}</CardTitle>
                  <p className="m-0 text-sm text-[var(--fm-text-muted)]">{topic.excerpt || topic.subtitle || "-"}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
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
      </section>
    </Container>
  );
}
