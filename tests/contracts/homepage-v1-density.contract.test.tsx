import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
      { title: "MBTI 性格测试", description: "快速了解你的类型偏好与决策风格", href: "/tests/mbti-personality-test-16-personality-types", label: "开始测试", meta: "人格测试" },
      { title: "Big Five 大五人格测试", description: "从五个维度看清你的稳定特质", href: "/tests/big-five-personality-test-ocean-model", label: "开始测试", meta: "人格测试" },
      { title: "IQ 智商测试", description: "快速了解你的认知能力基线", href: "/tests/iq-test-intelligence-quotient-assessment/take", label: "开始测试", meta: "能力测评" },
      { title: "霍兰德职业兴趣测试", description: "先得到兴趣结构与职业方向判断", href: "/tests/holland-career-interest-test-riasec", label: "开始测试", meta: "职业兴趣" },
      { title: "九型人格测试", description: "从核心动机与压力反应理解你的行为模式", href: "/tests", label: "开始测试", meta: "人格测试" },
      { title: "抑郁焦虑综合症测试", description: "同时查看抑郁与焦虑两个维度，获得更完整的近期状态参考", href: "/tests/clinical-depression-anxiety-assessment-professional-edition", label: "开始测试", meta: "学术专业版" },
    ],
  },
  families: {
    kicker: "MORE PATHS",
    title: "关于 费马团队",
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

class MockProbeImage {
  complete = false;
  naturalWidth = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(value: string) {
    queueMicrotask(() => {
      this.complete = true;
      this.naturalWidth = value.includes("missing-cover") || value.includes("broken") ? 0 : 800;

      if (this.naturalWidth > 0) {
        this.onload?.();
        return;
      }

      this.onerror?.();
    });
  }
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("homepage v1 density contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes homepage version selection and heavy legacy surfaces", async () => {
    render(<HomePageExperience locale="zh" copy={homeCopy} />);

    const bodyText = document.body.textContent ?? "";

    for (const forbidden of ["93题", "144题", "90题", "120题", "93Q", "144Q", "90Q", "120Q", "选择版本"]) {
      expect(bodyText).not.toContain(forbidden);
    }

    expect(screen.queryByText("按领域继续浏览。")).not.toBeInTheDocument();
    expect(screen.queryByText("方法、边界与隐私，都放在明处。")).not.toBeInTheDocument();
  });

  it("does not import form-version helpers or heavy result preview in the homepage component", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("listMbtiFormMetas");
    expect(source).not.toContain("listBig5FormMetas");
    expect(source).not.toContain("buildMbtiTakeHref");
    expect(source).not.toContain("buildBig5TakeHref");
  });

  it("keeps the requested banner skeletons without copying competitor assets", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("function HomepageHeroV1");
    expect(source).toContain("linear-gradient(112deg, #f7f8f5 0%, #faf8f1 54%, #f7f3fb 100%)");
    expect(source).toContain("const HOMEPAGE_HERO_ASSETS");
    expect(source).toContain("const HOMEPAGE_HERO_COPY");
    expect(source).toContain("heroCopy.primaryCta || copy.hero.primaryCta");
    expect(source).toContain("heroCopy.socialProofCount");
    expect(source).toContain("heroCopy.socialProof");
    expect(source).toContain('aria-label={heroCopy.title}');
    expect(source).toContain('aria-hidden="true"');
    expect(source).not.toContain("function HeroQuickStartPanel");
    expect(source).not.toContain("featuredTests.map");
    expect(source).not.toContain("copy.hero.secondaryCta");
    expect(source).not.toContain("copy.hero.tertiaryCta");
    expect(source).toContain("function HomepageHighlightedTestsBanner");
    expect(source).toContain("function listCoreHomepageTests");
    expect(source).toContain("supplementalTests.map(homeLinkFromHubCard)");
    expect(source).toContain("if (items.length >= 6) break");
    expect(source).toContain("function HomepageFamilyMatrix");
    expect(source).toContain("function HomepageTrustStripV1");
    expect(source).toContain("function TrustIcon");
    expect(source).toContain("function TestFeatureCard");
    expect(source).toContain("function RecommendationStars");
    expect(source).toContain("containsUnverifiedSocialProofText");
    expect(source).toContain("fm-section-clean relative z-20 border-b border-[var(--fm-border-soft)] py-20 md:py-24");
    expect(source).toContain("grid gap-7 md:grid-cols-3");
    expect(source).toContain("rounded-md bg-white px-8 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.10)]");
    expect(source).not.toContain("function HomepageSocialProofBanner");
    expect(source).not.toContain("SCENARIO_VALIDATIONS.slice(0, 5)");
    expect(source).not.toContain("EVIDENCE_LOGS.map");
    expect(source).toContain("relative overflow-hidden bg-[var(--fm-bg-soft)] pb-20 pt-16");
    expect(source).toContain("relative z-10 -mt-12 grid gap-7 md:grid-cols-3");
    expect(source).toContain("flex min-h-[18rem] flex-col items-center rounded-md bg-white");
    expect(source).not.toContain("function HomepageAboutBanner");
    expect(source).toContain("function HomepageArticlesBanner");
    expect(source).not.toContain("listBlogPosts(locale)");
    expect(source).toContain("type HomeArticle = CmsArticle");
    expect(source).toContain("ArticleResponsiveImage");
    expect(source).toContain("function ArticleCoverVisual");
    expect(source).toContain("src={article.coverImageUrl ?? null}");
    expect(source).not.toContain("function ArticleVisual");
    expect(source).not.toContain("bg-gradient-to-br");

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
      "HomepageHeroV1 locale={locale} copy={copy}",
      "HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests}",
      "HomepageTrustStripV1 locale={locale} copy={copy}",
      "HomepageFamilyMatrix locale={locale} copy={copy}",
      "HomepageArticlesBanner locale={locale} articles={articles}",
    ];

    for (let index = 1; index < order.length; index += 1) {
      expect(source.indexOf(order[index - 1])).toBeLessThan(source.indexOf(order[index]));
    }

    expect(source).not.toContain("Accordion");
    expect(source).not.toContain("ResultsPreviewShowcase");
    expect(source).not.toContain("HomepageSocialProofBanner locale={locale}");
    expect(source).not.toContain("HomepageAboutBanner locale={locale}");
    expect(source).not.toContain("HomepageResultPreview locale={locale}");
    expect(source).not.toContain("HomepageSecondaryExplore locale={locale}");
  });

  it("renders priority paths, filters clinical entries, and keeps CMS-driven article grid", async () => {
    vi.stubGlobal("Image", MockProbeImage);

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
        publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
        readingMinutes: 3,
        coverImageUrl: "https://assets.fermatmind.com/storage/media-library/holland-career-interest-test-riasec-card.jpg",
        coverImageAlt: "抽象职业罗盘与六个方向节点",
        coverImageWidth: 1200,
        coverImageHeight: 675,
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
        publishedRevisionId: 1,
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
      screen
        .getAllByRole("link", { name: "免费测试" })
        .some((link) => link.getAttribute("href") === "/zh/tests/mbti-personality-test-16-personality-types")
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: /开始测试/ }).some((link) => link.getAttribute("href") === "/zh/tests")
    ).toBe(true);
    expect(screen.getByRole("link", { name: "了解团队" })).toHaveAttribute("href", "/zh/about");
    expect(screen.getByRole("link", { name: "查看公共利益" })).toHaveAttribute("href", "/zh/foundation");
    expect(document.body.textContent ?? "").not.toContain("抑郁焦虑综合症测试");
    expect(document.body.innerHTML).not.toContain("clinical-depression-anxiety-assessment-professional-edition");

    expect(screen.queryByRole("heading", { level: 2, name: "使用场景与引用" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "关于 费马测试" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "热门测评" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "百万人测试" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "关于 费马团队" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "推荐阅读" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /你的性格如何塑造你对人工智能的态度？/ })).toHaveAttribute(
      "href",
      "/zh/articles/how-personality-shapes-attitude-toward-ai"
    );
    await waitFor(() => {
      const renderedCovers = Array.from(document.querySelectorAll('[data-cms-image-rendered="background"]'));

      expect(
        renderedCovers.some((cover) =>
          cover.getAttribute("style")?.includes("holland-career-interest-test-riasec-card.jpg")
        )
      ).toBe(true);
    });
    expect(screen.queryByRole("img", { name: "抽象职业罗盘与六个方向节点" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看全部文章/ })).toHaveAttribute("href", "/zh/articles");
  });
});
