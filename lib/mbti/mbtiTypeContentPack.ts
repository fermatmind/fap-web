import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import {
  MBTI_TYPE_CONTENT_PACKS,
  type MbtiTypeContentPackKey,
} from "./mbtiTypeContentPacks.generated";
import {
  getIntpPersonalityContent as getLegacyIntpPersonalityContent,
  getIntpRecommendationContent as getLegacyIntpRecommendationContent,
  type IntpPersonalityRenderCopy,
  type IntpRecommendationRenderCopy,
} from "./intpContentPack";

export const MBTI_TYPE_CODES = [
  "INTJ",
  "ENTP",
  "ENTJ",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
  "INTP",
] as const;

export const MBTI_TYPE_GROUPS = {
  NT: ["INTJ", "ENTP", "ENTJ", "INTP"],
  NF: ["INFP", "INFJ", "ENFJ", "ENFP"],
  SJ: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  SP: ["ISTP", "ISFP", "ESTP", "ESFP"],
} as const;

type MbtiVariant = "a" | "t";

type RenderedLink = {
  key: string;
  label: string;
  href: string;
};

type RenderedHeroCopy = {
  summary: string;
  positioning: string;
  coreStrength: string;
  realWorldFriction: string;
  nextStepHint: string;
  variantDeltaA: string;
  variantDeltaT: string;
  primaryCta: string;
  secondaryCta1: string;
  secondaryCta2: string;
};

type RenderedSceneCopy = {
  summary: string;
  bottleneck: string;
  advice: string;
  strengths: readonly string[];
  risks: readonly string[];
  why: string;
  variantDeltaA: string;
  variantDeltaT: string;
  nextLinks: RenderedLink[];
};

type PersonalitySupportLinks = {
  topicBacklink: RenderedLink;
  recommendationBacklink: RenderedLink;
  testEntryLink: RenderedLink;
  linkedGuides: RenderedLink[];
  linkedArticles: RenderedLink[];
};

type SceneRole = "career" | "team" | "growth";

type RenderedPersonalityPack = {
  hero: RenderedHeroCopy;
  careerDirection: RenderedSceneCopy;
  teamCollaboration: RenderedSceneCopy;
  growthPlanning: RenderedSceneCopy;
  ctaGroup: {
    primary: string;
    secondary1: string;
    secondary2: string;
  };
};

export type MbtiPersonalityContentCopy = {
  typeCode: string;
  variant: MbtiVariant;
  common: RenderedPersonalityPack;
  variantCopy: RenderedPersonalityPack;
  support: PersonalitySupportLinks;
};

export type MbtiRecommendationContentCopy = {
  typeCode: string;
  variant: MbtiVariant;
  heroSummary: string;
  fitWhy: string;
  costWhy: string;
  jobStructure: string;
  variantRisk: string;
  nextStep: string;
  ctaGroup: {
    primary: string;
    secondary1: string;
    secondary2: string;
  };
  support: {
    topicBacklink: RenderedLink;
    nextSteps: RenderedLink[];
    linkedGuides: RenderedLink[];
    linkedArticles: RenderedLink[];
  };
};

function normalizeTypeCode(value: string): string {
  return String(value ?? "").trim().toUpperCase().slice(0, 4);
}

function resolveVariantSlug(value: string): MbtiVariant | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized.endsWith("-a")) {
    return "a";
  }
  if (normalized.endsWith("-t")) {
    return "t";
  }
  return null;
}

function resolveTypeFromSlug(value: string): { typeCode: string; variant: MbtiVariant } | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("INTP")) {
    const variant = resolveVariantSlug(value) ?? "a";
    return { typeCode: "INTP", variant };
  }

  const compact = normalizeTypeCode(normalized.replace(/-(A|T)$/i, ""));
  if (!MBTI_TYPE_CODES.includes(compact as (typeof MBTI_TYPE_CODES)[number])) {
    return null;
  }

  return {
    typeCode: compact,
    variant: resolveVariantSlug(value) ?? "a",
  };
}

