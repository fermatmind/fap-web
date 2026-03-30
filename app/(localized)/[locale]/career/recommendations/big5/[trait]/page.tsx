import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBig5Recommendation,
  getCareerJobBySlug,
  listBig5RecommendationTraits,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

const BANDS = ["high", "balanced", "low"] as const;

export function generateStaticParams() {
  return listBig5RecommendationTraits().flatMap((trait) => [{ locale: "en", trait }, { locale: "zh", trait }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; trait: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, trait } = await params;
  const locale = resolveLocale(localeParam);
  const profile = getBig5Recommendation(trait, "balanced", locale);

  if (!profile) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildSeoMetadata({
    pageType: "guide",
    locale,
    pathname:
      locale === "zh"
        ? `/zh/career/recommendations/big5/${trait}`
        : `/en/career/recommendations/big5/${trait}`,
    title: profile.title,
    description: profile.summary,
    alternatesByLocale: {
      en: `/en/career/recommendations/big5/${trait}`,
      zh: `/zh/career/recommendations/big5/${trait}`,
      xDefault: "/",
    },
  });
}

export default async function CareerBig5RecommendationPage({
  params,
}: {
  params: Promise<{ locale: string; trait: string }>;
}) {
  const { locale: localeParam, trait } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  const profiles = BANDS.map((band) => getBig5Recommendation(trait, band, locale));
  const first = profiles.find((item) => Boolean(item));

  if (!first) return notFound();
  const canonicalPath = withLocale(`/career/recommendations/big5/${trait}`);
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `career-big5-${trait}`,
    pageType: "guide",
    locale,
    canonicalPath,
    title: first.title,
    description: first.summary,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: withLocale("/") },
      { name: locale === "zh" ? "职业" : "Career", path: withLocale("/career") },
      { name: locale === "zh" ? "职业推荐" : "Recommendations", path: withLocale("/career/recommendations") },
      { name: trait, path: canonicalPath },
    ],
  });

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "职业" : "Career", href: withLocale("/career") },
          { label: locale === "zh" ? "职业推荐" : "Recommendations", href: withLocale("/career/recommendations") },
          { label: trait },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Big Five</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{trait}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "查看不同特质水平下的职业匹配建议。" : "See career-fit suggestions across different trait bands."}
        </p>
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={first.summary}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "Big5 推荐口径" : "Big5 recommendation scope"}
        body={locale === "zh"
          ? "Big5 推荐按 trait 的不同水平展开对比，先给出特质层面的工作环境与岗位方向，再进入具体岗位验证。"
          : "Big5 recommendations compare different bands of the same trait, starting with trait-level work environment and role direction before moving into job-level validation."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {profiles.map((profile, idx) => {
          if (!profile) return null;
          const jobs = profile.recommended_jobs
            .map((slug) => getCareerJobBySlug(slug, locale))
            .filter((item): item is NonNullable<typeof item> => Boolean(item))
            .slice(0, 4);

          return (
            <Card key={`${profile.key}-${profile.band}-${idx}`}>
              <CardHeader>
                <CardTitle className="text-lg">{profile.band}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{profile.summary}</p>
                <p className="m-0 text-xs">{profile.work_env}</p>
                <div className="space-y-1">
                  {jobs.map((job) => (
                    <p key={job.slug} className="m-0">
                      <Link href={withLocale(`/career/jobs/${job.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                        {job.title}
                      </Link>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(first.body)}</article>

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={locale === "zh"
          ? "Big5 特质页描述的是相对倾向与环境偏好，不等于单个特质就能单独决定职业方向。"
          : "Big5 trait pages describe relative tendencies and environment preferences. A single trait does not determine a final career direction on its own."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />
    </Container>
  );
}
