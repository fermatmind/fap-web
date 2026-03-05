import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCareerJobBySlug, getMbtiRecommendation, listMbtiRecommendationTypes } from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listMbtiRecommendationTypes().flatMap((type) => [{ locale: "en", type }, { locale: "zh", type }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type: rawType } = await params;
  const locale = resolveLocale(localeParam);
  const type = rawType.toUpperCase();
  const profile = getMbtiRecommendation(type, locale);

  if (!profile) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    pathname:
      locale === "zh"
        ? `/zh/career/recommendations/mbti/${type}`
        : `/en/career/recommendations/mbti/${type}`,
    title: profile.title,
    description: profile.summary,
    alternatesByLocale: {
      en: `/en/career/recommendations/mbti/${type}`,
      zh: `/zh/career/recommendations/mbti/${type}`,
      xDefault: "/",
    },
  });
}

export default async function CareerMbtiRecommendationPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type: rawType } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const type = rawType.toUpperCase();

  const profile = getMbtiRecommendation(type, locale);
  if (!profile) return notFound();

  const recommendedJobs = profile.recommended_jobs
    .map((slug) => getCareerJobBySlug(slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const avoidJobs = (profile.avoid_jobs ?? [])
    .map((slug) => getCareerJobBySlug(slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">MBTI</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{profile.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{profile.summary}</p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">{profile.work_env}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "推荐职业" : "Recommended jobs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            {recommendedJobs.map((job) => (
              <p key={job.slug} className="m-0">
                <Link href={withLocale(`/career/jobs/${job.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {job.title}
                </Link>
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "不优先职业" : "Less suitable jobs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            {avoidJobs.length > 0 ? (
              avoidJobs.map((job) => <p key={job.slug} className="m-0">{job.title}</p>)
            ) : (
              <p className="m-0">{locale === "zh" ? "暂无" : "N/A"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "优势与风险" : "Strengths and risks"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
          <div>
            <p className="m-0 font-semibold text-[var(--fm-text)]">{locale === "zh" ? "优势" : "Strengths"}</p>
            <ul className="mt-2 space-y-1 pl-5">
              {profile.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="m-0 font-semibold text-[var(--fm-text)]">{locale === "zh" ? "风险" : "Risks"}</p>
            <ul className="mt-2 space-y-1 pl-5">
              {profile.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(profile.body)}</article>
    </Container>
  );
}
