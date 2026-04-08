import type { Metadata } from "next";
import Link from "next/link";
import { CareerRecommendationPanel } from "@/components/career/CareerRecommendationPanel";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { listMbtiCareerRecommendations } from "@/lib/cms/career-recommendations";
import { listBig5RecommendationTraits } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type MbtiRecommendationFamily = {
  canonicalTypeCode: string;
  typeName: string;
  items: Awaited<ReturnType<typeof listMbtiCareerRecommendations>>;
};

function groupMbtiFamilies(
  items: Awaited<ReturnType<typeof listMbtiCareerRecommendations>>
): MbtiRecommendationFamily[] {
  const byFamily = new Map<string, MbtiRecommendationFamily>();

  for (const item of items) {
    const existing = byFamily.get(item.canonicalTypeCode);
    if (existing) {
      existing.items.push(item);
      continue;
    }

    byFamily.set(item.canonicalTypeCode, {
      canonicalTypeCode: item.canonicalTypeCode,
      typeName: item.typeName,
      items: [item],
    });
  }

  return [...byFamily.values()]
    .map((family) => ({
      ...family,
      items: [...family.items].sort((left, right) => {
        const leftRank = left.variantCode === "A" ? 0 : left.variantCode === "T" ? 1 : 9;
        const rightRank = right.variantCode === "A" ? 0 : right.variantCode === "T" ? 1 : 9;
        return leftRank - rightRank || left.displayType.localeCompare(right.displayType);
      }),
    }))
    .sort((left, right) => left.canonicalTypeCode.localeCompare(right.canonicalTypeCode));
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
        ? "基于 MBTI、Big5、IQ/EQ 和 RIASEC 的职业个性化推荐。"
        : "Personalized recommendations powered by MBTI, Big5, IQ/EQ, and RIASEC.",
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

  const mbtiRecommendationItems = await listMbtiCareerRecommendations(locale).catch(() => []);
  const mbtiFamilies = groupMbtiFamilies(mbtiRecommendationItems);
  const big5Traits = listBig5RecommendationTraits();
  const canonicalPath =
    locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "基于 MBTI、Big5、IQ/EQ 和 RIASEC 的职业个性化推荐。"
        : "Personalized recommendations powered by MBTI, Big5, IQ/EQ, and RIASEC.",
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
          {locale === "zh" ? "个性化推荐引擎" : "Recommendation Engine"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "适合你的职业" : "Careers that fit you"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "融合历史测评结果与职业兴趣小测，输出可解释职业推荐。"
            : "Combines historical assessments with RIASEC to generate explainable recommendations."}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">MBTI</h2>
        {mbtiFamilies.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {mbtiFamilies.map((family) => (
              <div
                key={family.canonicalTypeCode}
                className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)]"
              >
                <div className="space-y-1">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {family.canonicalTypeCode}
                  </p>
                  <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{family.typeName}</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {family.items.map((item) => (
                    <Link
                      key={item.publicRouteSlug}
                      href={item.href}
                      className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
                    >
                      {item.displayType}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm text-[var(--fm-text-muted)]"
            data-testid="career-recommendation-index-status"
            data-career-data-status="unavailable"
          >
            {locale === "zh"
              ? "Career recommendation authority 当前不可用，索引页不会再回退到本地合成列表。"
              : "Career recommendation authority is currently unavailable, so the index does not fall back to a local synthesized list."}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">Big5</h2>
        <div className="flex flex-wrap gap-2">
          {big5Traits.map((trait) => (
            <Link key={trait} href={withLocale(`/career/recommendations/big5/${trait}`)} className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]">
              {trait}
            </Link>
          ))}
        </div>
      </section>

      <CareerRecommendationPanel locale={locale} />
    </Container>
  );
}