function localizeLabel(locale: Locale, zh: string, en: string): string {
  return locale === "zh" ? zh : en;
}

function localizeLink(locale: Locale, key: string, zh: string, en: string, href: string): RenderedLink {
  return {
    key,
    label: localizeLabel(locale, zh, en),
    href,
  };
}

function buildSharedGuideLinks(locale: Locale): RenderedLink[] {
  return [
    localizeLink(locale, "mbti-basics", "MBTI 基础指南", "MBTI basics guide", localizedPath("/articles/mbti-basics", locale)),
    localizeLink(locale, "mbti-growth-guide", "成长建议指南", "MBTI growth guide", localizedPath("/articles/mbti-growth-guide", locale)),
    localizeLink(locale, "mbti-narrative-portrait", "类型叙事画像", "Narrative portrait", localizedPath("/articles/mbti-narrative-portrait", locale)),
    localizeLink(locale, "mbti-job-fit-guide", "职业匹配指南", "MBTI job fit guide", localizedPath("/career/guides/from-mbti-to-job-fit", locale)),
  ];
}

function buildSharedArticleLinks(locale: Locale): RenderedLink[] {
  return [
    localizeLink(locale, "mbti-basic", "MBTI 基础", "MBTI basics", localizedPath("/articles/mbti-basics", locale)),
    localizeLink(locale, "mbti-growth", "成长建议", "Growth guidance", localizedPath("/articles/mbti-growth-guide", locale)),
    localizeLink(locale, "mbti-narrative", "类型叙事画像", "Type narrative portrait", localizedPath("/articles/mbti-narrative-portrait", locale)),
  ];
}

function buildSupportLinks(typeCode: string, variant: MbtiVariant, locale: Locale): PersonalitySupportLinks {
  return {
    topicBacklink: localizeLink(locale, "mbti_topic", "返回 MBTI 主题页", "Back to MBTI topic", localizedPath("/topics/mbti", locale)),
    recommendationBacklink: localizeLink(
      locale,
      `${typeCode.toLowerCase()}-${variant}-recommendation`,
      variant === "a" ? `${typeCode}-A 职业建议` : `${typeCode}-T 职业建议`,
      variant === "a" ? `${typeCode}-A career recommendations` : `${typeCode}-T career recommendations`,
      localizedPath(`/career/recommendations/mbti/${typeCode.toLowerCase()}-${variant}`, locale)
    ),
    testEntryLink: localizeLink(
      locale,
      "mbti-test-landing",
      "开始 MBTI 深度测试",
      "Start MBTI deep test",
      localizedPath("/tests/mbti-personality-test-16-personality-types", locale)
    ),
    linkedGuides: buildSharedGuideLinks(locale),
    linkedArticles: buildSharedArticleLinks(locale),
  };
}

function buildSceneNextLinks(
  typeCode: string,
  variant: MbtiVariant,
  locale: Locale,
  scene: SceneRole
): RenderedLink[] {
  const support = buildSupportLinks(typeCode, variant, locale);
  const guidanceHref = localizedPath("/career/guides/from-mbti-to-job-fit", locale);

  if (scene === "career") {
    return [
      support.recommendationBacklink,
      localizeLink(
        locale,
        "mbti-job-fit-guide",
        "职业匹配指南",
        "MBTI job fit guide",
        guidanceHref
      ),
      support.testEntryLink,
    ];
  }

  if (scene === "team") {
    return [
      support.topicBacklink,
      support.recommendationBacklink,
      support.testEntryLink,
    ];
  }

  return [
    support.topicBacklink,
    support.recommendationBacklink,
    support.testEntryLink,
  ];
}

function buildHeroCtas(typeCode: string, variant: MbtiVariant, locale: Locale): { primary: string; secondary1: string; secondary2: string } {
  const variantLabel = `${typeCode}-${variant.toUpperCase()}`;
  return {
    primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
    secondary1: localizeLabel(
      locale,
      `查看 ${variantLabel} 职业建议`,
      `View ${variantLabel} career recommendations`
    ),
    secondary2: localizeLabel(locale, "进入 MBTI 主题中心", "Back to MBTI topic"),
  };
}

