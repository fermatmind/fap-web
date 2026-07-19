import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

function linkOpeningTags(source: string): string[] {
  return Array.from(source.matchAll(/<Link\b[\s\S]*?>/g), (match) => match[0]);
}

function directoryPayload() {
  return {
    authority_version: "career.directory_authority.v1",
    bundle_kind: "career_directory",
    public_truth: {
      public_detail_indexable_count: 1046,
      directory_member_count: 1046,
      future_scale_ready: true,
      excluded_slugs: [],
    },
    pagination: {
      page: 1,
      per_page: 50,
      total: 1046,
      total_pages: 21,
      has_next_page: true,
      has_previous_page: false,
    },
    filters: {
      locale: "zh-CN",
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
    items: [
      {
        slug: "backend-architect",
        title_en: "Backend Architect",
        title_zh: "后端架构师",
        family: {
          slug: "business-and-financial",
          title_en: "Business and financial",
          title_zh: "商业与金融",
        },
        indexable: true,
        detail_ready: true,
      },
    ],
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("CAREER-JOBS-PREFETCH-BUDGET-01", () => {
  it("disables automatic prefetch on every Career directory Link declaration", () => {
    const pageSource = read("app/(localized)/[locale]/career/jobs/page.tsx");
    const directorySource = read("components/career/CareerOccupationDirectory.tsx");
    const pageLinks = linkOpeningTags(pageSource);
    const directoryLinks = linkOpeningTags(directorySource);

    expect(pageLinks).toHaveLength(9);
    expect(directoryLinks).toHaveLength(4);

    for (const link of [...pageLinks, ...directoryLinks]) {
      expect(link).toContain("prefetch={false}");
    }
  });

  it("preserves backend-owned href, locale, filter, and pagination navigation", async () => {
    vi.doMock("next/link", () => ({
      default: ({
        href,
        prefetch,
        children,
        ...props
      }: {
        href: string;
        prefetch?: boolean;
        children: ReactNode;
      }) => (
        <a href={href} data-prefetch={String(prefetch)} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
      fetchCareerDirectory: vi.fn(async () => directoryPayload()),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "zh" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("后端架构师");
    expect(html).toMatch(/href="\/zh\/career\/jobs\/backend-architect" data-prefetch="false"/);
    expect(html).toMatch(/href="\/zh\/career\/industries\/business-and-financial" data-prefetch="false"/);
    expect(html).toMatch(/href="\/zh\/career\/jobs\?family=healthcare" data-prefetch="false"/);
    expect(html).toMatch(/href="\/zh\/career\/jobs\?page=2" data-prefetch="false"/);
    expect(html).not.toContain("frontend-local");
    expect(html).not.toContain("CMS did not return any public career jobs");
  });
});
