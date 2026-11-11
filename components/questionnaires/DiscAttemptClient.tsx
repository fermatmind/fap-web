"use client";
import { useEffect } from "react";
import original from "@/lib/questionnaires/data/disc.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { prepareDiscResultProfile } from "@/lib/questionnaires/result-content/disc";
import { BasicQuestionnaireClient } from "./BasicQuestionnaireClient";

const source = original as Questionnaire;
const quiz = { ...source, profiles: source.profiles.map(prepareDiscResultProfile) };
export default function DiscAttemptClient({ locale, resume, onReady, projectedQuiz }: { locale: Locale; resume: boolean; onReady: () => void; projectedQuiz?: Questionnaire }) {
  useEffect(() => onReady(), [onReady]);
  return <BasicQuestionnaireClient quiz={projectedQuiz ?? quiz} locale={locale} startOnEntry resumeOnEntry={resume} emitStartOnEntry={false} />;
}
