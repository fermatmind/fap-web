"use client";
import { prepareCognitiveFunctionsResultProfile } from "@/lib/questionnaires/result-content/cognitive-functions-test";
import original from "@/lib/questionnaires/data/cognitive-functions-test.json";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { BasicQuestionnaireClient } from "./BasicQuestionnaireClient";
export default function CognitiveFunctions32Client({ locale, readingProfiles, localizedQuiz, startOnEntry = false }: { locale: Locale; localizedQuiz?: Questionnaire; readingProfiles?: QuestionnaireProfile[]; startOnEntry?: boolean }) {
  const quiz = localizedQuiz ?? original as Questionnaire;
  const selectedReadings = readingProfiles ?? (localizedQuiz ? quiz.profiles : quiz.profiles.map(prepareCognitiveFunctionsResultProfile));
  const profiles = quiz.profiles.map(p => selectedReadings.find(r => r.id === p.id && r.resultReading?.quizSlug === quiz.slug && r.resultReading.profileId === p.id) ?? p);
  return <BasicQuestionnaireClient key={locale} quiz={{ ...quiz, profiles }} locale={locale} startOnEntry={startOnEntry} resumeOnEntry={startOnEntry} />;
}
