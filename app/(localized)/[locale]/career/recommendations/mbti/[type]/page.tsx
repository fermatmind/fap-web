import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { MbtiCareerContinuityTelemetry } from "@/components/career/MbtiCareerContinuityTelemetry";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { MbtiScenarioDeepDiveSection } from "@/components/content/MbtiScenarioDeepDiveSection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import {
  buildCareerRecommendationFrontendUrl,
  getMbtiCareerRecommendationByType,
  type CareerRecommendationDetail,
} from "@/lib/cms/career-recommendations";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildMbtiRecommendationScenarioDeepModules } from "@/lib/mbti/sceneDeepContent";
import {
  parseMbtiContinuityQuery,
  resolveMbtiCarryoverFocusLabel,
  resolveMbtiCarryoverReasonLabel,
} from "@/lib/mbti/continuity";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildItemListJsonLd, buildWebPageJsonLd, type FAQItem } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function resolveTwitterCard(value: string | null | undefined): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function normalizeRequestedSlug(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function buildAnswerFirst(detail: CareerRecommendationDetail, locale: Locale): string {
  const firstParagraph = detail.career.summary.paragraphs[0];
  const matchedJobTitles = detail.matchedJobs.slice(0, 3).map((job) => job.title).join(locale === "zh" ? "、" : ", ");

  if (locale === "zh") {
    return firstParagraph
      ? `${detail.displayType} 的职业建议现在由后端 authority 直接提供。${firstParagraph}`
      : `${detail.displayType} 的职业建议现在由后端 authority 直接提供，当前优先关注 ${matchedJobTitles || "高匹配的结构化岗位"}，但内部 graph match 仍固定回落到 ${detail.graphTypeCode}。`;
  }

  return firstParagraph
    ? `Career guidance for ${detail.displayType} now comes directly from backend authority. ${firstParagraph}`
    : `Career guidance for ${detail.displayType} now comes directly from backend authority. Start with ${matchedJobTitles || "the highest-fit structured roles"}, while the internal graph match still falls back to ${detail.graphTypeCode}.`;
}

function buildCareerFaqItems(detail: CareerRecommendationDetail, locale: Locale): FAQItem[] {
  const primaryJobs = detail.matchedJobs.filter((job) => job.fitBucket === "primary").map((job) => job.title);
  const guideTitles = detail.matchedGuides.map((guide) => guide.title);
  const roleExamples = detail.career.preferredRoles.groups.flatMap((group) => group.examples).slice(0, 4);

  if (locale === "zh") {
    return [
      {
        question: `${detail.displayType} 的职业匹配是按什么 key 算的？`,
        answer: `公开路由使用 ${detail.publicRouteSlug}，但 graph match 固定回落到 ${detail.graphTypeCode}，因此岗位匹配仍以 4-letter canonical family 为准。`,
      },
      {
        question: `${detail.displayType} 现在优先看哪些方向？`,
        answer: `${primaryJobs.slice(0, 4).join("、") || roleExamples.join("、") || "高自主、高结构化的角色"} 是当前优先方向。`,
      },
      {
        question: `除了岗位，还应该看什么？`,
        answer: `${guideTitles.slice(0, 3).join("、") || "相关职业指南"} 可以继续补齐路径判断，不要只看单一人格标签。`,
      },
    ];
  }

  return [
    {
      question: `Which key does ${detail.displayType} use for career graph matching?`,
      answer: `The public route uses ${detail.publicRouteSlug}, but graph matching is fixed to ${detail.graphTypeCode}, so jobs still match through the canonical 4-letter family.`,
    },
    {
      question: `Which roles should ${detail.displayType} review first?`,
      answer: `${primaryJobs.slice(0, 4).join(", ") || roleExamples.join(", ") || "High-autonomy, high-structure roles"} are the current first-pass directions.`,
    },
    {
      question: `What else should you validate besides the job list?`,
      answer: `${guideTitles.slice(0, 3).join(", ") || "Related career guides"} should be part of the decision, so personality stays a routing signal rather than the only filter.`,
    },
  ];
}

function buildAnswerSurfaceFaqItems(detail: CareerRecommendationDetail, locale: Locale): FAQItem[] {
  if (detail.answerSurface?.faqBlocks.length) {
    return detail.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }));
  }

  return buildCareerFaqItems(detail, locale);
}

