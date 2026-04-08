import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type {
  PersonalityHubFamilyGroup,
  TypeDecisionCard,
  TypeWorkbenchCard,
  TypeWorkbenchPayload,
  TypeWorkbenchSortKey,
  TypeWorkbenchSortOption,
  TypeWorkbenchTraitKey,
} from "@/lib/mbti/personalityHub.types";

function deriveTraitKeys(typeCode: string): TypeWorkbenchTraitKey[] {
  const normalized = String(typeCode ?? "").trim().toUpperCase();
  const traits: TypeWorkbenchTraitKey[] = [];

  if (normalized[0] === "I") traits.push("introvert");
  if (normalized[0] === "E") traits.push("extravert");
  if (normalized[1] === "N") traits.push("intuition");
  if (normalized[1] === "S") traits.push("sensing");
  if (normalized[2] === "T") traits.push("thinking");
  if (normalized[2] === "F") traits.push("feeling");
  if (normalized[3] === "J") traits.push("judging");
  if (normalized[3] === "P") traits.push("perceiving");

  return traits;
}

function localizeTraitLabel(locale: Locale, trait: TypeWorkbenchTraitKey): string {
  const map = {
    introvert: locale === "zh" ? "内倾" : "Introvert",
    extravert: locale === "zh" ? "外倾" : "Extravert",
    intuition: locale === "zh" ? "直觉" : "Intuitive",
    sensing: locale === "zh" ? "实感" : "Sensing",
    thinking: locale === "zh" ? "思考" : "Thinking",
    feeling: locale === "zh" ? "情感" : "Feeling",
    judging: locale === "zh" ? "判断" : "Judging",
    perceiving: locale === "zh" ? "感知" : "Perceiving",
  } as const;

  return map[trait];
}

function buildSortOptions(locale: Locale): TypeWorkbenchSortOption[] {
  return [
    {
      key: "all",
      label: locale === "zh" ? "全部 16 型" : "All 16 types",
      description: locale === "zh" ? "回到完整 inventory 顺序。" : "Reset to the full inventory order.",
    },
    {
      key: "stable",
      label: locale === "zh" ? "稳定副白名单" : "Stable launch",
      description: locale === "zh" ? "把稳定副白名单类型排到前面。" : "Move stable launch types to the front.",
    },
    {
      key: "recommendation",
      label: locale === "zh" ? "职业推荐优先" : "Recommendation-ready",
      description: locale === "zh" ? "优先显示可直接进入 recommendation 的类型。" : "Prioritize types with direct recommendation routes.",
    },
    {
      key: "analysts",
      label: locale === "zh" ? "分析家 NT" : "Analysts (NT)",
      description: locale === "zh" ? "优先查看策略与系统型类型。" : "Bring strategy and systems-led types forward.",
    },
    {
      key: "diplomats",
      label: locale === "zh" ? "外交家 NF" : "Diplomats (NF)",
      description: locale === "zh" ? "优先查看关系与意义导向类型。" : "Bring people and meaning-led types forward.",
    },
    {
      key: "sentinels",
      label: locale === "zh" ? "守护者 SJ" : "Sentinels (SJ)",
      description: locale === "zh" ? "优先查看稳定和执行型类型。" : "Bring stability and execution-led types forward.",
    },
    {
      key: "explorers",
      label: locale === "zh" ? "探索者 SP" : "Explorers (SP)",
      description: locale === "zh" ? "优先查看行动和现场反馈型类型。" : "Bring action-led types forward.",
    },
    {
      key: "introvert",
      label: locale === "zh" ? "内倾优先" : "Introverts first",
      description: locale === "zh" ? "优先排列 I 型人格。" : "Push introverted types to the front.",
    },
    {
      key: "extravert",
      label: locale === "zh" ? "外倾优先" : "Extraverts first",
      description: locale === "zh" ? "优先排列 E 型人格。" : "Push extraverted types to the front.",
    },
  ];
}

function buildWorkbenchCard(locale: Locale, card: TypeDecisionCard): TypeWorkbenchCard {
  const derivedTraitKeys = deriveTraitKeys(card.typeCode);

  return {
    ...card,
    recommendationHref: localizedPath(`/career/recommendations/mbti/${card.slug}`, locale),
    recommendationReady: true,
    derivedTraitKeys,
    derivedTraitLabels: derivedTraitKeys.map((trait) => localizeTraitLabel(locale, trait)),
  };
}

function buildSortScore(card: TypeWorkbenchCard, key: TypeWorkbenchSortKey): number {
  switch (key) {
    case "stable":
      return card.launchTier === "stable" ? 100 : card.launchTier === "candidate" ? 50 : 0;
    case "recommendation":
      return card.recommendationReady ? 100 : 0;
    case "analysts":
      return card.groupKey === "NT" ? 100 : 0;
    case "diplomats":
      return card.groupKey === "NF" ? 100 : 0;
    case "sentinels":
      return card.groupKey === "SJ" ? 100 : 0;
    case "explorers":
      return card.groupKey === "SP" ? 100 : 0;
    case "introvert":
      return card.derivedTraitKeys.includes("introvert") ? 100 : 0;
    case "extravert":
      return card.derivedTraitKeys.includes("extravert") ? 100 : 0;
    case "all":
    default:
      return 0;
  }
}

const FAMILY_ORDER = ["NT", "NF", "SJ", "SP"];

export function rankPersonalityWorkbenchCards(cards: TypeWorkbenchCard[], key: TypeWorkbenchSortKey): TypeWorkbenchCard[] {
  return [...cards].sort((a, b) => {
    const score = buildSortScore(b, key) - buildSortScore(a, key);
    if (score !== 0) {
      return score;
    }

    const familyDelta = FAMILY_ORDER.indexOf(a.groupKey) - FAMILY_ORDER.indexOf(b.groupKey);
    if (familyDelta !== 0) {
      return familyDelta;
    }

    return a.typeCode.localeCompare(b.typeCode);
  });
}

export function buildPersonalityWorkbench(input: {
  locale: Locale;
  familyGroups: PersonalityHubFamilyGroup[];
  typeDecisionCards: TypeDecisionCard[];
}): TypeWorkbenchPayload {
  return {
    sortOptions: buildSortOptions(input.locale),
    cards: input.typeDecisionCards.map((card) => buildWorkbenchCard(input.locale, card)),
  };
}
