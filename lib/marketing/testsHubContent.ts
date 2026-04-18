import {
  getAllTests,
  getBlogPostBySlug,
  getCareerGuideBySlug,
  resolveTestTitleByLocale,
  type BlogPost,
  type CareerGuide,
  type TestListItem,
} from "@/lib/content";
import {
  buildBig5TakeHref,
  getBig5DurationSummary,
  getBig5QuestionSummary,
  getBig5VariantLabel,
  getBig5VariantSummary,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import {
  buildMbtiTakeHref,
  getMbtiDurationSummary,
  getMbtiQuestionSummary,
  getMbtiVariantLabel,
  getMbtiVariantSummary,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type TestsCategorySlug = "personality" | "career";

export type HubQuestionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  scent: string[];
};

export type HubTestCardItem = {
  key: string;
  title: string;
  description: string;
  questionsLabel: string;
  durationLabel: string;
  outputLabel: string;
  href: string;
  primaryActions?: Array<{
    href: string;
    label: string;
    meta?: string;
  }>;
  detailsHref?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  scientificBasis?: string;
  previewVariant: "summary" | "radar" | "bars" | "matrix";
};

export type TestFamilyItem = {
  id: string;
  title: string;
  description: string;
  exploreHref: string;
  exploreLabel: string;
  representativeLabels: string[];
  tests: HubTestCardItem[];
};

export type HowToChooseItem = {
  title: string;
  description: string;
};

export type TrustItem = {
  title: string;
  body: string;
};

export type ResourceItem = {
  key: string;
  typeLabel: string;
  title: string;
  description: string;
  href: string;
};

export type TestsHubContent = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    previewLabel: string;
    previewTitle: string;
    previewBody: string;
    previewFlow: string[];
    previewFamilies: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HubQuestionItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: TestFamilyItem[];
  };
  howToChoose: {
    kicker: string;
    title: string;
    body: string;
    items: HowToChooseItem[];
  };
  trust: {
    title: string;
    items: TrustItem[];
  };
  resources: {
    kicker: string;
    title: string;
    body: string;
    items: ResourceItem[];
    allHref: string;
    allLabel: string;
  };
  finalCta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export type CategoryContent = {
  slug: TestsCategorySlug;
  seo: {
    title: string;
    description: string;
  };
  breadcrumb: Array<{
    label: string;
    href?: string;
    path?: string;
  }>;
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  };
  featured: {
    kicker: string;
    title: string;
    body: string;
    items: HubTestCardItem[];
  };
  allTests: {
    kicker: string;
    title: string;
    body: string;
    items: HubTestCardItem[];
  };
  differences: {
    kicker: string;
    title: string;
    body: string;
    items: HowToChooseItem[];
  };
  resources: {
    kicker: string;
    title: string;
    body: string;
    items: ResourceItem[];
  };
  trust: {
    title: string;
    items: TrustItem[];
  };
  finalCta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
  };
};

type LocalizedCardOptions = {
  description: { zh: string; en: string };
  outputLabel: { zh: string; en: string };
  scientificBasis?: { zh: string; en: string };
  previewVariant: HubTestCardItem["previewVariant"];
  detailsPath?: string;
  hrefPath?: string;
  title?: { zh: string; en: string };
  questionsLabel?: { zh: string; en: string };
  durationLabel?: { zh: string; en: string };
};

function getTestMap() {
  return new Map(getAllTests().map((test) => [test.slug, test]));
}

function invariantTest(test: TestListItem | undefined, slug: string): TestListItem {
  if (!test) {
    throw new Error(`Missing test content for slug: ${slug}`);
  }
  return test;
}

function getLocalizedValue(locale: Locale, value: { zh: string; en: string }): string {
  return locale === "zh" ? value.zh : value.en;
}

function buildCardFromTest(
  locale: Locale,
  test: TestListItem,
  options: LocalizedCardOptions
): HubTestCardItem {
  const isMbti = test.slug === "mbti-personality-test-16-personality-types";
  const isBig5 = test.slug === "big-five-personality-test-ocean-model";
  const mbtiActions = isMbti
    ? listMbtiFormMetas().map((form) => ({
        href: buildMbtiTakeHref(test.slug, locale, form.formCode),
        label: getMbtiVariantLabel(form.formCode, locale),
        meta: getMbtiVariantSummary(form.formCode, locale),
      }))
    : undefined;
  const big5Actions = isBig5
    ? listBig5FormMetas().map((form) => ({
        href: buildBig5TakeHref(test.slug, locale, form.formCode),
        label: getBig5VariantLabel(form.formCode, locale),
        meta: getBig5VariantSummary(form.formCode, locale),
      }))
    : undefined;
  const fallbackHref = localizedPath(options.hrefPath ?? `/tests/${test.slug}/take`, locale);
  const fallbackPrimaryLabel = locale === "zh" ? "开始测试" : "Start test";
  const baseCard = {
    key: test.slug,
    title: options.title ? getLocalizedValue(locale, options.title) : resolveTestTitleByLocale(test, locale),
    description: getLocalizedValue(locale, options.description),
    questionsLabel:
      options.questionsLabel?.[locale] ??
      (isMbti
        ? getMbtiQuestionSummary(locale)
        : isBig5
        ? getBig5QuestionSummary(locale)
        : locale === "zh"
          ? `${test.questions_count} 题`
          : `${test.questions_count} questions`),
    durationLabel:
      options.durationLabel?.[locale] ??
      (isMbti
        ? getMbtiDurationSummary(locale)
        : isBig5
        ? getBig5DurationSummary(locale)
        : locale === "zh"
          ? `约 ${test.time_minutes} 分钟`
          : `${test.time_minutes} min`),
    outputLabel: getLocalizedValue(locale, options.outputLabel),
    detailsHref: localizedPath(options.detailsPath ?? `/tests/${test.slug}`, locale),
    secondaryLabel: locale === "zh" ? "查看详情" : "View details",
    scientificBasis: options.scientificBasis ? getLocalizedValue(locale, options.scientificBasis) : undefined,
    previewVariant: options.previewVariant,
  } satisfies Omit<HubTestCardItem, "href" | "primaryLabel" | "primaryActions">;

  if (mbtiActions) {
    return {
      ...baseCard,
      href: mbtiActions[0]?.href ?? fallbackHref,
      primaryActions: mbtiActions,
      primaryLabel: mbtiActions[0]?.label ?? fallbackPrimaryLabel,
    };
  }

  if (big5Actions) {
    return {
      ...baseCard,
      href: big5Actions[0]?.href ?? fallbackHref,
      primaryActions: big5Actions,
      primaryLabel: big5Actions[0]?.label ?? fallbackPrimaryLabel,
    };
  }

  return {
    ...baseCard,
    href: fallbackHref,
    primaryLabel: fallbackPrimaryLabel,
  };
}

