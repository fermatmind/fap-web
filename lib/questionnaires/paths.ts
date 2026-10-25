import catalog from "./catalog.json";

export const questionnairePath = (locale: "en" | "zh", slug: string) => `/${locale}/tests/${catalog.find(quiz => quiz.slug === slug)?.collection ?? "explore"}/${slug}`;
export const questionnaireGuidePath = (locale: "en" | "zh", slug: string, profile: string) => `${questionnairePath(locale, slug)}/results/${profile}`;
