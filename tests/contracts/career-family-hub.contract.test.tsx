import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerFamilyHub } from "@/lib/career/adapters/adaptCareerFamilyHub";
import { fetchCareerFamilyHub } from "@/lib/career/api/fetchCareerFamilyHub";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function installFamilyHubTrackingMocks() {
  const pageViewEvents: Array<{ eventName: string; properties: Record<string, unknown> | undefined }> = [];
  const trackedLinks: Array<{
    eventName: string;
    eventPayload: Record<string, unknown>;
    href: string;
  }> = [];

  vi.doMock("@/hooks/useAnalytics", () => ({
    AnalyticsPageViewTracker: ({
      eventName,
      properties,
    }: {
      eventName: string;
      properties?: Record<string, unknown>;
    }) => {
      pageViewEvents.push({ eventName, properties });
      return null;
    },
  }));

  vi.doMock("@/components/analytics/TrackedCareerLink", () => ({
    TrackedCareerLink: ({
      eventName,
      eventPayload,
      href,
      children,
      ...props
    }: {
      eventName: string;
      eventPayload: Record<string, unknown>;
      href: string;
      children: ReactNode;
    }) => {
      trackedLinks.push({ eventName, eventPayload, href });

      return (
        <a href={href} data-event-name={eventName} {...props}>
          {children}
        </a>
      );
    },
  }));

  return { pageViewEvents, trackedLinks };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career family hub fetch and adapter contract", () => {
  it("requests the backend family hub endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career/family/data-science?");
        expect(url).toContain("locale=zh-CN");

        return jsonResponse({
          bundle_kind: "career_family_hub",
          family: {
            canonical_slug: "data-science",
          },
          visible_children: [],
          counts: {
            visible_children_count: 0,
            publish_ready_count: 0,
            blocked_override_eligible_count: 0,
            blocked_not_safely_remediable_count: 0,
            blocked_total: 0,
          },
        });
      })
    );

    const payload = await fetchCareerFamilyHub({ locale: "zh", slug: "data-science" });

    expect(payload).not.toBeNull();
  });

  it("adapts the backend family hub bundle without local narrative synthesis", () => {
    const hub = adaptCareerFamilyHub({
      locale: "en",
      payload: {
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/data-science",
          canonical_title: "Data Science Canonical",
          index_state: "index",
          index_eligible: true,
          robots_policy: "index,follow",
        },
        family: {
          family_uuid: "fam_123",
          canonical_slug: "data-science",
          title_en: "Data Science",
          title_zh: "数据科学",
        },
        visible_children: [
          {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientist",
            canonical_title_en: "Data Scientist",
            canonical_title_zh: "数据科学家",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              index_state: "index",
              index_eligible: true,
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
        counts: {
          visible_children_count: 1,
          publish_ready_count: 1,
          blocked_override_eligible_count: 2,
          blocked_not_safely_remediable_count: 1,
          blocked_total: 3,
        },
        structured_data: {
          collection_page: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Data Science",
            url: "https://backend.example.test/career/family/data-science",
            mainEntityOfPage: "https://backend.example.test/career/family/data-science",
            numberOfItems: 1,
          },
          item_list: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            numberOfItems: 1,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Data Scientist",
                url: "https://backend.example.test/career/jobs/data-scientist",
              },
            ],
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "https://backend.example.test/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Data Science",
                item: "https://backend.example.test/career/family/data-science",
              },
            ],
          },
          dataset: {
            "@type": "Dataset",
          },
        },
      },
    });

    expect(hub).toEqual({
      authoritySource: "career_backend_family_hub.v0.5",
      seoContract: {
        canonicalPath: "/en/career/family/data-science",
        canonicalTitle: "Data Science Canonical",
        indexState: "index",
        indexEligible: true,
        robotsPolicy: "index,follow",
      },
      family: {
        familyUuid: "fam_123",
        canonicalSlug: "data-science",
        titleEn: "Data Science",
        titleZh: "数据科学",
        title: "Data Science",
      },
      visibleChildren: [
        {
          occupationUuid: "occ_123",
          canonicalSlug: "data-scientist",
          canonicalTitleEn: "Data Scientist",
          canonicalTitleZh: "数据科学家",
          title: "Data Scientist",
          href: "/en/career/jobs/data-scientist",
          seoContract: expect.objectContaining({
            canonicalPath: "/career/jobs/data-scientist",
            indexState: "index",
            indexEligible: true,
          }),
          trustSummary: {
            reviewerStatus: "approved",
          },
        },
      ],
      counts: {
        visibleChildrenCount: 1,
        publishReadyCount: 1,
        blockedOverrideEligibleCount: 2,
        blockedNotSafelyRemediableCount: 1,
        blockedTotal: 3,
      },
      structuredData: {
        collectionPage: {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Data Science",
          url: "http://localhost:3000/en/career/family/data-science",
          mainEntityOfPage: "http://localhost:3000/en/career/family/data-science",
          numberOfItems: 1,
        },
        itemList: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: 1,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Data Scientist",
              url: "http://localhost:3000/en/career/jobs/data-scientist",
            },
          ],
        },
        breadcrumbList: {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Career",
              item: "http://localhost:3000/en/career",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Data Science",
              item: "http://localhost:3000/en/career/family/data-science",
            },
          ],
        },
      },
    });
    expect(hub).not.toHaveProperty("summary");
    expect(hub).not.toHaveProperty("aliases");
    expect(hub).not.toHaveProperty("guidance");
    expect((hub?.structuredData as Record<string, unknown> | undefined)?.dataset).toBeUndefined();
    expect((hub?.structuredData as Record<string, unknown> | undefined)?.article).toBeUndefined();
    expect((hub?.structuredData as Record<string, unknown> | undefined)?.definedTermSet).toBeUndefined();
  });
});

