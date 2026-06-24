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
    title: personality.title || typeCode,
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
      title: locale === "zh" ? "第一步：人格只负责缩小范围" : "Step 1: Use personality to narrow the field",
      body:
        locale === "zh"
          ? "这页先用 A/T 人格变体帮助你识别更可能顺手的决策方式、协作方式和长期消耗点，但它不直接代替职业判断。"
          : "This page uses A/T personality variants to narrow likely decision styles, collaboration patterns, and long-term friction points, but it does not replace career judgment.",
    },
    {
      key: "strain-before-fit",
      title: locale === "zh" ? "第二步：先看结构性损耗，再看适配" : "Step 2: Check structural strain before fit",
      body:
        locale === "zh"
          ? "场景矩阵、工作台和职业预览优先帮助你看清什么样的工作结构会开始消耗你，再判断哪些角色只是看起来匹配。"
          : "The matrix, workbench, and career preview first show which work structures start to drain you, before deciding which roles merely look attractive on paper.",
    },
    {
      key: "recommendation-depth",
      title: locale === "zh" ? "第三步：把职业推荐详情页当作第二层判断" : "Step 3: Use recommendation detail as the second decision layer",
      body:
        locale === "zh"
          ? "当人格方向、结构损耗和职业样板开始对齐时，再进入 recommendation 深页核对岗位、风险与继续路径，而不是在这里抢结论。"
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
          ? "这里是 A/T 人格变体发布中心。测试仍然从 MBTI landing 进入，这里负责浏览、比较与继续探索。"
          : "This is the A/T variant release hub. Testing still starts from the MBTI landing page, while this page is for browsing, comparing, and continuing exploration.",
    },
    {
      question:
        locale === "zh"
          ? "为什么这里不直接给我最终职业结论？"
          : "Why does this page not give me a final career answer directly?",
      answer:
        locale === "zh"
          ? "因为人格只是第一层变量。这一页先帮你缩小方向，再用 recommendation 深页核对具体岗位、风险和继续路径。"
          : "Because personality is only the first variable. This page narrows direction first, then the recommendation detail route verifies concrete roles, risks, and next steps.",
    },
    {
      question:
        locale === "zh"
          ? "为什么 recommendation 是下一步，而不是起点？"
          : "Why is the recommendation route the next step instead of the starting point?",
      answer:
        locale === "zh"
          ? "因为 recommendation 需要建立在人格方向和结构损耗已经看清的前提下，否则你会把职业列表误当成结论。"
          : "Because recommendation works best after personality direction and structural strain are already clear. Otherwise the job list becomes a premature conclusion.",
    },
    {
      question:
        locale === "zh"
          ? "为什么要先看损耗，再看适配？"
          : "Why look at strain before fit?",
      answer:
        locale === "zh"
          ? "很多角色表面上看起来适配，但长期结构会持续消耗你。先看损耗，能更早排除代价过高的路径。"
          : "Many roles look compatible on paper while their long-term structure keeps draining you. Looking at strain first helps rule out paths with hidden long-term cost.",
    },
    {
      question:
        locale === "zh"
          ? "/personality、类型详情页和 recommendation 深页有什么区别？"
          : "What is the difference between /personality, a type detail page, and a recommendation detail page?",
      answer:
        locale === "zh"
          ? "/personality 负责总览、比较和继续导航；类型详情页负责解释单一人格；recommendation 深页负责把人格判断延伸到职业结构与岗位建议。"
          : "/personality is the hub for overview, comparison, and navigation. A type detail page explains one personality. A recommendation detail page extends that judgment into work structure and job guidance.",
    },
    {
      question:
        locale === "zh"
          ? "这里的职业预览是不是对我个人的最终真值？"
          : "Is the career preview here a final personal truth for me?",
      answer:
        locale === "zh"
          ? "不是。这里展示的是职业样板与结构信号，用来提示下一步应该验证什么，不是对你个人的最终职业判决。"
          : "No. The preview shows role patterns and structure signals to clarify what should be validated next, not a final career verdict for you personally.",
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
