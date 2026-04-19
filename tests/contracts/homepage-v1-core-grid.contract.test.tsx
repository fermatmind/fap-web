import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { getHomePageContent } from "@/lib/marketing/homepageContent";

const homePayload = vi.hoisted(() => ({
  hero: {
    eyebrow: "FermatMind / 费马测试",
    brand: "FermatMind / 费马测试",
    title: "看清自己，走好每一步",
    subhead: "费马测试把自我认知、职业探索与能力成长，做成可测量、可训练、可复盘的成长系统。",
    body: "先从最常用的测评入口开始，再把结果用于学习、协作和职业判断。",
    primaryCta: "开始测评",
    primaryHref: "/tests/mbti-personality-test-16-personality-types",
    secondaryCta: "了解产品体系",
    secondaryHref: "/about",
    tertiaryCta: "去职业探索",
    tertiaryHref: "/career",
    trustRail: ["结果结构清晰", "方法边界透明", "可匿名开始"],
  },
  quickStart: {
    kicker: "CORE TESTS",
    title: "从一个清楚的问题开始。",
    body: "保留最常用的六个入口，题量与版本选择放到对应测试页。",
    items: [
      {
        title: "MBTI 性格测试",
        description: "快速了解你的类型偏好与决策风格",
        href: "/tests/mbti-personality-test-16-personality-types",
        label: "开始测试",
        meta: "人格测试",
      },
      {
        title: "Big Five 大五人格测试",
        description: "从五个维度看清你的稳定特质",
        href: "/tests/big-five-personality-test-ocean-model",
        label: "开始测试",
        meta: "人格测试",
      },
      {
        title: "九型人格测试",
        description: "从核心动机与压力反应理解你的行为模式",
        href: "/tests",
        label: "开始测试",
        meta: "人格测试",
      },
      {
        title: "霍兰德职业兴趣测试",
        description: "先得到兴趣结构与职业方向判断",
        href: "/career/tests/riasec",
        label: "开始测试",
        meta: "职业兴趣",
      },
      {
        title: "IQ 智商测试",
        description: "快速了解你的认知能力基线",
        href: "/tests/iq-test-intelligence-quotient-assessment",
        label: "开始测试",
        meta: "能力测评",
      },
      {
        title: "抑郁焦虑综合症测试",
        description: "同时查看抑郁与焦虑两个维度，获得更完整的近期状态参考",
        href: "/tests/clinical-depression-anxiety-assessment-professional-edition",
        label: "开始测试",
        meta: "学术专业版",
      },
    ],
  },
  families: {
    kicker: "MORE PATHS",
    title: "继续探索，但不打断开始。",
    body: "次级入口保留为轻量路径，不再用大矩阵占据首页。",
    items: [
      {
        title: "全部测评",
        description: "查看当前可用的测评入口。",
        exploreLabel: "查看全部测评",
        exploreHref: "/tests",
        links: [{ title: "查看全部测评", href: "/tests" }],
      },
      {
        title: "职业探索",
        description: "把结果接回职业方向。",
        exploreLabel: "探索职业",
        exploreHref: "/career",
        links: [{ title: "探索职业", href: "/career" }],
      },
    ],
  },
  results: {
    kicker: "RESULT PROMISE",
    title: "拿到的不只是一个标签。",
    body: "结果页把类型、差异和下一步建议放在一起。",
    exampleLabel: "查看结果示例",
    exampleHref: "/personality",
    previews: [],
  },
  trust: {
    kicker: "TRUST",
    title: "先开始，需要时再深入。",
    body: "首页只保留必要信任信息。",
    methodHref: "/about",
    methodLabel: "查看方法与隐私",
    items: [
      { title: "免费可靠", summary: "围绕自我认知、职业判断和能力成长。", paragraphs: [] },
      { title: "重视隐私", summary: "可以先匿名开始，再决定是否保存。", paragraphs: [] },
      { title: "边界透明", summary: "方法和限制放在明处。", paragraphs: [] },
    ],
  },
  secondaryExplore: { kicker: "EXPLORE", title: "继续探索", items: [] },
  header: { testsLabel: "测试", testsTitle: "测试", testsBody: "", browseAllLabel: "全部测试", browseAllHref: "/tests", groups: [] },
  footer: { groups: [], supportEmailLabel: "联系", tailnote: "" },
  seo: {
    title: "费马测试",
    description: "费马测试首页",
    quickStartListTitle: "费马测试首页核心测评入口",
    quickStartListDescription: "首页核心测评入口，包括 MBTI、大五人格、IQ、霍兰德职业兴趣、九型人格与抑郁焦虑综合症测试。",
    familyListTitle: "更多路径",
    familyListDescription: "更多路径",
    organizationDescription: "费马测试",
  },
}));

vi.mock("@/lib/cms/landing-surfaces", () => ({
  getCmsLandingSurface: async () => ({ payloadJson: homePayload }),
}));

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
    title: "霍兰德职业兴趣测试",
    copy: "先得到兴趣结构与职业方向判断",
    meta: "职业兴趣",
    href: "/zh/career/tests/riasec",
  },
  {
    title: "九型人格测试",
    copy: "从核心动机与压力反应理解你的行为模式",
    meta: "人格测试",
    href: "/zh/tests",
  },
  {
    title: "抑郁焦虑综合症测试",
    copy: "同时查看抑郁与焦虑两个维度，获得更完整的近期状态参考",
    meta: "学术专业版",
    href: "/zh/tests/clinical-depression-anxiety-assessment-professional-edition",
  },
];

describe("homepage v1 core grid contract", () => {
  it("renders exactly six core test cards with four fields each", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);
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

  it("keeps the core grid in a three-column desktop layout contract", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    const gridHeading = screen.getByRole("heading", { level: 2, name: "从一个清楚的问题开始。" });
    const section = gridHeading.closest("section");

    expect(section?.innerHTML).toContain("lg:grid-cols-3");
    expect(section?.innerHTML).not.toContain("lg:grid-cols-6");
  });
});
