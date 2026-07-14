import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { adaptCareerIndustryDirectory } from "@/lib/career/adapters/adaptCareerIndustryDirectory";
import { fetchCareerIndustryDirectory } from "@/lib/career/api/fetchCareerIndustryDirectory";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/industries" : "/en/career/industries",
    title: locale === "zh" ? "职业行业目录" : "Career Industries",
    description:
      locale === "zh"
        ? "按行业浏览 342 个职业，从行业进入职业列表，再进入已开放的职业详情页。"
        : "Browse 342 occupations by industry, then open available role profiles.",
    alternatesByLocale: {
      en: "/en/career/industries",
      zh: "/zh/career/industries",
      xDefault: "/",
    },
  });
}

export default async function CareerIndustriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const directory = adaptCareerIndustryDirectory({
    locale,
    payload: await fetchCareerIndustryDirectory({ locale }),
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-10 py-10 md:py-16">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "行业入口" : "Industries" },
          ]}
        />

        <section className="max-w-3xl space-y-4">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            {locale === "zh" ? "先选行业，再看职业裂变" : "Choose an industry, then inspect the roles"}
          </h1>
        </section>

        <section className="grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3" data-testid="career-industry-directory">
          {directory.industries.map((industry) => (
            <article key={industry.slug} className="group border-t border-slate-200 py-5 transition hover:border-orange-300">
              <div className="flex items-start justify-between gap-4">
                <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-orange-600">
                  <Link href={industry.canonicalPath}>{industry.title}</Link>
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{industry.count}</span>
              </div>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
                {locale === "zh"
                  ? `${industry.publicDetailCount} 个公开数据条目，${industry.indexableCount} 个可查看职业详情。`
                  : `${industry.publicDetailCount} public entries, ${industry.indexableCount} detail-ready roles.`}
              </p>
              {industry.discoveryJobs.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2" data-testid="career-industry-approved-job-links">
                  {industry.discoveryJobs.map((job) => (
                    <Link
                      key={job.slug}
                      href={job.canonicalPath}
                      className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 underline-offset-4 hover:bg-orange-100 hover:underline"
                      data-testid="career-industry-approved-job-link"
                    >
                      {job.title}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link
                href={industry.canonicalPath}
                className="mt-4 inline-flex text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
              >
                {locale === "zh" ? "查看行业职业" : "View industry roles"}
              </Link>
            </article>
          ))}
        </section>
      </Container>
    </main>
  );
}
