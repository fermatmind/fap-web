import type { CmsLandingSurface } from "@/lib/cms/landing-surfaces";
import type { LastKnownGoodResult } from "@/lib/cms/last-known-good";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import type { HubTestCardItem, TestsHubContent } from "@/lib/marketing/testsHubContent";
import type { Locale } from "@/lib/i18n/locales";

const homeZh: HomePageContent = {
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
        title: "IQ 智商测试",
        description: "快速了解你的认知能力基线",
        href: "/tests/iq-test-intelligence-quotient-assessment/take",
        label: "开始测试",
        meta: "能力测评",
      },
      {
        title: "霍兰德职业兴趣测试",
        description: "先得到兴趣结构与职业方向判断",
        href: "/career/tests/riasec",
        label: "开始测试",
        meta: "职业兴趣",
      },
      {
        title: "九型人格测试",
        description: "从核心动机与压力反应理解你的行为模式",
        href: "/tests",
        label: "开始测试",
        meta: "人格测试",
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
    kicker: "EXPLORE",
    title: "按领域继续浏览。",
    body: "从测评、职业和方法说明继续探索。",
    items: [
      {
        title: "全部测评",
        description: "浏览全部测评入口。",
        exploreLabel: "继续了解",
        exploreHref: "/tests",
        links: [],
      },
      {
        title: "职业探索",
        description: "把结果接回职业方向判断。",
        exploreLabel: "继续了解",
        exploreHref: "/career",
        links: [],
      },
    ],
  },
  results: {
    kicker: "RESULTS",
    title: "结果可复用",
    body: "结果适合用于复盘、协作和下一步选择。",
    exampleLabel: "查看示例",
    exampleHref: "/personality",
    previews: [],
  },
  trust: {
    kicker: "TRUST",
    title: "方法、边界与隐私",
    body: "方法、边界与隐私，都放在明处。",
    methodHref: "/help/about",
    methodLabel: "查看方法与隐私",
    items: [
      { title: "结果结构清晰", summary: "结果更适合组织讨论。", paragraphs: [] },
      { title: "方法边界透明", summary: "说明适用边界和不适用场景。", paragraphs: [] },
      { title: "可匿名开始", summary: "可以先匿名完成测评。", paragraphs: [] },
    ],
  },
  secondaryExplore: {
    kicker: "MORE",
    title: "继续探索",
    items: [],
  },
  header: {
    testsLabel: "测评",
    testsTitle: "测评入口",
    testsBody: "选择一个入口开始。",
    browseAllLabel: "全部测评",
    browseAllHref: "/tests",
    groups: [],
  },
  footer: {
    groups: [],
    supportEmailLabel: "支持",
    tailnote: "See the Micro. Lead the Macro.",
  },
  seo: {
    title: "FermatMind / 费马测试",
    description: "费马测试提供结构化测评结果。",
    quickStartListTitle: "核心测评入口",
    quickStartListDescription: "核心测评入口列表。",
    familyListTitle: "探索路径",
    familyListDescription: "测评和职业探索路径。",
    organizationDescription: "费马测试提供结构化测评结果。",
  },
};

const homeEn: HomePageContent = {
  ...homeZh,
  hero: {
    ...homeZh.hero,
    brand: "FermatMind",
    title: "See yourself clearly, then choose the next step",
    subhead: "FermatMind turns assessment results into reusable structures for self-understanding, career direction, and growth.",
  },
  seo: {
    ...homeZh.seo,
    title: "FermatMind",
    description: "FermatMind provides structured assessment results.",
  },
};

function testCard(key: string, title: string): HubTestCardItem {
  return {
    key,
    title,
    description: `${title} description`,
    questionsLabel: "10 题",
    durationLabel: "约 5 分钟",
    outputLabel: `${title} report`,
    href: `/zh/tests/${key}`,
    primaryLabel: "开始测试",
    detailsHref: `/zh/tests/${key}`,
    secondaryLabel: "查看详情",
    previewVariant: "summary",
  };
}

