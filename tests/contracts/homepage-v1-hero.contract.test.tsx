import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { getHomePageContent } from "@/lib/marketing/homepageContent";

vi.mock("@/lib/cms/landing-surfaces", async () => {
  const fixture = await import("./fixtures/cmsLandingSurfaceMock");

  return {
    getCmsLandingSurface: vi.fn(fixture.getMockCmsLandingSurface),
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

  it("renders trust points as a compact strip instead of a heavy accordion", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    expect(screen.getByText("结果结构清晰")).toBeInTheDocument();
    expect(screen.getAllByText("方法边界透明").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("可匿名开始")).toBeInTheDocument();
    expect(screen.queryByText("Trust & Boundaries")).not.toBeInTheDocument();
  });
});
