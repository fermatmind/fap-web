import type { DisplayLocale } from "@/lib/i18n/locales";
import type { RiasecResultViewModel } from "@/lib/riasec/resultAssembler";

const portraits: Record<string, string> = { R: "realistic", I: "ias-researcher", A: "artistic", S: "social", E: "enterprising", C: "conventional" };

export function interestPreviewArt(lead?: string) {
  return `/images/riasec/${lead ? portraits[lead] ?? "ai-career-interests" : "ai-career-interests"}.webp`;
}

export function interestPreviewStory(model: RiasecResultViewModel, locale: DisplayLocale) {
  const tags = Array.from(model.topCode).flatMap(code => {
    const row = model.dimensions.find(dimension => dimension.code === code && dimension.scoreAvailable);
    return row ? [row.label] : [];
  });
  const tied = model.interpretationState?.tieDisplay?.dimensions?.includes(model.primaryType);
  return {
    title: locale === "en" ? "Career interest profile" : locale === "zh-TW" ? "職涯興趣輪廓" : "职业兴趣轮廓",
    art: interestPreviewArt(tied || !tags.length ? undefined : model.primaryType),
    tags,
  };
}
