import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    prefetch,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    prefetch?: boolean;
  }) => <a href={href} data-prefetch={prefetch ? "true" : undefined} {...props}>{children}</a>,
}));

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("homepage v1 density contract", () => {
  it("removes homepage version selection and heavy legacy surfaces", () => {
    render(<HomePageExperience locale="zh" />);

    const bodyText = document.body.textContent ?? "";

    for (const forbidden of ["93题", "144题", "90题", "120题", "93Q", "144Q", "90Q", "120Q", "选择版本"]) {
      expect(bodyText).not.toContain(forbidden);
    }

    expect(screen.queryByText("SBTI 人格测试")).not.toBeInTheDocument();
    expect(screen.queryByText("按领域继续浏览。")).not.toBeInTheDocument();
    expect(screen.queryByText("方法、边界与隐私，都放在明处。")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /更多测试 \/ 娱乐实验/ })).toHaveAttribute("href", "/zh/fun/sbti");
  });

  it("does not import hero SBTI, form-version helpers, or heavy result preview in the homepage component", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).not.toContain("SbtiHeroEntryCard");
    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("listMbtiFormMetas");
    expect(source).not.toContain("listBig5FormMetas");
    expect(source).not.toContain("buildMbtiTakeHref");
    expect(source).not.toContain("buildBig5TakeHref");
  });

  it("keeps the requested banner skeletons without copying competitor assets", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("function HeroLandingIllustration");
    expect(source).toContain("LIVE_COMPLETED_COUNT");
    expect(source).toContain("bg-orange-50 pb-24 pt-10 text-slate-950 md:pb-32 md:pt-14");
    expect(source).toContain("rounded-[100%] bg-white");
    expect(source).toContain("lg:grid-cols-[minmax(0,0.92fr)_minmax(27rem,1fr)]");
    expect(source).toContain("absolute right-0 top-3 w-[31rem]");
    expect(source).toContain("function TrustCard");
    expect(source).toContain("relative z-20 -mt-16 bg-transparent pb-8 md:-mt-20 md:pb-10");
    expect(source).toContain("grid gap-5 md:grid-cols-3");
    expect(source).toContain("rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-lg");
    expect(source).toContain("function HomepageSocialProofBanner");
    expect(source).toContain("SCENARIO_VALIDATIONS.slice(0, 5)");
    expect(source).toContain("EVIDENCE_LOGS.slice(0, 3)");
    expect(source).toContain("function HomepageHighlightedTestsBanner");
    expect(source).toContain("relative overflow-hidden bg-teal-800 py-20 text-white md:py-24");
    expect(source).toContain("mx-auto max-w-2xl text-center");
    expect(source).toContain("mt-10 grid gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3");
    expect(source).toContain("function HomepageAboutBanner");
    expect(source).toContain("bg-orange-500 px-6 py-16 text-center text-white");
    expect(source).toContain("function HomepageArticlesBanner");
    expect(source).toContain("listBlogPosts(locale)");
    expect(source).toContain("function ArticleVisual");
    expect(source).toContain("bg-gradient-to-br");
    expect(source).toContain('locale === "zh" ? "结果结构" : "Result"');
    expect(source).toContain("HeroLandingIllustration locale={locale} previews={copy.results.previews}");

    expect(source).not.toContain("py-16 text-slate-950 md:py-24");
    expect(source).not.toContain("HeroResultStructurePanel");
    expect(source).not.toContain("bg-slate-50 py-16 md:py-20");
    expect(source).not.toContain("bg-slate-50 py-12 md:py-16");
    expect(source).not.toContain("rounded-full border border-slate-200 bg-white px-4 py-2");
    expect(source).not.toContain("rounded-3xl border border-slate-200 bg-white px-5 py-4");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white/70");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10");
    expect(source).not.toContain("123test");
    expect(source).not.toContain("truity");
  });

  it("keeps the homepage banner order without restoring heavy surfaces", () => {
    const source = read("components/marketing/HomePageExperience.tsx");
    const order = [
      "HomepageHeroV1 locale={locale} copy={copy}",
      "HomepageTrustStripV1 locale={locale} copy={copy}",
      "HomepageSocialProofBanner locale={locale}",
      "HomepageHighlightedTestsBanner locale={locale} copy={copy}",
      "HomepageAboutBanner locale={locale} copy={copy}",
      "HomepageArticlesBanner locale={locale} articles={articles}",
    ];

    for (let index = 1; index < order.length; index += 1) {
      expect(source.indexOf(order[index - 1])).toBeLessThan(source.indexOf(order[index]));
    }

    expect(source).not.toContain("Accordion");
    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("SbtiHeroEntryCard");
  });

  it("renders secondary paths, about cards, and Truity-style article grid from local content", () => {
    render(<HomePageExperience locale="zh" />);

    expect(
      screen.getAllByRole("link", { name: /查看全部测评/ }).some((link) => link.getAttribute("href") === "/zh/tests")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /去职业探索/ }).some((link) => link.getAttribute("href") === "/zh/career")
    ).toBe(true);
    expect(screen.getByRole("link", { name: /查看数据方法/ })).toHaveAttribute("href", "/zh/help/about");
    expect(screen.getByRole("link", { name: /更多测试 \/ 娱乐实验/ })).toHaveAttribute("href", "/zh/fun/sbti");

    expect(screen.getByRole("heading", { level: 2, name: "使用场景与引用" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "关于 FermatMind" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "延伸阅读" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看全部文章/ })).toHaveAttribute("href", "/zh/articles");
  });
});
