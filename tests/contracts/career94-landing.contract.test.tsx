import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FreeAssessmentLanding, freeAssessmentMetadata } from "@/components/tests/FreeAssessmentLanding";
import { isValidElement, type ReactElement } from "react";
import type { Entry } from "@/components/tests/trio/TrioLandingInteractions";
import { trackEvent } from "@/lib/analytics";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("Career94 landing page", () => {
  it("keeps the mainland entry routes, click attribution and visible FAQ consistent with structured data", () => {
    const locale = "zh";
    const { container } = render(<FreeAssessmentLanding assessment="career" locale={locale} />);
    const takeLocale = locale;
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const start = screen.getByTestId("free-assessment-start");
    const closing = screen.getByTestId("free-assessment-start-closing");
    const mid = screen.getByTestId("free-assessment-start-mid");
    expect(mid).toHaveTextContent("免费开始 94 题测试");
    for (const entry of [start, mid, closing]) {
      expect(entry).toHaveAttribute("href", `/${takeLocale}/career/assessment/take`);
      entry.addEventListener("click", event => event.preventDefault());
      fireEvent.click(entry);
      expect(trackEvent).toHaveBeenLastCalledWith("start_click", {});
    }
    const sampleLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>(`main a[href="/${takeLocale}/reports/samples/career94"]`));
    expect(sampleLinks).toHaveLength(1);
    const structuredFaq = JSON.parse(container.querySelector<HTMLScriptElement>("#free-assessment-faq")!.textContent!);
    const visibleFaq = Array.from(container.querySelectorAll("#assessment-faq details"));
    expect(visibleFaq).toHaveLength(8);
    expect(visibleFaq.map(detail => detail.hasAttribute("open"))).toEqual([true, true, true, false, false, false, false, false]);
    expect(visibleFaq[6].querySelector("summary")?.textContent).toBe("职业测试准不准？结果会随时间变化吗？");
    expect(visibleFaq[7].querySelector("summary")?.textContent).toBe("免注册测试后结果怎么保存？中途退出或隐私怎么处理？");
    expect(visibleFaq[7].querySelector("p")).toHaveTextContent(/同一标签页切回或刷新.*专属结果页.*个人作答不会公开展示/);
    expect(visibleFaq[1].querySelector("p")).toHaveTextContent(/不绑手机号.*无自动续费.*¥2.99.*实时标价/);
    expect(structuredFaq.mainEntity).toHaveLength(visibleFaq.length);
    structuredFaq.mainEntity.forEach((entry: { name: string; acceptedAnswer: { text: string } }, index: number) => {
      expect(visibleFaq[index].querySelector("summary")?.textContent).toBe(entry.name);
      expect(visibleFaq[index].querySelector("p")?.textContent).toBe(entry.acceptedAnswer.text);
    });
    const hero = container.querySelector("[data-career-hero]")!;
    expect(hero.textContent).not.toMatch(/付费|付費|解锁|解鎖|paid|unlock/i);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("免费职业测试：结合职业兴趣、工作方式与现实条件找方向");
    expect(container.querySelectorAll("[data-career-matrix] li")).toHaveLength(25);
    expect(container.querySelectorAll("#sample-comparison table a[href*='/career/jobs/']")).toHaveLength(2);
    expect(container.querySelector("main")).toHaveTextContent("轴分 = 25 × (有效作答平均值 - 1)");
    expect(container.querySelector("main")).toHaveTextContent("89.2857");
    expect(container.querySelector("main")).toHaveTextContent("81.2500");
  });

  it("gives each decision section a distinct action and keeps the matrix field names", () => {
    const { container } = render(<FreeAssessmentLanding assessment="career" locale="zh" />);
    const decision = container.querySelector<HTMLElement>("#sample-comparison")!;
    expect(decision).toHaveTextContent("MBTI 等性格测试");
    expect(decision).toHaveTextContent("候选只按活动兴趣筛选");
    expect(decision).toHaveTextContent("交卷后，三步核实方向");
    expect(decision).not.toHaveTextContent(/分钟|1 小时/);
    const matrix = container.querySelector<HTMLElement>('[aria-labelledby="career-matrix-title"]')!;
    expect(matrix).toHaveTextContent("没有对错");
    expect(matrix.querySelectorAll("[data-career-matrix] article p")).toHaveLength(8);
    expect(matrix.querySelectorAll("[data-career-matrix] li")).toHaveLength(25);
    const scenarios = container.querySelector<HTMLElement>('[aria-labelledby="career-scenario-title"]')!;
    expect(scenarios).toHaveTextContent("找第一份工作 / 纠结 Offer");
    expect(scenarios).not.toHaveTextContent(/分钟|1 小时/);
    expect(within(scenarios).getByRole("link", { name: "职业指南" })).toHaveAttribute("href", "/zh/career/guides");
  });

  it("keeps the free results and optional verification details in sync with every sample tab", () => {
    render(<FreeAssessmentLanding assessment="career" locale="zh" />);
    const presets = [
      {
        code: "IRC", label: "研创分析向", interest: "研究×现实", scores: [93, 82, 71],
        jobs: ["工业工程师", "运筹分析师"], remaining: "艺术 A 61 · 企业 E 46 · 社会 S 39",
        preferences: ["低任务切换", "高方法自由度", "看重工时可预期", "不接受固定夜班"],
      },
      {
        code: "ESC", label: "组织协作向", interest: "企业×社会", scores: [93, 86, 75],
        jobs: ["培训与发展经理", "人力资源经理"], remaining: "研究 I 57 · 艺术 A 46 · 现实 R 39",
        preferences: ["高频对外沟通", "多方协作推进", "看重清晰晋升路径", "可考虑频繁过夜出差"],
      },
      {
        code: "AIR", label: "设计造物向", interest: "艺术×研究", scores: [93, 86, 75],
        jobs: ["工业设计师", "平面设计师"], remaining: "企业 E 54 · 社会 S 46 · 常规 C 39",
        preferences: ["自主选择工作方法", "中等协作频率", "看重可见工作成效", "看重学习支持"],
      },
    ];

    expect(screen.getByRole("tab", { name: presets[0].label })).toHaveAttribute("aria-selected", "true");
    for (const { code, label, interest, scores, jobs, remaining, preferences } of presets) {
      const tab = screen.getByRole("tab", { name: label });
      fireEvent.click(tab);
      expect(tab).toHaveAttribute("aria-selected", "true");
      const panel = within(screen.getByRole("tabpanel", { name: label }));
      expect(panel.getByText(`兴趣底色：${interest}`)).toBeVisible();
      expect(panel.getByText("虚构示例")).toBeVisible();
      expect(panel.getByLabelText(`三字代码 ${code}`)).toHaveTextContent(code);

      const free = within(panel.getByRole("region", { name: "免费基础可见" }));
      const chart = within(free.getByRole("list", { name: "核心活动兴趣 Top 3，0–100" }));
      expect(chart.getAllByRole("listitem").map(row => row.getAttribute("data-code"))).toEqual([...code]);
      expect(chart.getAllByRole("listitem").map(row => row.querySelector("b")?.textContent)).toEqual(scores.map(String));
      for (const job of jobs) expect(free.getByText(job)).toBeVisible();
      expect(free.getByText(`其余三维：${remaining}`)).toBeVisible();

      const deep = within(panel.getByRole("region", { name: "深度报告展开（可选）" }));
      for (const preference of preferences) {
        expect(deep.getByText(preference)).toBeVisible();
        expect(free.queryByText(preference)).not.toBeInTheDocument();
      }
    }
    fireEvent.keyDown(screen.getByRole("tab", { name: "设计造物向" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "研创分析向" })).toHaveAttribute("aria-selected", "true");
  });

  it.each([
    {
      domain: "CI localhost fallback",
      siteUrl: undefined,
      homepage: "http://localhost:3000/",
      publisherId: "http://localhost:3000/#organization",
    },
    {
      domain: "production domain",
      siteUrl: "https://fermatmind.com",
      homepage: "https://fermatmind.com/",
      publisherId: "https://fermatmind.com/#organization",
    },
  ])("publishes the Career94 publisher schema for the $domain", async ({ siteUrl, homepage, publisherId }) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
    vi.resetModules();
    try {
      const { FreeAssessmentLanding: Landing } = await import("@/components/tests/FreeAssessmentLanding");
      const { container } = render(<Landing assessment="career" locale="zh" />);
      const readSchema = (id: string) => JSON.parse(container.querySelector<HTMLScriptElement>(`#${id}`)!.textContent!);
      expect(readSchema("career94-organization")).toMatchObject({
        url: homepage,
        "@id": publisherId,
      });
      expect(readSchema("free-assessment-page").publisher).toEqual({ "@id": publisherId });
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it("publishes the Career94 editorial provenance and publisher profile", () => {
    const { container } = render(<FreeAssessmentLanding assessment="career" locale="zh" />);
    const readSchema = (id: string) => JSON.parse(container.querySelector<HTMLScriptElement>(`#${id}`)!.textContent!);
    const organization = readSchema("career94-organization");
    expect(organization).toMatchObject({
      "@type": "Organization",
      name: "FermatMind / 费马测试",
      sameAs: ["https://x.com/fermatmind", "https://youtube.com/@fermatmind", "https://www.instagram.com/fermatmind"],
    });
    expect(readSchema("free-assessment-breadcrumb")["@type"]).toBe("BreadcrumbList");

    const editorial = container.querySelector("[data-career94-editorial]");
    expect(editorial).toHaveTextContent("题本 career_v1 · 评分 career_profile_v1");
    expect(editorial).toHaveTextContent("编制与审校：费马测试测评编辑部（FermatMind）");
    expect(editorial?.querySelector("time")).toHaveAttribute("datetime", "2026-11");
    expect(Array.from(editorial?.querySelectorAll("a") ?? [], link => link.getAttribute("href"))).toEqual([
      "/zh/science", "/zh/reliability-validity", "/zh/item-design-notes",
    ]);
    expect(screen.getByRole("link", { name: "职业指南" })).toHaveAttribute("href", "/zh/career/guides");
  });

  it("preserves canonical and cross-language metadata", () => {
    expect(freeAssessmentMetadata("career", "zh").title).toEqual({ absolute: "免费职业测试：职业兴趣与工作偏好测评（94题）｜费马测试" });
    for (const locale of ["zh", "en", "zh-TW"] as const) {
      const metadata = freeAssessmentMetadata("career", locale);
      expect(metadata.alternates?.canonical).toContain(`/${locale}/tests/career-planning-and-work-style-test`);
      expect(metadata.alternates?.languages).toMatchObject({
        en: expect.stringContaining("/en/tests/career-planning-and-work-style-test"),
        "zh-CN": expect.stringContaining("/zh/tests/career-planning-and-work-style-test"),
        "zh-TW": expect.stringContaining("/zh-TW/tests/career-planning-and-work-style-test"),
      });
    }
  });

  it.each(["en", "zh-TW"] as const)("keeps the correct Career94 and sole Jung form in %s", locale => {
    const takeLocale = locale === "zh-TW" ? "zh" : locale;
    for (const [assessment, expected] of [
      ["career", "/career/assessment/take"],
      ["jung", "/tests/jung-archetypes/take"],
    ] as const) {
      const landing = FreeAssessmentLanding({assessment, locale});
      const child: unknown = landing.props.children;
      expect(isValidElement(child)).toBe(true);
      const {entries, entryNote} = (child as ReactElement<{entries: Entry[]; entryNote?: string}>).props;
      expect(entries.map(entry => entry.href)).toEqual([`/${takeLocale}${expected}`]);
      if (locale === "zh-TW") expect(entryNote).toContain("簡體中文");
    }
  });
});
