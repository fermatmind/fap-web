import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type DirectoryMockOptions = {
  page?: number;
  total?: number;
  totalPages?: number;
  items?: Array<Record<string, unknown>>;
};

const DEFAULT_ITEMS = [
  {
    slug: "accountants-and-auditors",
    title_en: "Accountants and Auditors",
    title_zh: "会计师和审计师",
    family: {
      slug: "business-and-financial",
      title_en: "Business and financial",
      title_zh: "商业与金融",
    },
    indexable: true,
    detail_ready: true,
  },
  {
    slug: "acute-care-nurses",
    title_en: "Acute Care Nurses",
    title_zh: "急症护理护士",
    family: {
      slug: "healthcare",
      title_en: "Healthcare",
      title_zh: "医疗健康",
    },
    indexable: true,
    detail_ready: true,
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

function directoryPayload(options: DirectoryMockOptions = {}) {
  const total = options.total ?? 1046;
  const page = options.page ?? 1;
  const totalPages = options.totalPages ?? 21;

  return {
    authority_version: "career.directory_authority.v1",
    bundle_kind: "career_directory",
    public_truth: {
      public_detail_indexable_count: 1046,
      directory_member_count: 1046,
      future_scale_ready: true,
      excluded_slugs: ["software-developers", "digital-forensics-analysts", "computer-occupations-all-other"],
    },
    pagination: {
      page,
      per_page: 50,
      total,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_previous_page: page > 1,
    },
    filters: {
      locale: "en",
      family: null,
      q: null,
    },
    facets: {
      families: [
        {
          slug: "business-and-financial",
          title_en: "Business and financial",
          title_zh: "商业与金融",
          count: 312,
        },
        {
          slug: "healthcare",
          title_en: "Healthcare",
          title_zh: "医疗健康",
          count: 184,
        },
      ],
    },
    items: options.items ?? DEFAULT_ITEMS,
  };
}

function installPageMocks(options: DirectoryMockOptions = {}) {
  const fetchCareerDirectory = vi.fn(async () => directoryPayload(options));

  vi.doMock("next/link", () => ({
    default: ({ href, prefetch, children, ...props }: { href: string; prefetch?: boolean; children: ReactNode }) => (
      <a href={href} data-prefetch={String(prefetch)} {...props}>
        {children}
      </a>
    ),
  }));

  vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
    fetchCareerDirectory,
  }));

  return fetchCareerDirectory;
}

async function renderCareerJobsPage(locale: "en" | "zh", searchParams: Record<string, string | string[] | undefined> = {}) {
  const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
  const page = await CareerJobsPage({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve(searchParams),
  });

  return renderToStaticMarkup(page as ReactNode);
}

describe("CAREER-DIRECTORY-UX-FACETS-PARITY-01", () => {
  it("renders EN and ZH directory facets, counts, rows, and pagination from the same backend authority shape", async () => {
    installPageMocks();

    const enHtml = await renderCareerJobsPage("en");
    vi.resetModules();
    installPageMocks();
    const zhHtml = await renderCareerJobsPage("zh");

    for (const html of [enHtml, zhHtml]) {
      expect(html).toContain('data-testid="career-directory-family-facets"');
      expect(html).toContain('data-testid="career-directory-pagination"');
      expect(html.match(/data-testid="career-occupation-row"/g)).toHaveLength(2);
      expect(html.match(/data-testid="career-occupation-family"/g)).toHaveLength(2);
      expect(html.match(/data-testid="career-occupation-status"/g)).toHaveLength(2);
      expect(html).toContain('data-testid="career-directory-next-page"');
      expect(html).not.toContain("software-developers");
      expect(html).not.toContain("digital-forensics-analysts");
      expect(html).not.toContain("computer-occupations-all-other");
    }

    expect(enHtml).toContain("1046 occupations, organized by industry");
    expect(enHtml).toContain("Business and financial (312)");
    expect(enHtml).toContain("Healthcare (184)");
    expect(enHtml).toContain("Page 1 of 21");
    expect(zhHtml).toContain("测量自己，看见职业，训练未来");
    expect(zhHtml).toContain("商业与金融 (312)");
    expect(zhHtml).toContain("医疗健康 (184)");
    expect(zhHtml).toContain("第 1 / 21 页");
  });

  it("keeps filtered directory pages noindex/canonical-safe while showing active filter UX", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    installPageMocks({ page: 2 });

    const html = await renderCareerJobsPage("en", {
      q: "nurse",
      family: "healthcare",
      page: "2",
    });
    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({ q: "nurse", family: "healthcare", page: "2" }),
    });

    expect(html).toContain('data-testid="career-directory-active-filters"');
    expect(html).toContain("Active filters:");
    expect(html).toContain("Search");
    expect(html).toContain("Healthcare");
    expect(html).toContain('href="/en/career/jobs"');
    expect(String(metadata.alternates?.canonical ?? "")).toBe("https://fermatmind.com/en/career/jobs");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it("renders a bounded empty state with a clear route instead of frontend fallback content", async () => {
    installPageMocks({
      total: 0,
      totalPages: 0,
      items: [],
    });

    const html = await renderCareerJobsPage("zh", { q: "zzzz" });

    expect(html).toContain('data-testid="career-occupation-empty-state"');
    expect(html).toContain("没有找到匹配的职业。");
    expect(html).toContain("查看全部职业");
    expect(html).toContain('href="/zh/career/jobs"');
    expect(html).not.toContain("CMS did not return any public career jobs");
    expect(html).not.toContain("frontend fallback");
  });
});