describe("career family hub page wiring", () => {
  it("renders family identity, counts, and visible children while keeping blocked rows hidden", async () => {
    const { pageViewEvents, trackedLinks } = installFamilyHubTrackingMocks();

    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async () => ({
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/data-science",
          canonical_title: "Data Science Canonical",
          index_state: "index",
          index_eligible: true,
          robots_policy: "index,follow",
        },
        family: {
          family_uuid: "fam_123",
          canonical_slug: "data-science",
          title_en: "Data Science",
          title_zh: "数据科学",
        },
        visible_children: [
          {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientist",
            canonical_title_en: "Data Scientist",
            canonical_title_zh: "数据科学家",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              index_state: "index",
              index_eligible: true,
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
        counts: {
          visible_children_count: 1,
          publish_ready_count: 1,
          blocked_override_eligible_count: 2,
          blocked_not_safely_remediable_count: 1,
          blocked_total: 3,
        },
        structured_data: {
          collection_page: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Data Science",
            url: "/career/family/data-science",
            mainEntityOfPage: "/career/family/data-science",
            numberOfItems: 1,
          },
          item_list: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            numberOfItems: 1,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Data Scientist",
                url: "/career/jobs/data-scientist",
              },
            ],
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Data Science",
                item: "/career/family/data-science",
              },
            ],
          },
        },
      })),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
      };
    });

    const { default: CareerFamilyPage } = await import("@/app/(localized)/[locale]/career/family/[slug]/page");
    const page = await CareerFamilyPage({
      params: Promise.resolve({ locale: "en", slug: "data-science" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("career-family-hub");
    expect(html).toContain("Data Science");
    expect(html).toContain("data-science");
    expect(html).toContain("career-family-hub-counts");
    expect(html).toContain("Blocked total");
    expect(html).toContain(">3<");
    expect(html).toContain("career-family-hub-visible-child");
    expect(html).toContain("Data Scientist");
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"ItemList"');
    expect(html.match(/"@type":"BreadcrumbList"/g)).toHaveLength(1);
    expect(html).toContain("http://localhost:3000/en/career/family/data-science");
    expect(html).toContain("http://localhost:3000/en/career/jobs/data-scientist");
    expect(html).toContain("http://localhost:3000/en/career");
    expect(html).not.toContain("blocked role");
    expect(pageViewEvents).toEqual([
      {
        eventName: "career_family_hub_view",
        properties: {
          locale: "en",
          entry_surface: "career_family_hub",
          source_page_type: "career_family_hub",
          target_action: "view_family_hub",
          landing_path: "/en/career/family/data-science",
          route_family: "family_hub",
          subject_kind: "family_slug",
          subject_key: "data-science",
          query_mode: "non_query",
        },
      },
    ]);
    expect(trackedLinks).toEqual([
      {
        eventName: "career_family_hub_child_click",
        eventPayload: {
          locale: "en",
          entrySurface: "career_family_hub",
          sourcePageType: "career_family_hub",
          targetAction: "open_family_hub_child",
          landingPath: "/en/career/family/data-science",
          routeFamily: "family_hub",
          subjectKind: "job_slug",
          subjectKey: "data-scientist",
          queryMode: "non_query",
        },
        href: "/en/career/jobs/data-scientist",
      },
    ]);
  });

  it("renders a valid empty state when the family has zero visible children", async () => {
    const { pageViewEvents, trackedLinks } = installFamilyHubTrackingMocks();

    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async () => ({
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/compliance",
          canonical_title: "Compliance Canonical",
          index_state: "noindex",
          index_eligible: false,
          robots_policy: "noindex,follow",
        },
        family: {
          family_uuid: "fam_124",
          canonical_slug: "compliance",
          title_en: "Compliance",
          title_zh: "合规",
        },
        visible_children: [],
        counts: {
          visible_children_count: 0,
          publish_ready_count: 0,
          blocked_override_eligible_count: 1,
          blocked_not_safely_remediable_count: 2,
          blocked_total: 3,
        },
        structured_data: {
          collection_page: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Compliance",
            url: "/career/family/compliance",
            mainEntityOfPage: "/career/family/compliance",
            numberOfItems: 0,
          },
          item_list: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            numberOfItems: 0,
            itemListElement: [],
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Compliance",
                item: "/career/family/compliance",
              },
            ],
          },
        },
      })),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
      };
    });

    const { default: CareerFamilyPage } = await import("@/app/(localized)/[locale]/career/family/[slug]/page");
    const page = await CareerFamilyPage({
      params: Promise.resolve({ locale: "en", slug: "compliance" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("Compliance");
    expect(html).toContain("career-family-hub-empty-state");
    expect(html).toContain("no public publish-ready children");
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"numberOfItems":0');
    expect(html).toContain('"itemListElement":[]');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('data-testid="career-family-hub-visible-child"');
    expect(pageViewEvents).toEqual([
      {
        eventName: "career_family_hub_view",
        properties: {
          locale: "en",
          entry_surface: "career_family_hub",
          source_page_type: "career_family_hub",
          target_action: "view_family_hub",
          landing_path: "/en/career/family/compliance",
          route_family: "family_hub",
          subject_kind: "family_slug",
          subject_key: "compliance",
          query_mode: "non_query",
        },
      },
    ]);
    expect(trackedLinks).toEqual([]);
  });
});

