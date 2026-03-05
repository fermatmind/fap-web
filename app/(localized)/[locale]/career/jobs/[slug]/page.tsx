import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCareerJobBySlug, listCareerJobSlugs } from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listCareerJobSlugs().flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const job = getCareerJobBySlug(slug, locale);

  if (!job) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? `/zh/career/jobs/${slug}` : `/en/career/jobs/${slug}`,
    title: job.title,
    description: job.summary,
    alternatesByLocale: {
      en: `/en/career/jobs/${slug}`,
      zh: `/zh/career/jobs/${slug}`,
      xDefault: "/",
    },
  });
}

export default async function CareerJobDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const job = getCareerJobBySlug(slug, locale);

  if (!job) return notFound();

  const canonicalPath = locale === "zh" ? `/zh/career/jobs/${slug}` : `/en/career/jobs/${slug}`;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: job.title,
    description: job.summary,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
    { name: locale === "zh" ? "职业库" : "Jobs", path: locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs" },
    { name: job.title, path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`career-job-webpage-${slug}`} data={webPageJsonLd} />
      <JsonLd id={`career-job-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{job.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{job.summary}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "主要工作内容" : "Main responsibilities"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <ul className="space-y-1 pl-5">
              {job.work_contents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "技能要求" : "Required skills"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <ul className="space-y-1 pl-5">
              {job.skills.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "薪资水平" : "Salary range"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{job.salary_range}</p>
            <p className="m-0">{job.job_outlook}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "发展路径" : "Growth path"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <ul className="space-y-1 pl-5">
              {job.growth_path.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "适配性格" : "Fit personality"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
          <ul className="space-y-1 pl-5">
            {job.fit_personality.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="m-0">MBTI: {job.mbti_primary.join(", ")} / {job.mbti_secondary.join(", ")}</p>
          <p className="m-0">RIASEC: R {job.riasec_vector.R} · I {job.riasec_vector.I} · A {job.riasec_vector.A} · S {job.riasec_vector.S} · E {job.riasec_vector.E} · C {job.riasec_vector.C}</p>
        </CardContent>
      </Card>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(job.body)}</article>

      <Link href={withLocale("/career/jobs")} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业库" : "Back to job library"}
      </Link>
    </Container>
  );
}
