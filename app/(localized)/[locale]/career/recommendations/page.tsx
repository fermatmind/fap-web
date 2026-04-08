import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { listBig5RecommendationTraits } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

function renderLightweightRecommendationStatusNotice(
  dataStatus: "available" | "trust_limited" | "unavailable",
  locale: "en" | "zh"
) {
  if (dataStatus === "available") {
    return null;
  }

  return (
    <p className="m-0">
      {dataStatus === "trust_limited"
        ? locale === "zh"
          ? "当前 recommendation 卡片处于 trust-limited 模式，仅显示后端明确放行的轻量状态。"
          : "This recommendation card is in trust-limited mode and only shows the lightweight status explicitly allowed by the backend."
        : locale === "zh"
          ? "当前 recommendation 卡片不可用，页面不会本地合成推荐解释。"
          : "This recommendation card is unavailable, and the page does not synthesize local recommendation explanations."}
    </p>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations",
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "基于 backend authority 的轻量职业推荐索引。"
        : "A lightweight career recommendation index powered by backend authority.",
    alternatesByLocale: {
      en: "/en/career/recommendations",
      zh: "/zh/career/recommendations",
      xDefault: "/",
    },
  });
}

export default async function CareerRecommendationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  const payload = await fetchCareerRecommendationIndex({ locale });
  const recommendationItems = adaptCareerRecommendationIndex({ locale, payload });
  const big5Traits = listBig5RecommendationTraits();
  const canonicalPath =
    locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "基于 backend authority 的轻量职业推荐索引。"
        : "A lightweight career recommendation index powered by backend authority.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
    { name: locale === "zh" ? "职业推荐" : "Recommendations", path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id="career-recommendation-webpage" data={webPageJsonLd} />
      <JsonLd id="career-recommendation-breadcrumb" data={breadcrumbJsonLd} />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "后端 recommendation index" : "Backend recommendation index"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "适合你的职业方向" : "Career directions that fit you"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这一页现在直接消费 backend B5 lightweight recommendation index，不再把 CMS family / variant 形状当成 authority。"
            : "This page now consumes the backend B5 lightweight recommendation index directly and no longer treats the CMS family/variant shape as authority."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">MBTI</h2>
        {recommendationItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recommendationItems.map((item) => (
              <article
                key={item.recommendationSubjectMeta.publicRouteSlug}
                className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)]"
                data-testid="career-recommendation-index-card"
                data-career-data-status={item.dataStatus}
              >
                <div className="space-y-1">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {item.recommendationSubjectMeta.canonicalTypeCode ??
                      item.recommendationSubjectMeta.typeCode ??
                      item.recommendationSubjectMeta.publicRouteSlug.toUpperCase()}
                  </p>
                  <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">
                    {item.recommendationSubjectMeta.displayTitle}
                  </h3>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[var(--fm-text-muted)]">
                  <p className="m-0">
                    {locale === "zh" ? "Authority route" : "Authority route"}: /
                    {item.recommendationSubjectMeta.publicRouteSlug}
                  </p>
                  {item.dataStatus === "available" ? (
                    <>
                      <p className="m-0">
                        {locale === "zh" ? "Fit 分数" : "Fit score"}: {item.scoreSummary.fitScore.value ?? "—"}
                      </p>
                      <p className="m-0">
                        {locale === "zh" ? "Confidence 分数" : "Confidence score"}:{" "}
                        {item.scoreSummary.confidenceScore.value ?? "—"}
                      </p>
                    </>
                  ) : (
                    renderLightweightRecommendationStatusNotice(item.dataStatus, locale)
                  )}
                  <p className="m-0">
                    {locale === "zh" ? "Reviewer" : "Reviewer"}: {item.trustSummary.reviewerStatus ?? "unknown"}
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    href={item.href}
                    className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                  >
                    {locale === "zh" ? "查看 recommendation detail" : "View recommendation detail"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm text-[var(--fm-text-muted)]"
            data-testid="career-recommendation-index-status"
            data-career-data-status="unavailable"
          >
            {locale === "zh"
              ? "backend recommendation index 当前不可用，因此页面不会回退到 CMS family / variant 列表，也不会退化成 job list。"
              : "The backend recommendation index is currently unavailable, so this page does not fall back to the CMS family/variant list and does not degrade into a job list."}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">Big5</h2>
        <div className="flex flex-wrap gap-2">
          {big5Traits.map((trait) => (
            <Link
              key={trait}
              href={withLocale(`/career/recommendations/big5/${trait}`)}
              className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
            >
              {trait}
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