describe("career family hub metadata contract", () => {
  it("marks visible family pages as indexable with self canonical metadata", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";

    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async () => ({
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/data-science",
          canonical_title: "Data Science Canonical",
          index_state: "index",
          index_eligible: true,
          robots_policy: "index,follow",
        },
        family: {
          family_uuid: "fam_123",
          canonical_slug: "data-science",
          title_en: "Data Science",
          title_zh: "数据科学",
        },
        visible_children: [
          {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientist",
            canonical_title_en: "Data Scientist",
            canonical_title_zh: "数据科学家",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              index_state: "indexed",
              index_eligible: true,
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
        counts: {
          visible_children_count: 1,
          publish_ready_count: 1,
          blocked_override_eligible_count: 0,
          blocked_not_safely_remediable_count: 0,
          blocked_total: 0,
        },
      })),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/family/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "data-science" }),
    });

    expect(metadata.title).toBe("Data Science Canonical");
    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/en/career/family/data-science");
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it("keeps zero-visible family pages valid but noindex", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";

    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async () => ({
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/compliance",
          canonical_title: "Compliance Canonical",
          index_state: "noindex",
          index_eligible: false,
          robots_policy: "noindex,follow",
        },
        family: {
          family_uuid: "fam_124",
          canonical_slug: "compliance",
          title_en: "Compliance",
          title_zh: "合规",
        },
        visible_children: [],
        counts: {
          visible_children_count: 0,
          publish_ready_count: 0,
          blocked_override_eligible_count: 1,
          blocked_not_safely_remediable_count: 2,
          blocked_total: 3,
        },
      })),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/family/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "compliance" }),
    });

    expect(metadata.title).toBe("Compliance Canonical");
    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/en/career/family/compliance");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
    });
  });

  it("obeys backend noindex posture even when visible children exist", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";

    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFamilyHub", () => ({
      fetchCareerFamilyHub: vi.fn(async () => ({
        bundle_kind: "career_family_hub",
        bundle_version: "career.protocol.family_hub.v1",
        seo_contract: {
          canonical_path: "/career/family/data-science",
          canonical_title: "Data Science Canonical",
          index_state: "noindex",
          index_eligible: false,
          robots_policy: "index,follow",
        },
        family: {
          family_uuid: "fam_123",
          canonical_slug: "data-science",
          title_en: "Data Science",
          title_zh: "数据科学",
        },
        visible_children: [
          {
            occupation_uuid: "occ_123",
            canonical_slug: "data-scientist",
            canonical_title_en: "Data Scientist",
            canonical_title_zh: "数据科学家",
            seo_contract: {
              canonical_path: "/career/jobs/data-scientist",
              index_state: "indexed",
              index_eligible: true,
            },
            trust_summary: {
              reviewer_status: "approved",
            },
          },
        ],
        counts: {
          visible_children_count: 1,
          publish_ready_count: 1,
          blocked_override_eligible_count: 0,
          blocked_not_safely_remediable_count: 0,
          blocked_total: 0,
        },
      })),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/family/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "data-science" }),
    });

    expect(metadata.title).toBe("Data Science Canonical");
    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/en/career/family/data-science");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
    });
  });
});
