import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

function installCareerLibraryMocks() {
  vi.doMock("next/link", () => ({
    default: ({
      href,
      children,
      prefetch: _prefetch,
      ...props
    }: {
      href: string;
      children: ReactNode;
      prefetch?: boolean;
    }) => {
      void _prefetch;

      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
  }));

  vi.doMock("@/lib/i18n/getDict", () => ({
    resolveLocale: vi.fn(() => "en"),
  }));

  vi.doMock("@/lib/i18n/locales", async () => {
    const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
    return {
      ...actual,
      localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
    };
  });

  vi.doMock("@/lib/career/api/fetchCareerDatasetHub", () => ({
    fetchCareerDatasetHub: vi.fn(async () => ({
      contract_kind: "career_public_dataset_hub",
      dataset_key: "career_all_342_occupations_dataset",
      dataset_scope: "career_all_342",
      dataset_name: "FermatMind Career Occupations Dataset (All 342 Tracked Occupations)",
      dataset_name_zh: "费马测试职业数据库（342 全量职业范围）",
      collection_summary: {
        member_count: 342,
        included_count: 34,
        excluded_count: 308,
        public_detail_indexable_count: 1,
        public_detail_conservative_count: 1,
        public_index_state_counts: { indexable: 1, noindex: 341 },
      },
      filters: { family: true, publish_track: true, index_posture: true },
      members: [
        {
          member_kind: "career_tracked_occupation",
          canonical_slug: "accountants-and-auditors",
          canonical_title_en: "Accountants and auditors",
          family_slug: "business-and-financial",
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
      ],
      structured_data: { dataset: { "@type": "Dataset" } },
    })),
  }));

  vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
    fetchCareerJobIndex: vi.fn(async () => ({
      items: [
        {
          identity: { canonical_slug: "accountants-and-auditors" },
          titles: { canonical_en: "Accountants and auditors" },
          seo_contract: { index_state: "indexable", index_eligible: true },
        },
      ],
    })),
  }));
}

describe("career all occupations library contract", () => {
  it("renders the full occupation library from dataset members instead of the six-item job index", async () => {
    installCareerLibraryMocks();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("342 occupations, organized by industry");
    expect(html).toContain("career-all-occupations-hero");
    expect(html).toContain("career-occupation-directory");
    expect(html).toContain("Accountants and auditors");
    expect(html).toContain("Actors");
    expect(html).toContain("Detail ready");
    expect(html).toContain("Directory only");
    expect(html).not.toContain("career-job-search-resolve-handoff-assist");
  });

  it("keeps industry filtering inside the all occupations library", async () => {
    installCareerLibraryMocks();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ family: "business-and-financial" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("Business and financial");
    expect(html).toContain("Accountants and auditors");
    expect(html).not.toContain(">Actors<");
  });
});
