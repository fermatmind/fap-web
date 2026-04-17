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

describe("homepage v1 hero contract", () => {
  it("removes the red-boxed hero copy while preserving the banner skeleton", () => {
    render(<HomePageExperience locale="zh" />);

    const source = document.body.innerHTML;

    expect(source).toContain("bg-orange-50 pb-24 pt-10 text-slate-950 md:pb-32 md:pt-14");
    expect(source).toContain("lg:grid-cols-[minmax(0,0.92fr)_minmax(27rem,1fr)]");
    expect(source).toContain("absolute right-0 top-3 w-[31rem]");
    expect(screen.queryByText("过去 30 天完成")).not.toBeInTheDocument();
    expect(screen.queryByText("FermatMind / 费马测试")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "先了解自己，再决定下一步。" })).not.toBeInTheDocument();
    expect(screen.queryByText("用一份简洁、可继续使用的测评结果，帮你看清人格、能力与职业方向。")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "开始 MBTI 测试" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看全部测评" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /去职业探索/ })).not.toBeInTheDocument();
    expect(screen.queryByText("结果结构")).not.toBeInTheDocument();
    expect(screen.queryByText("可继续使用的结果页")).not.toBeInTheDocument();
  });

  it("keeps trust cards but removes the red-boxed method link", () => {
    render(<HomePageExperience locale="zh" />);

    expect(screen.getByText("结果结构清晰")).toBeInTheDocument();
    expect(screen.getAllByText("方法边界透明").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("可匿名开始")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "查看方法与隐私" })).not.toBeInTheDocument();
    expect(screen.queryByText("Trust & Boundaries")).not.toBeInTheDocument();
  });
});
