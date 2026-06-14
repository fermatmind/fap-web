import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";

const homePayload = vi.hoisted(() => ({
  hero: {
    eyebrow: "FermatMind / 费马测试",
    brand: "FermatMind / 费马测试",
    title: "看清自己，走好每一步",
    subhead: "费马测试把自我认知、职业探索与能力成长，做成可测量、可训练、可复盘的成长系统。",
    body: "先从最常用的测评入口开始，再把结果用于学习、协作和职业判断。",
    primaryCta: "免费测试",
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
        href: "/tests/enneagram-personality-test-nine-types",
        label: "开始测试",
        meta: "人格测试",
      },
      {
        title: "霍兰德职业兴趣测试",
        description: "先得到兴趣结构与职业方向判断",
        href: "/tests/holland-career-interest-test-riasec",
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
        title: "情商测试",
        description: "看清情绪调节、沟通表达与关系协作中的关键能力",
        href: "/tests/eq-test-emotional-intelligence-assessment",
        label: "开始测试",
        meta: "情绪能力",
      },
    ],
  },
  families: {
    kicker: "MORE PATHS",
    title: "关于 费马团队",
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
    quickStartListDescription: "首页核心测评入口，包括 MBTI、大五人格、IQ、霍兰德职业兴趣、九型人格与情商测试。",
    familyListTitle: "更多路径",
    familyListDescription: "更多路径",
    organizationDescription: "费马测试",
  },
}));

vi.mock("@/lib/cms/landing-surfaces", () => ({
  getCmsLandingSurface: async () => ({ payloadJson: homePayload }),
  getCmsLandingSurfaceWithLastKnownGood: async () => ({
    value: { payloadJson: homePayload },
    source: "fresh",
    stale: false,
    updatedAt: "2026-04-19T00:00:00.000Z",
    error: null,
  }),
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
    copy: "想了解自己的性格吗？看看你的偏好、沟通方式和决策风格。 开始 MBTI 免费测试。",
    detail: "MBTI 性格测试帮助你理解日常选择、互动方式和团队协作中的偏好，适合作为自我了解和沟通参考。",
    href: "/zh/tests/mbti-personality-test-16-personality-types",
  },
  {
    title: "大五人格测试",
    copy: "想知道你的稳定特质吗？从五个维度了解你平时如何行动和反应。 开始大五人格免费测试。",
    detail: "大五人格测试围绕开放性、尽责性、外向性、宜人性和情绪稳定性，帮助你获得更连续的特质视角。",
    href: "/zh/tests/big-five-personality-test-ocean-model",
  },
  {
    title: "智商测试",
    accessibleTitle: "IQ 智商测试",
    copy: "想练习推理能力吗？完成视觉与数字题，获得一份清晰的原始分参考。 开始智商免费测试。",
    detail: "智商测试包含视觉和数字推理练习，适合在常模权威上线前作为能力训练与原始分参考。",
    href: "/zh/tests/iq-test-intelligence-quotient-assessment",
  },
  {
    title: "霍兰德职业兴趣测试",
    copy: "想知道什么工作更吸引你吗？看看你的兴趣类型和偏好的工作环境。 开始霍兰德职业兴趣免费测试。",
    detail: "霍兰德职业兴趣测试用 RIASEC 类型帮助你比较职业方向、学习选择和工作环境偏好。",
    href: "/zh/tests/holland-career-interest-test-riasec",
  },
  {
    title: "九型人格测试",
    copy: "你的核心动机是什么？看看压力、关系和成长中的常见反应模式。 开始九型人格免费测试。",
    detail: "九型人格测试帮助你从动机和行为模式理解自己，适合用于关系反思和个人成长参考。",
    href: "/zh/tests/enneagram-personality-test-nine-types",
  },
  {
    title: "情商测试",
    copy: "想了解情绪和关系能力吗？看看你在理解、表达和协作中的常见模式。 开始情商免费测试。",
    detail: "情商测试关注情绪识别、沟通表达和关系协作，帮助你获得更清晰的互动参考。",
    href: "/zh/tests/eq-test-emotional-intelligence-assessment",
  },
];

describe("homepage v1 core grid contract", () => {
  it("renders exactly six core test cards with four fields each", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);
    const gridHeading = screen.getByRole("heading", { level: 2, name: "热门测评" });
    const section = gridHeading.closest("section");

    for (const card of EXPECTED_ZH_CARDS) {
      const title = within(section as HTMLElement).getByRole("heading", { level: 3, name: card.accessibleTitle ?? card.title });
      const article = title.closest("article");
      const link = title.closest("a");

      expect(article).toBeTruthy();
      expect(link).toHaveAttribute("href", card.href);
      expect(link).toHaveTextContent(card.copy);
      expect(within(article as HTMLElement).getByText(card.detail)).toBeInTheDocument();
      expect(within(article as HTMLElement).getByLabelText("推荐指数 5 星")).toBeInTheDocument();
    }

    expect(within(section as HTMLElement).getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(section?.innerHTML).not.toContain("/take");
    for (const article of Array.from((section as HTMLElement).querySelectorAll("article"))) {
      expect(article.innerHTML).not.toContain('href="/zh/tests"');
    }
  });

  it("keeps the core grid in a three-column desktop layout contract", async () => {
    render(<HomePageExperience locale="zh" copy={await getHomePageContent("zh")} />);

    const gridHeading = screen.getByRole("heading", { level: 2, name: "热门测评" });
    const section = gridHeading.closest("section");

    expect(section?.innerHTML).toContain("xl:grid-cols-3");
    expect(section?.innerHTML).not.toContain("lg:grid-cols-6");
  });

  it("backfills missing homepage quick-start cards from the CMS tests hub", async () => {
    const copy = await getHomePageContent("zh");
    const supplementalTests: HubTestCardItem[] = [
      {
        key: "eq-test-emotional-intelligence-assessment",
        title: "情商测试",
        description: "看清情绪调节、沟通表达与关系协作中的关键能力",
        questionsLabel: "30 题",
        durationLabel: "约 8 分钟",
        outputLabel: "情绪能力",
        href: "/zh/tests/eq-test-emotional-intelligence-assessment",
        detailsHref: "/zh/tests/eq-test-emotional-intelligence-assessment",
        primaryLabel: "开始测试",
        previewVariant: "summary",
      },
    ];

    render(
      <HomePageExperience
        locale="zh"
        copy={{ ...copy, quickStart: { ...copy.quickStart, items: copy.quickStart.items.slice(0, 5) } }}
        supplementalTests={supplementalTests}
      />
    );
    const gridHeading = screen.getByRole("heading", { level: 2, name: "热门测评" });
    const section = gridHeading.closest("section");

    expect(within(section as HTMLElement).getAllByRole("heading", { level: 3 })).toHaveLength(6);
    const eqTitle = within(section as HTMLElement).getByRole("heading", { level: 3, name: "情商测试" });
    expect(eqTitle.closest("a")).toHaveAttribute("href", "/zh/tests/eq-test-emotional-intelligence-assessment");
    expect(section?.innerHTML).not.toContain("/zh/zh/tests");
  });
});