function buildCommonHeroCtas(typeCode: string, locale: Locale): { primary: string; secondary1: string; secondary2: string } {
  return {
    primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
    secondary1: localizeLabel(locale, `查看 ${typeCode} 职业建议`, `View ${typeCode} career recommendations`),
    secondary2: localizeLabel(locale, `比较 ${typeCode}-A 与 ${typeCode}-T`, `Compare ${typeCode}-A and ${typeCode}-T`),
  };
}

function renderHero(raw: { summary: string; positioning: string; coreStrength: string; realWorldFriction: string; nextStepHint: string; variantDeltaA: string; variantDeltaT: string }, ctas: { primary: string; secondary1: string; secondary2: string }): RenderedHeroCopy {
  return {
    summary: raw.summary,
    positioning: raw.positioning,
    coreStrength: raw.coreStrength,
    realWorldFriction: raw.realWorldFriction,
    nextStepHint: raw.nextStepHint,
    variantDeltaA: raw.variantDeltaA,
    variantDeltaT: raw.variantDeltaT,
    primaryCta: ctas.primary,
    secondaryCta1: ctas.secondary1,
    secondaryCta2: ctas.secondary2,
  };
}

function renderSceneCopy(
  typeCode: string,
  variant: MbtiVariant,
  locale: Locale,
  scene: SceneRole,
  raw: {
    summary: string;
    bottleneck?: string;
    advice?: string;
    strengths: readonly string[];
    risks: readonly string[];
    why: string;
    variantDeltaA: string;
    variantDeltaT: string;
  }
): RenderedSceneCopy {
  return {
    summary: raw.summary,
    bottleneck: raw.bottleneck ?? "",
    advice: raw.advice ?? "",
    strengths: raw.strengths,
    risks: raw.risks,
    why: raw.why,
    variantDeltaA: raw.variantDeltaA,
    variantDeltaT: raw.variantDeltaT,
    nextLinks: buildSceneNextLinks(typeCode, variant, locale, scene),
  };
}

function renderPersonalityPack(
  typeCode: string,
  variant: MbtiVariant,
  locale: Locale,
  rawPack: (typeof MBTI_TYPE_CONTENT_PACKS)[MbtiTypeContentPackKey]
): RenderedPersonalityPack {
  const source = variant === "a" ? rawPack.a : rawPack.t;
  return {
    hero: renderHero(source.hero, buildHeroCtas(typeCode, variant, locale)),
    careerDirection: renderSceneCopy(typeCode, variant, locale, "career", source.career),
    teamCollaboration: renderSceneCopy(typeCode, variant, locale, "team", source.team),
    growthPlanning: renderSceneCopy(typeCode, variant, locale, "growth", source.growth),
    ctaGroup: buildHeroCtas(typeCode, variant, locale),
  };
}

function renderCommonPersonalityPack(
  typeCode: string,
  locale: Locale,
  rawPack: (typeof MBTI_TYPE_CONTENT_PACKS)[MbtiTypeContentPackKey]
): RenderedPersonalityPack {
  const common = rawPack.common;
  return {
    hero: renderHero(common.hero, buildCommonHeroCtas(typeCode, locale)),
    careerDirection: renderSceneCopy(typeCode, "a", locale, "career", common.career),
    teamCollaboration: renderSceneCopy(typeCode, "a", locale, "team", common.team),
    growthPlanning: renderSceneCopy(typeCode, "a", locale, "growth", common.growth),
    ctaGroup: buildCommonHeroCtas(typeCode, locale),
  };
}

