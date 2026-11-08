import copy from "@/lib/i18n/zh-TW/seven-sins-ui.source.json";
import { miniVirtuesDefinitions } from "./miniVirtues";
import type { QuestionnaireProfile } from "./types";

/** Chinese page headings only; the accepted result package and scoring stay intact. */
export function sevenSinsChineseGuideProfile(
  slug: string,
  locale: string,
  profile: QuestionnaireProfile,
): QuestionnaireProfile {
  if (slug !== "seven-sins-virtues-test" || locale !== "zh") return profile;
  const axis = miniVirtuesDefinitions.find(part => part.profileId === profile.id
    && profile.directionIds.includes(part.id));
  if (!axis) return profile;
  const text = (field: string) => (copy as Record<string, { zh: string }>)[`seo-${profile.id}-${field}`].zh;
  return {
    ...profile,
    title: { ...profile.title, zh: text("title") },
    summary: { ...profile.summary, zh: text("description") },
    seo: {
      title: { ...profile.seo!.title, zh: text("metadata") },
      description: { ...profile.seo!.description, zh: text("description") },
    },
  };
}
