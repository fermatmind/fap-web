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

  vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
    fetchCareerDirectory: vi.fn(async () => ({
      authority_version: "career.directory_authority.v1",
      bundle_kind: "career_directory",
      public_truth: {
        public_detail_indexable_count: 342,
        directory_member_count: 342,
        future_scale_ready: true,
        excluded_slugs: [],
      },
      pagination: {
        page: 1,
        per_page: 50,
        total: 1,
        total_pages: 1,
        has_next_page: false,
        has_previous_page: false,
      },
      filters: { locale: "en", family: null, q: null },
      facets: {
        families: [
          {
            slug: "business-and-financial",
            title_en: "Business and financial",
            count: 1,
          },
        ],
      },
      items: [
        {
          slug: "accountants-and-auditors",
          title_en: "Accountants and auditors",
          family: {
            slug: "business-and-financial",
            title_en: "Business and financial",
          },
          indexable: true,
          detail_ready: true,
        },
      ],
    })),
  }));
}

describe("career all occupations library contract", () => {
  it("renders the paginated occupation directory from backend directory authority", async () => {
    installCareerLibraryMocks();

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("342 occupations, organized by industry");
    expect(html).toContain("career-all-occupations-hero");
    expect(html).toContain("career-library-summary");
    expect(html).toContain("career-occupation-directory");
    expect(html).toContain("Accountants and auditors");
    expect(html).not.toContain(">Actors<");
    expect(html).toContain("Detail ready");
    expect(html).not.toContain("Directory only");
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
