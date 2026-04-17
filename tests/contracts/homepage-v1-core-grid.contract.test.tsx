import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
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

const EXPECTED_ZH_CARDS = [
  {
    title: "MBTI 性格测试",
    copy: "快速了解你的类型偏好与决策风格",
    meta: "人格测试",
    href: "/zh/tests/mbti-personality-test-16-personality-types",
  },
  {
    title: "Big Five 大五人格测试",
    copy: "从五个维度看清你的稳定特质",
    meta: "人格测试",
    href: "/zh/tests/big-five-personality-test-ocean-model",
  },
  {
    title: "IQ 智商测试",
    copy: "快速了解你的认知能力基线",
    meta: "能力测评",
    href: "/zh/tests/iq-test-intelligence-quotient-assessment/take",
  },
  {
    title: "EQ 情商测试",
    copy: "了解你在情绪识别与协作沟通中的表现",
    meta: "情绪能力",
    href: "/zh/tests/eq-test-emotional-intelligence-assessment/take",
  },
  {
    title: "九型人格测试",
    copy: "从核心动机与压力反应理解你的行为模式",
    meta: "人格测试",
    href: "/zh/tests",
  },
  {
    title: "情绪状态自测",
    copy: "快速了解你近期的情绪状态变化",
    meta: "状态自测",
    href: "/zh/tests",
  },
];

describe("homepage v1 core grid contract", () => {
  it("renders exactly six core test cards with four fields each", () => {
    render(<HomePageExperience locale="zh" />);
    const gridHeading = screen.getByRole("heading", { level: 2, name: "从一个清楚的问题开始。" });
    const section = gridHeading.closest("section");

    for (const card of EXPECTED_ZH_CARDS) {
      const title = within(section as HTMLElement).getByRole("heading", { level: 3, name: card.title });
      const article = title.closest("article");

      expect(article).toBeTruthy();
      expect(within(article as HTMLElement).getByText(card.copy)).toBeInTheDocument();
      expect(within(article as HTMLElement).getByText(card.meta)).toBeInTheDocument();
      expect(within(article as HTMLElement).getByRole("link", { name: /开始测试/ })).toHaveAttribute(
        "href",
        card.href
      );
    }

    expect(within(section as HTMLElement).getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  it("keeps the core grid in a three-column desktop layout contract", () => {
    render(<HomePageExperience locale="zh" />);

    const gridHeading = screen.getByRole("heading", { level: 2, name: "从一个清楚的问题开始。" });
    const section = gridHeading.closest("section");

    expect(section?.innerHTML).toContain("lg:grid-cols-3");
    expect(section?.innerHTML).not.toContain("lg:grid-cols-6");
  });
});
