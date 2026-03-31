import type { HighlightCard, MbtiSectionUnlock, ReportSection, ResolvedOffer, RichResultHeadline } from "@/components/result/RichResultReport";
import { MBTI_DESKTOP_CLONE_CONTENT_ZH_32 } from "@/components/result/mbti/clone/content";
import {
  MBTI_FULL_CODES,
  type MbtiDesktopCloneContent,
  type MbtiDesktopCloneSlots,
  type MbtiFullCode,
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
};

const SECTION_META = {
  career: {
    step: "2",
    sectionLabel: { zh: "职业路径", en: "Career path" },
    title: { zh: "Your Career Path", en: "Your Career Path" },
  },
  growth: {
    step: "3",
    sectionLabel: { zh: "个人成长", en: "Personal growth" },
    title: { zh: "Your Personal Growth", en: "Your Personal Growth" },
  },
  relationships: {
    step: "4",
    sectionLabel: { zh: "关系模式", en: "Relationships" },
    title: { zh: "Your Relationships", en: "Your Relationships" },
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

function isMbtiFullCode(value: string): value is MbtiFullCode {
  return (MBTI_FULL_CODES as readonly string[]).includes(value);
}

function resolveDisplayTitle(headline: RichResultHeadline, projectionViewModel?: MbtiResultProjectionViewModel | null) {
  return normalizeText(headline.displayName, projectionViewModel?.typeName, headline.typeCode, "MBTI");
}

function buildDimensionSummary(
  dimensions: Array<Record<string, unknown>>,
  headline: RichResultHeadline,
  projectionViewModel?: MbtiResultProjectionViewModel | null,
) {
  const primary =
    [...dimensions].sort(
      (left, right) =>
        Number(right.percent ?? right.score ?? right.value ?? 0) - Number(left.percent ?? left.score ?? left.value ?? 0),
    )[0] ?? null;
  const percent = Number(primary?.percent ?? primary?.score ?? primary?.value ?? 0);
  const roundedPercent = Number.isFinite(percent) ? Math.round(percent) : 0;
  const fallback = MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.traits.summaryPane;

  return {
    eyebrow: fallback.eyebrow,
    title: normalizeText(primary?.winnerLabel, primary?.sideLabel, resolveDisplayTitle(headline, projectionViewModel), fallback.title),
    value: roundedPercent > 0 ? `${roundedPercent}%` : fallback.value,
    body: normalizeText(primary?.summary, headline.supportingLine, headline.summary, fallback.body),
  };
}

function resolveZhContent(fullCode: string): MbtiDesktopCloneContent | null {
  if (!isMbtiFullCode(fullCode)) {
    return null;
  }

  return MBTI_DESKTOP_CLONE_CONTENT_ZH_32[fullCode];
}

export function resolveMbtiDesktopCloneSlots({
  locale,
  headline,
  dimensions,
  projectionViewModel,
}: ResolveMbtiDesktopCloneSlotsArgs): MbtiDesktopCloneSlots {
  const fullCode = normalizeText(headline.typeCode, projectionViewModel?.displayType).toUpperCase() || "MBTI";
  const baseCode = normalizeBaseMbtiCode(fullCode);
  const isZh = locale === "zh";
  const language = isZh ? "zh" : "en";
  const content = isZh ? resolveZhContent(fullCode) : null;
  const placeholders = MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH;
  const dimensionSummary = buildDimensionSummary(dimensions, headline, projectionViewModel);
  const authoringLevel = content ? "fullCode" : "placeholder";

  return {
    meta: {
      baseCode,
      fullCode,
      locale,
      authoringLevel,
    },
    hero: {
      eyebrow: isZh ? "你的人格类型是" : "Your personality type is",
      title: resolveDisplayTitle(headline, projectionViewModel),
      typeCode: fullCode,
      summary: content?.hero.summary ?? placeholders.hero.summary,
      asset: placeholders.hero.asset,
    },
    intro: {
      paragraphs: content?.intro.paragraphs ?? placeholders.intro.paragraphs,
    },
    traits: {
      sectionLabel: placeholders.traits.sectionLabel,
      title: "Personality Traits",
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
        influentialTraits: content?.chapters.career.influentialTraits ?? placeholders.chapters.career.influentialTraits,
        visibleBlocks: content?.chapters.career.visibleBlocks ?? placeholders.chapters.career.visibleBlocks,
        lockedBlocks: content?.chapters.career.lockedBlocks ?? placeholders.chapters.career.lockedBlocks,
      },
      growth: {
        step: SECTION_META.growth.step,
        sectionLabel: SECTION_META.growth.sectionLabel[language],
        title: SECTION_META.growth.title[language],
        asset: placeholders.chapters.growth.asset,
        intro: content?.chapters.growth.intro ?? placeholders.chapters.growth.intro,
        influentialTraits: content?.chapters.growth.influentialTraits ?? placeholders.chapters.growth.influentialTraits,
        visibleBlocks: content?.chapters.growth.visibleBlocks ?? placeholders.chapters.growth.visibleBlocks,
        lockedBlocks: content?.chapters.growth.lockedBlocks ?? placeholders.chapters.growth.lockedBlocks,
      },
      relationships: {
        step: SECTION_META.relationships.step,
        sectionLabel: SECTION_META.relationships.sectionLabel[language],
        title: SECTION_META.relationships.title[language],
        asset: placeholders.chapters.relationships.asset,
        intro: content?.chapters.relationships.intro ?? placeholders.chapters.relationships.intro,
        influentialTraits:
          content?.chapters.relationships.influentialTraits ?? placeholders.chapters.relationships.influentialTraits,
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
