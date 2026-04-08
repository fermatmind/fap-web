import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type {
  HubCtaLink,
  HubMetric,
  PersonalityHubFamilyGroup,
  ScenarioCard,
  ScenarioMatrixCard,
  TypeDecisionCard,
} from "@/lib/mbti/personalityHub.types";

type ScenarioFamilyHint = {
  families: string[];
  topTypeCodes: string[];
  secondaryHref: string;
  secondaryLabelEn: string;
  secondaryLabelZh: string;
};

const SCENARIO_HINTS: Record<string, ScenarioFamilyHint> = {
  career_direction: {
    families: ["NT", "SJ"],
    topTypeCodes: ["INTJ", "ENTJ", "ISTJ"],
    secondaryHref: "/career/recommendations",
    secondaryLabelEn: "Browse recommendation hub",
    secondaryLabelZh: "查看职业推荐目录",
  },
  major_choice: {
    families: ["NF", "NT"],
    topTypeCodes: ["INFJ", "INFP", "INTJ"],
    secondaryHref: "/topics/mbti",
    secondaryLabelEn: "Use the MBTI topic hub",
    secondaryLabelZh: "进入 MBTI 主题中心",
  },
  team_collaboration: {
    families: ["NF", "SJ"],
    topTypeCodes: ["ENFJ", "ESFJ", "ISFJ"],
    secondaryHref: "/personality",
    secondaryLabelEn: "Review collaboration profiles",
    secondaryLabelZh: "查看协作型人格页",
  },
  relationship_patterns: {
    families: ["NF", "SP"],
    topTypeCodes: ["ENFJ", "INFP", "ESFP"],
    secondaryHref: "/topics/mbti",
    secondaryLabelEn: "Open related MBTI topics",
    secondaryLabelZh: "打开相关 MBTI 主题",
  },
  growth_plan: {
    families: ["NT", "NF", "SJ", "SP"],
    topTypeCodes: ["INTJ", "INFJ", "ISTJ"],
    secondaryHref: "/tests/mbti-personality-test-16-personality-types",
    secondaryLabelEn: "Go straight to the test",
    secondaryLabelZh: "直接开始测试",
  },
};

function buildScenarioPrimaryMetric(
  locale: Locale,
  card: ScenarioCard,
  topTypeCodes: string[],
  stableTypeCount: number
): HubMetric {
  if (card.metric) {
    return card.metric;
  }

  return {
    key: `${card.key}-primary`,
    label: locale === "zh" ? "优先切入" : "First pass",
    value: topTypeCodes[0] || String(stableTypeCount),
    tone: "positive",
  };
}

function buildScenarioSecondaryMetric(
  locale: Locale,
  card: ScenarioCard,
  stableTypeCount: number,
  familyCount: number
): HubMetric {
  return {
    key: `${card.key}-secondary`,
    label: locale === "zh" ? "稳定覆盖" : "Stable coverage",
    value:
      card.key === "growth_plan"
        ? locale === "zh"
          ? `${stableTypeCount} 个稳定类型`
          : `${stableTypeCount} stable types`
        : locale === "zh"
          ? `${familyCount} 个类型组`
          : `${familyCount} families`,
    tone: "neutral",
  };
}

function buildPrimaryCta(locale: Locale, card: ScenarioCard): HubCtaLink {
  return {
    label: locale === "zh" ? "进入该场景" : "Open this scenario",
    href: card.href,
    kind: "primary",
  };
}

function buildSecondaryCta(locale: Locale, hint: ScenarioFamilyHint): HubCtaLink {
  return {
    label: locale === "zh" ? hint.secondaryLabelZh : hint.secondaryLabelEn,
    href: localizedPath(hint.secondaryHref, locale),
    kind: "secondary",
  };
}

export function buildPersonalityScenarioMatrix(input: {
  locale: Locale;
  scenarioCards: ScenarioCard[];
  familyGroups: PersonalityHubFamilyGroup[];
  typeDecisionCards: TypeDecisionCard[];
}): ScenarioMatrixCard[] {
  return input.scenarioCards.map((card) => {
    const hint = SCENARIO_HINTS[card.key] ?? {
      families: input.familyGroups.slice(0, 2).map((group) => group.groupKey),
      topTypeCodes: input.typeDecisionCards.slice(0, 3).map((type) => type.typeCode),
      secondaryHref: "/topics/mbti",
      secondaryLabelEn: "Continue in MBTI topics",
      secondaryLabelZh: "继续查看 MBTI 主题",
    };
    const topCards = input.typeDecisionCards.filter((type) => hint.topTypeCodes.includes(type.typeCode));
    const stableTypeCount = topCards.filter((type) => type.launchTier === "stable").length;

    return {
      key: card.key,
      title: card.title,
      summary: card.summary,
      href: card.href,
      primaryMetric: buildScenarioPrimaryMetric(input.locale, card, hint.topTypeCodes, stableTypeCount),
      secondaryMetric: buildScenarioSecondaryMetric(
        input.locale,
        card,
        stableTypeCount,
        hint.families.length
      ),
      primaryCta: card.cta ?? buildPrimaryCta(input.locale, card),
      secondaryCta: buildSecondaryCta(input.locale, hint),
      familyHints: hint.families,
      topTypeCodes: hint.topTypeCodes,
    };
  });
}
