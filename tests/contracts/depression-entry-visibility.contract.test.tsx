import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
import { vi } from "vitest";

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

function collectHomeEntryHrefs(locale: "zh" | "en"): string[] {
  const content = getHomePageContent(locale);

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

  it("removes both depression-related entries from home marketing content in both locales", () => {
    for (const locale of ["zh", "en"] as const) {
      const hrefs = collectHomeEntryHrefs(locale);

      expect(hrefs.some((href) => href.includes("depression-screening-test-standard-edition"))).toBe(false);
      expect(
        hrefs.some((href) => href.includes("clinical-depression-anxiety-assessment-professional-edition"))
      ).toBe(false);
    }
  });

  it("removes the tests hub emotion-state family when all depression-related test cards are hidden", () => {
    for (const locale of ["zh", "en"] as const) {
      const content = getTestsHubContent(locale);
      const emotionFamily = content.families.items.find((family) => family.id === "family-emotion-state");
      const emotionQuickStart = content.quickStart.items.find((item) => item.id === "emotion-state");

      expect(emotionFamily).toBeUndefined();
      expect(emotionQuickStart).toBeUndefined();
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
        <SiteFooter />
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
});
