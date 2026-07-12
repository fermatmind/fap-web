import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HighlightedTestsSection } from "@/components/marketing/HighlightedTestsSection";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";
import {
  extractTestSlugFromEntryHref,
  isPublicTestEntryVisible,
} from "@/lib/tests/publicTestEntryVisibility";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

const mockTestItems = vi.hoisted(() => [
  {
    slug: "mbti-personality-test-16-personality-types",
    title: "MBTI Personality Test",
    title_i18n: { en: "MBTI Personality Test", zh: "MBTI 性格测试" },
    description: "MBTI",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 144,
    time_minutes: 15,
    scale_code: "MBTI",
  },
  {
    slug: "big-five-personality-test-ocean-model",
    title: "Big Five Personality Test",
    title_i18n: { en: "Big Five Personality Test", zh: "大五人格测试" },
    description: "Big Five",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 120,
    time_minutes: 20,
    scale_code: "BIG5_OCEAN",
  },
  {
    slug: "iq-test-intelligence-quotient-assessment",
    title: "IQ Test",
    title_i18n: { en: "IQ Test", zh: "智商测试" },
    description: "IQ",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 60,
    time_minutes: 12,
    scale_code: "IQ_RAVEN",
  },
  {
    slug: "eq-test-emotional-intelligence-assessment",
    title: "EQ Test",
    title_i18n: { en: "EQ Test", zh: "情商测试" },
    description: "EQ",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 50,
    time_minutes: 10,
    scale_code: "EQ_60",
  },
  {
    slug: "clinical-depression-anxiety-assessment-professional-edition",
    title: "Clinical Depression & Anxiety Assessment",
    title_i18n: { en: "Clinical Depression & Anxiety Assessment", zh: "抑郁焦虑综合检测" },
    description: "Clinical",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 68,
    time_minutes: 12,
    scale_code: "CLINICAL_COMBO_68",
  },
  {
    slug: "depression-screening-test-standard-edition",
    title: "Depression Screening Test",
    title_i18n: { en: "Depression Screening Test", zh: "抑郁测评" },
    description: "SDS",
    cover_image: "/share/mbti_square_600x600.png",
    questions_count: 20,
    time_minutes: 5,
    scale_code: "SDS_20",
  },
]);

vi.mock("@/lib/content", async () => {
  const actual = await vi.importActual<typeof import("@/lib/content")>("@/lib/content");
  return {
    ...actual,
    getAllTests: vi.fn(async () => mockTestItems),
    getTestBySlug: vi.fn(async (slug: string) => mockTestItems.find((item) => item.slug === slug) ?? null),
  };
});

vi.mock("@/lib/cms/landing-surfaces", async () => {
  const fixture = await import("./fixtures/cmsLandingSurfaceMock");

  return {
    getCmsLandingSurface: vi.fn(fixture.getMockCmsLandingSurface),
    getCmsLandingSurfaceWithLastKnownGood: vi.fn(fixture.getMockCmsLandingSurfaceWithLastKnownGood),
  };
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <span data-testid="mock-next-image" data-alt={alt ?? ""} />,
}));

async function collectHomeEntryHrefs(locale: "zh" | "en"): Promise<string[]> {
  const content = await getHomePageContent(locale);

  return [
    ...content.quickStart.items.map((item) => item.href),
    ...content.families.items.flatMap((family) => family.links.map((link) => link.href)),
    ...content.header.groups.flatMap((group) => group.links.map((link) => link.href)),
    ...content.footer.groups.flatMap((group) => group.links.map((link) => link.href)),
  ];
}

