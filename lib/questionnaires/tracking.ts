import type { Questionnaire } from "./types";
import type { Locale } from "@/lib/i18n/locales";

export type QuestionnaireTrackingDefinition = Pick<Questionnaire, "slug" | "kind" | "code"> & { source: Pick<Questionnaire["source"], "formCode"> };

// Keep the pre-existing public play entry's analytics identity while upgrading its full content.
export function questionnaireTrackingPayload(quiz: QuestionnaireTrackingDefinition, locale: Locale) {
  const legacyPlayEntry = quiz.slug === "relationship-values";
  return { slug: quiz.slug, locale, entry_surface: legacyPlayEntry ? "entertainment" : "questionnaire", scale_code: legacyPlayEntry ? "ENTERTAINMENT" : quiz.code, form_code: legacyPlayEntry ? `fun_${quiz.slug}_v1` : quiz.source.formCode, test_type: legacyPlayEntry ? "entertainment" : quiz.kind === "practice" ? "knowledge_practice" : "self_report", page_type: legacyPlayEntry ? "entertainment" : "test_detail" };
}
