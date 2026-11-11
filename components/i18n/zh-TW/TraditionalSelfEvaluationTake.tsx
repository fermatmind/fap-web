import { Imposter20Client } from "@/components/questionnaires/Imposter20Client";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireFscrs22Client } from "@/components/questionnaires/QuestionnaireFscrs22Client";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

export function TraditionalSelfEvaluationTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", quiz.slug)}>
      {quiz.kind === "imposter20"
        ? <Imposter20Client quiz={takeQuiz} locale="zh" readingProfiles={quiz.profiles} displayQuestions={quiz.questions} />
        : quiz.kind === "fscrs22"
          ? <QuestionnaireFscrs22Client quiz={takeQuiz} locale="zh" readingProfiles={quiz.profiles} />
          : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