describe("depression entry visibility contract", () => {
  it("hides both public depression-related slugs from public entry filtering", () => {
    expect(
      isPublicTestEntryVisible({ href: "/tests/depression-screening-test-standard-edition/take" })
    ).toBe(false);
    expect(
      isPublicTestEntryVisible({
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take",
      })
    ).toBe(false);
    expect(extractTestSlugFromEntryHref("/tests/depression-screening-test-standard-edition/take")).toBe(
      "depression-screening-test-standard-edition"
    );
  });

  it("removes both depression-related entries from homepage public exposure", async () => {
    for (const locale of ["zh", "en"] as const) {
      const hrefs = await collectHomeEntryHrefs(locale);

      expect(hrefs.some((href) => href.includes("depression-screening-test-standard-edition"))).toBe(false);
      expect(
        hrefs.some((href) => href.includes("clinical-depression-anxiety-assessment-professional-edition"))
      ).toBe(false);
    }
  });

  it("keeps the tests hub emotion-state entry without depression-related detail links", async () => {
    for (const locale of ["zh", "en"] as const) {
      const content = await getTestsHubContent(locale);
      const emotionFamily = content.families.items.find((family) => family.id === "family-emotion-state");
      const emotionQuickStart = content.quickStart.items.find((item) => item.id === "emotion-state");

      expect(emotionQuickStart).toBeTruthy();
      expect(emotionFamily?.tests.map((item) => item.key)).not.toEqual(
        expect.arrayContaining([
          "depression-screening-test-standard-edition",
          "clinical-depression-anxiety-assessment-professional-edition",
        ])
      );
    }
  });

  it("removes both depression-related entries from header dropdown menus", () => {
    for (const locale of ["zh", "en"] as const) {
      const testsMenu = getHeaderDropdownMenus(locale).find((menu) => menu.key === "tests");

      expect(testsMenu).toBeTruthy();
      expect(
        testsMenu?.items.some((item) => item.href.includes("depression-screening-test-standard-edition"))
      ).toBe(false);
      expect(
        testsMenu?.items.some((item) =>
          item.href.includes("clinical-depression-anxiety-assessment-professional-edition")
        )
      ).toBe(false);
    }
  });

  it("removes both depression-related entries from the rendered footer", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter locale="en" />
      </LocaleProvider>
    );

    expect(screen.queryByRole("link", { name: "SDS-20" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Clinical Combo" })).not.toBeInTheDocument();
  });

  it("suppresses both depression-related highlighted cards at render time while keeping other cards visible", () => {
    render(
      <HighlightedTestsSection
        locale="en"
        cards={[
          {
            kind: "live",
            slug: "depression-screening-test-standard-edition",
            title: "Depression Screening (Standard)",
            description: "Quick emotional baseline check",
            category: "Emotion & state",
            tags: ["recent baseline"],
            questionsCount: 20,
            timeMinutes: 5,
            footnote: "20 items / 5 min / baseline",
          },
          {
            kind: "live",
            slug: "clinical-depression-anxiety-assessment-professional-edition",
            title: "Depression & Anxiety Assessment",
            description: "Broader clinical combo",
            category: "Emotion & state",
            tags: ["risk scan"],
            questionsCount: 68,
            timeMinutes: 12,
            footnote: "68 items / 12 min / risk scan",
          },
        ]}
      />
    );

    expect(
      screen.queryByRole("link", { name: "Depression Screening (Standard)" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Depression & Anxiety Assessment" })
    ).not.toBeInTheDocument();
  });

  it("excludes hidden clinical tests from sitemap and LLM discovery surfaces", () => {
    const llms = read("app/llms.txt/route.ts");
    const llmsFull = read("app/llms-full.txt/route.ts");
    const backendTestSource = read("lib/seo/backendTestDiscoverabilitySource.ts");
    const sitemap = `${read("next-sitemap.config.js")}\n${read("lib/seo/sitemapAuthorityAdapters.cjs")}`;

    expect(llms).toContain("listBackendDiscoverabilityTestEntries");
    expect(llmsFull).toContain("listBackendDiscoverabilityTestEntries");
    expect(backendTestSource).toContain("filterVisiblePublicTestEntries");
    expect(sitemap).toContain("HIDDEN_PUBLIC_TEST_ENTRY_SLUGS");
    expect(sitemap).toContain("isHiddenPublicTestEntrySlug");
    expect(sitemap).toContain("clinical-depression-anxiety-assessment-professional-edition");
    expect(sitemap).toContain("depression-screening-test-standard-edition");
  });
});
