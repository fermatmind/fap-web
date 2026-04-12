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
      },
    });

    expect(hub).toEqual({
      authoritySource: "career_backend_family_hub.v0.5",
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
    });
    expect(hub).not.toHaveProperty("summary");
    expect(hub).not.toHaveProperty("aliases");
    expect(hub).not.toHaveProperty("guidance");
  });
});

describe("career family hub page wiring", () => {
  it("renders family identity, counts, and visible children while keeping blocked rows hidden", async () => {
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
    expect(html).not.toContain("blocked role");
  });

  it("renders a valid empty state when the family has zero visible children", async () => {
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
    expect(html).not.toContain('data-testid="career-family-hub-visible-child"');
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

    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/en/career/family/compliance");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});
