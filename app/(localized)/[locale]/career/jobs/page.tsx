import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { CareerOccupationDirectory } from "@/components/career/CareerOccupationDirectory";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { adaptCareerDirectory } from "@/lib/career/adapters/adaptCareerDirectory";
import {
  formatCareerFamilyTitle,
  normalizeFamilySlug,
} from "@/lib/career/datasetDirectory";
import { fetchCareerDirectory } from "@/lib/career/api/fetchCareerDirectory";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;
const CAREER_DIRECTORY_PAGE_SIZE = 50;

function firstQueryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}

function normalizeSearchParam(value: string | string[] | undefined): string {
  return firstQueryValue(value).trim();
}

function normalizePageParam(value: string | string[] | undefined): number {
  const parsed = Number(firstQueryValue(value));
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsed));
}

function buildJobsQueryPath(
  basePath: string,
  input: { query?: string | null; family?: string | null; page?: number | null }
): string {
  const query = new URLSearchParams();
  const submittedQuery = String(input.query ?? "").trim();
  const family = String(input.family ?? "").trim();
  const page = input.page && input.page > 1 ? input.page : null;

  if (submittedQuery) {
    query.set("q", submittedQuery);
  }
  if (family) {
    query.set("family", family);
  }
  if (page) {
    query.set("page", String(page));
  }

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
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
  const page = normalizePageParam(resolvedSearchParams.page);
  const pathname = locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs";

  return buildPageMetadata({
    locale,
    pathname: buildJobsQueryPath(pathname, { query: submittedQuery, family, page }),
    canonicalPathname: pathname,
    title: locale === "zh" ? "全部职业库" : "All Occupations Library",
    description:
      locale === "zh"
        ? "浏览 FermatMind 职业数据库，按行业筛选职业，并进入已开放的职业详情页。"
        : "Browse the FermatMind occupation library, filter by industry, and open available role profiles.",
    noindex: submittedQuery.length > 0 || family.length > 0 || page > 1,
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
  const page = normalizePageParam(resolvedSearchParams.page);
  const jobsPath = localizedPath("/career/jobs", locale);
  const industriesPath = localizedPath("/career/industries", locale);
  const directory = adaptCareerDirectory({
    locale,
    payload: await fetchCareerDirectory({
      locale,
      page,
      perPage: CAREER_DIRECTORY_PAGE_SIZE,
      family: selectedFamily || null,
      query: submittedQuery || null,
    }),
  });
  const visibleMembers = directory.members;
  const families = directory.facets.families;
  const selectedFamilyTitle =
    selectedFamily
      ? families.find((family) => normalizeFamilySlug(family.slug) === normalizeFamilySlug(selectedFamily))?.title ??
        formatCareerFamilyTitle(normalizeFamilySlug(selectedFamily), locale)
      : null;
  const publicDetailCount = directory.publicTruth.publicDetailIndexableCount || directory.pagination.total || visibleMembers.length;
  const occupationCount = directory.publicTruth.directoryMemberCount || publicDetailCount;
  const previousPageHref = buildJobsQueryPath(jobsPath, {
    query: submittedQuery,
    family: selectedFamily,
    page: Math.max(1, directory.pagination.page - 1),
  });
  const nextPageHref = buildJobsQueryPath(jobsPath, {
    query: submittedQuery,
    family: selectedFamily,
    page: directory.pagination.page + 1,
  });
  const hasActiveFilters = Boolean(submittedQuery || selectedFamily);

  if (directory.state === "unavailable") {
    return (
      <main className="min-h-screen bg-slate-50">
        <Container as="div" className="py-16">
          <section className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm" data-testid="career-directory-unavailable">
            <h1 className="m-0 text-2xl font-semibold text-slate-950">
              {locale === "zh" ? "职业库暂时无法加载" : "The occupation library is temporarily unavailable"}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              {locale === "zh" ? "这不是空职业库，请稍后重试。" : "This is not an empty directory. Please try again shortly."}
            </p>
            <Link
              href={buildJobsQueryPath(jobsPath, { query: submittedQuery, family: selectedFamily, page })}
              prefetch={false}
              className={buttonVariants({ className: "mt-6" })}
            >
              {locale === "zh" ? "重试" : "Retry"}
            </Link>
          </section>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-10 py-10 md:space-y-12 md:py-16">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "全部职业库" : "All occupations" },
          ]}
        />

        <section className="space-y-7 text-center" data-testid="career-all-occupations-hero">
          <div className="mx-auto w-full space-y-4">
            <h1 className="m-0 mx-auto max-w-4xl text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl md:text-5xl">
              {locale === "zh" ? "测量自己，看见职业，训练未来" : `${occupationCount} occupations, organized by industry`}
            </h1>
          </div>

          <div className="grid gap-3 md:grid-cols-4" data-testid="career-library-summary">
            <Metric label={locale === "zh" ? "全部职业" : "All occupations"} value={String(occupationCount)} />
            <Metric label={locale === "zh" ? "行业分类" : "Industries"} value={String(families.length)} />
            <Metric label={locale === "zh" ? "公开条目" : "Public entries"} value={String(publicDetailCount)} />
            <Metric label={locale === "zh" ? "每页显示" : "Page size"} value={String(directory.pagination.perPage)} />
          </div>
        </section>

        <section className="space-y-5" data-testid="career-library-workspace">
          {directory.state === "stale" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" data-testid="career-directory-stale">
              {locale === "zh" ? "当前显示上一版可用职业数据。" : "Showing the last known good occupation data."}
            </div>
          ) : null}
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
                  <Link href={jobsPath} prefetch={false} className={buttonVariants({ variant: "outline" })}>
                    {locale === "zh" ? "清除" : "Clear"}
                  </Link>
                ) : null}
              </div>
            </form>

            {hasActiveFilters ? (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                data-testid="career-directory-active-filters"
              >
                <p className="m-0">
                  {locale === "zh" ? "当前筛选：" : "Active filters:"}{" "}
                  {submittedQuery ? (
                    <span className="font-semibold">
                      {locale === "zh" ? "关键词" : "Search"} “{submittedQuery}”
                    </span>
                  ) : null}
                  {submittedQuery && selectedFamilyTitle ? <span> · </span> : null}
                  {selectedFamilyTitle ? <span className="font-semibold">{selectedFamilyTitle}</span> : null}
                </p>
                <Link href={jobsPath} prefetch={false} className="text-sm font-semibold underline-offset-4 hover:underline">
                  {locale === "zh" ? "清除筛选" : "Clear filters"}
                </Link>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                  {selectedFamilyTitle ?? (locale === "zh" ? "全部职业" : "All occupations")}
                </h2>
              </div>
              <Link
                href={industriesPath}
                prefetch={false}
                className="text-sm font-semibold text-orange-600 underline-offset-4 hover:underline"
              >
                {locale === "zh" ? "按行业浏览" : "Browse by industry"}
              </Link>
            </div>

            {families.length > 0 ? (
              <nav
                className="flex flex-wrap gap-2"
                aria-label={locale === "zh" ? "职业行业筛选" : "Occupation family filters"}
                data-testid="career-directory-family-facets"
              >
                <Link
                  href={buildJobsQueryPath(jobsPath, { query: submittedQuery })}
                  prefetch={false}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    selectedFamily ? "border-slate-200 bg-white text-slate-500" : "border-emerald-200 bg-emerald-50 text-emerald-700",
                  ].join(" ")}
                >
                  {locale === "zh" ? "全部" : "All"}
                </Link>
                {families.map((family) => (
                  <Link
                    key={family.slug}
                    href={buildJobsQueryPath(jobsPath, { query: submittedQuery, family: family.slug })}
                    prefetch={false}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-semibold",
                      normalizeFamilySlug(selectedFamily) === normalizeFamilySlug(family.slug)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500",
                    ].join(" ")}
                  >
                    {family.title} ({family.count})
                  </Link>
                ))}
              </nav>
            ) : null}

            <CareerOccupationDirectory
              locale={locale}
              members={visibleMembers}
              emptyLabel={locale === "zh" ? "没有找到匹配的职业。" : "No matching occupations found."}
              emptyActionHref={jobsPath}
              emptyActionLabel={locale === "zh" ? "查看全部职业" : "View all occupations"}
            />

            {directory.pagination.totalPages > 1 ? (
              <nav
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
                aria-label={locale === "zh" ? "职业分页" : "Occupation pagination"}
                data-testid="career-directory-pagination"
              >
                {directory.pagination.hasPreviousPage ? (
                  <Link
                    href={previousPageHref}
                    prefetch={false}
                    className={buttonVariants({ variant: "outline" })}
                    data-testid="career-directory-prev-page"
                  >
                    {locale === "zh" ? "上一页" : "Previous"}
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-10 items-center rounded-full border border-slate-100 px-4 text-sm font-semibold text-slate-300"
                    aria-disabled="true"
                  >
                    {locale === "zh" ? "上一页" : "Previous"}
                  </span>
                )}
                <span className="text-center text-sm font-medium text-slate-500" data-testid="career-directory-page-status">
                  {locale === "zh"
                    ? `第 ${directory.pagination.page} / ${directory.pagination.totalPages} 页`
                    : `Page ${directory.pagination.page} of ${directory.pagination.totalPages}`}
                </span>
                {directory.pagination.hasNextPage ? (
                  <Link
                    href={nextPageHref}
                    prefetch={false}
                    className={`${buttonVariants({ variant: "outline" })} justify-self-end`}
                    data-testid="career-directory-next-page"
                  >
                    {locale === "zh" ? "下一页" : "Next"}
                  </Link>
                ) : (
                  <span
                    className="inline-flex h-10 items-center justify-self-end rounded-full border border-slate-100 px-4 text-sm font-semibold text-slate-300"
                    aria-disabled="true"
                  >
                    {locale === "zh" ? "下一页" : "Next"}
                  </span>
                )}
              </nav>
            ) : null}
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
