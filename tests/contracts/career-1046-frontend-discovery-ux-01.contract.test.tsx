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

function buildDatasetMember(slug: string, indexable = true) {
  return {
    member_kind: "career_tracked_occupation",
    canonical_slug: slug,
    canonical_title_en: slug
      .split("-")
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" "),
    family_slug: "computer-and-information-technology",
    release_cohort: indexable ? "public_detail_indexable" : "manual_hold",
    public_index_state: indexable ? "indexable" : "noindex",
    included_in_public_dataset: indexable,
  };
}

function buildJobIndexItem(slug: string) {
  return {
    identity: { canonical_slug: slug },
    titles: {
      canonical_en: slug
        .split("-")
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" "),
    },
    seo_contract: {
      canonical_path: `/career/jobs/${slug}`,
      index_state: "indexable",
      index_eligible: true,
    },
  };
}

function installCareerAuthorityMocks(input: {
  datasetSlugs: string[];
  jobIndexSlugs: string[];
  excludedDatasetSlugs?: string[];
  memberCount?: number;
}) {
  vi.doMock("@/lib/career/api/fetchCareerDatasetHub", () => ({
    fetchCareerDatasetHub: vi.fn(async () => ({
      contract_kind: "career_public_dataset_hub",
      dataset_key: "career_public_1046",
      dataset_scope: "career_public_1046",
      collection_summary: {
        member_count: input.memberCount ?? input.datasetSlugs.length,
        included_count: input.jobIndexSlugs.length,
        public_detail_indexable_count: input.jobIndexSlugs.length,
        excluded_count: input.excludedDatasetSlugs?.length ?? 0,
      },
      members: [
        ...input.datasetSlugs.map((slug) => buildDatasetMember(slug, true)),
        ...(input.excludedDatasetSlugs ?? []).map((slug) => buildDatasetMember(slug, false)),
      ],
      structured_data: { dataset: { "@type": "Dataset" } },
    })),
  }));

  vi.doMock("@/lib/career/api/fetchCareerJobIndex", () => ({
    fetchCareerJobIndex: vi.fn(async () => ({
      bundle_kind: "career_job_index",
      items: input.jobIndexSlugs.map(buildJobIndexItem),
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
    const slugs = Array.from({ length: 1046 }, (_, index) => `career-public-role-${index + 1}`);
    installCareerAuthorityMocks({
      datasetSlugs: slugs,
      jobIndexSlugs: slugs,
      memberCount: 1046,
    });

    const html = await renderCareerJobsPage();

    expect(html).toContain("1046 occupations, organized by industry");
    expect(html).toContain("data-testid=\"career-library-result-summary\"");
    expect(html).toContain("Showing 1046 occupations; 1046 detail pages are confirmed by backend publication gates.");
    expect((html.match(/data-testid="career-occupation-row"/g) ?? [])).toHaveLength(1046);
    expect((html.match(/data-testid="career-occupation-detail-link"/g) ?? [])).toHaveLength(1046);
  });

  it("does not render local fallback-only career cards when backend authority is unavailable", async () => {
    installBaseMocks();
    installCareerAuthorityMocks({
      datasetSlugs: [],
      jobIndexSlugs: [],
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
      datasetSlugs: ["accountants-and-auditors", "actors"],
      jobIndexSlugs: ["accountants-and-auditors", "actors"],
      excludedDatasetSlugs: EXCLUDED_SLUGS,
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
