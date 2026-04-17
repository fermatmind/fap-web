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
  it("renders the fixed Chinese V1 hero with one primary MBTI action", () => {
    render(<HomePageExperience locale="zh" />);

    expect(screen.getByRole("heading", { level: 1, name: "先了解自己，再决定下一步。" })).toBeInTheDocument();
    expect(
      screen.getByText("用一份简洁、可继续使用的测评结果，帮你看清人格、能力与职业方向。")
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "开始 MBTI 测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types"
    );
    expect(screen.getAllByRole("link", { name: "开始 MBTI 测试" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "查看全部测评" })).toHaveAttribute("href", "/zh/tests");
    expect(
      screen.getAllByRole("link", { name: /去职业探索/ }).some((link) => link.getAttribute("href") === "/zh/career")
    ).toBe(true);
  });

  it("renders trust points as a compact strip instead of a heavy accordion", () => {
    render(<HomePageExperience locale="zh" />);

    expect(screen.getByText("结果结构清晰")).toBeInTheDocument();
    expect(screen.getByText("方法边界透明")).toBeInTheDocument();
    expect(screen.getByText("可匿名开始")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看方法与隐私" })).toHaveAttribute("href", "/zh/help/about");
    expect(screen.queryByText("Trust & Boundaries")).not.toBeInTheDocument();
  });
});
