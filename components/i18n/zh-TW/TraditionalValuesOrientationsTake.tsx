import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireFourAxesClient } from "@/components/questionnaires/QuestionnaireFourAxesClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

export function TraditionalValuesOrientationsTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", quiz.slug)}>
      {quiz.kind === "four-axes"
        ? <QuestionnaireFourAxesClient quiz={takeQuiz} locale="zh" readingProfiles={quiz.profiles} />
        : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
