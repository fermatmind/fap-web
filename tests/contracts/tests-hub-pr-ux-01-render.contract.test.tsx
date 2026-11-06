import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";

vi.mock("@/lib/cms/landing-surfaces", async () => {
  const fixture = await import("./fixtures/cmsLandingSurfaceMock");

  return {
    getCmsLandingSurface: vi.fn(fixture.getMockCmsLandingSurface),
    getCmsLandingSurfaceWithLastKnownGood: vi.fn(
      fixture.getMockCmsLandingSurfaceWithLastKnownGood,
    ),
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
  }) => (
    <a href={href} data-prefetch={prefetch ? "true" : undefined} {...props}>
      {children}
    </a>
  ),
}));

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("tests hub PR-UX-01 render contract", () => {
  it("keeps tests hub cards on the public CMS catalog and visible-entry filter", () => {
    const source = read("components/marketing/tests/TestsHubExperience.tsx");

    expect(source).toContain("content.families.items");
    expect(source).toContain("filterVisiblePublicTestEntries(ordered)");
    expect(source).toContain("listCoreTests");
    expect(source).not.toContain("depression-screening-test-standard-edition");
    expect(source).not.toContain(
      "clinical-depression-anxiety-assessment-professional-edition",
    );
  });

  it("prioritizes MBTI, Big Five, and RIASEC while keeping clinical entries hidden", async () => {
    const content = await getTestsHubContent("zh");

    render(<TestsHubExperience locale="zh" content={content} />);

    const bodyText = document.querySelector("#core-tests")?.textContent ?? "";
    const bodyHtml = document.body.innerHTML;
    const mbtiIndex = bodyText.indexOf("MBTI 性格测试");
    const bigFiveIndex = bodyText.indexOf("大五人格测试");
    const riasecIndex = bodyText.indexOf("霍兰德职业兴趣测试");
    const iqIndex = bodyText.indexOf("智商测试");

    expect(mbtiIndex).toBeGreaterThanOrEqual(0);
    expect(bigFiveIndex).toBeGreaterThan(mbtiIndex);
    expect(riasecIndex).toBeGreaterThan(bigFiveIndex);
    expect(iqIndex).toBeGreaterThan(riasecIndex);

    expect(screen.getAllByText("MBTI 性格测试").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText(/大五人格测试/).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText(/^霍兰德职业兴趣测试/).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", { level: 1, name: content.hero.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: content.hero.title }),
    ).not.toHaveClass("sr-only");
    expect(
      screen.queryByText(
        "选择合适的测试，了解你的性格特质、兴趣倾向与能力潜能。",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "为什么选择我们的测试" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "搜索测试" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^主要测评/ }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "开始 MBTI 免费测试" }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", { name: "开始大五人格免费测试" }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole("link", { name: "开始霍兰德职业兴趣免费测试" })
        .length,
    ).toBeGreaterThanOrEqual(1);

    expect(bodyText).not.toContain("情绪与状态");
    expect(bodyHtml).not.toContain(
      "depression-screening-test-standard-edition",
    );
    expect(bodyHtml).not.toContain(
      "clinical-depression-anxiety-assessment-professional-edition",
    );
  });
  it("searches core and exploration entries despite casing, spacing, punctuation and an existing category", async () => {
    const content = await getTestsHubContent("zh");
    const { container } = render(
      <TestsHubExperience locale="zh" content={content} />,
    );
    const initialCoreCount =
      container.querySelectorAll(".catalog-core-card").length;
    fireEvent.click(screen.getByRole("button", { name: /^主要测评/ }));
    expect(container.querySelectorAll(".catalog-core-card")).toHaveLength(
      initialCoreCount,
    );
    expect(container.querySelectorAll("#more-tests .catalog-item")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /^主要测评/ }));
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索测试" }), {
      target: { value: "打字速度" },
    });
    expect(container.querySelectorAll(".catalog-core-card")).toHaveLength(0);
    expect(container.querySelectorAll("#more-tests .catalog-item")).toHaveLength(1);
    const input = screen.getByRole("searchbox", { name: "搜索测试" });
    for (const keyword of [
      "mBtI",
      "ＭＢＴＩ",
      "MBTI性格",
      "big five",
      "RIASEC",
    ]) {
      fireEvent.change(input, { target: { value: keyword } });
      expect(
        container.querySelectorAll(".catalog-core-card").length,
      ).toBeGreaterThan(0);
    }
    fireEvent.click(within(container.querySelector(".catalog-category-bar") as HTMLElement).getByRole("button", { name: /^幻想与故事/ }));
    fireEvent.change(input, { target: { value: "打 字 速 度" } });
    expect(container.querySelectorAll("#more-tests .catalog-item")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "打字速度测试" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "5 分钟以内" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("浏览测试")).not.toBeInTheDocument();
    expect(screen.queryByText("做测试之前")).not.toBeInTheDocument();
    expect(container.querySelectorAll("#interactive-stories [data-story-slug]")).toHaveLength(101);
    expect(container.querySelector('#interactive-stories [data-story-slug="global-history-quiz"]')).not.toBeNull();
  });
});
