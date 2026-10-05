import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { CmsPersonalityProfileSummary } from "@/lib/cms/personality";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getMbtiAdsLaunchTier } from "@/lib/mbti/adsPolicy";
import { MBTI_TYPE_GROUPS } from "@/lib/mbti/mbtiTypeContentPack";
import { buildDefaultMbtiSceneBlocks } from "@/lib/mbti/sceneBlocks";
import type {
  CareerPreviewSeed,
  FaqBlock,
  MethodologyBlock,
  PersonalityHubFamilyGroup,
  PersonalityHubPayload,
  ScenarioCard,
  TypeDecisionCard,
  TypeWorkbenchCard,
} from "@/lib/mbti/personalityHub.types";

const MBTI_GROUP_ORDER = ["NT", "NF", "SJ", "SP"] as const;
type MbtiGroupKey = (typeof MBTI_GROUP_ORDER)[number];

const MBTI_BASE_TYPE_GROUP = new Map<string, MbtiGroupKey>(
  MBTI_GROUP_ORDER.flatMap((groupKey) => MBTI_TYPE_GROUPS[groupKey].map((typeCode) => [typeCode, groupKey] as const))
);

const MBTI_GROUP_META = {
  NT: {
    en: {
      title: "Analysts",
      summary:
        "Strategy-first types that lean on abstraction, systems thinking, and long-range pattern reading.",
    },
    zh: {
      title: "分析家",
      summary: "更偏抽象、策略、系统化判断的类型组，适合从长期结构和模式中做决策。",
    },
  },
  NF: {
    en: {
      title: "Diplomats",
      summary:
        "Meaning-led types that read people, values, and future possibility before locking a direction.",
    },
    zh: {
      title: "外交家",
      summary: "更关注意义、关系和未来可能性的类型组，适合从价值与人际动力里理解自己。",
    },
  },
  SJ: {
    en: {
      title: "Sentinels",
      summary:
        "Stability-led types that organize commitments, routines, and dependable systems around real-world execution.",
    },
    zh: {
      title: "守护者",
      summary: "更偏稳定、秩序和责任落实的类型组，适合从执行、协作和长期承诺里理解自己。",
    },
  },
  SP: {
    en: {
      title: "Explorers",
      summary:
        "Action-led types that read the moment quickly, respond with flexibility, and test through direct contact.",
    },
    zh: {
      title: "探索者",
      summary: "更偏行动、当下反馈和灵活应变的类型组，适合从现场感与真实体验里理解自己。",
    },
  },
} as const;

interface BuildPersonalityHubPayloadInput {
  locale: Locale;
  canonicalPath: string;
  personalities: CmsPersonalityProfileSummary[];
  landingSurface: LandingSurfaceViewModel | null;
  sceneSummaryBlocks?: AnswerSurfaceViewModel["sceneSummaryBlocks"];
}

function buildTypeDecisionCard(params: {
  locale: Locale;
  personality: CmsPersonalityProfileSummary;
  groupKey: MbtiGroupKey;
}): TypeDecisionCard {
  const { locale, personality, groupKey } = params;
  const groupMeta = MBTI_GROUP_META[groupKey][locale];
  const typeCode = personality.displayType || personality.runtimeTypeCode || personality.typeCode;
  const slug = personality.publicRouteSlug || personality.slug;

  return {
    typeCode,
    baseTypeCode: personality.baseTypeCode,
    variantCode: personality.variantCode,
    slug,
    title: personality.nickname || personality.title || typeCode,
    excerpt: personality.excerpt || personality.subtitle || groupMeta.summary,
    imageUrl: personality.heroImageUrl ?? null,
    href: localizedPath(`/personality/${slug}`, locale),
    groupKey,
    groupTitle: groupMeta.title,
    launchTier: getMbtiAdsLaunchTier(personality.baseTypeCode),
  };
}

function buildScenarioCards(input: BuildPersonalityHubPayloadInput): ScenarioCard[] {
  const fallbackBlocks = buildDefaultMbtiSceneBlocks(input.locale);
  const sourceBlocks = input.sceneSummaryBlocks?.length
    ? input.sceneSummaryBlocks.map((block) => ({
        key: block.key,
        title: block.title,
        body: block.body,
        href: block.href,
      }))
    : fallbackBlocks;

  return sourceBlocks.map((block, index) => ({
    key: block.key,
    title: block.title,
    summary: block.body,
    href: block.href || localizedPath("/topics/mbti", input.locale),
    metric: {
      key: `${block.key}-metric`,
      label: input.locale === "zh" ? "适用场景" : "Best used for",
      value: index === 0 ? (input.locale === "zh" ? "职业方向" : "Career direction") : block.title,
    },
    cta: {
      label: input.locale === "zh" ? "进入该场景" : "Open this scenario",
      href: block.href || localizedPath("/topics/mbti", input.locale),
      kind: "tertiary",
    },
  }));
}

