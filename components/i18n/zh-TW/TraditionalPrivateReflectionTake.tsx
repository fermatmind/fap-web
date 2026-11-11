import { notFound } from "next/navigation";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireConflictClient } from "@/components/questionnaires/QuestionnaireConflictClient";
import { QuestionnaireCopingClient } from "@/components/questionnaires/QuestionnaireCopingClient";
import { QuestionnaireHabitClient } from "@/components/questionnaires/QuestionnaireHabitClient";
import { QuestionnaireIntimacyClient } from "@/components/questionnaires/QuestionnaireIntimacyClient";
import { QuestionnaireOrientationClient } from "@/components/questionnaires/QuestionnaireOrientationClient";
import { QuestionnaireShadowClient } from "@/components/questionnaires/QuestionnaireShadowClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

function PrivateReflectionClient({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  const props = { quiz: takeQuiz, locale: "zh", readingProfiles: quiz.profiles } as const;
  switch (quiz.kind) {
    case "mini-conflict": return <QuestionnaireConflictClient {...props} />;
    case "mini-coping": return <QuestionnaireCopingClient {...props} />;
    case "mini-habit": return <QuestionnaireHabitClient {...props} />;
    case "mini-intimacy": return <QuestionnaireIntimacyClient {...props} />;
    case "mini-orientation": return <QuestionnaireOrientationClient {...props} />;
    case "mini-shadow": return <QuestionnaireShadowClient {...props} />;
    case "mini-breakup": return <QuestionnaireClient quiz={takeQuiz} locale="zh" breakupReadingProfiles={quiz.profiles} />;
    case "mini-friction": return <QuestionnaireClient quiz={quiz} locale="zh" />;
    default: return notFound();
  }
}

export function TraditionalPrivateReflectionTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  const { slug } = quiz;
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", slug)}>
      <PrivateReflectionClient quiz={quiz} takeQuiz={takeQuiz} />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
