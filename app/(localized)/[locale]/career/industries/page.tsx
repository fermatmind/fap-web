import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { adaptCareerDatasetHub } from "@/lib/career/adapters/adaptCareerDatasetHub";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import {
  buildCareerFamilyDirectory,
  buildRenderableCareerDatasetMembers,
  isCareerDatasetMemberDetailReady,
  normalizeFamilySlug,
} from "@/lib/career/datasetDirectory";
import { fetchCareerDatasetHub } from "@/lib/career/api/fetchCareerDatasetHub";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { listBackendSitemapCareerJobPaths } from "@/lib/seo/backendSitemapSource";

export const dynamic = "force-dynamic";

function normalizeApprovedCareerJobSlug(value: string | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

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
  const [datasetPayload, jobIndexPayload, approvedCareerJobPaths] = await Promise.all([
    fetchCareerDatasetHub({ locale }),
    fetchCareerJobIndex({ locale }),
    listBackendSitemapCareerJobPaths(),
  ]);
  const approvedCareerJobSlugs = new Set(
    approvedCareerJobPaths
      .map((path) => path.match(new RegExp(`^/${locale}/career/jobs/([^/]+)$`, "i"))?.[1]?.toLowerCase() ?? "")
      .map(normalizeApprovedCareerJobSlug)
      .filter((slug): slug is string => Boolean(slug))
  );
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
  const detailReadyMembersByFamily = new Map<string, typeof members>();

  for (const member of members.filter(
    (candidate) => {
      const canonicalSlug = normalizeApprovedCareerJobSlug(candidate.canonicalSlug);
      return Boolean(
        canonicalSlug &&
          isCareerDatasetMemberDetailReady(candidate) &&
          approvedCareerJobSlugs.has(canonicalSlug)
      );
    }
  )) {
    const familySlug = normalizeFamilySlug(member.familySlug);
    const familyMembers = detailReadyMembersByFamily.get(familySlug) ?? [];
    familyMembers.push(member);
    detailReadyMembersByFamily.set(familySlug, familyMembers);
  }

  for (const familyMembers of detailReadyMembersByFamily.values()) {
    familyMembers.sort((left, right) => left.canonicalTitleEn.localeCompare(right.canonicalTitleEn));
  }

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
          {families.map((family) => {
            const discoveryMembers = (detailReadyMembersByFamily.get(family.slug) ?? []).slice(0, 3);

            return (
              <article key={family.slug} className="group border-t border-slate-200 py-5 transition hover:border-orange-300">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-orange-600">
                    <Link href={withLocale(`/career/industries/${family.slug}`)}>{family.title}</Link>
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{family.count}</span>
                </div>
                <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
                  {locale === "zh"
                    ? `${family.publicDetailCount} 个公开数据条目，${family.indexableCount} 个可查看职业详情。`
                    : `${family.publicDetailCount} public entries, ${family.indexableCount} detail-ready roles.`}
                </p>
                {discoveryMembers.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2" data-testid="career-industry-approved-job-links">
                    {discoveryMembers.map((member) => (
                      <Link
                        key={member.canonicalSlug}
                        href={withLocale(`/career/jobs/${member.canonicalSlug}`)}
                        className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 underline-offset-4 hover:bg-orange-100 hover:underline"
                        data-testid="career-industry-approved-job-link"
                      >
                        {locale === "zh" && member.canonicalTitleZh ? member.canonicalTitleZh : member.canonicalTitleEn}
                      </Link>
                    ))}
                  </div>
                ) : null}
                <Link
                  href={withLocale(`/career/industries/${family.slug}`)}
                  className="mt-4 inline-flex text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
                >
                  {locale === "zh" ? "查看行业职业" : "View industry roles"}
                </Link>
              </article>
            );
          })}
        </section>
      </Container>
    </main>
  );
}
