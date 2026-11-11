import { Anger20Client } from "@/components/questionnaires/Anger20Client";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireStressCheckInClient } from "@/components/questionnaires/QuestionnaireStressCheckInClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

export function TraditionalStressCopingTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", quiz.slug)}>
      {quiz.kind === "anger20"
        ? <Anger20Client quiz={takeQuiz} displayQuiz={quiz} locale="zh" readingProfiles={quiz.profiles} />
        : quiz.kind === "stress-reflection4" || quiz.kind === "pss4"
          ? <QuestionnaireStressCheckInClient quiz={takeQuiz} locale="zh" resultProfile={quiz.profiles[0]} />
          : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
