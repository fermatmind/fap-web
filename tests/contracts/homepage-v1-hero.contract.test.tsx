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
      screen.getByText("费马测试把自我认知、职业探索与能力成长，做成可测量、可训练、可复盘的成长系统。")
    ).toBeInTheDocument();
  });

  it("keeps the hero focused on the primary start action without HUD or secondary CTA clutter", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    expect(screen.getByRole("link", { name: "开始测评" })).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types"
    );

    for (const removedText of [
      "FERMATMIND / 费马测试",
      "结果结构清晰",
      "方法边界透明",
      "可匿名开始",
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
