import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { MbtiScenarioDeepDiveSection } from "@/components/content/MbtiScenarioDeepDiveSection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import {
  buildTopicFrontendUrl,
  getTopicBySlug,
  getTopicSeoBySlug,
  normalizeTopicSeoPayload,
} from "@/lib/cms/topics";
import { extractTopicFaqItems, renderTopicEntryGroups, renderTopicSections } from "@/lib/cms/topic-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { MBTI_TYPE_GROUPS } from "@/lib/mbti/mbtiTypeContentPack";
import { buildMbtiTopicScenarioDeepModules } from "@/lib/mbti/sceneDeepContent";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { resolveTopicRuntimeAuthority } from "@/lib/seo/topicLlmsAuthority";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildTopicFrontendUrl(locale, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [topic, seo] = await Promise.all([
    getTopicBySlug(slug, locale),
    getTopicSeoBySlug(slug, locale),
  ]);

  if (!topic) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildCanonicalPath(topic.slug, locale);
  const normalizedSeo = normalizeTopicSeoPayload(seo, topic, locale);
  const noindex = !topic.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.surface?.title || normalizedSeo.meta.title,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildTopicFrontendUrl("en", topic.slug),
      zh: buildTopicFrontendUrl("zh", topic.slug),
      xDefault: "/",
    },
  });
  const canonical = canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;
  const twitterImages = normalizeTwitterImages(
    normalizedSeo.surface?.twitter.image,
    normalizedSeo.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: twitterImages,
    },
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [topic, seo] = await Promise.all([
    getTopicBySlug(slug, locale),
    getTopicSeoBySlug(slug, locale),
  ]);

  if (!topic) {
    return notFound();
  }

  const normalizedSeo = normalizeTopicSeoPayload(seo, topic, locale);
  const canonicalPath = buildCanonicalPath(topic.slug, locale);
  const faqItems = topic.answerSurface?.faqBlocks.length
    ? topic.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : extractTopicFaqItems(topic.sections);
  const landingSurface = topic.landingSurface;
  const topicRuntimeAuthority = resolveTopicRuntimeAuthority({
    slug: topic.slug,
    hasLandingSurfaceCtaBundle: Boolean(landingSurface?.ctaBundle.length),
  });
  const canRenderRelatedTopicCtas = Boolean(landingSurface?.ctaBundle.length) || topicRuntimeAuthority.cta.allowed;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "主题" : "Topics", path: localizedPath("/topics", locale) },
    { name: topic.title, path: canonicalPath },
  ]);
  const renderedSections = renderTopicSections(topic.sections, locale);
  const renderedEntryGroups = renderTopicEntryGroups(topic.entryGroups, locale);
  const isMbtiTopic =
    String(topic.topicCode || "").toLowerCase() === "mbti" || String(topic.slug || "").toLowerCase() === "mbti";
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_detail",
    sourcePageType: "topic_detail",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_detail",
    sourcePageType: "topic_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_topic_detail",
    sourcePageType: "topic_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const topicSceneBlocks = topic.answerSurface?.sceneSummaryBlocks ?? [];
  const mbtiTopicHubHref = localizedPath("/topics/mbti", locale);
  const mbtiPersonalityHubHref = localizedPath("/personality", locale);
  const mbtiCareerRecommendationHubHref = localizedPath("/career/recommendations", locale);
  const topicScenarioDeepModules = isMbtiTopic ? buildMbtiTopicScenarioDeepModules(locale) : [];

  return (
    <Container as="main" className="space-y-6 py-10">
      {isMbtiTopic ? <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} /> : null}
      <JsonLd id={`topic-jsonld-${topic.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`topic-webpage-${topic.slug}`} data={webPageJsonLd} />
      <JsonLd id={`topic-breadcrumb-${topic.slug}`} data={breadcrumbJsonLd} />
      {faqItems.length > 0 ? <JsonLd id={`topic-faq-${topic.slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "主题" : "Topics", href: localizedPath("/topics", locale) },
          { label: topic.title },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        {topic.heroKicker ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {topic.heroKicker}
          </p>
        ) : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{topic.title}</h1>
        {topic.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{topic.subtitle}</p> : null}
        {topic.excerpt ? <p className="m-0 text-[var(--fm-text-muted)]">{topic.excerpt}</p> : null}
        {isMbtiTopic ? (
          <div className="flex flex-wrap items-center gap-3 pt-1" data-testid="mbti-topic-detail-entry-cta-group">
            <TrackedEntryCtaLink
              href={mbtiPrimaryCtaHref}
              prefetch
              data-testid="mbti-topic-detail-primary-cta"
              eventProperties={mbtiPrimaryCtaTrackingProps}
              className={buttonVariants({ size: "lg" })}
            >
              {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
            </TrackedEntryCtaLink>
            <Link
              href={mbtiPersonalityHubHref}
              data-testid="mbti-topic-detail-secondary-cta"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {locale === "zh" ? "查看人格类型" : "Browse personality types"}
            </Link>
          </div>
        ) : null}
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="topic-detail-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {topic.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {topic.heroQuote}
          </blockquote>
        ) : null}
      </section>

      {isMbtiTopic ? (
        <section
          className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          data-testid="mbti-topic-type-grid"
        >
          <div className="space-y-2">
            <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "MBTI 类型延伸入口" : "MBTI type continue grid"}
            </h2>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "这里保持轻量，只提供类型入口与职业推荐入口，不把主题页变成长文页。"
                : "This remains lightweight: type entry points and recommendation entry points only, not a long-form topic page."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(Object.entries(MBTI_TYPE_GROUPS) as Array<[keyof typeof MBTI_TYPE_GROUPS, readonly string[]]>).map(([groupKey, typeCodes]) => (
              <Card key={groupKey} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{groupKey}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                  {typeCodes.map((typeCode) => {
                    const personalityHref = localizedPath(`/personality/${typeCode.toLowerCase()}-a`, locale);
                    const recommendationHref = localizedPath(`/career/recommendations/mbti/${typeCode.toLowerCase()}-a`, locale);

                    return (
                      <div key={typeCode} className="space-y-1 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
                        <p className="m-0 font-medium text-[var(--fm-text)]">{typeCode}</p>
                        <div className="flex flex-wrap gap-2">
                          <Link href={personalityHref} className="fm-help-chip-link">
                            {locale === "zh" ? "类型页" : "Personality"}
                          </Link>
                          <Link href={recommendationHref} className="fm-help-chip-link">
                            {locale === "zh" ? "职业推荐" : "Recommendation"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
      {isMbtiTopic ? (
        <MbtiSceneEntrySection
          locale={locale}
          sourcePageType="topic_detail"
          blocks={topicSceneBlocks}
          testId="topic-detail-scene-entry"
        />
      ) : null}
      {isMbtiTopic ? (
        <MbtiScenarioDeepDiveSection
          locale={locale}
          modules={topicScenarioDeepModules}
          sourcePageType="topic_detail"
          sourcePath={canonicalPath}
          testId="topic-detail-scene-deep-dive"
          heading={locale === "zh" ? "MBTI 场景深化（主题页）" : "MBTI scene depth on the topic hub"}
          subtitle={
            locale === "zh"
              ? "先用主题页建立职业/协作/专业/成长判断框架，再进入类型与推荐页做下一步验证。"
              : "Use the topic hub as a decision frame for career, collaboration, major, and growth before validating on type and recommendation pages."
          }
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {renderedSections}
          <AnswerSurfaceSection
            surface={topic.answerSurface}
            locale={locale}
            testId="topic-detail-answer-surface"
          />
          {renderedEntryGroups}
          {canRenderRelatedTopicCtas ? (
            <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
              <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
                {locale === "zh" ? "继续延伸阅读" : "Continue with related public guides"}
              </h2>
              <div className="flex flex-wrap gap-2 text-sm">
                {landingSurface?.ctaBundle.length
                  ? landingSurface.ctaBundle.map((cta) => (
                      <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                        {cta.label}
                      </Link>
                    ))
                  : topicRuntimeAuthority.cta.allowed
                    ? (
                        <>
                          <Link href={mbtiPersonalityHubHref} className="fm-help-chip-link">
                            {locale === "zh" ? "人格画像" : "Personality hub"}
                          </Link>
                          <Link href={mbtiCareerRecommendationHubHref} className="fm-help-chip-link">
                            {locale === "zh" ? "职业推荐" : "Career recommendations"}
                          </Link>
                          <Link href={mbtiTopicHubHref} className="fm-help-chip-link">
                            {locale === "zh" ? "MBTI 主题页" : "MBTI topic hub"}
                          </Link>
                          <Link href={localizedPath("/help/faq", locale)} className="fm-help-chip-link">
                            {locale === "zh" ? "帮助与常见问题" : "Help and FAQ"}
                          </Link>
                        </>
                      )
                    : null}
              </div>
            </section>
          ) : null}
          {renderedSections.length === 0 && renderedEntryGroups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "该 topic 已接入 CMS，但当前语言下尚未同步可渲染的 sections 或 entry groups。"
                    : "This topic is connected to the CMS, but no renderable sections or entry groups are available for this locale yet."}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "主题摘要" : "Topic summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "主题代码" : "Topic code"}:</span>{" "}
                {topic.topicCode || topic.slug}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "语言" : "Locale"}:</span>{" "}
                {topic.locale}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "规范链接" : "Canonical"}:</span>{" "}
                {canonicalUrl(canonicalPath)}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "索引状态" : "Indexing"}:</span>{" "}
                {normalizedSeo.meta.robots}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "SEO 快照" : "SEO snapshot"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "标题" : "Title"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.title || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "描述" : "Description"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.description || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">Canonical</p>
                <p className="mb-0 mt-1 break-all">{normalizedSeo.meta.canonical || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
