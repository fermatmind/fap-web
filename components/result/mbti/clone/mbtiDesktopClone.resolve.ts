import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import {
  type MbtiDesktopCloneContent,
  type MbtiDesktopCloneSlots,
  type ProfileIdentity,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";

export type ResolveMbtiDesktopCloneSlotsArgs = {
  locale: Locale;
  headline: RichResultHeadline;
  dimensions: Array<Record<string, unknown>>;
  highlights: HighlightCard[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
  projectionViewModel?: MbtiResultProjectionViewModel | null;
  storageContent?: MbtiDesktopCloneContent | null;
};

const SECTION_META = {
  career: {
    step: "2",
    sectionLabel: { zh: "职业路径", en: "Career path" },
    title: { zh: "职业路径", en: "Your Career Path" },
  },
  growth: {
    step: "3",
    sectionLabel: { zh: "个人成长", en: "Personal growth" },
    title: { zh: "个人成长", en: "Your Personal Growth" },
  },
  relationships: {
    step: "4",
    sectionLabel: { zh: "关系模式", en: "Relationships" },
    title: { zh: "关系模式", en: "Your Relationships" },
  },
} as const;

function normalizeText(...values: unknown[]) {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeBaseMbtiCode(fullCode: string) {
  const match = fullCode.toUpperCase().match(/([A-Z]{4})/);
  return match?.[1] ?? fullCode.toUpperCase();
}

function resolveDisplayTitle(headline: RichResultHeadline, projectionViewModel?: MbtiResultProjectionViewModel | null) {
  return normalizeText(headline.displayName, projectionViewModel?.typeName, headline.typeCode, "MBTI");
}

function normalizeDimensionPercent(dimension: Record<string, unknown> | null | undefined): number {
  const value = Number(
    dimension?.dominantPct ??
      dimension?.dominant_pct ??
      dimension?.percent ??
      dimension?.pct ??
      0,
  );

  return Number.isFinite(value) ? Math.round(value) : 0;
}

function resolveProfileIdentity(
  fullCode: string,
  headline: RichResultHeadline,
  projectionViewModel?: MbtiResultProjectionViewModel | null,
  storageContent?: MbtiDesktopCloneContent | null,
): ProfileIdentity {
  const authored = storageContent?.hero.profileIdentity;

  return {
    code: normalizeText(authored?.code, fullCode),
    name: normalizeText(authored?.name, resolveDisplayTitle(headline, projectionViewModel)),
    nickname: normalizeText(authored?.nickname),
    rarity: normalizeText(authored?.rarity),
    keywords: Array.isArray(authored?.keywords)
      ? authored.keywords.map((keyword) => normalizeText(keyword)).filter((keyword) => keyword.length > 0).slice(0, 6)
      : [],
  };
}

function buildDimensionSummary(
  dimensions: Array<Record<string, unknown>>,
  headline: RichResultHeadline,
  projectionViewModel?: MbtiResultProjectionViewModel | null,
) {
  const primary = dimensions[0] ?? null;
  const roundedPercent = normalizeDimensionPercent(primary);
  const fallback = MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.summaryPane;
  const axisTitle = normalizeText(primary?.axisTitle, primary?.axis_title, primary?.label, fallback.eyebrow);
  const dominantLabel = normalizeText(
    primary?.dominantLabel,
    primary?.dominant_label,
    primary?.sideLabel,
    primary?.side_label,
    resolveDisplayTitle(headline, projectionViewModel),
    fallback.title,
  );

  return {
    eyebrow: axisTitle || fallback.eyebrow,
    title: dominantLabel,
    value: roundedPercent > 0 ? `${roundedPercent}%` : fallback.value,
    body: normalizeText(primary?.summary, headline.supportingLine, headline.summary, fallback.body),
  };
}

export function resolveMbtiDesktopCloneSlots({
  locale,
  headline,
  dimensions,
  projectionViewModel,
  storageContent = null,
}: ResolveMbtiDesktopCloneSlotsArgs): MbtiDesktopCloneSlots {
  const fullCode = normalizeText(headline.typeCode, projectionViewModel?.displayType).toUpperCase() || "MBTI";
  const baseCode = normalizeBaseMbtiCode(fullCode);
  const isZh = locale === "zh";
  const language = isZh ? "zh" : "en";
  const content = isZh ? storageContent : null;
  const placeholders = MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH;
  const dimensionSummary = buildDimensionSummary(dimensions, headline, projectionViewModel);
  const authoringLevel = content ? "fullCode" : "placeholder";
  const contentSource = content ? "storage" : "placeholder";
  const profileIdentity = resolveProfileIdentity(fullCode, headline, projectionViewModel, content);

  return {
    meta: {
      baseCode,
      fullCode,
      locale,
      authoringLevel,
      contentSource,
    },
    hero: {
      profileIdentity,
      eyebrow: isZh ? "你的人格类型是" : "Your personality type is",
      title: resolveDisplayTitle(headline, projectionViewModel),
      typeCode: fullCode,
      summary: content?.hero.summary ?? headline.summary ?? headline.supportingLine ?? placeholders.hero.summary,
      asset: placeholders.hero.asset,
    },
    intro: {
      paragraphs: content?.intro.paragraphs ?? placeholders.intro.paragraphs,
    },
    lettersIntro: content?.lettersIntro ?? null,
    overview: content?.overview ?? null,
    traits: {
      sectionLabel: placeholders.traits.sectionLabel,
      title: isZh ? "人格特质" : "Personality Traits",
      asset: placeholders.traits.asset,
      summaryPane: {
        eyebrow: content?.traits.summaryPane.eyebrow ?? dimensionSummary.eyebrow,
        title: content?.traits.summaryPane.title ?? dimensionSummary.title,
        value: content?.traits.summaryPane.value ?? dimensionSummary.value,
        body: content?.traits.summaryPane.body ?? dimensionSummary.body,
        asset: placeholders.traits.summaryPane.asset,
      },
      body: content?.traits.body ?? placeholders.traits.body,
    },
    chapters: {
      career: {
        step: SECTION_META.career.step,
        sectionLabel: SECTION_META.career.sectionLabel[language],
        title: SECTION_META.career.title[language],
        asset: placeholders.chapters.career.asset,
        intro: content?.chapters.career.intro ?? placeholders.chapters.career.intro,
        strengths: content?.chapters.career.strengths ?? null,
        weaknesses: content?.chapters.career.weaknesses ?? null,
        matchedJobs: content?.chapters.career.matchedJobs ?? null,
        matchedGuides: content?.chapters.career.matchedGuides ?? null,
        careerIdeas: content?.chapters.career.careerIdeas ?? null,
        workStyles: content?.chapters.career.workStyles ?? null,
        whatEnergizes: null,
        whatDrains: null,
        superpowers: null,
        pitfalls: null,
        influentialTraits: content?.chapters.career.influentialTraits ?? placeholders.chapters.career.influentialTraits,
        traitsUnlock: content?.chapters.career.traitsUnlock ?? null,
        visibleBlocks: content?.chapters.career.visibleBlocks ?? placeholders.chapters.career.visibleBlocks,
        lockedBlocks: content?.chapters.career.lockedBlocks ?? placeholders.chapters.career.lockedBlocks,
      },
      growth: {
        step: SECTION_META.growth.step,
        sectionLabel: SECTION_META.growth.sectionLabel[language],
        title: SECTION_META.growth.title[language],
        asset: placeholders.chapters.growth.asset,
        intro: content?.chapters.growth.intro ?? placeholders.chapters.growth.intro,
        strengths: content?.chapters.growth.strengths ?? null,
        weaknesses: content?.chapters.growth.weaknesses ?? null,
        matchedJobs: null,
        matchedGuides: null,
        careerIdeas: null,
        workStyles: null,
        whatEnergizes: content?.chapters.growth.whatEnergizes ?? null,
        whatDrains: content?.chapters.growth.whatDrains ?? null,
        superpowers: null,
        pitfalls: null,
        influentialTraits: content?.chapters.growth.influentialTraits ?? placeholders.chapters.growth.influentialTraits,
        traitsUnlock: content?.chapters.growth.traitsUnlock ?? null,
        visibleBlocks: content?.chapters.growth.visibleBlocks ?? placeholders.chapters.growth.visibleBlocks,
        lockedBlocks: content?.chapters.growth.lockedBlocks ?? placeholders.chapters.growth.lockedBlocks,
      },
      relationships: {
        step: SECTION_META.relationships.step,
        sectionLabel: SECTION_META.relationships.sectionLabel[language],
        title: SECTION_META.relationships.title[language],
        asset: placeholders.chapters.relationships.asset,
        intro: content?.chapters.relationships.intro ?? placeholders.chapters.relationships.intro,
        strengths: content?.chapters.relationships.strengths ?? null,
        weaknesses: content?.chapters.relationships.weaknesses ?? null,
        matchedJobs: null,
        matchedGuides: null,
        careerIdeas: null,
        workStyles: null,
        whatEnergizes: null,
        whatDrains: null,
        superpowers: content?.chapters.relationships.superpowers ?? null,
        pitfalls: content?.chapters.relationships.pitfalls ?? null,
        influentialTraits:
          content?.chapters.relationships.influentialTraits ?? placeholders.chapters.relationships.influentialTraits,
        traitsUnlock: content?.chapters.relationships.traitsUnlock ?? null,
        visibleBlocks: content?.chapters.relationships.visibleBlocks ?? placeholders.chapters.relationships.visibleBlocks,
        lockedBlocks: content?.chapters.relationships.lockedBlocks ?? placeholders.chapters.relationships.lockedBlocks,
      },
    },
    finalOffer: {
      eyebrow: content?.finalOffer.eyebrow ?? placeholders.finalOffer.eyebrow,
      headline: content?.finalOffer.headline ?? placeholders.finalOffer.headline,
      body: content?.finalOffer.body ?? placeholders.finalOffer.body,
      priceLabel: content?.finalOffer.priceLabel ?? placeholders.finalOffer.priceLabel,
      ctaLabel: content?.finalOffer.ctaLabel ?? placeholders.finalOffer.ctaLabel,
      guarantee: content?.finalOffer.guarantee ?? placeholders.finalOffer.guarantee,
      asset: placeholders.finalOffer.asset,
    },
  };
}
