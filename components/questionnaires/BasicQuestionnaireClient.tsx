"use client";
import { scoreDirectionalQuestionnaire, scoreLikertQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { QuestionnaireRunner, type QuestionnaireClientProps } from "./QuestionnaireRunner";

/** The DISC and original32 engines do not need the all-model scoring registry. */
export function BasicQuestionnaireClient(props: QuestionnaireClientProps) {
  const score = props.quiz.kind === "likert" ? scoreLikertQuestionnaire : scoreDirectionalQuestionnaire;
  return <QuestionnaireRunner {...props} scoreQuestionnaire={score} />;
}
