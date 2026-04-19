import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { CareerOccupationDirectory } from "@/components/career/CareerOccupationDirectory";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { adaptCareerDatasetHub } from "@/lib/career/adapters/adaptCareerDatasetHub";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import {
  buildRenderableCareerDatasetMembers,
  buildCareerFamilyDirectory,
  filterCareerDatasetMembers,
  formatCareerFamilyTitle,
  isCareerDatasetMemberDetailReady,
  isCareerDatasetMemberPublic,
  normalizeFamilySlug,
} from "@/lib/career/datasetDirectory";
import { fetchCareerDatasetHub } from "@/lib/career/api/fetchCareerDatasetHub";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function firstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  return firstQueryValue(value).trim();
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const submittedQuery = normalizeSearchParam(resolvedSearchParams.q);
  const family = normalizeSearchParam(resolvedSearchParams.family);
  const pathname = locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs";

  return buildPageMetadata({
    locale,
    pathname: submittedQuery || family ? `${pathname}?${new URLSearchParams({ ...(submittedQuery ? { q: submittedQuery } : {}), ...(family ? { family } : {}) }).toString()}` : pathname,
    canonicalPathname: pathname,
    title: locale === "zh" ? "全部职业库" : "All Occupations Library",
    description:
      locale === "zh"
        ? "浏览 FermatMind 342 个职业数据库，按行业筛选职业，并进入已开放的职业详情页。"
        : "Browse the FermatMind 342-occupation library, filter by industry, and open available role profiles.",
    noindex: submittedQuery.length > 0 || family.length > 0,
    alternatesByLocale: {
      en: "/en/career/jobs",
      zh: "/zh/career/jobs",
      xDefault: "/",
    },
  });
}

export default async function CareerJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const submittedQuery = normalizeSearchParam(resolvedSearchParams.q);
  const selectedFamily = normalizeSearchParam(resolvedSearchParams.family);
  const jobsPath = localizedPath("/career/jobs", locale);
  const industriesPath = localizedPath("/career/industries", locale);
  const [datasetPayload, jobIndexPayload] = await Promise.all([
    fetchCareerDatasetHub({ locale }),
    fetchCareerJobIndex({ locale }),
  ]);
  const dataset = adaptCareerDatasetHub({ payload: datasetPayload });
  const detailReadySlugs = new Set(
    adaptCareerJobIndex({ locale, payload: jobIndexPayload })
      .filter((job) => job.seoContract.indexState === "indexable" && job.seoContract.indexEligible !== false)
      .map((job) => job.identity.canonicalSlug)
  );
  const members = buildRenderableCareerDatasetMembers({
    datasetMembers: dataset?.members ?? [],
    detailReadySlugs,
  });
  const families = buildCareerFamilyDirectory(members, locale);
  const visibleMembers = filterCareerDatasetMembers({
    members,
    familySlug: selectedFamily || null,
    query: submittedQuery,
  });
  const selectedFamilyTitle = selectedFamily ? formatCareerFamilyTitle(normalizeFamilySlug(selectedFamily), locale) : null;
  const detailReadyCount = members.filter(isCareerDatasetMemberDetailReady).length;
  const publicDetailCount = members.filter(isCareerDatasetMemberPublic).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-10 py-10 md:space-y-12 md:py-16">
        {dataset?.structuredData.dataset ? <JsonLd id="career-occupation-library-jsonld" data={dataset.structuredData.dataset} /> : null}
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "全部职业库" : "All occupations" },
          ]}
        />

        <section className="space-y-7 text-center" data-testid="career-all-occupations-hero">
          <div className="mx-auto w-full space-y-4">
            <h1 className="m-0 whitespace-nowrap text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-5xl">
              {locale === "zh" ? "342 个职业，先按行业找到入口" : "342 occupations, organized by industry"}
            </h1>
          </div>

          <div className="grid gap-3 md:grid-cols-4" data-testid="career-library-summary">
            <Metric label={locale === "zh" ? "全部职业" : "All occupations"} value={String(dataset?.collectionSummary.memberCount ?? members.length)} />
            <Metric label={locale === "zh" ? "行业分类" : "Industries"} value={String(families.length)} />
            <Metric label={locale === "zh" ? "公开条目" : "Public entries"} value={String(publicDetailCount)} />
            <Metric label={locale === "zh" ? "可看详情" : "Detail pages"} value={String(detailReadyCount)} />
          </div>
        </section>

        <section className="space-y-5" data-testid="career-library-workspace">
          <div className="space-y-5">
            <form action={jobsPath} method="get" className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex md:items-center md:gap-3" data-testid="career-occupation-search-form">
              <input
                type="search"
                name="q"
                defaultValue={submittedQuery}
                placeholder={locale === "zh" ? "搜索职业、英文名" : "Search occupation or title"}
                className="h-12 w-full rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              />
              {selectedFamily ? <input type="hidden" name="family" value={selectedFamily} /> : null}
              <div className="mt-3 flex gap-3 md:mt-0 md:shrink-0">
                <button type="submit" className={buttonVariants({})}>
                  {locale === "zh" ? "搜索" : "Search"}
                </button>
                {submittedQuery || selectedFamily ? (
                  <Link href={jobsPath} className={buttonVariants({ variant: "outline" })}>
                    {locale === "zh" ? "清除" : "Clear"}
                  </Link>
                ) : null}
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                  {selectedFamilyTitle ?? (locale === "zh" ? "全部职业" : "All occupations")}
                </h2>
              </div>
              <Link href={industriesPath} className="text-sm font-semibold text-orange-600 underline-offset-4 hover:underline">
                {locale === "zh" ? "按行业浏览" : "Browse by industry"}
              </Link>
            </div>

            <CareerOccupationDirectory
              locale={locale}
              members={visibleMembers}
              emptyLabel={locale === "zh" ? "没有找到匹配的职业。" : "No matching occupations found."}
            />
          </div>
        </section>
      </Container>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-slate-200 py-2 pl-4">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="m-0 mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