async function getDetailOrNotFound(locale: Locale, type: string): Promise<CareerRecommendationDetail> {
  const detail = await getMbtiCareerRecommendationByType(locale, type);
  if (!detail) {
    notFound();
  }

  return detail;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const detail = await getMbtiCareerRecommendationByType(locale, type);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug);
  const noindex = shouldNoindex(detail.seo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: detail.seo.surface?.title || detail.seo.meta.title,
    description: detail.seo.surface?.description || detail.seo.meta.description,
    seoSurface: detail.seo.surface,
    noindex: !detail.seo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: detail.seo.meta.alternates.en ?? buildCareerRecommendationFrontendUrl("en", detail.publicRouteSlug),
      zh: detail.seo.meta.alternates["zh-CN"] ?? buildCareerRecommendationFrontendUrl("zh", detail.publicRouteSlug),
      xDefault: "/",
    },
  });
  const canonical = canonicalUrl(canonicalPath);

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: detail.seo.surface?.og.title || detail.seo.meta.og.title,
      description: detail.seo.surface?.og.description || detail.seo.meta.og.description,
      images: detail.seo.surface?.og.image ? [detail.seo.surface.og.image] : detail.seo.meta.og.image ? [detail.seo.meta.og.image] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(detail.seo.surface?.twitter.card ?? detail.seo.meta.twitter.card),
      title: detail.seo.surface?.twitter.title || detail.seo.meta.twitter.title,
      description: detail.seo.surface?.twitter.description || detail.seo.meta.twitter.description,
      images: detail.seo.surface?.twitter.image ? [detail.seo.surface.twitter.image] : detail.seo.meta.twitter.image ? [detail.seo.meta.twitter.image] : undefined,
    },
  };
}

