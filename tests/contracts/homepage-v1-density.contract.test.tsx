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

  it("keeps hero, trust, grid, secondary exploration, and result promise in a tightened landing rhythm", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("pb-5 pt-12 text-slate-950 md:pb-7 md:pt-16");
    expect(source).toContain("bg-slate-50 pb-4 md:pb-5");
    expect(source).toContain("border-y border-slate-200 py-4");
    expect(source).toContain("bg-slate-50 pb-10 pt-4 md:pb-12 md:pt-5");
    expect(source).toContain("mt-6 grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3");
    expect(source).toContain("bg-slate-50 pb-8 pt-2 md:pb-10 md:pt-4");
    expect(source).toContain("border-t border-slate-200 pt-7 md:pt-8");

    expect(source).not.toContain("py-16 text-slate-950 md:py-24");
    expect(source).not.toContain("bg-slate-50 py-16 md:py-20");
    expect(source).not.toContain("bg-slate-50 py-12 md:py-16");
    expect(source).not.toContain("rounded-full border border-slate-200 bg-white px-4 py-2");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white/70");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10");
  });

  it("compresses secondary exploration and result promise to lightweight sections", () => {
    render(<HomePageExperience locale="zh" />);

    expect(screen.getByRole("heading", { level: 2, name: "需要更多入口时，再从这里继续。" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /查看全部测评/ }).some((link) => link.getAttribute("href") === "/zh/tests")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /去职业探索/ }).some((link) => link.getAttribute("href") === "/zh/career")
    ).toBe(true);
    expect(screen.getByRole("link", { name: /查看数据方法/ })).toHaveAttribute("href", "/zh/help/about");

    expect(screen.getByRole("heading", { level: 2, name: "你拿到的，不只是一个标签。" })).toBeInTheDocument();
    expect(
      screen.getByText("结果会把类型、差异和下一步建议整理到同一页，方便你继续判断。")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看结果示例" })).toHaveAttribute("href", "/zh/personality");
  });
});
