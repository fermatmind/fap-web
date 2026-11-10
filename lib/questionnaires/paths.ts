import { native as catalog } from "../entertainment/clientCatalog.json";

import type { DisplayLocale } from "@/lib/i18n/locales";

export const questionnairePath = (locale: DisplayLocale, slug: string) => `/${locale}/tests/${catalog.find(quiz => quiz.slug === slug)?.collection ?? "explore"}/${slug}`;
export const questionnaireGuidePath = (locale: DisplayLocale, slug: string, profile: string) => `${questionnairePath(locale, slug)}/results/${profile}`;
