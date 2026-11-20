"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveDiscAssessment } from "@/lib/api/v0_3";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import original from "@/lib/questionnaires/data/disc-take.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { BasicQuestionnaireClient } from "./BasicQuestionnaireClient";

const source = original as Questionnaire;
const quiz = source;
export default function DiscAttemptClient({ locale, resume, onReady, projectedQuiz }: { locale: Locale; resume: boolean; onReady: () => void; projectedQuiz?: Questionnaire }) {
  const router = useRouter();
  const ref = useRef<string | null>(null);
  const display = useQuestionnaireDisplayCopy();
  useEffect(() => onReady(), [onReady]);
  return <BasicQuestionnaireClient onComplete={async answers => {
    ref.current ??= crypto.randomUUID();
    const saved = await saveDiscAssessment(answers, (display.traditional ? "zh-TW" : locale), ref.current);
    router.push(`/${(display.traditional ? "zh-TW" : locale)}/result/${saved.attempt_id}`);
  }} quiz={projectedQuiz ? { ...projectedQuiz, profiles: quiz.profiles } : quiz} locale={locale} startOnEntry resumeOnEntry={resume} emitStartOnEntry={false} />;
}
