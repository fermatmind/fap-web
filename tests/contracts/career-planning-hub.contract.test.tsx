import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { careerPlanningExample } from "@/lib/career/planningExample";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const cms = vi.hoisted(() => ({ list: vi.fn(), detail: vi.fn() }));
vi.mock("@/lib/cms/career-guides", () => ({
  listCareerGuidesFromCms: cms.list,
  getCareerGuideFromCmsBySlug: cms.detail,
}));
vi.mock("next/link", () => ({ default: ({ href, children, prefetch: _p, ...rest }: { href: string; children: ReactNode; prefetch?: boolean }) => { void _p; return <a href={href} {...rest}>{children}</a>; } }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/components/analytics/TrackedCareerLink", () => ({
  TrackedCareerLink: ({ href, children, eventPayload, className }: { href: string; children: ReactNode; eventPayload: { targetAction: string }; className?: string }) => <a href={href} className={className} data-action={eventPayload.targetAction}>{children}</a>,
}));

afterEach(() => vi.clearAllMocks());

const example = "## Worked example: compare, test, review\n\nSynthetic teaching case.\n\n[Actors](/en/career/jobs/actors) and [Film and Video Editors](/en/career/jobs/film-and-video-editors).\n\n### Review\nKeep testing.\n\n## Copy a decision record\nExcluded section.";

describe("career planning hub", () => {
  it("extracts only the published example and preserves Chinese subsection headings", () => {
    expect(careerPlanningExample(example, "en")).toContain("### Review");
    expect(careerPlanningExample(example, "en")).not.toContain("Excluded section");
    expect(careerPlanningExample("## 5.2 完整填写示例：演员与电影视频编辑\n\n事实与未知。\n### 下一步\n继续。\n## 6. 自检清单\n结束", "zh")).toBe("事实与未知。\n### 下一步\n继续。");
    expect(careerPlanningExample("## 5.2 完整填寫示例：演員與電影影片編輯\n\n已發布示例。\n## 6. 自檢清單\n結束", "zh-TW")).toBe("已發布示例。");
    expect(careerPlanningExample("## 5.2 完整填写示例：演员\n\n简中正文。", "zh-TW")).toBeNull();
    expect(careerPlanningExample("# Generic old template", "en")).toBeNull();
  });

  it("renders the Traditional hub with published guides, its worked example and safe links", async () => {
    const href = "/zh-TW/career/guides/how-to-find-right-career-direction";
    cms.list.mockResolvedValue([{ slug: "how-to-find-right-career-direction", title: "找方向", summary: "指南摘要", href, category: "career-planning" }]);
    cms.detail.mockResolvedValue({ bodyMd: "## 5.2 完整填寫示例：職涯比較\n\n繁體教學案例。\n## 6. 自檢清單\n範例外的內容。" });
    const route = await import("@/app/(traditional)/zh-TW/career/guides/page");
    const html = renderToStaticMarkup(await route.default());
    expect(cms.list).toHaveBeenCalledWith("zh-TW", expect.objectContaining({ fresh: true }));
    expect(cms.detail).toHaveBeenCalledWith("how-to-find-right-career-direction", "zh-TW");
    expect(html).toContain("繁體教學案例。");
    expect(html).not.toContain("範例外的內容。");
    expect(html).toContain(`href="${href}"`);
    expect(html).not.toContain('href="/zh-TW/career/guides/career-transition-playbook"');
    expect(html).toContain('href="/zh/holland-test/pdf-download"');
    expect(html).not.toContain('aria-label="頁面語言"');
    const metadata = await route.generateMetadata();
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toMatch(/\/zh-TW\/career\/guides$/u);
  });

  it.each(["zh", "en"])("keeps three starts, same-language next steps and the CMS example in %s", async (locale) => {
    cms.list.mockResolvedValue([{ slug: "how-to-find-right-career-direction", title: "Direction", summary: "Published summary", href: `/${locale}/career/guides/how-to-find-right-career-direction`, category: "career-planning" }]);
    cms.detail.mockResolvedValue({ bodyMd: locale === "en" ? example : "## 5.2 完整填写示例：职业比较\n\n公开合成案例。\n## 6. 自检清单\n隐藏。" });
    const { default: Page } = await import("@/app/(localized)/[locale]/career/guides/page");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale }) }));
    const dom = new DOMParser().parseFromString(html, "text/html");
    expect(dom.querySelectorAll("[data-action^='select_start_']")).toHaveLength(3);
    for (const target of ["#explore-work", "#worked-example", "#target-plan"]) expect(dom.querySelector(target)).not.toBeNull();
    for (const path of ["career/tests", "career/guides/how-to-find-right-career-direction", "career/guides/career-transition-playbook", "holland-test/pdf-download"]) {
      expect(dom.querySelector(`a[href='/${locale}/${path}']`)).not.toBeNull();
    }
    expect(dom.querySelector("#worked-example")?.textContent).toContain(locale === "en" ? "Synthetic teaching case" : "公开合成案例");
    expect(dom.querySelectorAll("h1")).toHaveLength(1);
    expect(dom.querySelector("#worked-example")?.querySelector("h2")?.textContent).not.toContain("Excluded");
    expect(cms.list).toHaveBeenCalledWith(locale, { fresh: true, throwOnUnavailable: true });
  });

  it("distinguishes an empty publication from an API failure without inventing a sample", async () => {
    const { default: Page } = await import("@/app/(localized)/[locale]/career/guides/page");
    cms.list.mockResolvedValue([]); cms.detail.mockResolvedValue(null);
    const empty = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale: "en" }) }));
    expect(empty).toContain("No guides are currently published");
    expect(empty).toContain("No complete example is currently published");
    expect(empty).not.toContain('href="/zh-TW/career/guides"');
    cms.list.mockRejectedValue(new Error("unavailable")); cms.detail.mockRejectedValue(new Error("unavailable"));
    const failed = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale: "en" }) }));
    expect(failed).toContain("The guide list is temporarily unavailable");
    expect(failed).toContain("The example is temporarily unavailable");
    expect(failed).not.toContain("Synthetic teaching case");
    expect(failed).not.toContain('href="/zh-TW/career/guides"');
  });

  it.each(["zh", "en"] as const)("adds one career-test entry to the shared desktop/mobile registry in %s", (locale) => {
    const menu = getHeaderDropdownMenus(locale).find((menu) => menu.key === "career");
    expect(menu?.items.filter((item) => item.href === "/career/tests")).toHaveLength(1);
    expect(new Set(menu?.items.map((item) => item.href)).size).toBe(menu?.items.length);
  });
});
