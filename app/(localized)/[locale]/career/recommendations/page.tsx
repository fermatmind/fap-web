import type { Metadata } from "next";
import Link from "next/link";
import { CareerRecommendationPanel } from "@/components/career/CareerRecommendationPanel";
import { Container } from "@/components/layout/Container";
import { ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { listMbtiCareerRecommendations } from "@/lib/cms/career-recommendations";
import { listBig5RecommendationTraits, listCareerJobs } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

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

  return buildSeoMetadata({
    pageType: "hub",
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

  const [jobs, mbtiRecommendationItems] = await Promise.all([
    Promise.resolve(listCareerJobs(locale)),
    listMbtiCareerRecommendations(locale).catch(() => []),
  ]);
  const mbtiFamilies = groupMbtiFamilies(mbtiRecommendationItems);
  const big5Traits = listBig5RecommendationTraits();
  const canonicalPath =
    locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "career-recommendations-index",
    pageType: "hub",
    locale,
    canonicalPath,
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "基于 MBTI、Big5、IQ/EQ 和 RIASEC 的职业个性化推荐。"
        : "Personalized recommendations powered by MBTI, Big5, IQ/EQ, and RIASEC.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
      { name: locale === "zh" ? "职业推荐" : "Recommendations", path: canonicalPath },
    ],
  });

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
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

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={locale === "zh"
          ? "职业推荐页把 MBTI、Big5 与职业兴趣入口组织到同一页面，先分发到正确模型，再进入具体岗位和指南。"
          : "The recommendation hub organizes MBTI, Big5, and career-interest routes on one page so users enter the right model first and then move into specific roles and guides."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "推荐口径" : "Recommendation scope"}
        body={locale === "zh"
          ? "本页展示的是推荐入口和推荐家族，不把所有结论压缩成一段 marketing copy；具体岗位结论和方法边界在下游详情页中继续展开。"
          : "This page presents recommendation entry points and families rather than collapsing every conclusion into one marketing block. Specific role conclusions and method boundaries continue on downstream detail pages."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <section className="space-y-2">
        <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">MBTI</h2>
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
                    href={normalizePublicHref(item.href, locale)}
                    className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
                  >
                    {item.displayType}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
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

      <CareerRecommendationPanel locale={locale} jobs={jobs} />
    </Container>
  );
}