function buildFamilyGroups(input: BuildPersonalityHubPayloadInput): PersonalityHubFamilyGroup[] {
  const variantDirectory = input.personalities
    .filter((personality) => personality.publicRouteType === "32-type")
    .filter((personality) => personality.runtimeTypeCode && personality.variantCode && personality.slug)
    .filter((personality) => MBTI_BASE_TYPE_GROUP.has(personality.baseTypeCode))
    .sort((left, right) => {
      const leftGroup = MBTI_BASE_TYPE_GROUP.get(left.baseTypeCode) ?? "NT";
      const rightGroup = MBTI_BASE_TYPE_GROUP.get(right.baseTypeCode) ?? "NT";
      const groupDelta = MBTI_GROUP_ORDER.indexOf(leftGroup) - MBTI_GROUP_ORDER.indexOf(rightGroup);
      if (groupDelta !== 0) {
        return groupDelta;
      }

      const leftGroupOrder = (MBTI_TYPE_GROUPS[leftGroup] as readonly string[]).indexOf(left.baseTypeCode);
      const rightGroupOrder = (MBTI_TYPE_GROUPS[rightGroup] as readonly string[]).indexOf(right.baseTypeCode);
      if (leftGroupOrder !== rightGroupOrder) {
        return leftGroupOrder - rightGroupOrder;
      }

      const variantRank = (variantCode: string | null) => (variantCode === "A" ? 0 : variantCode === "T" ? 1 : 9);

      return variantRank(left.variantCode) - variantRank(right.variantCode);
    });

  return MBTI_GROUP_ORDER.map((groupKey) => ({
    groupKey,
    title: MBTI_GROUP_META[groupKey][input.locale].title,
    summary: MBTI_GROUP_META[groupKey][input.locale].summary,
    cards: variantDirectory
      .filter((personality) => MBTI_BASE_TYPE_GROUP.get(personality.baseTypeCode) === groupKey)
      .map((personality) =>
        buildTypeDecisionCard({
          locale: input.locale,
          personality,
          groupKey,
        })
      ),
  }));
}

function buildCareerPreviewSeed(input: BuildPersonalityHubPayloadInput, cards: TypeDecisionCard[]): CareerPreviewSeed[] {
  const selected: TypeDecisionCard[] = [];
  const selectedTypes = new Set<string>();
  const pushCard = (card: TypeDecisionCard) => {
    if (selectedTypes.has(card.typeCode)) {
      return;
    }

    selected.push(card);
    selectedTypes.add(card.typeCode);
  };

  const stableGrouped = cards.filter(
    (card, index, collection) =>
      card.launchTier === "stable" &&
      collection.findIndex((candidate) => candidate.groupKey === card.groupKey && candidate.launchTier === "stable") === index
  );

  const nonStableGrouped = cards.filter(
    (card, index, collection) =>
      card.launchTier !== "stable" &&
      collection.findIndex((candidate) => candidate.groupKey === card.groupKey && candidate.launchTier !== "stable") === index
  );

  for (const card of stableGrouped) {
    pushCard(card);
  }

  for (const card of nonStableGrouped) {
    pushCard(card);
  }

  for (const card of cards) {
    pushCard(card);
  }

  return selected.map((card) => ({
    typeCode: card.typeCode,
    slug: card.slug,
    title: card.title,
    groupKey: card.groupKey,
    groupTitle: card.groupTitle,
    launchTier: card.launchTier,
    recommendationHref: localizedPath(`/career/recommendations/mbti/${card.slug}`, input.locale),
  }));
}

function buildTypeWorkbenchSeed(input: BuildPersonalityHubPayloadInput, cards: TypeDecisionCard[]): TypeWorkbenchCard[] {
  return cards.map((card) => {
    const derivedTraitKeys = [
      card.baseTypeCode.startsWith("I") ? "introvert" : "extravert",
      card.baseTypeCode[1] === "N" ? "intuition" : "sensing",
      card.baseTypeCode[2] === "T" ? "thinking" : "feeling",
      card.baseTypeCode[3] === "J" ? "judging" : "perceiving",
    ] as const;

    const derivedTraitLabels = derivedTraitKeys.map((trait) => {
      const labels = {
        introvert: input.locale === "zh" ? "内倾" : "Introvert",
        extravert: input.locale === "zh" ? "外倾" : "Extravert",
        intuition: input.locale === "zh" ? "直觉" : "Intuitive",
        sensing: input.locale === "zh" ? "实感" : "Sensing",
        thinking: input.locale === "zh" ? "思考" : "Thinking",
        feeling: input.locale === "zh" ? "情感" : "Feeling",
        judging: input.locale === "zh" ? "判断" : "Judging",
        perceiving: input.locale === "zh" ? "感知" : "Perceiving",
      } as const;

      return labels[trait];
    });

    return {
      ...card,
      recommendationHref: localizedPath(`/career/recommendations/mbti/${card.slug}`, input.locale),
      recommendationReady: true,
      derivedTraitKeys: [...derivedTraitKeys],
      derivedTraitLabels,
    };
  });
}