function buildRecommendationSupportLinks(typeCode: string, variant: MbtiVariant, locale: Locale): MbtiRecommendationContentCopy["support"] {
  const support = buildSupportLinks(typeCode, variant, locale);
  return {
    topicBacklink: support.topicBacklink,
    nextSteps: [
      support.recommendationBacklink,
      support.topicBacklink,
      support.testEntryLink,
      localizeLink(locale, "mbti-job-fit-guide", "职业匹配指南", "MBTI job fit guide", localizedPath("/career/guides/from-mbti-to-job-fit", locale)),
    ],
    linkedGuides: support.linkedGuides,
    linkedArticles: support.linkedArticles,
  };
}

function renderRecommendationCopy(
  typeCode: string,
  variant: MbtiVariant,
  locale: Locale,
  rawPack: (typeof MBTI_TYPE_CONTENT_PACKS)[MbtiTypeContentPackKey]
): MbtiRecommendationContentCopy {
  const source = rawPack.common.recommendation;
  const variantRisk = variant === "a" ? source.variantRiskA : source.variantRiskT;
  return {
    typeCode,
    variant,
    heroSummary: source.heroSummary,
    fitWhy: source.fitWhy,
    costWhy: source.costWhy,
    jobStructure: source.jobStructure,
    variantRisk: `${variant === "a" ? localizeLabel(locale, "A 型风险：", "A-variant risk:") : localizeLabel(locale, "T 型风险：", "T-variant risk:")} ${variantRisk}`,
    nextStep: source.nextStep,
    ctaGroup: {
      primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
      secondary1: localizeLabel(locale, "查看职业推荐", "View career recommendations"),
      secondary2: localizeLabel(locale, "进入 MBTI 主题中心", "Back to MBTI topic"),
    },
    support: buildRecommendationSupportLinks(typeCode, variant, locale),
  };
}

function adaptLegacyIntpPersonalityContent(
  legacy: IntpPersonalityRenderCopy,
  variant: MbtiVariant,
  locale: Locale
): MbtiPersonalityContentCopy {
  const commonHero: RenderedHeroCopy = {
    summary: legacy.heroSummary,
    positioning: legacy.heroPositioning,
    coreStrength: legacy.heroCoreStrength,
    realWorldFriction: legacy.heroRealWorldFriction,
    nextStepHint: legacy.heroNextStepHint,
    variantDeltaA: legacy.variantDelta,
    variantDeltaT: legacy.variantDelta,
    primaryCta: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
    secondaryCta1: localizeLabel(locale, "查看 INTP 职业建议", "View INTP career recommendations"),
    secondaryCta2: localizeLabel(locale, "比较 INTP-A 与 INTP-T", "Compare INTP-A and INTP-T"),
  };

  const toScene = (scene: IntpPersonalityRenderCopy["careerDirection"], role: SceneRole): RenderedSceneCopy => ({
    summary: scene.summary,
    bottleneck: "",
    advice: "",
    strengths: scene.strengths,
    risks: scene.risks,
    why: scene.why,
    variantDeltaA: scene.variantDelta,
    variantDeltaT: scene.variantDelta,
    nextLinks: scene.nextLinks.map((link) => ({
      key: link.key,
      label: link.label,
      href: link.href,
    })),
  });

  return {
    typeCode: "INTP",
    variant,
    common: {
      hero: commonHero,
      careerDirection: toScene(legacy.careerDirection, "career"),
      teamCollaboration: toScene(legacy.teamCollaboration, "team"),
      growthPlanning: toScene(legacy.growthPlanning, "growth"),
      ctaGroup: {
        primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
        secondary1: localizeLabel(locale, "查看 INTP 职业建议", "View INTP career recommendations"),
        secondary2: localizeLabel(locale, "比较 INTP-A 与 INTP-T", "Compare INTP-A and INTP-T"),
      },
    },
    variantCopy: {
      hero: commonHero,
      careerDirection: toScene(legacy.careerDirection, "career"),
      teamCollaboration: toScene(legacy.teamCollaboration, "team"),
      growthPlanning: toScene(legacy.growthPlanning, "growth"),
      ctaGroup: {
        primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
        secondary1: localizeLabel(locale, `查看 INTP-${variant.toUpperCase()} 职业建议`, `View INTP-${variant.toUpperCase()} career recommendations`),
        secondary2: localizeLabel(locale, "进入 MBTI 主题中心", "Back to MBTI topic"),
      },
    },
    support: {
      topicBacklink: {
        key: "mbti_topic",
        label: localizeLabel(locale, "返回 MBTI 主题页", "Back to MBTI topic"),
        href: localizedPath("/topics/mbti", locale),
      },
      recommendationBacklink:
        variant === "a" ? legacy.recommendationBacklink : legacy.recommendationBacklink,
      testEntryLink: legacy.testEntryLink,
      linkedGuides: legacy.linkedGuides,
      linkedArticles: legacy.linkedArticles,
    },
  };
}

