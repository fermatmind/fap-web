import type { ReactNode } from "react";
import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";

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
    expect(source).not.toContain("clinical-depression-anxiety-assessment-professional-edition");
  });

  it("prioritizes MBTI, Big Five, and RIASEC while keeping clinical entries hidden", async () => {
    const content = await getTestsHubContent("zh");

    render(<TestsHubExperience locale="zh" content={content} />);

    const bodyText = document.body.textContent ?? "";
    const bodyHtml = document.body.innerHTML;
    const mbtiIndex = bodyText.indexOf("MBTI 性格测试");
    const bigFiveIndex = bodyText.indexOf("大五人格测试");
    const riasecIndex = bodyText.indexOf("霍兰德职业兴趣测试");
    const iqIndex = bodyText.indexOf("智商测试");

    expect(mbtiIndex).toBeGreaterThanOrEqual(0);
    expect(bigFiveIndex).toBeGreaterThan(mbtiIndex);
    expect(riasecIndex).toBeGreaterThan(bigFiveIndex);
    expect(iqIndex).toBeGreaterThan(riasecIndex);

    expect(screen.getAllByText("MBTI 性格测试").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/大五人格测试/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("霍兰德职业兴趣测试").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("link", { name: "开始测试" }).length).toBeGreaterThanOrEqual(3);

    expect(bodyText).not.toContain("抑郁");
    expect(bodyText).not.toContain("焦虑");
    expect(bodyText).not.toContain("情绪与状态");
    expect(bodyHtml).not.toContain("depression-screening-test-standard-edition");
    expect(bodyHtml).not.toContain("clinical-depression-anxiety-assessment-professional-edition");
  });
});
