import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const EXCLUDED_SLUGS = [
  "software-developers",
  "digital-forensics-analysts",
  "computer-occupations-all-other",
];

function installBaseMocks() {
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
}

function buildDirectoryItem(slug: string, indexable = true) {
  return {
    slug,
    title_en: slug
      .split("-")
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" "),
    family: {
      slug: "computer-and-information-technology",
      title_en: "Computer and information technology",
    },
    canonical_path: `/en/career/jobs/${slug}`,
    indexability_state: indexable ? "indexable" : "noindex",
    robots_policy: indexable ? "index,follow" : "noindex,nofollow",
    indexable,
    detail_ready: indexable,
  };
}

function installCareerAuthorityMocks(input: {
  pageSlugs: string[];
  excludedSlugs?: string[];
  memberCount?: number;
  total?: number;
}) {
  vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
    fetchCareerDirectory: vi.fn(async () => ({
      authority_version: "career.directory_authority.v1",
      bundle_kind: "career_directory",
      public_truth: {
        public_detail_indexable_count: input.memberCount ?? input.total ?? input.pageSlugs.length,
        directory_member_count: input.memberCount ?? input.total ?? input.pageSlugs.length,
        future_scale_ready: true,
        excluded_slugs: input.excludedSlugs ?? [],
      },
      pagination: {
        page: 1,
        per_page: 50,
        total: input.total ?? input.pageSlugs.length,
        total_pages: input.total && input.total > 50 ? Math.ceil(input.total / 50) : input.pageSlugs.length > 0 ? 1 : 0,
        has_next_page: Boolean(input.total && input.total > 50),
        has_previous_page: false,
      },
      filters: { locale: "en", family: null, q: null },
      facets: {
        families: [
          {
            slug: "computer-and-information-technology",
            title_en: "Computer and information technology",
            count: input.total ?? input.pageSlugs.length,
          },
        ],
      },
      items: input.pageSlugs.map((slug) => buildDirectoryItem(slug, true)),
    })),
  }));
}

async function renderCareerJobsPage(searchParams: Record<string, string | string[] | undefined> = {}) {
  const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
  const page = await CareerJobsPage({
    params: Promise.resolve({ locale: "en" }),
    searchParams: Promise.resolve(searchParams),
  });

  return renderToStaticMarkup(page as ReactNode);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("CAREER-1046-FRONTEND-DISCOVERY-UX-01", () => {
  it("renders 1046 backend-authority detail-ready occupations with a discoverable result summary", async () => {
    installBaseMocks();
    const slugs = Array.from({ length: 50 }, (_, index) => `career-public-role-${index + 1}`);
    installCareerAuthorityMocks({
      memberCount: 1046,
      pageSlugs: slugs,
      total: 1046,
    });

    const html = await renderCareerJobsPage();

    expect(html).toContain("1046 occupations, organized by industry");
    expect(html).toContain("data-testid=\"career-library-result-summary\"");
    expect(html).toContain("Showing 1-50 of 1046 matching occupations; 1046 detail pages are confirmed by backend publication gates.");
    expect((html.match(/data-testid="career-occupation-row"/g) ?? [])).toHaveLength(50);
    expect((html.match(/data-testid="career-occupation-detail-link"/g) ?? [])).toHaveLength(50);
  });

  it("does not render local fallback-only career cards when backend authority is unavailable", async () => {
    installBaseMocks();
    installCareerAuthorityMocks({
      pageSlugs: [],
      memberCount: 0,
    });

    const html = await renderCareerJobsPage();

    expect(html).toContain("No matching occupations found.");
    expect(html).not.toContain("Accountants and auditors");
    expect(html).not.toContain("data-testid=\"career-occupation-row\"");
    expect(html).not.toContain("data-testid=\"career-occupation-detail-link\"");
  });

  it("keeps excluded slugs out of discovery while preserving backend-indexable detail links", async () => {
    installBaseMocks();
    installCareerAuthorityMocks({
      pageSlugs: ["accountants-and-auditors", "actors"],
      excludedSlugs: EXCLUDED_SLUGS,
      memberCount: 1049,
    });

    const html = await renderCareerJobsPage();

    expect(html).toContain("/en/career/jobs/accountants-and-auditors");
    expect(html).toContain("/en/career/jobs/actors");
    for (const slug of EXCLUDED_SLUGS) {
      expect(html).not.toContain(`/en/career/jobs/${slug}`);
      expect(html).not.toContain(`data-career-slug="${slug}"`);
    }
  });
});