function buildRiasecCard(locale: Locale, overrides?: Partial<LocalizedCardOptions>): HubTestCardItem {
  return {
    key: "career-riasec",
    title: locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)",
    description:
      overrides?.description
        ? getLocalizedValue(locale, overrides.description)
        : locale === "zh"
          ? "当你需要先判断职业兴趣方向、行业偏好与起步线索时。"
          : "When you need a first-pass read on interest patterns, role direction, and industry fit.",
    questionsLabel:
      overrides?.questionsLabel?.[locale] ?? (locale === "zh" ? "36 题" : "36 questions"),
    durationLabel:
      overrides?.durationLabel?.[locale] ?? (locale === "zh" ? "约 6-8 分钟" : "6-8 min"),
    outputLabel:
      overrides?.outputLabel
        ? getLocalizedValue(locale, overrides.outputLabel)
        : locale === "zh"
          ? "RIASEC 兴趣结构与主次代码"
          : "RIASEC profile and top interest codes",
    href: localizedPath("/career/tests/riasec", locale),
    detailsHref: localizedPath("/career/tests", locale),
    primaryLabel: locale === "zh" ? "开始测试" : "Start test",
    secondaryLabel: locale === "zh" ? "查看职业测试" : "View career tests",
    scientificBasis:
      overrides?.scientificBasis
        ? getLocalizedValue(locale, overrides.scientificBasis)
        : locale === "zh"
          ? "Based on Holland Code"
          : "Based on Holland Code",
    previewVariant: overrides?.previewVariant ?? "matrix",
  };
}

function toResourceItem(
  locale: Locale,
  source: BlogPost | CareerGuide | null,
  fallback: {
    key: string;
    typeLabel: { zh: string; en: string };
    title: { zh: string; en: string };
    description: { zh: string; en: string };
    href: string;
  }
): ResourceItem {
  return {
    key: fallback.key,
    typeLabel: getLocalizedValue(locale, fallback.typeLabel),
    title:
      typeof source?.title === "string" && source.title.trim().length > 0
        ? source.title
        : getLocalizedValue(locale, fallback.title),
    description:
      typeof source?.summary === "string" && source.summary.trim().length > 0
        ? source.summary
        : getLocalizedValue(locale, fallback.description),
    href: localizedPath(fallback.href, locale),
  };
}

function buildSharedTrust(locale: Locale): TrustItem[] {
  if (locale === "zh") {
    return [
      {
        title: "结果用于支持判断，不定义一个人",
        body: "报告更适合用来组织讨论、澄清倾向与形成下一步行动，而不是给人下结论。",
      },
      {
        title: "可匿名开始",
        body: "可以先从问题和测试版本开始，匿名完成后再决定是否继续留下更多信息。",
      },
      {
        title: "不替代医疗、法律或诊断意见",
        body: "情绪与状态类结果只作为结构化参考，不能替代专业诊疗、法律意见或高风险决策中的正式评估。",
      },
      {
        title: "结果可以被复盘，也可以被放进真实场景",
        body: "适合放进学习规划、职业讨论、合作磨合与阶段性复盘，而不是只看一次分数就结束。",
      },
    ];
  }

  return [
    {
      title: "Results support judgment. They do not define a person.",
      body: "Use reports to structure discussion, clarify tendencies, and decide the next move instead of treating them as final labels.",
    },
      {
        title: "You can start anonymously",
        body: "You can start from the question and the right test version first, then decide later whether to share more information.",
      },
    {
      title: "Not a substitute for medical, legal, or diagnostic advice",
      body: "State-oriented results are structured references, not formal diagnosis, treatment, or legal guidance.",
    },
    {
      title: "Results should be reviewed in context",
      body: "The strongest use cases are learning plans, career conversations, collaboration review, and recurring reflection.",
    },
  ];
}

