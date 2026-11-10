import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

function installCareerIndustryMocks(locale: "en" | "zh" = "en") {
  vi.doMock("next/link", () => ({
    default: ({ href, children, prefetch: _prefetch, ...props }: { href: string; children: ReactNode; prefetch?: boolean }) => {
      void _prefetch;

      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  }));

  vi.doMock("@/lib/i18n/getDict", () => ({
    resolveLocale: vi.fn(() => locale),
  }));

  vi.doMock("@/lib/i18n/locales", async () => {
    const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
    return {
      ...actual,
      localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
    };
  });

  vi.doMock("@/lib/career/api/fetchCareerIndustryDirectory", () => ({
    fetchCareerIndustryDirectory: vi.fn(async () => ({
      authority_version: "career.industry_directory.v1",
      bundle_kind: "career_industry_directory",
      bundle_version: "career.industry_directory.v1",
      locale: locale === "zh" ? "zh-CN" : "en",
      public_detail_indexable_count: 2,
      industry_count: 1,
      industries: [
        {
          slug: "computer-and-information-technology",
          title: locale === "zh" ? "计算机与信息技术" : "Computer and Information Technology",
          title_en: "Computer and Information Technology",
          title_zh: "计算机与信息技术",
          count: 2,
          public_detail_count: 2,
          indexable_count: 2,
          canonical_path: `/${locale}/career/industries/computer-and-information-technology`,
          discovery_jobs: [
            {
              slug: "data-engineers",
              title: locale === "zh" ? "数据工程师" : "Data Engineers",
              title_en: "Data Engineers",
              canonical_path: `/${locale}/career/jobs/data-engineers`,
            },
            {
              slug: "data-scientists",
              title: locale === "zh" ? "数据科学家" : "Data Scientists",
              title_en: "Data Scientists",
              canonical_path: `/${locale}/career/jobs/data-scientists`,
            },
          ],
        },
      ],
    })),
  }));

  vi.doMock("@/lib/career/api/fetchCareerDatasetHub", () => ({
    fetchCareerDatasetHub: vi.fn(async () => ({
      contract_kind: "career_public_dataset_hub",
      dataset_key: "career_all_342_occupations_dataset",
      dataset_scope: "career_all_342",
      dataset_name: "FermatMind Career Occupations Dataset",
      collection_summary: {
        member_count: 4,
        included_count: 2,
        excluded_count: 2,
        public_detail_indexable_count: 2,
      },
      filters: { family: true, publish_track: true, index_posture: true },
      members: [
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "data-scientists",
          canonical_title_en: "Data Scientists",
          canonical_title_zh: "数据科学家",
          family_slug: "computer-and-information-technology",
          release_cohort: "public_detail_indexable",
          public_index_state: "indexable",
          included_in_public_dataset: true,
        },
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "data-engineers",
          canonical_title_en: "Data Engineers",
          canonical_title_zh: "数据工程师",
          family_slug: "computer-and-information-technology",
          release_cohort: "public_detail_indexable",
          public_index_state: "indexable",
          included_in_public_dataset: true,
        },
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "actors",
          canonical_title_en: "Actors",
          family_slug: "entertainment-and-sports",
          release_cohort: "review_needed",
          public_index_state: "noindex",
          included_in_public_dataset: false,
        },
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "aerospace-engineers",
          canonical_title_en: "Aerospace Engineers",
          family_slug: "architecture-and-engineering",
          release_cohort: "public_detail_indexable",
          public_index_state: "indexable",
          included_in_public_dataset: true,
        },
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "..%2f..%2fapi%2fv0.5%2fpoisoned-discovery",
          canonical_title_en: "Poisoned Discovery",
          family_slug: "computer-and-information-technology",
          release_cohort: "public_detail_indexable",
          public_index_state: "indexable",
          included_in_public_dataset: true,
        },
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "software-developers",
          canonical_title_en: "Software Developers",
          family_slug: "computer-and-information-technology",
          release_cohort: "manual_hold",
          public_index_state: "noindex",
          included_in_public_dataset: false,
          exclusion_reasons: ["manual_hold"],
        },
      ],
      structured_data: { dataset: { "@type": "Dataset" } },
    })),
  }));

  vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
    fetchCareerJobIndex: vi.fn(async () => ({
      bundle_kind: "career_job_index",
      items: [
        {
          identity: { canonical_slug: "data-scientists" },
          titles: { canonical_en: "Data Scientists" },
          seo_contract: { index_state: "indexable", index_eligible: true },
        },
        {
          identity: { canonical_slug: "data-engineers" },
          titles: { canonical_en: "Data Engineers" },
          seo_contract: { index_state: "indexable", index_eligible: true },
        },
        {
          identity: { canonical_slug: "actors" },
          titles: { canonical_en: "Actors" },
          seo_contract: { index_state: "noindex", index_eligible: false },
        },
        {
          identity: { canonical_slug: "aerospace-engineers" },
          titles: { canonical_en: "Aerospace Engineers" },
          seo_contract: { index_state: "indexable", index_eligible: true },
        },
        {
          identity: { canonical_slug: "..%2f..%2fapi%2fv0.5%2fpoisoned-discovery" },
          titles: { canonical_en: "Poisoned Discovery" },
          seo_contract: { index_state: "indexable", index_eligible: true },
        },
      ],
    })),
  }));

  vi.doMock("@/lib/seo/backendSitemapSource", () => ({
      listBackendSitemapBigFiveZhPaths: vi.fn(async () => []),
    listBackendSitemapCareerJobPaths: vi.fn(async () => [
      "/en/career/jobs/data-engineers",
      "/zh/career/jobs/data-engineers",
      "/en/career/jobs/data-scientists",
      "/zh/career/jobs/data-scientists",
      "/en/career/jobs/..%2F..%2Fapi%2Fv0.5%2Fpoisoned-discovery",
    ]),
  }));
}

