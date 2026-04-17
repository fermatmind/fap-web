import type { Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type HomeLinkItem = {
  title: string;
  description?: string;
  href: string;
  label?: string;
  meta?: string;
};

type HomeFamily = {
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  links: HomeLinkItem[];
};

export type HomeResultPreview = {
  title: string;
  metrics: string[];
  tone: "traits" | "career" | "state";
};

type HomeTrustItem = {
  title: string;
  summary: string;
  paragraphs: string[];
  href?: string;
  hrefLabel?: string;
};

type HomeFooterGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

type HomeSecondaryLink = {
  title: string;
  description: string;
  href: string;
};

type HomeLocaleContent = {
  hero: {
    eyebrow: string;
    brand: string;
    title: string;
    subhead: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    tertiaryCta: string;
    tertiaryHref: string;
    trustRail: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HomeLinkItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: HomeFamily[];
  };
  results: {
    kicker: string;
    title: string;
    body: string;
    exampleLabel: string;
    exampleHref: string;
    previews: HomeResultPreview[];
  };
  trust: {
    kicker: string;
    title: string;
    body: string;
    methodHref: string;
    methodLabel: string;
    items: HomeTrustItem[];
  };
  secondaryExplore: {
    kicker: string;
    title: string;
    items: HomeSecondaryLink[];
  };
  header: {
    testsLabel: string;
    testsTitle: string;
    testsBody: string;
    browseAllLabel: string;
    browseAllHref: string;
    groups: Array<{ title: string; links: HomeLinkItem[] }>;
  };
  footer: {
    groups: HomeFooterGroup[];
    supportEmailLabel: string;
    tailnote: string;
  };
  seo: {
    title: string;
    description: string;
    quickStartListTitle: string;
    quickStartListDescription: string;
    familyListTitle: string;
    familyListDescription: string;
    organizationDescription: string;
  };
};

const HOME_PAGE_CONTENT: Record<Locale, HomeLocaleContent> = {
  zh: {
    hero: {
      eyebrow: "FermatMind / 费马测试",
      brand: "FermatMind / 费马测试",
      title: "先了解自己，再决定下一步。",
      subhead: "用一份简洁、可继续使用的测评结果，帮你看清人格、能力与职业方向。",
      body: "先从最常用的测评入口开始，再把结果用于学习、协作和职业判断。",
      primaryCta: "开始 MBTI 测试",
      primaryHref: "/tests/mbti-personality-test-16-personality-types",
      secondaryCta: "查看全部测评",
      secondaryHref: "/tests",
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
          title: "EQ 情商测试",
          description: "了解你在情绪识别与协作沟通中的表现",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "开始测试",
          meta: "情绪能力",
        },
        {
          title: "九型人格测试",
          description: "从核心动机与压力反应理解你的行为模式",
          href: "/tests",
          label: "开始测试",
          meta: "人格测试",
        },
        {
          title: "情绪状态自测",
          description: "快速了解你近期的情绪状态变化",
          href: "/tests",
          label: "开始测试",
          meta: "状态自测",
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
          description: "把测评结果放回职业方向判断。",
          exploreLabel: "去职业探索",
          exploreHref: "/career",
          links: [{ title: "去职业探索", href: "/career" }],
        },
        {
          title: "娱乐实验",
          description: "SBTI 与更多轻量实验从这里进入。",
          exploreLabel: "更多测试 / 娱乐实验",
          exploreHref: "/fun/sbti",
          links: [{ title: "更多测试 / 娱乐实验", href: "/fun/sbti" }],
        },
        {
          title: "数据方法",
          description: "查看方法、边界与隐私说明。",
          exploreLabel: "查看数据方法",
          exploreHref: "/help/about",
          links: [{ title: "查看数据方法", href: "/help/about" }],
        },
      ],
    },
    results: {
      kicker: "RESULT PROMISE",
      title: "你拿到的，不只是一个标签。",
      body: "结果会把类型、差异和下一步建议整理到同一页，方便你继续判断。",
      exampleLabel: "查看结果示例",
      exampleHref: "/personality",
      previews: [
        { title: "类型", metrics: ["类型偏好"], tone: "traits" },
        { title: "差异", metrics: ["关键差异"], tone: "career" },
        { title: "下一步", metrics: ["行动建议"], tone: "state" },
      ],
    },
    trust: {
      kicker: "TRUST",
      title: "先开始，再按需深入。",
      body: "首页只保留必要信任信息，详细方法与隐私说明后置。",
      methodHref: "/help/about",
      methodLabel: "查看方法与隐私",
      items: [
        {
          title: "结果结构清晰",
          summary: "先看结论，再看差异和下一步。",
          paragraphs: ["结果结构清晰"],
        },
        {
          title: "方法边界透明",
          summary: "测评用于判断辅助，不替代诊断或唯一答案。",
          paragraphs: ["方法边界透明"],
          href: "/help/about",
          hrefLabel: "查看方法说明",
        },
        {
          title: "可匿名开始",
          summary: "支持先完成测评，再决定是否继续保存或深入。",
          paragraphs: ["可匿名开始"],
          href: "/privacy",
          hrefLabel: "查看隐私政策",
        },
      ],
    },
    secondaryExplore: {
      kicker: "继续浏览",
      title: "需要更多入口时，再从这里继续。",
      items: [
        { title: "查看全部测评", description: "完整测评入口", href: "/tests" },
        { title: "去职业探索", description: "职业方向与路径", href: "/career" },
        { title: "更多测试 / 娱乐实验", description: "SBTI 与轻量实验", href: "/fun/sbti" },
        { title: "查看数据方法", description: "方法、边界与隐私", href: "/help/about" },
      ],
    },
    header: {
      testsLabel: "测评入口",
      testsTitle: "从一个测评开始。",
      testsBody: "人格、能力、情绪与职业方向都从这里进入。",
      browseAllLabel: "查看全部测评",
      browseAllHref: "/tests",
      groups: [
        {
          title: "核心测评",
          links: [
            { title: "MBTI", href: "/tests/mbti-personality-test-16-personality-types" },
            { title: "Big Five", href: "/tests/big-five-personality-test-ocean-model" },
            { title: "IQ", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "EQ", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
      ],
    },
    footer: {
      groups: [
        {
          title: "热门测评",
          links: [
            { label: "MBTI", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "Big Five", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "IQ", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { label: "EQ", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "支持与政策",
          links: [
            { label: "帮助中心", href: "/help" },
            { label: "隐私政策", href: "/privacy" },
            { label: "服务条款", href: "/terms" },
          ],
        },
      ],
      supportEmailLabel: "支持邮箱",
      tailnote: "识微，见远。See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind / 费马测试",
      description: "费马测试提供清晰、可继续使用的测评结果，帮助你看清人格、能力与职业方向。",
      quickStartListTitle: "费马测试首页核心测评入口",
      quickStartListDescription: "首页核心测评入口，包括 MBTI、大五人格、IQ、EQ、九型人格与情绪状态自测。",
      familyListTitle: "费马测试首页继续探索入口",
      familyListDescription: "首页轻量继续探索入口，包括全部测评、职业探索、娱乐实验与数据方法。",
      organizationDescription: "FermatMind / 费马测试提供用于自我理解、能力观察、职业方向与协作判断的结构化测评。",
    },
  },
  en: {
    hero: {
      eyebrow: "FermatMind",
      brand: "FermatMind",
      title: "Understand yourself before the next step.",
      subhead: "Start with a clear, reusable assessment result for personality, ability, and career direction.",
      body: "Begin with the most-used entry points, then use the result for learning, collaboration, and career judgment.",
      primaryCta: "Start MBTI test",
      primaryHref: "/tests/mbti-personality-test-16-personality-types",
      secondaryCta: "View all assessments",
      secondaryHref: "/tests",
      tertiaryCta: "Explore careers",
      tertiaryHref: "/career",
      trustRail: ["Clear result structure", "Transparent method boundaries", "Anonymous start available"],
    },
    quickStart: {
      kicker: "CORE TESTS",
      title: "Start from one clear question.",
      body: "Six common entry points stay visible. Question-count and version choices move to each test page.",
      items: [
        {
          title: "MBTI Personality Test",
          description: "Understand your type preference and decision style quickly.",
          href: "/tests/mbti-personality-test-16-personality-types",
          label: "Start test",
          meta: "Personality test",
        },
        {
          title: "Big Five Personality Test",
          description: "Read your stable traits across five dimensions.",
          href: "/tests/big-five-personality-test-ocean-model",
          label: "Start test",
          meta: "Personality test",
        },
        {
          title: "IQ Test",
          description: "Get a quick baseline for cognitive ability.",
          href: "/tests/iq-test-intelligence-quotient-assessment/take",
          label: "Start test",
          meta: "Ability assessment",
        },
        {
          title: "EQ Test",
          description: "Review emotional recognition and collaboration skills.",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "Start test",
          meta: "Emotional ability",
        },
        {
          title: "Enneagram Test",
          description: "Understand behavior patterns through motivation and stress response.",
          href: "/tests",
          label: "Start test",
          meta: "Personality test",
        },
        {
          title: "Emotional State Check",
          description: "Check recent changes in your emotional state.",
          href: "/tests",
          label: "Start test",
          meta: "State check",
        },
      ],
    },
    families: {
      kicker: "MORE PATHS",
      title: "Keep exploring without delaying the start.",
      body: "Secondary paths stay lightweight instead of taking over the homepage.",
      items: [
        {
          title: "All assessments",
          description: "See every available assessment entry.",
          exploreLabel: "View all assessments",
          exploreHref: "/tests",
          links: [{ title: "View all assessments", href: "/tests" }],
        },
        {
          title: "Career exploration",
          description: "Put results back into career direction.",
          exploreLabel: "Explore careers",
          exploreHref: "/career",
          links: [{ title: "Explore careers", href: "/career" }],
        },
        {
          title: "Fun experiments",
          description: "SBTI and lightweight experiments live here.",
          exploreLabel: "More tests / fun experiments",
          exploreHref: "/fun/sbti",
          links: [{ title: "More tests / fun experiments", href: "/fun/sbti" }],
        },
        {
          title: "Data method",
          description: "Read method, boundary, and privacy notes.",
          exploreLabel: "View data method",
          exploreHref: "/help/about",
          links: [{ title: "View data method", href: "/help/about" }],
        },
      ],
    },
    results: {
      kicker: "RESULT PROMISE",
      title: "What you get back is more than a label.",
      body: "The result brings type, differences, and next-step suggestions onto one page so you can keep judging clearly.",
      exampleLabel: "View result example",
      exampleHref: "/personality",
      previews: [
        { title: "Type", metrics: ["Type preference"], tone: "traits" },
        { title: "Differences", metrics: ["Key differences"], tone: "career" },
        { title: "Next step", metrics: ["Action guidance"], tone: "state" },
      ],
    },
    trust: {
      kicker: "TRUST",
      title: "Start first, go deeper when needed.",
      body: "The homepage keeps only essential trust information. Method and privacy details are one step away.",
      methodHref: "/help/about",
      methodLabel: "View method and privacy",
      items: [
        {
          title: "Clear result structure",
          summary: "Start from the conclusion, then read differences and next steps.",
          paragraphs: ["Clear result structure"],
        },
        {
          title: "Transparent method boundaries",
          summary: "Assessments support judgment. They do not replace diagnosis or promise one final answer.",
          paragraphs: ["Transparent method boundaries"],
          href: "/help/about",
          hrefLabel: "Read method notes",
        },
        {
          title: "Anonymous start available",
          summary: "You can complete the assessment first, then decide whether to save or go deeper.",
          paragraphs: ["Anonymous start available"],
          href: "/privacy",
          hrefLabel: "View privacy policy",
        },
      ],
    },
    secondaryExplore: {
      kicker: "Keep browsing",
      title: "Use these only when you need a different path.",
      items: [
        { title: "View all assessments", description: "Complete assessment entry", href: "/tests" },
        { title: "Explore careers", description: "Career direction and paths", href: "/career" },
        { title: "More tests / fun experiments", description: "SBTI and lightweight experiments", href: "/fun/sbti" },
        { title: "View data method", description: "Method, boundaries, and privacy", href: "/help/about" },
      ],
    },
    header: {
      testsLabel: "Assessments",
      testsTitle: "Start from one assessment.",
      testsBody: "Personality, ability, emotion, and career direction all begin here.",
      browseAllLabel: "View all assessments",
      browseAllHref: "/tests",
      groups: [
        {
          title: "Core assessments",
          links: [
            { title: "MBTI", href: "/tests/mbti-personality-test-16-personality-types" },
            { title: "Big Five", href: "/tests/big-five-personality-test-ocean-model" },
            { title: "IQ", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "EQ", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
      ],
    },
    footer: {
      groups: [
        {
          title: "Top assessments",
          links: [
            { label: "MBTI", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "Big Five", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "IQ", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { label: "EQ", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "Support and policy",
          links: [
            { label: "Help Center", href: "/help" },
            { label: "Privacy policy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ],
        },
      ],
      supportEmailLabel: "Support",
      tailnote: "See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind",
      description: "FermatMind provides clear, reusable assessment results for personality, ability, and career direction.",
      quickStartListTitle: "FermatMind core assessment entry points",
      quickStartListDescription: "Core homepage entry points including MBTI, Big Five, IQ, EQ, Enneagram, and emotional state check.",
      familyListTitle: "FermatMind lightweight exploration paths",
      familyListDescription: "Lightweight homepage paths for all assessments, career exploration, fun experiments, and data method notes.",
      organizationDescription: "FermatMind provides structured assessments for self-understanding, ability review, career direction, and collaboration judgment.",
    },
  },
};

export function getHomePageContent(locale: Locale) {
  const content = HOME_PAGE_CONTENT[locale];

  return {
    ...content,
    quickStart: {
      ...content.quickStart,
      items: filterVisiblePublicTestEntries(content.quickStart.items),
    },
    families: {
      ...content.families,
      items: content.families.items.map((family) => ({
        ...family,
        links: filterVisiblePublicTestEntries(family.links),
      })),
    },
    header: {
      ...content.header,
      groups: content.header.groups.map((group) => ({
        ...group,
        links: filterVisiblePublicTestEntries(group.links),
      })),
    },
    footer: {
      ...content.footer,
      groups: content.footer.groups.map((group) => ({
        ...group,
        links: filterVisiblePublicTestEntries(group.links),
      })),
    },
  };
}
