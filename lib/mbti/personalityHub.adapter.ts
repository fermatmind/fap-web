import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";
import type { CmsPersonalityProfileSummary } from "@/lib/cms/personality";
import { buildDefaultPublicPersonalitySlug } from "@/lib/cms/personality";
import type { LandingSurfaceViewModel } from "@/lib/landing/landingSurface";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getMbtiAdsLaunchTier } from "@/lib/mbti/adsPolicy";
import { MBTI_TYPE_GROUPS } from "@/lib/mbti/mbtiTypeContentPack";
import { buildDefaultMbtiSceneBlocks } from "@/lib/mbti/sceneBlocks";
import type {
  CareerPreviewCard,
  FaqBlock,
  MethodologyBlock,
  PersonalityHubFamilyGroup,
  PersonalityHubPayload,
  ScenarioCard,
  TypeDecisionCard,
} from "@/lib/mbti/personalityHub.types";

const MBTI_GROUP_ORDER = ["NT", "NF", "SJ", "SP"] as const;

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
  typeCode: string;
  personality?: CmsPersonalityProfileSummary;
  groupKey: (typeof MBTI_GROUP_ORDER)[number];
}): TypeDecisionCard {
  const { locale, typeCode, personality, groupKey } = params;
  const groupMeta = MBTI_GROUP_META[groupKey][locale];

  return {
    typeCode,
    slug: buildDefaultPublicPersonalitySlug(typeCode),
    title: personality?.title || typeCode,
    excerpt: personality?.excerpt || personality?.subtitle || groupMeta.summary,
    href: localizedPath(`/personality/${buildDefaultPublicPersonalitySlug(typeCode)}`, locale),
    groupKey,
    groupTitle: groupMeta.title,
    launchTier: getMbtiAdsLaunchTier(typeCode),
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
  const personalityByType = new Map(
    input.personalities.map((personality) => [String(personality.typeCode ?? "").toUpperCase(), personality])
  );

  return MBTI_GROUP_ORDER.map((groupKey) => ({
    groupKey,
    title: MBTI_GROUP_META[groupKey][input.locale].title,
    summary: MBTI_GROUP_META[groupKey][input.locale].summary,
    cards: MBTI_TYPE_GROUPS[groupKey].map((typeCode) =>
      buildTypeDecisionCard({
        locale: input.locale,
        typeCode,
        personality: personalityByType.get(typeCode),
        groupKey,
      })
    ),
  }));
}

function buildCareerPreviewCards(input: BuildPersonalityHubPayloadInput): CareerPreviewCard[] {
  return MBTI_GROUP_ORDER.map((groupKey) => {
    const meta = MBTI_GROUP_META[groupKey][input.locale];
    const representativeType = MBTI_TYPE_GROUPS[groupKey][0];

    return {
      key: groupKey,
      title: input.locale === "zh" ? `${meta.title}职业预览` : `${meta.title} career preview`,
      summary:
        input.locale === "zh"
          ? `先从 ${representativeType} 切入该类型组的职业判断路径，再进入对应 recommendation 页面。`
          : `Start with ${representativeType} to inspect the career decision pattern for this family, then move into the recommendation detail route.`,
      href: localizedPath(
        `/career/recommendations/mbti/${buildDefaultPublicPersonalitySlug(representativeType)}`,
        input.locale
      ),
      keywords: [representativeType, meta.title],
      matchedJobSlugs: [representativeType.toLowerCase()],
    };
  });
}

function buildMethodologyBlocks(locale: Locale): MethodologyBlock[] {
  return [
    {
      key: "coverage",
      title: locale === "zh" ? "内容覆盖" : "Coverage",
      body:
        locale === "zh"
          ? "当前 hub 基于已发布人格摘要、场景入口和职业推荐目录进行聚合，不改动 source authority。"
          : "The current hub aggregates published personality summaries, scenario entry points, and career recommendation routes without changing source authority.",
    },
    {
      key: "inventory",
      title: locale === "zh" ? "目录完整性" : "Inventory integrity",
      body:
        locale === "zh"
          ? "16 型链接 inventory 始终由 adapter 完整输出，后续动态重排只允许改变顺序，不允许改变 crawlable inventory。"
          : "The adapter always outputs the full 16-type link inventory. Future dynamic reordering may change ranking, not crawlable inventory.",
    },
  ];
}

function buildFaqBlocks(locale: Locale): FaqBlock[] {
  return [
    {
      question: locale === "zh" ? "这里是测试入口还是人格目录？" : "Is this the test landing or the personality directory?",
      answer:
        locale === "zh"
          ? "这里是 16 型人格发布中心。测试仍然从 MBTI landing 进入，这里负责浏览、比较与继续探索。"
          : "This is the 16-type release hub. Testing still starts from the MBTI landing page, while this page is for browsing, comparing, and continuing exploration.",
    },
  ];
}

export function buildPersonalityHubPayload(input: BuildPersonalityHubPayloadInput): PersonalityHubPayload {
  const familyGroups = buildFamilyGroups(input);
  const typeDecisionCards = familyGroups.flatMap((group) => group.cards);
  const summaryBody =
    input.landingSurface?.summaryBlocks[0]?.body ||
    (input.locale === "zh"
      ? "16 型人格的优势、风险、关系模式与职业方向。"
      : "Strengths, risks, relationship patterns, and career direction across all 16 types.");

  return {
    hero: {
      eyebrow: "MBTI Content Framework",
      title: input.locale === "zh" ? "人格类型" : "Personality types",
      summary: summaryBody,
      primaryCta: {
        label: input.locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test",
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
          label: input.locale === "zh" ? "按类型组浏览 16 型" : "Browse all 16 by family",
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
      ],
    },
    scenarioCards: buildScenarioCards(input),
    familyGroups,
    typeDecisionCards,
    careerPreviewCards: buildCareerPreviewCards(input),
    methodologyBlocks: buildMethodologyBlocks(input.locale),
    faqBlocks: buildFaqBlocks(input.locale),
    inventoryLinks: typeDecisionCards.map((card) => ({
      typeCode: card.typeCode,
      href: card.href,
    })),
    quickLocateSeed: typeDecisionCards.map((card) => ({
      query: card.typeCode,
      matchedTypeCodes: [card.typeCode],
    })),
    faqItems: buildFaqBlocks(input.locale),
    methodologyItems: buildMethodologyBlocks(input.locale),
    jsonLdInputs: {
      faqItems: buildFaqBlocks(input.locale),
      typeItemList: typeDecisionCards.map((card) => ({
        name: `${card.typeCode} · ${card.title}`,
        url: card.href,
      })),
    },
  };
}
