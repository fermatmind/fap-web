"use client";
import original from "@/lib/questionnaires/data/cognitive-functions-test.json";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireClient } from "./QuestionnaireClient";
export default function CognitiveFunctions32Client({ locale, readingProfiles }: { locale: Locale; readingProfiles?: QuestionnaireProfile[] }) {
  const quiz = original as Questionnaire;
  const profiles = quiz.profiles.map(p => readingProfiles?.find(r => r.id === p.id && r.resultReading?.quizSlug === quiz.slug && r.resultReading.profileId === p.id) ?? p);
  return <QuestionnaireClient key={locale} quiz={{ ...quiz, profiles }} locale={locale} />;
}