function buildMethodologyBlocks(locale: Locale): MethodologyBlock[] {
  return [
    {
      key: "first-variable",
      title: locale === "zh" ? "第一步：用人格描述提出观察问题" : "Step 1: Use personality to narrow the field",
      body:
        locale === "zh"
          ? "把四字母人格描述与 A/T 阅读变体作为自我观察提示，结合实际经历与反例理解自己的偏好，不据此判断能力或职业适配。"
          : "This page uses A/T personality variants to narrow likely decision styles, collaboration patterns, and long-term friction points, but it does not replace career judgment.",
    },
    {
      key: "strain-before-fit",
      title: locale === "zh" ? "第二步：了解实际工作条件" : "Step 2: Check structural strain before fit",
      body:
        locale === "zh"
          ? "了解任务、工作量、时间安排、自主空间与支持条件，再结合自己的经历和现实限制提出要核实的问题。类型标签不能预测长期负担。"
          : "The matrix, workbench, and career preview first show which work structures start to drain you, before deciding which roles merely look attractive on paper.",
    },
    {
      key: "recommendation-depth",
      title: locale === "zh" ? "第三步：结合职业信息继续探索" : "Step 3: Use recommendation detail as the second decision layer",
      body:
        locale === "zh"
          ? "可以从职业目录、兴趣或真实任务体验开始探索，也可以继续阅读类型描述。职业页面帮助了解工作任务与条件，能力、资格和机会仍需分别核实。"
          : "When personality direction, structural strain, and role pattern begin to align, move into the recommendation detail route to verify jobs, risks, and next steps instead of forcing a final answer here.",
    },
  ];
}

function buildFaqBlocks(locale: Locale): FaqBlock[] {
  return [
    {
      question: locale === "zh" ? "这里是测试入口还是人格目录？" : "Is this the test landing or the personality directory?",
      answer:
        locale === "zh"
          ? "这里可以浏览人格描述与类型对比。要回答测评问卷，请使用上方的测试入口。"
          : "This directory lets you browse personality descriptions and comparisons. To answer the questionnaire, use the test entry above.",
    },
    {
      question:
        locale === "zh"
          ? "为什么这里不直接给我最终职业结论？"
          : "Why does this page not give me a final career answer directly?",
      answer:
        locale === "zh"
          ? "人格描述不能证明岗位能力或适合程度。可以用它提出观察问题，再了解实际工作任务、技能要求、资格与个人限制。"
          : "A personality description does not establish job ability or suitability. Use it to frame questions, then compare actual work tasks, skills, qualifications and personal constraints.",
    },
    {
      question:
        locale === "zh"
          ? "没有确定人格类型，也能探索职业吗？"
          : "Can I explore occupations without choosing a personality type first?",
      answer:
        locale === "zh"
          ? "可以。你可以从职业信息、兴趣或真实任务体验开始。类型描述只是可选的自我观察提示，不会验证职业列表，也不是探索职业的前提。"
          : "Yes. You can start with occupations, interests or a work sample. Type descriptions are optional reflection prompts; they do not validate a job list or need to be settled first.",
    },
    {
      question:
        locale === "zh"
          ? "怎样了解一个工作环境的负担？"
          : "How can I examine the cost of a work environment?",
      answer:
        locale === "zh"
          ? "了解工作量、时间安排、自主空间与支持条件，再对照自己的经历和现实限制。类型标签不能预测长期负担，也不能替你排除或选定职业。"
          : "Ask about workload, schedule, autonomy and support, then compare them with your own experience and constraints. A type label cannot predict long-term strain or rule a career in or out.",
    },
    {
      question:
        locale === "zh"
          ? "人格目录、类型描述和职业页面有什么区别？"
          : "How do the directory, type descriptions and career pages differ?",
      answer:
        locale === "zh"
          ? "人格目录提供浏览与导航，类型页面提供供自我观察的人格描述，职业页面介绍工作任务与条件。它们都不能证明你的能力或保证结果。"
          : "The directory provides navigation, a type page offers descriptions for reflection, and career pages introduce work tasks and conditions. None establishes your abilities or guarantees an outcome.",
    },
    {
      question:
        locale === "zh"
          ? "职业预览能决定我应该选择什么工作吗？"
          : "Does a career preview decide which job I should choose?",
      answer:
        locale === "zh"
          ? "不能。把示例当作待核实的问题，通过实际职业信息、任务体验和交流继续了解。技能、资格、机会与个人目标仍需分别核实。"
          : "No. Treat examples as questions to investigate through actual job information, task experience and conversations. Skills, qualifications, opportunities and your goals still need separate evidence.",
    },
  ];
}

