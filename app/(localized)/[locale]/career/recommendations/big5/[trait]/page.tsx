import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getBig5Recommendation,
  getCareerJobBySlug,
  listBig5RecommendationTraits,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

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

  return buildPageMetadata({
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

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Big Five</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{trait}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "查看不同特质水平下的职业匹配建议。" : "See career-fit suggestions across different trait bands."}
        </p>
      </section>

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
    </Container>
  );
}
