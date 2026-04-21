import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import type { CmsArticle } from "@/lib/cms/articles";
import type { HomePageContent } from "@/lib/marketing/homepageContent";

const homeCopy: HomePageContent = {
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
      { title: "MBTI 性格测试", description: "快速了解你的类型偏好与决策风格", href: "/tests/mbti-personality-test-16-personality-types", label: "开始测试", meta: "人格测试" },
      { title: "Big Five 大五人格测试", description: "从五个维度看清你的稳定特质", href: "/tests/big-five-personality-test-ocean-model", label: "开始测试", meta: "人格测试" },
      { title: "IQ 智商测试", description: "快速了解你的认知能力基线", href: "/tests/iq-test-intelligence-quotient-assessment/take", label: "开始测试", meta: "能力测评" },
      { title: "霍兰德职业兴趣测试", description: "先得到兴趣结构与职业方向判断", href: "/career/tests/riasec", label: "开始测试", meta: "职业兴趣" },
      { title: "九型人格测试", description: "从核心动机与压力反应理解你的行为模式", href: "/tests", label: "开始测试", meta: "人格测试" },
      { title: "抑郁焦虑综合症测试", description: "同时查看抑郁与焦虑两个维度，获得更完整的近期状态参考", href: "/tests/clinical-depression-anxiety-assessment-professional-edition", label: "开始测试", meta: "学术专业版" },
    ],
  },
  families: {
    kicker: "MORE PATHS",
    title: "继续探索，但不打断开始。",
    body: "次级入口保留为轻量路径，不再用大矩阵占据首页。",
    items: [
      { title: "全部测评", description: "查看当前可用的测评入口。", exploreLabel: "查看全部测评", exploreHref: "/tests", links: [{ title: "查看全部测评", href: "/tests" }] },
      { title: "职业探索", description: "把结果接回职业方向。", exploreLabel: "探索职业", exploreHref: "/career", links: [{ title: "探索职业", href: "/career" }] },
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
};

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

describe("homepage v1 density contract", () => {
  it("removes homepage version selection and heavy legacy surfaces", async () => {
    render(<HomePageExperience locale="zh" copy={homeCopy} />);

    const bodyText = document.body.textContent ?? "";

    for (const forbidden of ["93题", "144题", "90题", "120题", "93Q", "144Q", "90Q", "120Q", "选择版本"]) {
      expect(bodyText).not.toContain(forbidden);
    }

    expect(screen.queryByText("SBTI 人格测试")).not.toBeInTheDocument();
    expect(screen.queryByText("按领域继续浏览。")).not.toBeInTheDocument();
    expect(screen.queryByText("方法、边界与隐私，都放在明处。")).not.toBeInTheDocument();
  });

  it("does not import hero SBTI, form-version helpers, or heavy result preview in the homepage component", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).not.toContain("SbtiHeroEntryCard");
    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("listMbtiFormMetas");
    expect(source).not.toContain("listBig5FormMetas");
    expect(source).not.toContain("buildMbtiTakeHref");
    expect(source).not.toContain("buildBig5TakeHref");
  });

  it("keeps the requested banner skeletons without copying competitor assets", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("function HomepageHeroV1");
    expect(source).toContain("min-h-[34rem] overflow-hidden bg-orange-50");
    expect(source).toContain("rounded-[100%] bg-white");
    expect(source).toContain("function TrustCard");
    expect(source).toContain("relative z-20 bg-white pb-8 pt-10");
    expect(source).toContain("grid gap-6 md:grid-cols-3");
    expect(source).toContain("rounded-lg bg-white px-4 pb-4 pt-10 text-center shadow");
    expect(source).toContain("function HomepageSocialProofBanner");
    expect(source).toContain("SCENARIO_VALIDATIONS.slice(0, 5)");
    expect(source).toContain("EVIDENCE_LOGS.map");
    expect(source).toContain("function HomepageHighlightedTestsBanner");
    expect(source).toContain("relative overflow-hidden bg-teal-800 py-20 text-white md:py-24");
    expect(source).toContain("mx-auto max-w-2xl text-center");
    expect(source).toContain("mt-10 grid gap-x-6 gap-y-9 md:grid-cols-2 lg:grid-cols-3");
    expect(source).toContain("function HomepageAboutBanner");
    expect(source).toContain("bg-orange-500 px-6 py-16 text-center text-white");
    expect(source).toContain("function HomepageArticlesBanner");
    expect(source).not.toContain("listBlogPosts(locale)");
    expect(source).toContain("type HomeArticle = CmsArticle");
    expect(source).toContain("function ArticleVisual");
    expect(source).toContain("bg-gradient-to-br");

    expect(source).not.toContain("py-16 text-slate-950 md:py-24");
    expect(source).not.toContain("HeroLandingIllustration");
    expect(source).not.toContain("HeroResultStructurePanel");
    expect(source).not.toContain("LIVE_COMPLETED_COUNT");
    expect(source).not.toContain("bg-slate-50 py-16 md:py-20");
    expect(source).not.toContain("bg-slate-50 py-12 md:py-16");
    expect(source).not.toContain("rounded-full border border-slate-200 bg-white px-4 py-2");
    expect(source).not.toContain("rounded-3xl border border-slate-200 bg-white px-5 py-4");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white/70");
    expect(source).not.toContain("rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-10");
    expect(source).not.toContain("123test");
    expect(source).not.toContain("truity");
  });

  it("keeps the homepage banner order without restoring heavy surfaces", () => {
    const source = read("components/marketing/HomePageExperience.tsx");
    const order = [
      "HomepageHeroV1 copy={copy}",
      "HomepageTrustStripV1 copy={copy}",
      "HomepageSocialProofBanner locale={locale}",
      "HomepageHighlightedTestsBanner locale={locale} copy={copy}",
      "HomepageAboutBanner locale={locale} copy={copy}",
      "HomepageArticlesBanner locale={locale} articles={articles}",
    ];

    for (let index = 1; index < order.length; index += 1) {
      expect(source.indexOf(order[index - 1])).toBeLessThan(source.indexOf(order[index]));
    }

    expect(source).not.toContain("Accordion");
    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("SbtiHeroEntryCard");
  });

  it("renders secondary paths, about cards, and CMS-driven article grid", async () => {
    const articles: CmsArticle[] = [
      {
        id: 1,
        slug: "how-personality-shapes-attitude-toward-ai",
        locale: "zh-CN",
        title: "你的性格如何塑造你对人工智能的态度？",
        excerpt: "一篇 CMS 文章摘要",
        contentMd: "",
        contentHtml: "",
        authorName: "Fermat Institute",
        reviewerName: null,
        readingMinutes: 3,
        coverImageUrl: null,
        coverImageAlt: null,
        coverImageWidth: null,
        coverImageHeight: null,
        coverImageVariants: {
          hero: null,
          card: null,
          thumbnail: null,
          square: null,
          og: null,
          preload: null,
        },
        relatedTestSlug: null,
        voice: null,
        voiceOrder: null,
        status: "published",
        isPublic: true,
        isIndexable: true,
        publishedAt: "2026-04-18",
        scheduledAt: null,
        createdAt: "2026-04-18",
        updatedAt: "2026-04-18",
        category: { id: 1, slug: "mbti", name: "MBTI" },
        tags: [],
        seoMeta: null,
        landingSurface: null,
        answerSurface: null,
      },
    ];

    render(<HomePageExperience locale="zh" copy={homeCopy} articles={articles} />);

    expect(
      screen.getAllByRole("link", { name: /开始测试/ }).some((link) => link.getAttribute("href") === "/zh/tests")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /继续了解/ }).some((link) => link.getAttribute("href") === "/zh/career")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /继续了解/ }).some((link) => link.getAttribute("href") === "/zh/help")
    ).toBe(true);

    expect(screen.getByRole("heading", { level: 2, name: "使用场景与引用" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "关于 费马测试" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "推荐阅读" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /你的性格如何塑造你对人工智能的态度？/ })).toHaveAttribute(
      "href",
      "/zh/articles/how-personality-shapes-attitude-toward-ai"
    );
    expect(screen.getByRole("link", { name: /查看全部文章/ })).toHaveAttribute("href", "/zh/articles");
  });
});