function buildTestCards(locale: Locale) {
  const tests = getTestMap();
  const mbti = buildCardFromTest(locale, invariantTest(tests.get("mbti-personality-test-16-personality-types"), "mbti-personality-test-16-personality-types"), {
    description: {
      zh: "当你想先看整体人格风格、偏好模式与协作中的自然倾向时。",
      en: "When you want a quick read on personality style, preference patterns, and collaboration tendencies.",
    },
    outputLabel: {
      zh: "类型画像、偏好说明与场景化解释",
      en: "Type profile, preference map, and scenario interpretation",
    },
    scientificBasis: {
      zh: "Based on Jungian-inspired typology",
      en: "Based on Jungian-inspired typology",
    },
    previewVariant: "summary",
  });

  const bigFive = buildCardFromTest(locale, invariantTest(tests.get("big-five-personality-test-ocean-model"), "big-five-personality-test-ocean-model"), {
    description: {
      zh: "当你需要更稳定、维度化地理解自己在工作、压力与关系中的特质结构时。",
      en: "When you need a more dimensional view of how stable traits shape work, stress, and relationships.",
    },
    outputLabel: {
      zh: "五维特质分布、强弱项与应用建议",
      en: "Five-factor trait profile with strengths and application notes",
    },
    scientificBasis: {
      zh: "Based on Big Five",
      en: "Based on Big Five",
    },
    previewVariant: "radar",
  });

  const eq = buildCardFromTest(locale, invariantTest(tests.get("eq-test-emotional-intelligence-assessment"), "eq-test-emotional-intelligence-assessment"), {
    description: {
      zh: "当你想看情绪调节、沟通表达与关系协作中的关键能力环节时。",
      en: "When you want to review emotional regulation, communication, and collaboration skills.",
    },
    outputLabel: {
      zh: "情绪能力结构、沟通提示与成长方向",
      en: "Emotional skill profile, communication cues, and growth direction",
    },
    scientificBasis: {
      zh: "Based on EQ framework",
      en: "Based on EQ framework",
    },
    previewVariant: "bars",
  });

  const iq = buildCardFromTest(locale, invariantTest(tests.get("iq-test-intelligence-quotient-assessment"), "iq-test-intelligence-quotient-assessment"), {
    description: {
      zh: "当你想看推理表现、问题处理速度与认知优势线索时。",
      en: "When you want a read on reasoning performance, pattern recognition, and cognitive strengths.",
    },
    outputLabel: {
      zh: "能力基线、推理表现与后续参考",
      en: "Ability baseline, reasoning profile, and reference notes",
    },
    previewVariant: "matrix",
  });

  const depression = buildCardFromTest(locale, invariantTest(tests.get("depression-screening-test-standard-edition"), "depression-screening-test-standard-edition"), {
    description: {
      zh: "当你需要快速了解近期情绪低落、兴趣下降与状态波动是否值得进一步关注时。",
      en: "When you need a quick signal on recent low mood, loss of interest, or state changes worth tracking.",
    },
    outputLabel: {
      zh: "近期抑郁状态筛查参考",
      en: "Recent depression-state screening reference",
    },
    previewVariant: "bars",
  });

  const clinical = buildCardFromTest(locale, invariantTest(tests.get("clinical-depression-anxiety-assessment-professional-edition"), "clinical-depression-anxiety-assessment-professional-edition"), {
    description: {
      zh: "当你想同时查看抑郁与焦虑两个维度，并获得更完整的近期状态参考时。",
      en: "When you want a fuller snapshot across both depression and anxiety dimensions.",
    },
    outputLabel: {
      zh: "抑郁焦虑双维状态参考",
      en: "Depression and anxiety state reference",
    },
    previewVariant: "summary",
  });

  const enneagram: HubTestCardItem = {
    key: "enneagram-personality-test",
    title: locale === "zh" ? "九型人格测试" : "Enneagram Test",
    description:
      locale === "zh"
        ? "从核心动机与压力反应理解你的行为模式。"
        : "Understand behavior patterns through motivation and stress response.",
    questionsLabel: locale === "zh" ? "即将上线" : "Coming soon",
    durationLabel: locale === "zh" ? "人格测试" : "Personality test",
    outputLabel: locale === "zh" ? "动机结构、压力反应与行为模式" : "Motivation structure, stress response, and behavior patterns",
    href: localizedPath("/tests", locale),
    detailsHref: localizedPath("/tests", locale),
    primaryLabel: locale === "zh" ? "查看入口" : "View entry",
    secondaryLabel: locale === "zh" ? "查看入口" : "View entry",
    scientificBasis: locale === "zh" ? "Based on Enneagram" : "Based on Enneagram",
    previewVariant: "summary",
  };

  const riasec = buildRiasecCard(locale);

  const visibleCards = filterVisiblePublicTestEntries([mbti, bigFive, eq, iq, depression, clinical, riasec]);

  return {
    mbti,
    bigFive,
    eq,
    iq,
    depression,
    clinical,
    enneagram,
    riasec,
    visibleCards,
  };
}

export function listVisibleTestsHubCards(locale: Locale): HubTestCardItem[] {
  return buildTestCards(locale).visibleCards;
}

export function listAllContentTestsHubCards(locale: Locale): HubTestCardItem[] {
  const cards = buildTestCards(locale);
  return [cards.mbti, cards.bigFive, cards.iq, cards.eq, cards.clinical, cards.enneagram];
}

export function listTestsCategorySlugs(): TestsCategorySlug[] {
  return ["personality", "career"];
}

