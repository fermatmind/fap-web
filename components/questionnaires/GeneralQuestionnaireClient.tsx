"use client";
import { scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { QuestionnaireRunner, type QuestionnaireClientProps } from "./QuestionnaireClient";

export default function GeneralQuestionnaireClient(props: QuestionnaireClientProps) {
  return <QuestionnaireRunner {...props} scoreQuestionnaire={scoreQuestionnaire} />;
}
