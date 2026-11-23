import type { DisplayLocale } from "@/lib/i18n/locales";

export const questionnairePath = (locale: DisplayLocale, slug: string) => slug === "career-match" ? `/${locale}/career/match` : `/${locale}/tests/explore/${slug}`;
export const questionnaireGuidePath = (locale: DisplayLocale, slug: string, profile: string) => `${questionnairePath(locale, slug)}/results/${profile}`;