export function buildPersonalityHubPayload(input: BuildPersonalityHubPayloadInput): PersonalityHubPayload {
  const familyGroups = buildFamilyGroups(input);
  const typeDecisionCards = familyGroups.flatMap((group) => group.cards);
  const typeWorkbenchSeed = buildTypeWorkbenchSeed(input, typeDecisionCards);
  const stableCount = typeDecisionCards.filter((card) => card.launchTier === "stable").length;
  const summaryBody =
    input.landingSurface?.summaryBlocks[0]?.body ||
    (input.locale === "zh"
      ? "A/T 人格变体的优势、风险、关系模式与职业方向。"
      : "Strengths, risks, relationship patterns, and career direction across A/T variants.");

  return {
    hero: {
      eyebrow: "MBTI Content Framework",
      title: input.locale === "zh" ? "人格类型" : "Personality types",
      summary: summaryBody,
      primaryCta: {
        label: input.locale === "zh" ? "开始 MBTI 免费测试" : "Start the free MBTI test",
        href: localizedPath("/tests/mbti-personality-test-16-personality-types", input.locale),
        kind: "primary",
      },
      secondaryCta: {
        label: input.locale === "zh" ? "查看 MBTI 主题" : "View MBTI topic",
        href: localizedPath("/topics/mbti", input.locale),
        kind: "secondary",
      },
      discoverabilityLinks: [
        {
          label: input.locale === "zh" ? "按类型组浏览 A/T 变体" : "Browse A/T variants by family",
          href: `${input.canonicalPath}#mbti-family-groups`,
          kind: "tertiary",
        },
        {
          label: input.locale === "zh" ? "查看职业推荐目录" : "Browse career recommendations",
          href: localizedPath("/career/recommendations", input.locale),
          kind: "tertiary",
        },
        {
          label: input.locale === "zh" ? "进入 MBTI 主题中心" : "Open the MBTI topic hub",
          href: localizedPath("/topics/mbti", input.locale),
          kind: "tertiary",
        },
      ],
      metrics: [
        {
          key: "inventory",
          label: input.locale === "zh" ? "已发布类型" : "Published types",
          value: String(typeDecisionCards.length),
          tone: "positive",
        },
        {
          key: "families",
          label: input.locale === "zh" ? "类型组" : "Families",
          value: String(familyGroups.length),
        },
        {
          key: "stable-launch",
          label: input.locale === "zh" ? "稳定副白名单" : "Stable launch types",
          value: String(stableCount),
          tone: "positive",
        },
        {
          key: "career-preview",
          label: input.locale === "zh" ? "职业预览样板" : "Career preview samples",
          value: "3",
        },
      ],
    },
    scenarioCards: buildScenarioCards(input),
    scenarioMatrixSeed: buildScenarioCards(input),
    familyGroups,
    typeDecisionCards,
    typeWorkbenchSeed,
    careerPreviewSeed: buildCareerPreviewSeed(input, typeDecisionCards),
    methodologyBlocks: buildMethodologyBlocks(input.locale),
    faqBlocks: buildFaqBlocks(input.locale),
    inventoryLinks: typeDecisionCards.map((card) => ({
      typeCode: card.typeCode,
      href: card.href,
    })),
    quickLocateSeed: typeDecisionCards.map((card) => ({
      query: card.typeCode,
      matchedTypeCodes: [card.typeCode],
      typeResults: [
        {
          kind: "type",
          typeCode: card.typeCode,
          title: card.title,
          excerpt: card.excerpt,
          href: card.href,
          groupKey: card.groupKey,
          groupTitle: card.groupTitle,
          recommendationHref: localizedPath(`/career/recommendations/mbti/${card.slug}`, input.locale),
          keywords: [card.typeCode.toLowerCase(), card.title.toLowerCase(), card.groupTitle.toLowerCase()],
          launchTier: card.launchTier,
        },
      ],
      careerResults: [],
    })),
    faqItems: buildFaqBlocks(input.locale),
    methodologyItems: buildMethodologyBlocks(input.locale),
    jsonLdInputs: {
      faqItems: buildFaqBlocks(input.locale),
      typeItemList: typeDecisionCards.map((card) => ({
        name: `${card.typeCode} · ${card.title}`,
        url: card.href,
        description: card.excerpt,
      })),
    },
  };
}
