export const questionnairePath = (locale: "en" | "zh", slug: string) => `/${locale}/tests/explore/${slug}`;
export const questionnaireGuidePath = (locale: "en" | "zh", slug: string, profile: string) => `${questionnairePath(locale, slug)}/results/${profile}`;