function adaptLegacyIntpRecommendationContent(
  legacy: IntpRecommendationRenderCopy,
  variant: MbtiVariant,
  locale: Locale
): MbtiRecommendationContentCopy {
  return {
    typeCode: "INTP",
    variant,
    heroSummary: legacy.heroSummary,
    fitWhy: legacy.fitWhy,
    costWhy: legacy.costWhy,
    jobStructure: legacy.jobStructure,
    variantRisk: legacy.variantRisk,
    nextStep: localizeLabel(
      locale,
      "查看职业深度指南；重新验证结果；查看团队协作 / 成长建议；开始 144 题深度版本。",
      "Read career deep guidance; re-validate results; review collaboration / growth guidance; start the 144-question deep version."
    ),
    ctaGroup: {
      primary: localizeLabel(locale, "开始 MBTI 深度测试", "Start MBTI deep test"),
      secondary1: localizeLabel(locale, "查看职业推荐", "View career recommendations"),
      secondary2: localizeLabel(locale, "进入 MBTI 主题中心", "Back to MBTI topic"),
    },
    support: {
      topicBacklink: legacy.topicBacklink,
      nextSteps: legacy.nextSteps,
      linkedGuides: legacy.linkedGuides,
      linkedArticles: legacy.linkedArticles,
    },
  };
}

export function getMbtiPersonalityContent(slug: string, locale: Locale): MbtiPersonalityContentCopy | null {
  const resolved = resolveTypeFromSlug(slug);
  if (!resolved) {
    return null;
  }

  if (resolved.typeCode === "INTP") {
    const legacy = getLegacyIntpPersonalityContent(`${resolved.typeCode.toLowerCase()}-${resolved.variant}`, locale);
    if (!legacy) {
      return null;
    }
    return adaptLegacyIntpPersonalityContent(legacy, resolved.variant, locale);
  }

  const rawPack = MBTI_TYPE_CONTENT_PACKS[resolved.typeCode as MbtiTypeContentPackKey];
  if (!rawPack) {
    return null;
  }

  return {
    typeCode: resolved.typeCode,
    variant: resolved.variant,
    common: renderCommonPersonalityPack(resolved.typeCode, locale, rawPack),
    variantCopy: renderPersonalityPack(resolved.typeCode, resolved.variant, locale, rawPack),
    support: buildSupportLinks(resolved.typeCode, resolved.variant, locale),
  };
}

export function getMbtiRecommendationContent(slug: string, locale: Locale): MbtiRecommendationContentCopy | null {
  const resolved = resolveTypeFromSlug(slug);
  if (!resolved) {
    return null;
  }

  if (resolved.typeCode === "INTP") {
    const legacy = getLegacyIntpRecommendationContent(`${resolved.typeCode.toLowerCase()}-${resolved.variant}`, locale);
    if (!legacy) {
      return null;
    }
    return adaptLegacyIntpRecommendationContent(legacy, resolved.variant, locale);
  }

  const rawPack = MBTI_TYPE_CONTENT_PACKS[resolved.typeCode as MbtiTypeContentPackKey];
  if (!rawPack) {
    return null;
  }

  return renderRecommendationCopy(resolved.typeCode, resolved.variant, locale, rawPack);
}