export function getTestsHubContent(locale: Locale): TestsHubContent {
  const cards = buildTestCards(locale);

  const quickStartItems: HubQuestionItem[] =
    locale === "zh"
      ? [
          {
            id: "career-direction",
            title: "我适合什么职业方向？",
            description: "先看兴趣、工作风格与能力线索，再决定更值得深入的职业路径。",
            href: localizedPath("/tests/category/career", locale),
            ctaLabel: "进入职业方向入口",
            scent: ["霍兰德职业兴趣", "Big Five", "MBTI"],
          },
          {
            id: "personality-structure",
            title: "我的人格结构是什么？",
            description: "从人格风格与稳定特质切入，先建立可讨论、可复盘的自我认知底图。",
            href: localizedPath("/tests/category/personality", locale),
            ctaLabel: "进入人格测评入口",
            scent: ["MBTI 93Q", "MBTI 144Q", "Big Five 90Q"],
          },
          {
            id: "emotion-state",
            title: "我现在的情绪或状态如何？",
            description: "如果你更关心近期波动与风险信号，先看状态类测试，再决定是否需要进一步支持。",
            href: localizedPath("/tests#family-emotion-state", locale),
            ctaLabel: "查看状态类测试",
            scent: ["综合抑郁焦虑"],
          },
          {
            id: "cognitive-ability",
            title: "我的认知能力与优势在哪里？",
            description: "当你想看推理表现、认知节奏与能力基线时，优先从能力类入口开始。",
            href: localizedPath("/tests#family-cognitive-ability", locale),
            ctaLabel: "查看能力类测试",
            scent: ["IQ 测评", "推理表现"],
          },
          {
            id: "relationship-collaboration",
            title: "我在人际、协作与关系中是什么风格？",
            description: "把情绪能力、偏好模式与互动习惯放在一起看，更适合协作与关系判断。",
            href: localizedPath("/tests#family-relationship-collaboration", locale),
            ctaLabel: "查看协作类入口",
            scent: ["EQ", "MBTI"],
          },
        ]
      : [
          {
            id: "career-direction",
            title: "What career direction fits me best?",
            description: "Start with interest, work-style, and capability signals before deciding which path deserves deeper effort.",
            href: localizedPath("/tests/category/career", locale),
            ctaLabel: "Open career entry",
            scent: ["RIASEC", "Big Five", "MBTI"],
          },
          {
            id: "personality-structure",
            title: "What does my personality structure look like?",
            description: "Build a decision-ready self-understanding baseline through personality style and stable trait structure.",
            href: localizedPath("/tests/category/personality", locale),
            ctaLabel: "Open personality entry",
            scent: ["MBTI 93Q", "MBTI 144Q", "Big Five 90Q"],
          },
          {
            id: "emotion-state",
            title: "How is my current emotional state?",
            description: "If your main concern is recent fluctuation or warning signals, state-oriented tests should come first.",
            href: localizedPath("/tests#family-emotion-state", locale),
            ctaLabel: "View state tests",
            scent: ["Clinical combo"],
          },
          {
            id: "cognitive-ability",
            title: "Where are my cognitive strengths?",
            description: "Use the ability entry when you want a clearer read on reasoning performance and baseline capability.",
            href: localizedPath("/tests#family-cognitive-ability", locale),
            ctaLabel: "View ability tests",
            scent: ["IQ assessment", "Reasoning"],
          },
          {
            id: "relationship-collaboration",
            title: "How do I show up in collaboration and relationships?",
            description: "Combine emotional skills and preference patterns to read how you tend to communicate, coordinate, and respond.",
            href: localizedPath("/tests#family-relationship-collaboration", locale),
            ctaLabel: "View collaboration entry",
            scent: ["EQ", "MBTI"],
          },
        ];

  const families: TestFamilyItem[] =
    locale === "zh"
      ? [
          {
            id: "family-personality-style",
            title: "人格与风格",
            description: "适合先建立稳定的人格底图，再讨论偏好、风格与长期倾向。",
            exploreHref: localizedPath("/tests/category/personality", locale),
            exploreLabel: "查看人格与风格入口",
            representativeLabels: ["MBTI 93Q", "MBTI 144Q", "Big Five 120Q"],
            tests: [cards.mbti, cards.bigFive, cards.eq],
          },
          {
            id: "family-career-direction",
            title: "职业与方向",
            description: "适合把兴趣、工作风格与能力线索拼起来，用于职业方向判断。",
            exploreHref: localizedPath("/tests/category/career", locale),
            exploreLabel: "查看职业与方向入口",
            representativeLabels: ["霍兰德职业兴趣", "Big Five 90Q", "MBTI 93Q"],
            tests: [cards.riasec, cards.bigFive, cards.mbti],
          },
          {
            id: "family-emotion-state",
            title: "情绪与状态",
            description: "适合关注近期波动、风险信号与是否需要进一步支持的用户。",
            exploreHref: localizedPath("/tests#family-emotion-state", locale),
            exploreLabel: "查看这一组测试",
            representativeLabels: ["综合抑郁焦虑"],
            tests: cards.visibleCards.filter((card) => ["clinical-depression-anxiety-assessment-professional-edition"].includes(card.key)),
          },
          {
            id: "family-cognitive-ability",
            title: "认知与能力",
            description: "适合想看推理表现、能力基线与问题处理优势的人。",
            exploreHref: localizedPath("/tests#family-cognitive-ability", locale),
            exploreLabel: "查看这一组测试",
            representativeLabels: ["IQ 测评"],
            tests: [cards.iq],
          },
          {
            id: "family-relationship-collaboration",
            title: "关系与协作",
            description: "适合想理解沟通、情绪处理与协作摩擦来源的人。",
            exploreHref: localizedPath("/tests#family-relationship-collaboration", locale),
            exploreLabel: "查看这一组测试",
            representativeLabels: ["EQ", "MBTI"],
            tests: [cards.eq, cards.mbti],
          },
        ]
      : [
          {
            id: "family-personality-style",
            title: "Personality & Style",
            description: "Best for building a stable map of preferences, traits, and long-horizon tendencies.",
            exploreHref: localizedPath("/tests/category/personality", locale),
            exploreLabel: "View personality entry",
            representativeLabels: ["MBTI 93Q", "MBTI 144Q", "Big Five 120Q"],
            tests: [cards.mbti, cards.bigFive, cards.eq],
          },
          {
            id: "family-career-direction",
            title: "Career & Direction",
            description: "Best for combining interest, work style, and capability signals into career direction decisions.",
            exploreHref: localizedPath("/tests/category/career", locale),
            exploreLabel: "View career entry",
            representativeLabels: ["RIASEC", "Big Five 90Q", "MBTI 93Q"],
            tests: [cards.riasec, cards.bigFive, cards.mbti],
          },
          {
            id: "family-emotion-state",
            title: "Emotion & State",
            description: "Best for recent fluctuation, warning signals, and deciding whether further support is needed.",
            exploreHref: localizedPath("/tests#family-emotion-state", locale),
            exploreLabel: "View this group",
            representativeLabels: ["Clinical combo"],
            tests: cards.visibleCards.filter((card) => ["clinical-depression-anxiety-assessment-professional-edition"].includes(card.key)),
          },
          {
            id: "family-cognitive-ability",
            title: "Cognition & Ability",
            description: "Best for reasoning performance, baseline capability, and cognitive strength signals.",
            exploreHref: localizedPath("/tests#family-cognitive-ability", locale),
            exploreLabel: "View this group",
            representativeLabels: ["IQ assessment"],
            tests: [cards.iq],
          },
          {
            id: "family-relationship-collaboration",
            title: "Relationship & Collaboration",
            description: "Best for reading communication style, emotional handling, and collaboration friction.",
            exploreHref: localizedPath("/tests#family-relationship-collaboration", locale),
            exploreLabel: "View this group",
            representativeLabels: ["EQ", "MBTI"],
            tests: [cards.eq, cards.mbti],
          },
        ];

  const visibleFamilies = families.filter((family) => family.tests.length > 0);
  const hasEmotionStateFamily = visibleFamilies.some((family) => family.id === "family-emotion-state");
  const visibleQuickStartItems = quickStartItems.filter(
    (item) => item.id !== "emotion-state" || hasEmotionStateFamily
  );

  const resources: ResourceItem[] = [
    toResourceItem(locale, getCareerGuideBySlug("how-to-find-right-career-direction", locale), {
      key: "career-direction-guide",
      typeLabel: { zh: "指南", en: "Guide" },
      title: { zh: "如何找到更适合自己的职业方向", en: "How to Find a Better-Fit Career Direction" },
      description: {
        zh: "把兴趣、能力与现实约束放到一个决策框架里，而不是只凭一次直觉做选择。",
        en: "Bring interest, ability, and real constraints into one decision frame instead of relying on a single instinct.",
      },
      href: "/career/guides/how-to-find-right-career-direction",
    }),
    toResourceItem(locale, getBlogPostBySlug("mbti-basics", locale), {
      key: "mbti-basics",
      typeLabel: { zh: "文章", en: "Article" },
      title: { zh: "MBTI 入门", en: "MBTI Basics" },
      description: {
        zh: "在开始测试前先理解它适合回答什么，不适合回答什么。",
        en: "Understand what MBTI helps with and where its interpretation boundary should stop.",
      },
      href: "/articles/mbti-basics",
    }),
    toResourceItem(locale, getBlogPostBySlug("big-five-tool-guide", locale), {
      key: "big-five-guide",
      typeLabel: { zh: "文章", en: "Article" },
      title: { zh: "大五工具说明", en: "Big Five Tool Guide" },
      description: {
        zh: "如果你更偏好维度化解释，这篇内容适合作为 Big Five 的前置阅读。",
        en: "A clearer pre-read if you prefer dimensional interpretation over type-based language.",
      },
      href: "/articles/big-five-tool-guide",
    }),
  ];

  return {
    seo: {
      title: locale === "zh" ? "测评入口中心" : "Tests Hub",
      description:
        locale === "zh"
          ? "按问题或分类进入 FermatMind 测评入口，更快判断从哪一个测试开始。"
          : "Start from a clearer question or category and choose the right FermatMind assessment more quickly.",
    },
    hero: {
      eyebrow: locale === "zh" ? "测评入口" : "Tests",
      title:
        locale === "zh"
          ? "从一个更清晰的问题开始，找到适合你的测评。"
          : "Start from a clearer question and find the assessment that fits.",
      body:
        locale === "zh"
          ? "围绕自我认知、学习、职业方向与协作判断的精选入口，帮你更快开始，也更容易选对。"
          : "A curated set of assessment entry points for self-understanding, learning, career direction, relationships, and collaboration.",
      primaryLabel: locale === "zh" ? "开始选择" : "Start choosing",
      primaryHref: "#tests-quick-start",
      secondaryLabel: locale === "zh" ? "浏览全部测评" : "Browse all assessments",
      secondaryHref: "#tests-families",
      previewLabel: locale === "zh" ? "选择预览" : "Selection preview",
      previewTitle:
        locale === "zh" ? "先定问题，再进入最适合的测评。" : "Start with the question, then move into the right assessment.",
      previewBody:
        locale === "zh"
          ? "职业方向、人格结构、状态判断和能力线索，都先用一个更清楚的入口接住。"
          : "Use a clearer starting surface for career direction, personality structure, state, and ability signals.",
      previewFlow:
        locale === "zh"
          ? ["选择问题", "进入分类", "查看代表测试"]
          : ["Choose a question", "Enter a category", "See representative tests"],
      previewFamilies: visibleFamilies.map((family) => family.title),
    },
    quickStart: {
      kicker: locale === "zh" ? "Quick Start" : "Quick Start",
      title: locale === "zh" ? "按你现在最在意的问题开始。" : "Start from the question that matters most right now.",
      body:
        locale === "zh"
          ? "先把你现在要解决的问题说清楚，再进入更合适的测试版本。"
          : "Name the question first, then move into the version that fits best.",
      items: visibleQuickStartItems,
    },
    families: {
      kicker: locale === "zh" ? "Test Families" : "Test Families",
      title: locale === "zh" ? "按你要理解的方向继续往下走。" : "Continue through the family that best matches your question.",
      body:
        locale === "zh"
          ? "如果你已经知道大方向，但还没决定具体做哪个测试，这里会更清楚。"
          : "If you know the broad topic but not the exact test, this is the clearer way forward.",
      items: visibleFamilies,
    },
    howToChoose: {
      kicker: locale === "zh" ? "How to Choose" : "How to Choose",
      title: locale === "zh" ? "先判断你要解决哪类问题。" : "Choose based on the decision you need to make.",
      body:
        locale === "zh"
          ? "只保留足够做决定的判断规则。"
          : "Only keep the rules you need to make the next decision.",
      items:
        locale === "zh"
          ? [
              {
                title: "第一次进入，先从人格或职业方向开始",
                description: "它们更适合作为第一次进入产品时的总入口，帮助你建立后续判断框架。",
              },
              {
                title: "如果你关心近期波动，优先选情绪与状态类",
                description: "这类测试更适合处理“我最近怎么了”而不是“我本质上是谁”。",
              },
              {
                title: "如果你更关注优势与能力，优先看认知与能力类",
                description: "它更适合用在学习策略、问题处理与能力基线判断中。",
              },
            ]
          : [
              {
                title: "For a first pass, start with personality or career direction",
                description: "Those entries work best as first-pass routes because they help build the broader decision frame.",
              },
              {
                title: "If the concern is recent fluctuation, start with emotion and state",
                description: "Those tests are better for “what is happening lately?” than “who am I in general?”",
              },
              {
                title: "If the goal is strengths and capability, start with cognition and ability",
                description: "That route is more useful for learning strategy, problem solving, and baseline ability checks.",
              },
            ],
    },
    trust: {
      title: locale === "zh" ? "方法、边界与隐私" : "Method, boundary, and privacy",
      items: buildSharedTrust(locale),
    },
    resources: {
      kicker: locale === "zh" ? "Related Resources" : "Related Resources",
      title: locale === "zh" ? "在开始前，先看最值得读的 3 个入口。" : "Read the three most useful resources before you go deeper.",
      body:
        locale === "zh"
          ? "给开始前后最值得看的少量补充内容。"
          : "Three short reads that make the next choice easier.",
      items: resources,
      allHref: localizedPath("/articles", locale),
      allLabel: locale === "zh" ? "查看全部资源" : "View all resources",
    },
    finalCta: {
      title:
        locale === "zh"
          ? "先从更适合的问题开始，再决定做哪一个版本。"
          : "Start from the better question first, then decide how deep to go.",
      body:
        locale === "zh"
          ? "如果你还不确定具体做哪个测试，就先进入问题入口，再从代表测试或双版本产品开始。"
          : "If you are not sure which test to take yet, start with the question entry or the category hubs first.",
      primaryLabel: locale === "zh" ? "开始选择" : "Start choosing",
      primaryHref: "#tests-quick-start",
      secondaryLabel: locale === "zh" ? "查看人格入口" : "Open personality hub",
      secondaryHref: localizedPath("/tests/category/personality", locale),
    },
  };
}