export default async function CareerMbtiRecommendationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; type: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, type } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const detail = await getDetailOrNotFound(locale, type);
  const continuity = parseMbtiContinuityQuery(resolvedSearchParams);
  const continuityFocusLabel = resolveMbtiCarryoverFocusLabel(
    String(continuity?.carryoverFocusKey ?? ""),
    locale
  );
  const continuityReasonLabel = resolveMbtiCarryoverReasonLabel(
    String(continuity?.carryoverReason ?? ""),
    locale
  );

  if (normalizeRequestedSlug(type) !== detail.publicRouteSlug) {
    permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug));
  }

  const canonicalPath = buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug);
  const answerFirst = detail.answerSurface?.summaryBlocks[0]?.body || buildAnswerFirst(detail, locale);
  const faqItems = buildAnswerSurfaceFaqItems(detail, locale);
  const landingSurface = detail.landingSurface;
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "entry_view",
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const recommendationScenarioDeepModules = buildMbtiRecommendationScenarioDeepModules({
    locale,
    typeCode: detail.graphTypeCode,
  });
  const recommendationHasGrowthScene = recommendationScenarioDeepModules.some((module) => module.sceneKey === "growth_planning");
  const mbtiLandingHref = withLocale("/tests/mbti-personality-test-16-personality-types");
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: detail.seo.meta.title,
    description: detail.seo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    {
      name: locale === "zh" ? "职业推荐" : "Career recommendations",
      path: localizedPath("/career/recommendations", locale),
    },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? `${detail.displayType} 推荐职业列表` : `${detail.displayType} recommended roles`,
    description: answerFirst,
    locale,
    items: detail.matchedJobs.map((job) => ({
      name: job.title,
      path: localizedPath(`/career/jobs/${job.slug}`, locale),
      description: job.summary,
    })),
  });

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id={`career-mbti-webpage-${detail.publicRouteSlug}`} data={webPageJsonLd} />
      <JsonLd id={`career-mbti-breadcrumb-${detail.publicRouteSlug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`career-mbti-itemlist-${detail.publicRouteSlug}`} data={itemListJsonLd} />
      <JsonLd id={`career-mbti-faq-${detail.publicRouteSlug}`} data={buildFAQPageJsonLd(faqItems)} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          {
            label: locale === "zh" ? "职业推荐" : "Career recommendations",
            href: localizedPath("/career/recommendations", locale),
          },
          { label: detail.displayType },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        {continuity ? (
          <>
            <div
              data-testid="mbti-career-continuity-entry"
              className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {locale === "zh" ? "继续上次重点" : "Continue the current focus"}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-[var(--fm-text)]">{continuityFocusLabel}</p>
              <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{continuityReasonLabel}</p>
            </div>
            <MbtiCareerContinuityTelemetry
              locale={locale}
              continuity={continuity}
              typeCode={detail.displayType}
            />
          </>
        ) : null}
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {detail.displayType}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {detail.typeName}
          {detail.nickname ? <span className="text-[var(--fm-text-muted)]"> · {detail.nickname}</span> : null}
        </h1>
        <p className="m-0 text-base leading-7 text-[var(--fm-text)]">{answerFirst}</p>
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="career-recommendation-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1" data-testid="mbti-career-entry-cta-group">
          <TrackedEntryCtaLink
            href={mbtiPrimaryCtaHref}
            prefetch
            data-testid="mbti-career-primary-cta"
            eventProperties={mbtiPrimaryCtaTrackingProps}
            className={buttonVariants({ size: "lg" })}
          >
            {locale === "zh" ? "验证我的类型（开始 MBTI 测试）" : "Validate my type (Start MBTI test)"}
          </TrackedEntryCtaLink>
          <Link
            href={mbtiLandingHref}
            data-testid="mbti-career-secondary-cta"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {locale === "zh" ? "查看测试介绍" : "View test overview"}
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Authority route" : "Authority route"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">/{detail.publicRouteSlug}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Graph key" : "Graph key"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{detail.graphTypeCode}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Keywords" : "Keywords"}
            </p>
            <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">
              {detail.keywords.join(locale === "zh" ? "、" : ", ") || detail.heroSummary}
            </p>
          </div>
        </div>
      </section>

      <MbtiSceneEntrySection
        locale={locale}
        sourcePageType="career_recommendation_detail"
        blocks={detail.answerSurface?.sceneSummaryBlocks}
        testId="career-recommendation-scene-entry"
      />
      <MbtiScenarioDeepDiveSection
        locale={locale}
        modules={recommendationScenarioDeepModules}
        sourcePageType="career_recommendation_detail"
        sourcePath={canonicalPath}
        testId="career-recommendation-scene-deep-dive"
        heading={
          locale === "zh"
            ? recommendationHasGrowthScene
              ? `${detail.graphTypeCode} 场景深化（职业优先 + 协作/专业/成长承接）`
              : `${detail.graphTypeCode} 场景深化（以职业方向为主）`
            : recommendationHasGrowthScene
              ? `${detail.graphTypeCode} scene depth (career-first with collaboration / major / growth continuity)`
              : `${detail.graphTypeCode} scene depth (career-first)`
        }
        subtitle={
          locale === "zh"
            ? recommendationHasGrowthScene
              ? "在职业推荐页延伸团队协作、专业选择和成长建议，避免只看岗位列表。"
              : "在职业推荐页延伸团队协作与专业选择，避免只看岗位列表。"
            : recommendationHasGrowthScene
              ? "Extend collaboration, major-selection, and growth guidance here, not just a job list."
              : "Extend collaboration and major-selection guidance here, not just a job list."
        }
      />

      <AnswerSurfaceSection
        surface={detail.answerSurface}
        locale={locale}
        testId="career-recommendation-answer-surface"
      />

      <section
        id="recommended-roles"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "匹配岗位矩阵" : "Matched role matrix"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "岗位列表直接来自 backend authority，并显式区分 primary / secondary fit。"
              : "The job list now comes directly from backend authority and explicitly separates primary and secondary fit."}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--fm-border)] text-[var(--fm-text)]">
                <th className="px-3 py-2">{locale === "zh" ? "Fit" : "Fit"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "岗位" : "Role"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "摘要" : "Summary"}</th>
                <th className="px-3 py-2">{locale === "zh" ? "匹配编码" : "Matching codes"}</th>
              </tr>
            </thead>
            <tbody>
              {detail.matchedJobs.map((job) => (
                <tr key={job.slug} className="border-b border-[var(--fm-border)] align-top text-[var(--fm-text-muted)]">
                  <td className="px-3 py-3 font-medium text-[var(--fm-text)]">
                    {job.fitBucket === "primary"
                      ? locale === "zh"
                        ? "Primary"
                        : "Primary"
                      : job.fitBucket === "secondary"
                        ? locale === "zh"
                          ? "Secondary"
                          : "Secondary"
                        : "-"}
                  </td>
                  <td className="px-3 py-3">
                    <Link href={job.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{job.summary || "-"}</td>
                  <td className="px-3 py-3">
                    {[...job.fitPersonalityCodes, ...job.mbtiPrimaryCodes, ...job.mbtiSecondaryCodes].join(", ") || detail.graphTypeCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{detail.career.advantages.title || (locale === "zh" ? "职业优势" : "Career advantages")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
            {detail.career.advantages.items.map((item) => (
              <div key={`${item.title}-${item.description}`}>
                {item.title ? <p className="m-0 font-medium text-[var(--fm-text)]">{item.title}</p> : null}
                {item.description ? <p className="m-0 mt-1">{item.description}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{detail.career.weaknesses.title || (locale === "zh" ? "职业短板" : "Career weaknesses")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
            {detail.career.weaknesses.items.map((item) => (
              <div key={`${item.title}-${item.description}`}>
                {item.title ? <p className="m-0 font-medium text-[var(--fm-text)]">{item.title}</p> : null}
                {item.description ? <p className="m-0 mt-1">{item.description}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {detail.career.preferredRoles.title || (locale === "zh" ? "偏好角色" : "Preferred roles")}
        </h2>
        {detail.career.preferredRoles.intro ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.career.preferredRoles.intro}</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {detail.career.preferredRoles.groups.map((group) => (
            <Card key={`${group.groupTitle}-${group.description}`}>
              <CardHeader>
                <CardTitle>{group.groupTitle || (locale === "zh" ? "角色组" : "Role group")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                {group.description ? <p className="m-0">{group.description}</p> : null}
                {group.examples.length > 0 ? (
                  <ul className="m-0 list-disc space-y-1 pl-5">
                    {group.examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
        {detail.career.preferredRoles.outro ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.career.preferredRoles.outro}</p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {detail.career.upgradeSuggestions.title || (locale === "zh" ? "升级建议" : "Upgrade suggestions")}
        </h2>
        <div className="space-y-3 text-sm leading-7 text-[var(--fm-text-muted)]">
          {detail.career.upgradeSuggestions.paragraphs.map((paragraph) => (
            <p key={paragraph} className="m-0">
              {paragraph}
            </p>
          ))}
        </div>
        {detail.career.upgradeSuggestions.bullets.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {detail.career.upgradeSuggestions.bullets.map((bullet) => (
              <div key={`${bullet.label}-${bullet.content}`} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                {bullet.label ? <p className="m-0 font-medium text-[var(--fm-text)]">{bullet.label}</p> : null}
                {bullet.content ? <p className="m-0 mt-1 text-sm text-[var(--fm-text-muted)]">{bullet.content}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {detail.matchedGuides.length > 0 ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "匹配指南" : "Matched guides"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {detail.matchedGuides.map((guide) => (
              <Card key={guide.slug}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={guide.href} className="text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                      {guide.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                  {guide.summary ? <p className="m-0">{guide.summary}</p> : null}
                  {guide.fitPersonalityCodes.length > 0 ? (
                    <p className="m-0">
                      {locale === "zh" ? "fit_personality_codes" : "fit_personality_codes"}: {guide.fitPersonalityCodes.join(", ")}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section id="faq" className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "常见问题" : "Frequently asked questions"}
        </h2>
        <dl className="m-0 space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="space-y-1">
              <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
              <dd className="m-0 text-[var(--fm-text-muted)]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "继续查看相关公域页面" : "Continue with related public pages"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {landingSurface?.ctaBundle.length
            ? landingSurface.ctaBundle.map((cta) => (
                <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                  {cta.label}
                </Link>
              ))
            : (
                <>
                  <Link href={withLocale(`/personality/${detail.publicRouteSlug}`)} className="fm-help-chip-link">
                    {locale === "zh" ? `${detail.displayType} 人格主页` : `${detail.displayType} personality page`}
                  </Link>
                  <Link href={withLocale("/topics/mbti")} className="fm-help-chip-link">
                    {locale === "zh" ? "MBTI 主题页" : "MBTI topic page"}
                  </Link>
                  <Link href={withLocale("/help/faq")} className="fm-help-chip-link">
                    {locale === "zh" ? "帮助与 FAQ" : "Help and FAQ"}
                  </Link>
                </>
              )}
        </div>
      </section>
    </Container>
  );
}
