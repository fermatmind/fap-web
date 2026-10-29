"use client";
import original from "@/lib/questionnaires/data/cognitive-functions-test.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireClient } from "./QuestionnaireClient";
export default function CognitiveFunctions32Client({ locale }: { locale: Locale }) {
  return <QuestionnaireClient key={locale} quiz={original as Questionnaire} locale={locale} />;
}