describe("Career-owned discovery links", () => {
  it("adds industry-card links only for approved indexable Career job details", async () => {
    installCareerIndustryMocks();

    const { default: CareerIndustriesPage } = await import("@/app/(localized)/[locale]/career/industries/page");
    const page = await CareerIndustriesPage({
      params: Promise.resolve({ locale: "en" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain('data-testid="career-industry-approved-job-link"');
    expect(html).toContain('href="/en/career/jobs/data-engineers"');
    expect(html).toContain('href="/en/career/jobs/data-scientists"');
    expect(html).not.toContain('href="/en/career/jobs/aerospace-engineers"');
    expect(html).not.toContain('href="/en/career/jobs/actors"');
    expect(html).not.toContain('href="/en/career/jobs/software-developers"');
    expect(html).not.toContain("poisoned-discovery");
    expect(html).not.toContain("%2F");
    expect(html).not.toContain("/tests/");
    expect(html).not.toContain("big-five");
    expect(html).not.toContain("riasec");
  });

  it("reads the real locale authority shape for the Traditional industry index and filtered details", async () => {
    installCareerIndustryMocks("zh");
    const { default: Index, metadata } = await import("@/app/(traditional)/zh-TW/career/industries/page");
    const { default: Details, generateMetadata } = await import("@/app/(traditional)/zh-TW/career/industries/[slug]/page");
    const { default: IndustryIndex } = await import("@/app/(localized)/[locale]/career/industries/page");
    const { default: IndustryDetail } = await import("@/app/(localized)/[locale]/career/industries/[slug]/page");
    const { fetchCareerIndustryDirectory } = await import("@/lib/career/api/fetchCareerIndustryDirectory");
    const slug = "computer-and-information-technology";
    const path = `/zh-TW/career/industries/${slug}`;
    const params = Promise.resolve({ slug });
    const searchParams = Promise.resolve({ q: "資料工程師" });
    expect(metadata.robots).toMatchObject({ index: false });
    expect((await generateMetadata({ params, searchParams })).alternates).toEqual({ canonical: path });
    expect(Index()).toBeDefined();
    expect(await Details({ params, searchParams })).toBeDefined();
    const index = renderToStaticMarkup(await IndustryIndex({ params: Promise.resolve({ locale: "zh-TW" }) }));
    expect(fetchCareerIndustryDirectory).toHaveBeenCalledWith({ locale: "zh" });
    expect(index).toContain(`href="${path}"`);
    expect(index).toContain('href="/zh-TW/career/jobs/data-engineers"');
    const details = renderToStaticMarkup(await IndustryDetail({ params: Promise.resolve({ slug, locale: "zh-TW" }), searchParams }));
    expect(details).toContain(`action="${path}"`);
    expect(details).toContain('value="資料工程師"');
    expect(details).toContain('href="/zh-TW/career/jobs/data-engineers"');
    expect(details).not.toContain('href="/zh-TW/career/jobs/data-scientists"');
  });
});
