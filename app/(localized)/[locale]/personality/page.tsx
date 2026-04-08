import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { PersonalityHeroExecutiveSummary } from "@/components/personality/PersonalityHeroExecutiveSummary";
import { CareerIntelligencePreview } from "@/components/personality/CareerIntelligencePreview";
import { PersonalityFaq } from "@/components/personality/PersonalityFaq";
import { PersonalityMobileDecisionBar } from "@/components/personality/PersonalityMobileDecisionBar";
import { ScenarioIntelligenceMatrix } from "@/components/personality/ScenarioIntelligenceMatrix";
import { PersonalityMethodology } from "@/components/personality/PersonalityMethodology";
import { TypeNavigatorWorkbench } from "@/components/personality/TypeNavigatorWorkbench";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import { buildPersonalityQuickLocateIndex } from "@/lib/mbti/personalityQuickLocate";
import { buildPersonalityCareerPreview } from "@/lib/mbti/personalityCareerPreview";
import { buildPersonalityScenarioMatrix } from "@/lib/mbti/personalityScenarioMatrix";
import { buildPersonalityWorkbench } from "@/lib/mbti/personalityWorkbench";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
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
  const scenarioMatrix = buildPersonalityScenarioMatrix({
    locale,
    scenarioCards: hubPayload.scenarioMatrixSeed,
    familyGroups: hubPayload.familyGroups,
    typeDecisionCards: hubPayload.typeDecisionCards,
  });
  const workbenchPayload = buildPersonalityWorkbench({
    locale,
    familyGroups: hubPayload.familyGroups,
    typeDecisionCards: hubPayload.typeDecisionCards,
  });
  const careerPreviewCards = await buildPersonalityCareerPreview({
    locale,
    seed: hubPayload.careerPreviewSeed,
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
  const methodologyItems = hubPayload.methodologyItems ?? hubPayload.methodologyBlocks;
  const faqItems = hubPayload.faqItems ?? hubPayload.faqBlocks;
  const typeItemList = hubPayload.jsonLdInputs?.typeItemList ?? [];
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
  const faqJsonLd =
    faqItems.length
      ? buildFAQPageJsonLd(faqItems)
      : null;
  const itemListJsonLd =
    typeItemList.length
      ? buildItemListJsonLd({
          path: canonicalPath,
          title: locale === "zh" ? "16 型人格目录" : "16 personality type inventory",
          description:
            locale === "zh"
              ? "按人格类型浏览 16 型 profile 路由。"
              : "Browse the published profile routes for all 16 personality types.",
          locale,
          idSuffix: "personality-inventory",
          items: typeItemList.map((item) => ({
            name: item.name,
            path: item.url,
            description: item.description,
          })),
        })
      : null;

  return (
    <Container as="main" className="space-y-6 py-10 pb-28 md:pb-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id="personality-webpage" data={webPageJsonLd} />
      <JsonLd id="personality-breadcrumb" data={breadcrumbJsonLd} />
      {faqJsonLd ? <JsonLd id="personality-faq-jsonld" data={faqJsonLd} /> : null}
      {itemListJsonLd ? <JsonLd id="personality-itemlist-jsonld" data={itemListJsonLd} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "人格" : "Personality" },
        ]}
      />
      <PersonalityMobileDecisionBar
        locale={locale}
        primaryHref={mbtiPrimaryCtaHref}
        primaryTrackingProps={mbtiPrimaryCtaTrackingProps}
        quickLocateHref="#personality-quick-locate"
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

      <ScenarioIntelligenceMatrix locale={locale} cards={scenarioMatrix} />

      {workbenchPayload.cards.length > 0 ? (
        <TypeNavigatorWorkbench
          locale={locale}
          payload={workbenchPayload}
          familyGroups={hubPayload.familyGroups}
        />
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

      <CareerIntelligencePreview locale={locale} cards={careerPreviewCards} />
      <PersonalityMethodology locale={locale} blocks={methodologyItems} />
      <PersonalityFaq locale={locale} items={faqItems} />
    </Container>
  );
}
