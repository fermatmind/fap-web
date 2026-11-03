"use client";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireRunner, type QuestionnaireClientProps } from "./QuestionnaireRunner";

export type { QuestionnaireClientProps } from "./QuestionnaireRunner";
export function QuestionnaireClient(props: QuestionnaireClientProps) {
  return <QuestionnaireRunner {...props} scoreQuestionnaire={scoreQuestionnaire} />;
}
