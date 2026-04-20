import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { adaptCareerDatasetHub } from "@/lib/career/adapters/adaptCareerDatasetHub";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { buildCareerFamilyDirectory, buildRenderableCareerDatasetMembers } from "@/lib/career/datasetDirectory";
import { fetchCareerDatasetHub } from "@/lib/career/api/fetchCareerDatasetHub";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
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
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const [datasetPayload, jobIndexPayload] = await Promise.all([
    fetchCareerDatasetHub({ locale }),
    fetchCareerJobIndex({ locale }),
  ]);
  const dataset = adaptCareerDatasetHub({ payload: datasetPayload });
  const detailReadyJobs = new Map(
    adaptCareerJobIndex({ locale, payload: jobIndexPayload })
      .filter((job) => job.seoContract.indexState === "indexable" && job.seoContract.indexEligible !== false)
      .map((job) => [job.identity.canonicalSlug, job])
  );
  const members = buildRenderableCareerDatasetMembers({
    datasetMembers: dataset?.members ?? [],
    detailReadyJobs,
  });
  const families = buildCareerFamilyDirectory(members, locale);

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
          {families.map((family) => (
            <Link
              key={family.slug}
              href={withLocale(`/career/industries/${family.slug}`)}
              className="group border-t border-slate-200 py-5 transition hover:border-orange-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-orange-600">{family.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{family.count}</span>
              </div>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
                {locale === "zh"
                  ? `${family.publicDetailCount} 个公开数据条目，${family.indexableCount} 个可查看职业详情。`
                  : `${family.publicDetailCount} public entries, ${family.indexableCount} detail-ready roles.`}
              </p>
              <p className="m-0 mt-4 text-sm font-semibold text-orange-600">{locale === "zh" ? "查看行业职业" : "View industry roles"}</p>
            </Link>
          ))}
        </section>
      </Container>
    </main>
  );
}