export function getTestsCategoryContent(locale: Locale, slug: TestsCategorySlug): CategoryContent {
  const cards = buildTestCards(locale);
  const sharedTrust = buildSharedTrust(locale);

  if (slug === "personality") {
    return {
      slug,
      seo: {
        title: locale === "zh" ? "人格与风格测评" : "Personality & Style Tests",
        description:
          locale === "zh"
            ? "围绕人格风格、稳定特质与协作偏好的测评聚合页，帮助你更快判断先做哪一个。"
            : "A category hub for personality style, stable traits, and collaboration preferences with a clearer path into the right test.",
      },
      breadcrumb: [
        {
          label: locale === "zh" ? "测评入口" : "Tests",
          href: localizedPath("/tests", locale),
          path: locale === "zh" ? "/zh/tests" : "/en/tests",
        },
        {
          label: locale === "zh" ? "人格与风格" : "Personality & Style",
          path: locale === "zh" ? "/zh/tests/category/personality" : "/en/tests/category/personality",
        },
      ],
      hero: {
        eyebrow: locale === "zh" ? "人格与风格" : "Personality & Style",
        title: locale === "zh" ? "人格与风格测评" : "Personality & Style Tests",
        body:
          locale === "zh"
            ? "先看人格语言与稳定特质，再把结果放回学习、职业与协作场景里判断下一步。"
            : "Best for reading preference patterns, stable traits, and collaboration style before applying them to learning, career, and relationship decisions.",
        points:
          locale === "zh"
            ? ["适合第一次进入人格类测评", "帮助建立更稳定的自我认知底图", "结果更适合讨论与复盘，而不是贴标签"]
            : [
                "A strong first entry into personality-focused assessment",
                "Helps build a more stable self-understanding baseline",
                "Best used for discussion and review, not fixed labeling",
              ],
      },
      featured: {
        kicker: locale === "zh" ? "Featured Tests" : "Featured Tests",
        title: locale === "zh" ? "先从最适合起步的代表测试进入。" : "Start with the most useful representative tests first.",
        body:
          locale === "zh"
            ? "先把最常用的两条入口说清楚：MBTI 更容易讨论，Big Five 更偏维度化解释。"
          : "Start with MBTI for a discussable type frame, or Big Five for a more dimensional trait read.",
        items: [cards.mbti, cards.bigFive],
      },
      allTests: {
        kicker: locale === "zh" ? "All Tests in Category" : "All Tests in Category",
        title: locale === "zh" ? "这一类下的全部测试" : "All tests in this category",
        body:
          locale === "zh"
            ? "如果你已经知道自己更偏好哪一种入口，可以直接从这里进入。"
          : "If you already know what kind of read you want, jump directly into the specific test here.",
        items: [cards.mbti, cards.bigFive, cards.eq],
      },
      differences: {
        kicker: locale === "zh" ? "How These Tests Differ" : "How These Tests Differ",
        title: locale === "zh" ? "同一类测试，关注点并不相同。" : "Tests in the same family do not solve the same problem.",
        body:
          locale === "zh"
            ? "先明白你更需要哪一种结果，再选版本会更稳。"
          : "Choosing the right lens matters more than scanning every title.",
        items:
          locale === "zh"
            ? [
                {
                  title: "MBTI 更适合先拿到一个可讨论的人格框架",
                  description: "93Q 更适合快速读懂整体类型感，144Q 更适合继续看更完整的偏好与场景解释。",
                },
                {
                  title: "Big Five 更适合看稳定特质的连续分布",
                  description: "90Q 适合先看五维轮廓，120Q 更适合在职业、关系和压力情境下读完整特质档案。",
                },
                {
                  title: "EQ 适合作为补充，而不是代替人格底图",
                  description: "当你的核心问题是沟通、反馈和协作时，再把 EQ 放进来会更有用。",
                },
              ]
            : [
                {
                  title: "MBTI is often the easiest first entry",
                  description: "It works well when you want personality language that is easier to discuss, remember, and share.",
                },
                {
                  title: "Big Five is more dimensional",
                  description: "Choose it when you want stable trait ranges and less type-based interpretation.",
                },
                {
                  title: "EQ is stronger for real interaction patterns",
                  description: "It is more useful for communication, conflict, feedback, and collaboration than for full personality mapping.",
                },
              ],
      },
      resources: {
        kicker: locale === "zh" ? "Related Resources" : "Related Resources",
        title: locale === "zh" ? "只保留三条最值得延伸的内容" : "Three useful reads to deepen the choice",
        body:
          locale === "zh"
            ? "如果你还想多看一点，就从这三条开始。"
          : "Read these if you want more context before choosing.",
        items: [
          toResourceItem(locale, getBlogPostBySlug("mbti-basics", locale), {
            key: "mbti-basics",
            typeLabel: { zh: "文章", en: "Article" },
            title: { zh: "MBTI 入门", en: "MBTI Basics" },
            description: {
              zh: "先理解 MBTI 适合回答什么，再判断它是不是你的起点。",
              en: "Understand what MBTI is good for before deciding whether it is your best starting point.",
            },
            href: "/articles/mbti-basics",
          }),
          toResourceItem(locale, getBlogPostBySlug("mbti-growth-guide", locale), {
            key: "mbti-growth-guide",
            typeLabel: { zh: "文章", en: "Article" },
            title: { zh: "MBTI 成长指南", en: "MBTI Growth Guide" },
            description: {
              zh: "把人格结果翻译成成长与协作中的具体动作。",
              en: "Translate personality results into concrete growth and collaboration actions.",
            },
            href: "/articles/mbti-growth-guide",
          }),
          toResourceItem(locale, getBlogPostBySlug("big-five-tool-guide", locale), {
            key: "big-five-tool-guide",
            typeLabel: { zh: "文章", en: "Article" },
            title: { zh: "大五工具说明", en: "Big Five Tool Guide" },
            description: {
              zh: "如果你更偏好维度解释，这篇内容更适合作为 Big Five 的入口。",
              en: "A better entry if you prefer dimensional interpretation over type language.",
            },
            href: "/articles/big-five-tool-guide",
          }),
        ],
      },
      trust: {
        title: locale === "zh" ? "方法、边界与使用方式" : "Method, boundary, and use",
        items: sharedTrust,
      },
      finalCta: {
        title: locale === "zh" ? "先从一个更顺手的人格入口开始。" : "Start with the personality entry that fits your decision style.",
        body:
          locale === "zh"
            ? "想先要一个更容易讨论的人格框架，从 MBTI 开始；想先看稳定特质分布，从 Big Five 开始。"
          : "Start with MBTI for a more discussable type framework, or Big Five for a more dimensional read.",
        primaryLabel: locale === "zh" ? "开始人格测评" : "Start personality tests",
        primaryHref: cards.mbti.href,
      },
    };
  }

  return {
    slug,
    seo: {
      title: locale === "zh" ? "职业与方向测评" : "Career & Direction Tests",
      description:
        locale === "zh"
          ? "围绕职业兴趣、工作风格与职业决策线索的测评聚合页，帮助你更快判断从哪一个入口开始。"
          : "A category hub for career interest, work style, and decision-relevant signals with a clearer way to choose where to start.",
    },
    breadcrumb: [
      {
        label: locale === "zh" ? "测评入口" : "Tests",
        href: localizedPath("/tests", locale),
        path: locale === "zh" ? "/zh/tests" : "/en/tests",
      },
      {
        label: locale === "zh" ? "职业与方向" : "Career & Direction",
        path: locale === "zh" ? "/zh/tests/category/career" : "/en/tests/category/career",
      },
    ],
    hero: {
      eyebrow: locale === "zh" ? "Category Hub" : "Category Hub",
      title: locale === "zh" ? "职业与方向测评" : "Career & Direction Tests",
      body:
        locale === "zh"
          ? "适合把职业兴趣、工作风格与能力线索组合起来，用于专业选择、岗位判断与下一步职业探索。"
          : "Use this category when you need to combine interest, work style, and capability signals for role choice and career direction.",
      points:
        locale === "zh"
          ? ["兴趣先回答方向感", "人格与风格帮助判断工作方式", "能力类结果更适合作为补充信号"]
          : [
              "Interest signals answer direction first",
              "Personality helps with work-style fit",
              "Ability-focused tests work best as supporting signals",
            ],
    },
    featured: {
      kicker: locale === "zh" ? "Featured Tests" : "Featured Tests",
      title: locale === "zh" ? "先从最能帮助职业决策的入口开始。" : "Start with the entries that help career decisions most directly.",
      body:
        locale === "zh"
          ? "职业方向不是只看一个分数，而是先拼出兴趣、风格与能力线索。"
          : "Career direction should not rely on one score alone. Start by combining interest, style, and ability signals.",
      items: [
        buildRiasecCard(locale, {
          description: {
            zh: "当你最想知道自己更偏向哪类职业活动、任务环境与工作内容时。",
            en: "When your main question is which kinds of work activities and environments fit your interests best.",
          },
          outputLabel: {
            zh: "兴趣结构、主次代码与职业方向线索",
            en: "Interest profile, top codes, and direction signals",
          },
          previewVariant: "matrix",
        }),
        buildCardFromTest(locale, invariantTest(getTestMap().get("big-five-personality-test-ocean-model"), "big-five-personality-test-ocean-model"), {
          description: {
            zh: "当你要把职业方向判断落到工作方式、压力反应与长期特质上时。",
            en: "When you want career direction grounded in work style, stress response, and stable traits.",
          },
          outputLabel: {
            zh: "工作风格与稳定特质线索",
            en: "Work-style and stable-trait signals",
          },
          scientificBasis: {
            zh: "Based on Big Five",
            en: "Based on Big Five",
          },
          previewVariant: "radar",
        }),
        buildCardFromTest(locale, invariantTest(getTestMap().get("mbti-personality-test-16-personality-types"), "mbti-personality-test-16-personality-types"), {
          description: {
            zh: "当你更需要一个容易讨论的职业风格语言，用来判断岗位与协作环境是否匹配时。",
            en: "When you want a more discussable framework for reading role fit and work-environment preference.",
          },
          outputLabel: {
            zh: "职业风格语言与协作偏好",
            en: "Career-style language and collaboration preference",
          },
          scientificBasis: {
            zh: "Based on Jungian-inspired typology",
            en: "Based on Jungian-inspired typology",
          },
          previewVariant: "summary",
        }),
      ],
    },
    allTests: {
      kicker: locale === "zh" ? "All Tests in Category" : "All Tests in Category",
      title: locale === "zh" ? "这类判断常用到的全部测试" : "All tests commonly used in this category",
      body:
        locale === "zh"
          ? "这里既包括直接的职业兴趣入口，也包括对职业判断有帮助的支撑型测试。"
          : "This list includes the direct career-interest entry and supporting tests that sharpen career judgment.",
      items: [cards.riasec, cards.bigFive, cards.mbti, cards.iq, cards.eq],
    },
    differences: {
      kicker: locale === "zh" ? "How These Tests Differ" : "How These Tests Differ",
      title: locale === "zh" ? "同是职业方向相关测试，作用层级并不一样。" : "Career-relevant tests operate at different layers.",
      body:
        locale === "zh"
          ? "先理解每个测试回答的是哪一个问题，选择会更稳。"
          : "Selection becomes easier once you know what question each test actually answers.",
      items:
        locale === "zh"
          ? [
              {
                title: "RIASEC 更偏兴趣结构",
                description: "它更适合回答“我更容易被哪类职业活动吸引”，是职业入口中最直接的一层。",
              },
              {
                title: "Big Five 与 MBTI 更偏工作风格和长期倾向",
                description: "它们更适合辅助判断工作环境、协作方式与岗位适配感，而不是单独决定职业方向。",
              },
              {
                title: "IQ 与 EQ 更偏补充信号",
                description: "能力与情绪能力结果更适合用来修正判断，帮助你看见执行、沟通与问题处理层面的现实差异。",
              },
            ]
          : [
              {
                title: "RIASEC is the direct interest lens",
                description: "It is the clearest route when the question is which kinds of work activity attract you most.",
              },
              {
                title: "Big Five and MBTI are stronger for work style",
                description: "Use them to read environment fit, collaboration style, and long-horizon tendencies rather than to decide a career alone.",
              },
              {
                title: "IQ and EQ are supporting signals",
                description: "Those tests refine judgment by adding perspective on execution, communication, and problem handling.",
              },
            ],
    },
    resources: {
      kicker: locale === "zh" ? "Related Guides" : "Related Guides",
      title: locale === "zh" ? "帮助职业判断的延伸内容" : "Guides that support stronger career decisions",
      body:
        locale === "zh"
          ? "把测试结果放回真实职业语境，通常比只看分数更重要。"
          : "Putting results back into real career context matters more than reading scores alone.",
      items: [
        toResourceItem(locale, getCareerGuideBySlug("how-to-find-right-career-direction", locale), {
          key: "how-to-find-right-career-direction",
          typeLabel: { zh: "指南", en: "Guide" },
          title: { zh: "如何找到更适合自己的职业方向", en: "How to Find a Better-Fit Career Direction" },
          description: {
            zh: "把兴趣、能力与现实约束放进同一个职业判断框架。",
            en: "Bring interest, capability, and real constraints into one career decision frame.",
          },
          href: "/career/guides/how-to-find-right-career-direction",
        }),
        toResourceItem(locale, getCareerGuideBySlug("from-mbti-to-job-fit", locale), {
          key: "from-mbti-to-job-fit",
          typeLabel: { zh: "指南", en: "Guide" },
          title: { zh: "如何将 MBTI 用于职业匹配", en: "From MBTI to Job Fit" },
          description: {
            zh: "把人格语言翻译成岗位与工作环境的匹配判断。",
            en: "Translate personality language into role and work-environment fit decisions.",
          },
          href: "/career/guides/from-mbti-to-job-fit",
        }),
        toResourceItem(locale, getCareerGuideBySlug("big5-for-career-decisions", locale), {
          key: "big5-for-career-decisions",
          typeLabel: { zh: "指南", en: "Guide" },
          title: { zh: "如何用 Big Five 支持职业决策", en: "Using Big Five for Career Decisions" },
          description: {
            zh: "如果你更偏好维度化的人格解释，这篇内容更适合作为职业判断补充。",
            en: "A better support layer if you prefer trait dimensions over type language in career decisions.",
          },
          href: "/career/guides/big5-for-career-decisions",
        }),
      ],
    },
    trust: {
      title: locale === "zh" ? "方法、边界与使用方式" : "Method, boundary, and use",
      items: sharedTrust,
    },
    finalCta: {
      title: locale === "zh" ? "先从职业兴趣开始，再叠加风格与能力信号。" : "Start with career interest first, then add style and ability signals.",
      body:
        locale === "zh"
          ? "如果你只想先做一个最直接的职业入口，RIASEC 通常是更好的开始。"
          : "If you want the most direct starting point for career direction, RIASEC is usually the better first move.",
      primaryLabel: locale === "zh" ? "开始职业方向测评" : "Start career direction tests",
      primaryHref: localizedPath("/career/tests/riasec", locale),
    },
  };
}