const testsHubZh: TestsHubContent = {
  seo: {
    title: "测评入口中心",
    description: "按问题或分类进入 FermatMind 测评入口。",
  },
  hero: {
    eyebrow: "测评入口",
    title: "从一个更清晰的问题开始，找到适合你的测评。",
    body: "精选测评入口。",
    primaryLabel: "开始选择",
    primaryHref: "#tests-quick-start",
    secondaryLabel: "浏览全部测评",
    secondaryHref: "#tests-families",
    previewLabel: "选择预览",
    previewTitle: "先定问题，再进入测评。",
    previewBody: "选择合适入口。",
    previewFlow: ["选择问题", "进入分类", "查看代表测试"],
    previewFamilies: ["人格与风格", "职业与方向"],
  },
  quickStart: {
    kicker: "Quick Start",
    title: "按你现在最在意的问题开始。",
    body: "先说清楚问题。",
    items: [
      {
        id: "emotion-state",
        title: "我现在的情绪或状态如何？",
        description: "如果你更关心近期波动与风险信号，先看状态类测试。",
        href: "/zh/tests#family-emotion-state",
        ctaLabel: "查看状态类测试",
        scent: ["抑郁焦虑综合症"],
      },
    ],
  },
  families: {
    kicker: "Test Families",
    title: "按方向继续。",
    body: "选择一个方向。",
    items: [
      {
        id: "family-personality-style",
        title: "人格与风格",
        description: "人格入口。",
        exploreHref: "/zh/tests/category/personality",
        exploreLabel: "查看人格入口",
        representativeLabels: ["MBTI", "Big Five"],
        tests: [
          testCard("mbti-personality-test-16-personality-types", "MBTI 性格测试"),
          testCard("big-five-personality-test-ocean-model", "Big Five 大五人格测试"),
          testCard("enneagram-personality-test", "九型人格测试"),
        ],
      },
      {
        id: "family-career-direction",
        title: "职业与方向",
        description: "职业入口。",
        exploreHref: "/zh/tests/category/career",
        exploreLabel: "查看职业入口",
        representativeLabels: ["RIASEC"],
        tests: [
          testCard("eq-test-emotional-intelligence-assessment", "EQ 情商测试"),
          testCard("iq-test-intelligence-quotient-assessment", "IQ 智商测试"),
          testCard("career-riasec", "霍兰德职业兴趣测试"),
        ],
      },
      {
        id: "family-emotion-state",
        title: "情绪与状态",
        description: "近期情绪状态参考。",
        exploreHref: "/zh/tests#family-emotion-state",
        exploreLabel: "查看状态类测试",
        representativeLabels: ["抑郁症标准版", "抑郁焦虑综合症"],
        tests: [
          testCard("depression-screening-test-standard-edition", "抑郁症标准版测试"),
          testCard("clinical-depression-anxiety-assessment-professional-edition", "抑郁焦虑综合症测试"),
        ],
      },
    ],
  },
  howToChoose: {
    kicker: "How to Choose",
    title: "先判断问题。",
    body: "选择规则。",
    items: [],
  },
  trust: {
    title: "方法、边界与隐私",
    items: [],
  },
  resources: {
    kicker: "Related Resources",
    title: "相关阅读",
    body: "补充内容。",
    items: [],
    allHref: "/zh/articles",
    allLabel: "查看全部资源",
  },
  finalCta: {
    title: "开始选择",
    body: "先从问题开始。",
    primaryLabel: "开始选择",
    primaryHref: "#tests-quick-start",
    secondaryLabel: "查看人格入口",
    secondaryHref: "/zh/tests/category/personality",
  },
};

const testsHubEn: TestsHubContent = {
  ...testsHubZh,
  seo: {
    title: "Tests Hub",
    description: "Choose the right FermatMind assessment.",
  },
};

const payloads = {
  home: {
    zh: homeZh,
    en: homeEn,
  },
  tests: {
    zh: testsHubZh,
    en: testsHubEn,
  },
} as const;

export async function getMockCmsLandingSurface<TPayload>(
  surfaceKey: string,
  locale: Locale,
): Promise<CmsLandingSurface<TPayload>> {
  const normalizedLocale = locale === "zh" ? "zh" : "en";
  const payload = payloads[surfaceKey as keyof typeof payloads]?.[normalizedLocale];
  if (!payload) {
    throw new Error(`Missing mocked landing surface: ${surfaceKey}`);
  }

  return {
    surfaceKey,
    locale,
    title: null,
    description: null,
    schemaVersion: "test.v1",
    payloadJson: payload as TPayload,
    status: "published",
    isPublic: true,
    isIndexable: true,
    publishedAt: null,
    scheduledAt: null,
    pageBlocks: [],
  };
}

export async function getMockCmsLandingSurfaceWithLastKnownGood<TPayload>(
  surfaceKey: string,
  locale: Locale,
): Promise<LastKnownGoodResult<CmsLandingSurface<TPayload>>> {
  return {
    value: await getMockCmsLandingSurface<TPayload>(surfaceKey, locale),
    source: "fresh",
    stale: false,
    updatedAt: "2026-04-19T00:00:00.000Z",
    error: null,
  };
}
