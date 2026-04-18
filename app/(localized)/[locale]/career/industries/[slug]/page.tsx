import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerOccupationDirectory } from "@/components/career/CareerOccupationDirectory";
import { Container } from "@/components/layout/Container";
import { adaptCareerDatasetHub } from "@/lib/career/adapters/adaptCareerDatasetHub";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import {
  CAREER_DATASET_FAMILY_SLUGS,
  buildCareerFamilyDirectory,
  buildRenderableCareerDatasetMembers,
  filterCareerDatasetMembers,
  formatCareerFamilyTitle,
  normalizeFamilySlug,
} from "@/lib/career/datasetDirectory";
import { fetchCareerDatasetHub } from "@/lib/career/api/fetchCareerDatasetHub";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CAREER_DATASET_FAMILY_SLUGS.flatMap((slug) => [
    { locale: "en", slug },
    { locale: "zh", slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const familyTitle = formatCareerFamilyTitle(slug, locale);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? `/zh/career/industries/${slug}` : `/en/career/industries/${slug}`,
    title: locale === "zh" ? `${familyTitle}职业` : `${familyTitle} careers`,
    description:
      locale === "zh"
        ? `浏览${familyTitle}行业下的职业清单，并进入已开放的职业详情页。`
        : `Browse occupations in ${familyTitle} and open available role profiles.`,
    alternatesByLocale: {
      en: `/en/career/industries/${slug}`,
      zh: `/zh/career/industries/${slug}`,
      xDefault: "/",
    },
  });
}

export default async function CareerIndustryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const familySlug = normalizeFamilySlug(slug);
  const submittedQuery = String(Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q ?? "").trim();
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
  const family = families.find((item) => item.slug === familySlug);

  if (!family) {
    notFound();
  }

  const industryPath = localizedPath(`/career/industries/${familySlug}`, locale);
  const jobsPath = localizedPath("/career/jobs", locale);
  const visibleMembers = filterCareerDatasetMembers({
    members,
    familySlug,
    query: submittedQuery,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-10 py-10 md:py-16">
        <nav className="flex flex-wrap gap-2 text-sm text-slate-500">
          <Link href={localizedPath("/career", locale)} className="hover:text-slate-950">
            {locale === "zh" ? "职业" : "Career"}
          </Link>
          <span>/</span>
          <Link href={localizedPath("/career/industries", locale)} className="hover:text-slate-950">
            {locale === "zh" ? "行业" : "Industries"}
          </Link>
          <span>/</span>
          <span className="text-slate-950">{family.title}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div aria-hidden="true" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label={locale === "zh" ? "职业" : "Roles"} value={String(family.count)} />
            <Metric label={locale === "zh" ? "公开" : "Public"} value={String(family.publicDetailCount)} />
            <Metric label={locale === "zh" ? "详情" : "Details"} value={String(family.indexableCount)} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <form action={industryPath} method="get" className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex md:items-center md:gap-3">
              <input
                type="search"
                name="q"
                defaultValue={submittedQuery}
                placeholder={locale === "zh" ? "在本行业内搜索职业" : "Search within this industry"}
                className="h-12 w-full rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              />
              <div className="mt-3 flex gap-3 md:mt-0 md:shrink-0">
                <button className="h-12 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700" type="submit">
                  {locale === "zh" ? "搜索" : "Search"}
                </button>
                {submittedQuery ? (
                  <Link href={industryPath} className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:border-slate-300">
                    {locale === "zh" ? "清除" : "Clear"}
                  </Link>
                ) : null}
              </div>
            </form>

            <CareerOccupationDirectory
              locale={locale}
              members={visibleMembers}
              emptyLabel={locale === "zh" ? "本行业下没有找到匹配职业。" : "No matching roles in this industry."}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="m-0 text-base font-semibold text-slate-950">{locale === "zh" ? "继续浏览" : "Continue"}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <Link href={jobsPath} className="block font-semibold text-orange-600 underline-offset-4 hover:underline">
                  {locale === "zh" ? "返回全部职业库" : "Back to all occupations"}
                </Link>
                <Link href={`${jobsPath}?family=${encodeURIComponent(familySlug)}`} className="block font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">
                  {locale === "zh" ? "在全部职业库中查看本行业" : "Open this industry in the library"}
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </Container>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-slate-200 py-2 pl-3 text-left">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="m-0 mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
