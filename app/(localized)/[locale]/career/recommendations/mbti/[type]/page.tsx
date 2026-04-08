import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { MbtiCareerContinuityTelemetry } from "@/components/career/MbtiCareerContinuityTelemetry";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
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
import {
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
} from "@/lib/mbti/entryTracking";
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

function renderCareerDataStatus(detail: CareerRecommendationDetail, locale: Locale) {
  if (detail.careerDataStatus === "available") {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
      data-testid="career-recommendation-protocol-status"
      data-career-data-status={detail.careerDataStatus}
    >
      <p className="m-0 font-medium">
        {detail.careerDataStatus === "trust_limited"
          ? locale === "zh"
            ? "当前为 trust-limited 渲染"
            : "Rendering in trust-limited mode"
          : locale === "zh"
            ? "当前内容不可用"
            : "Career data is currently unavailable"}
      </p>
      <p className="m-0 mt-2 leading-7">
        {locale === "zh"
          ? "Career recommendation 页面现在只消费显式协议 surface，并要求 claim / trust / index gate 明确放行。缺少关键协议字段时，页面不会再本地合成职业解释。"
          : "This recommendation page now consumes explicit protocol surfaces only, with explicit claim, trust, and index gates. When key protocol fields are missing, it no longer synthesizes local career explanations."}
      </p>
      {detail.renderState.missingFields.length > 0 ? (
        <p className="m-0 mt-2 text-xs uppercase tracking-[0.08em] text-amber-900/80">
          {locale === "zh" ? "缺失字段" : "Missing fields"}: {detail.renderState.missingFields.join(", ")}
        </p>
      ) : null}
    </div>
  );
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
    explicitIndexGate: {
      indexEligible: detail.protocol.careerAsset?.seo_contract.index_eligible ?? detail.seo.surface?.indexEligible ?? null,
      indexState: detail.protocol.careerAsset?.seo_contract.index_state ?? detail.seo.surface?.indexState ?? null,
    },
    noindex: !detail.renderState.canIndexPage || noindex,
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
  const renderState = detail.renderState;
  const answerSurface = renderState.canRenderAnswerSurface ? detail.answerSurface : null;
  const landingSurface = renderState.canRenderLandingSurface ? detail.landingSurface : null;
  const matchedJobs = renderState.canRenderMatchedJobs ? detail.matchedJobs : [];
  const faqItems: FAQItem[] = renderState.canRenderStrongTruth
    ? (detail.answerSurface?.faqBlocks ?? [])
        .filter((item) => item.question && item.answer)
        .map((item) => ({
          question: item.question,
          answer: item.answer,
        }))
    : [];
  const answerFirst = renderState.canRenderStrongTruth
    ? detail.answerSurface?.summaryBlocks.find((block) => block.body)?.body ?? null
    : null;
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_career_recommendation_detail",
    sourcePageType: "career_recommendation_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
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
    description: answerFirst ?? detail.seo.meta.description,
    locale,
    items: matchedJobs.map((job) => ({
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
      {renderState.canRenderMatchedJobs && matchedJobs.length > 0 ? (
        <JsonLd id={`career-mbti-itemlist-${detail.publicRouteSlug}`} data={itemListJsonLd} />
      ) : null}
      {faqItems.length > 0 ? (
        <JsonLd id={`career-mbti-faq-${detail.publicRouteSlug}`} data={buildFAQPageJsonLd(faqItems)} />
      ) : null}
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
        {renderCareerDataStatus(detail, locale)}
        {answerFirst ? <p className="m-0 text-base leading-7 text-[var(--fm-text)]">{answerFirst}</p> : null}
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
        <div
          className="flex flex-wrap items-center gap-3 pt-1"
          data-testid="mbti-career-entry-cta-group"
          data-ads-surface="secondary"
        >
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
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {locale === "zh" ? "查看测试介绍" : "View test overview"}
          </Link>
        </div>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]" data-testid="mbti-career-cta-guidance">
          {locale === "zh"
            ? "如果你是从职业意图进入，先用测试验证类型是否吻合，再用这页判断职业方向。"
            : "If you arrived with career intent, validate the type first so this recommendation page reflects your actual pattern."}
        </p>
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
              {detail.keywords.join(locale === "zh" ? "、" : ", ") || detail.graphTypeCode}
            </p>
          </div>
        </div>
      </section>

      {renderState.canRenderAnswerSurface ? (
        <MbtiSceneEntrySection
          locale={locale}
          sourcePageType="career_recommendation_detail"
          blocks={answerSurface?.sceneSummaryBlocks}
          testId="career-recommendation-scene-entry"
        />
      ) : null}

      {renderState.canRenderAnswerSurface ? (
        <AnswerSurfaceSection
          surface={answerSurface}
          locale={locale}
          testId="career-recommendation-answer-surface"
        />
      ) : null}

      {renderState.canRenderMatchedJobs && matchedJobs.length > 0 ? (
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
                ? "岗位列表只在 authority payload 明确提供时渲染，并显式区分 primary / secondary fit。"
                : "The job list renders only when the authority payload provides it explicitly, with primary / secondary fit separated."}
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
                {matchedJobs.map((job) => (
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
      ) : (
        <section
          className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          data-testid="career-recommendation-matched-jobs-status"
          data-career-data-status={detail.careerDataStatus}
        >
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "当前未拿到可渲染的 authority matched jobs，页面不会再本地拼接岗位矩阵。"
              : "Authority matched jobs are not currently available, so this page does not assemble a local role matrix."}
          </p>
        </section>
      )}

      {renderState.canRenderStrongTruth ? (
        <>
          {detail.career.summary.paragraphs.length > 0 ? (
            <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
                {detail.career.summary.title || (locale === "zh" ? "职业摘要" : "Career summary")}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-[var(--fm-text-muted)]">
                {detail.career.summary.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="m-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

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
        </>
      ) : null}

      {renderState.canRenderStrongTruth && detail.matchedGuides.length > 0 ? (
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

      {faqItems.length > 0 ? (
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
      ) : null}

      {landingSurface?.ctaBundle.length ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "继续查看相关公域页面" : "Continue with related public pages"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
