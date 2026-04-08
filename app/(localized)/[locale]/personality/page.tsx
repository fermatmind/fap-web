import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { Container } from "@/components/layout/Container";
import { PersonalityHeroExecutiveSummary } from "@/components/personality/PersonalityHeroExecutiveSummary";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildPersonalityQuickLocateIndex } from "@/lib/mbti/personalityQuickLocate";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/personality" : "/en/personality",
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "浏览 16 型人格的优势、风险、人际模式与职业匹配建议。"
        : "Explore strengths, risks, relationship patterns, and career-fit guidance across 16 personality types.",
    alternatesByLocale: {
      en: "/en/personality",
      zh: "/zh/personality",
      xDefault: "/",
    },
  });
}

export default async function PersonalityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const { items: personalities, landingSurface } = await listPersonalityProfiles({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/personality" : "/en/personality";
  const hubPayload = buildPersonalityHubPayload({
    locale,
    canonicalPath,
    personalities,
    landingSurface,
  });
  const quickLocateIndex = await buildPersonalityQuickLocateIndex({
    locale,
    typeResults: hubPayload.typeDecisionCards,
  });
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiTopicHubHref = withLocale("/topics/mbti");
  const mbtiCareerRecommendationHubHref = withLocale("/career/recommendations");
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "浏览 16 型人格的优势、风险、人际模式与职业匹配建议。"
        : "Explore strengths, risks, relationship patterns, and career-fit guidance across 16 personality types.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "人格" : "Personality", path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id="personality-webpage" data={webPageJsonLd} />
      <JsonLd id="personality-breadcrumb" data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "人格" : "Personality" },
        ]}
      />

      <PersonalityHeroExecutiveSummary
        locale={locale}
        hero={hubPayload.hero}
        primaryHref={mbtiPrimaryCtaHref}
        primaryTrackingProps={mbtiPrimaryCtaTrackingProps}
        secondaryHref={mbtiTopicHubHref}
        quickLocateIndex={quickLocateIndex}
        supportingLinks={landingSurface?.ctaBundle ?? []}
        footerNote={
          locale === "zh"
            ? "内容来自 Personality CMS，仅展示已发布且公开的 profile。"
            : "Powered by Personality CMS and showing published public profiles only."
        }
      />

      <MbtiSceneEntrySection locale={locale} sourcePageType="personality_index" testId="personality-index-scene-entry" />

      <section
        id="mbti-family-groups"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
        data-testid="mbti-personality-family-grid"
      >
        <div className="space-y-2">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "按类型组浏览 16 型人格" : "Browse all 16 personality types by family"}
          </h2>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这里承担 16 型总入口职责：先按类型组缩小范围，再进入具体人格页或对应职业推荐页。"
              : "This is the 16-type release center: narrow by family first, then move into the profile or the matching career recommendation route."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {hubPayload.familyGroups.map((family) => (
            <Card
              key={family.groupKey}
              id={family.groupKey.toLowerCase()}
              className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="font-serif text-[var(--fm-text)]">
                  {family.groupKey} · {family.title}
                </CardTitle>
                <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{family.summary}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {family.cards.map((item) => {
                    return (
                      <Link
                        key={`${family.groupKey}-${item.typeCode}`}
                        href={item.href}
                        className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
                      >
                        {item.typeCode}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={mbtiCareerRecommendationHubHref} className="fm-help-chip-link">
                    {locale === "zh" ? "查看 MBTI 职业推荐目录" : "Browse MBTI career recommendations"}
                  </Link>
                  <Link href={mbtiTopicHubHref} className="fm-help-chip-link">
                    {locale === "zh" ? "回到 MBTI 主题中心" : "Continue in the MBTI topic hub"}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {hubPayload.typeDecisionCards.length > 0 ? (
        <div className="space-y-3" data-testid="mbti-personality-directory-grid">
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">
              {locale === "zh" ? "全部人格页" : "All profile routes"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "这里保留完整目录层，方便直接进入具体人格页。"
                : "This keeps the full directory layer for direct profile access."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {hubPayload.typeDecisionCards.map((personality) => (
            <Card
              key={personality.typeCode}
              className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="font-serif text-[var(--fm-text)]">
                  {personality.typeCode} · {personality.title}
                </CardTitle>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                  {personality.groupKey} · {personality.groupTitle}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{personality.excerpt}</p>
                <Link
                  href={personality.href}
                  className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看人格页" : "View profile"}
                </Link>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      ) : (
        <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-[var(--fm-text)]">
              {locale === "zh" ? "暂无已发布人格内容" : "No published personality profiles yet"}
            </CardTitle>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "CMS 当前没有返回该语言的人格内容。"
                : "The CMS did not return any personality profiles for this locale."}
            </p>
          </CardHeader>
        </Card>
      )}
    </Container>
  );
}
