import copy from "@/lib/i18n/zh-TW/seven-sins-ui.source.json";
import { miniVirtuesDefinitions } from "./miniVirtues";
import { sevenSinsChineseGuideProfile } from "./sevenSinsChineseSeo";
import type { QuestionnaireProfile } from "./types";

/** Public guide presentation only; accepted personal-result content stays unchanged. */
export function sevenSinsGuideProfile(slug: string, locale: string, profile: QuestionnaireProfile): QuestionnaireProfile {
  if (locale !== "en") return sevenSinsChineseGuideProfile(slug, locale, profile);
  if (slug !== "seven-sins-virtues-test" || !miniVirtuesDefinitions.some(axis => axis.profileId === profile.id && profile.directionIds.includes(axis.id))) return profile;
  const text = (field: string) => (copy as Record<string, { en: string }>)[`seo-${profile.id}-${field}`].en;
  return {
    ...profile,
    title: { ...profile.title, en: text("title") },
    summary: { ...profile.summary, en: text("description") },
    seo: {
      title: { ...profile.seo!.title, en: text("metadata") },
      description: { ...profile.seo!.description, en: text("description") },
    },
  };
}
