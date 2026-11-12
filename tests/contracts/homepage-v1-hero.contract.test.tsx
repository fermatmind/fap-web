import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { getHomePageContent } from "@/lib/marketing/homepageContent";

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
    prefetch,
    ...props
  }: {
    href: string;
    children?: ReactNode;
    prefetch?: boolean;
  }) => <a href={href} data-prefetch={prefetch ? "true" : undefined} {...props}>{children}</a>,
}));

describe("homepage v1 hero contract", () => {
  it("renders the fixed Chinese V1 hero from the CMS surface", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    expect(screen.getByRole("heading", { level: 1, name: "看清自己，走好每一步" })).toBeInTheDocument();
    expect(
      screen.getByText("用 MBTI 了解性格偏好，用霍兰德测试发现职业兴趣。再从千余种职业档案中，比较真实的工作任务、技能要求和入行条件，找到值得亲自尝试的方向。")
    ).toBeInTheDocument();
  });

  it("offers assessment and career entry points without the quick-start panel", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    expect(screen.getByRole("link", { name: "免费测试" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types"
    );

    expect(screen.getByRole("link", { name: "浏览职业库" })).toHaveAttribute("href", "/zh/career");

    for (const removedText of [
      "FERMATMIND / 费马测试",
      "CORE TESTS",
      "从一个清楚的问题开始。",
      "保留最常用的六个入口，题量与版本选择放到对应测试页。",
      "快速了解你的类型偏好与决策风格",
      "从五个维度看清你的稳定特质",
      "先得到兴趣结构与职业方向判断",
      "结果结构清晰",
      "方法边界透明",
      "可匿名开始",
      "人格核心维度",
      "潜在能力因子",
      "模型视图",
      "维度映射",
      "结果结构",
      "隐私保护",
      "了解产品体系",
    ]) {
      expect(screen.queryByText(removedText)).not.toBeInTheDocument();
    }

    expect(screen.queryByText("Trust & Boundaries")).not.toBeInTheDocument();
  });
});
