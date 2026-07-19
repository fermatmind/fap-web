import type { ReactNode } from "react";
import { renderToReadableStream } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

function installBaseMocks(locale: "en" | "zh") {
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
    resolveLocale: vi.fn(() => locale),
  }));
}

function installDirectoryAuthority(
  families: Array<{ slug?: string; title_en?: string; title_zh?: string; count?: number }>,
  discoverableSlugs = families.map((family) => String(family.slug ?? "")).filter(Boolean)
) {
  vi.doMock("@/lib/career/api/fetchCareerDirectory", () => ({
    fetchCareerDirectory: vi.fn(async () => ({
      authority_version: "career.directory_authority.v1",
      public_truth: {
        public_detail_indexable_count: 101,
        directory_member_count: 101,
        future_scale_ready: true,
        excluded_slugs: [],
      },
      pagination: {
        page: 1,
        per_page: 50,
        total: 101,
        total_pages: 3,
        has_next_page: true,
        has_previous_page: false,
      },
      filters: { locale: "en", family: null, q: null },
      facets: { families },
      items: [
        {
          slug: "data-scientists",
          title_en: "Data Scientists",
          title_zh: "数据科学家",
          family: { slug: "computer-and-information-technology" },
          canonical_path: "/career/jobs/data-scientists",
          indexable: true,
          detail_ready: true,
        },
      ],
    })),
  }));

  vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
    fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(async () => ({
      manifest_kind: "career_first_wave_discoverability_manifest",
      manifest_version: "career.first_wave.discoverability.v1",
      scope: "public_career_routes",
      routes: families.map((family) => ({
        route_kind: "career_family_hub",
        canonical_path: `/career/family/${family.slug}`,
        canonical_slug: family.slug,
        discoverability_state: discoverableSlugs.includes(String(family.slug ?? ""))
          ? "discoverable"
          : "excluded",
        title_en: family.title_en,
        visible_children_count: family.count,
      })),
    })),
  }));
}

async function renderJobsPage(locale: "en" | "zh") {
  const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
  const page = await CareerJobsPage({
    params: Promise.resolve({ locale }),
    searchParams: Promise.resolve({}),
  });

  const stream = await renderToReadableStream(page as ReactNode);
  await stream.allReady;

  return new Response(stream).text();
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/link");
});

describe("SAEP-PLANNED-PR-05 Career Hub crawlable links", () => {
  it.each([
    {
      locale: "en" as const,
      title: "Computer and information technology",
      titleEn: "Computer and information technology",
      titleZh: "计算机与信息技术",
    },
    {
      locale: "zh" as const,
      title: "计算机与信息技术",
      titleEn: "Computer and information technology",
      titleZh: "计算机与信息技术",
    },
  ])("renders an SSR canonical family-hub anchor for $locale from backend facets", async ({ locale, title, titleEn, titleZh }) => {
    installBaseMocks(locale);
    installDirectoryAuthority([
      {
        slug: "computer-and-information-technology",
        title_en: titleEn,
        title_zh: titleZh,
        count: 101,
      },
    ]);

    const html = await renderJobsPage(locale);

    expect(html).toContain('data-testid="career-directory-family-hubs"');
    expect(html).toContain(
      `href="/${locale}/career/family/computer-and-information-technology"`
    );
    expect(html).toContain(`data-testid="career-directory-family-hub-link"><span>${title}</span>`);
    expect(html).toContain(
      `href="/${locale}/career/jobs?family=computer-and-information-technology"`
    );
    expect(html).toContain(`href="/${locale}/career/jobs?page=2"`);
  });

  it("does not invent family-hub anchors when backend authority returns no family facets", async () => {
    installBaseMocks("en");
    installDirectoryAuthority([]);

    const html = await renderJobsPage("en");

    expect(html).not.toContain('data-testid="career-directory-family-hubs"');
    expect(html).not.toContain('data-testid="career-directory-family-hub-link"');
    expect(html).not.toContain("/en/career/family/");
  });

  it("keeps an excluded family available as a filter without exposing its hub as a crawlable anchor", async () => {
    installBaseMocks("en");
    installDirectoryAuthority(
      [
        {
          slug: "computer-and-information-technology",
          title_en: "Computer and information technology",
          title_zh: "计算机与信息技术",
          count: 91,
        },
        {
          slug: "ambiguous-family",
          title_en: "Ambiguous family",
          title_zh: "待确认家族",
          count: 10,
        },
      ],
      ["computer-and-information-technology"]
    );

    const html = await renderJobsPage("en");

    expect(html).toContain('href="/en/career/family/computer-and-information-technology"');
    expect(html).not.toContain('href="/en/career/family/ambiguous-family"');
    expect(html).toContain('href="/en/career/jobs?family=ambiguous-family"');
  });

  it("keeps the core directory render independent from the optional hub manifest", async () => {
    installBaseMocks("en");
    installDirectoryAuthority([
      {
        slug: "computer-and-information-technology",
        title_en: "Computer and information technology",
        title_zh: "计算机与信息技术",
        count: 101,
      },
    ]);
    const deferredManifest: { resolve?: (value: null) => void } = {};
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveDiscoverabilityManifest", () => ({
      fetchCareerFirstWaveDiscoverabilityManifest: vi.fn(
        () => new Promise<null>((resolve) => {
          deferredManifest.resolve = resolve;
        })
      ),
    }));

    const { default: CareerJobsPage } = await import("@/app/(localized)/[locale]/career/jobs/page");
    const page = await CareerJobsPage({
      params: Promise.resolve({ locale: "en" }),
      searchParams: Promise.resolve({}),
    });
    const stream = await renderToReadableStream(page as ReactNode);
    const reader = stream.getReader();
    const firstChunk = await reader.read();
    const html = new TextDecoder().decode(firstChunk.value);

    expect(html).toContain('data-testid="career-library-workspace"');
    expect(html).not.toContain('data-testid="career-directory-family-hub-link"');
    expect(deferredManifest.resolve).toBeTypeOf("function");
    deferredManifest.resolve?.(null);

    while (!(await reader.read()).done) {
      // Drain the completed stream so the server render exits without an abort.
    }
  });
});
