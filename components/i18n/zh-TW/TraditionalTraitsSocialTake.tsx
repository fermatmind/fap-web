import { CatQ25Client } from "@/components/questionnaires/CatQ25Client";
import { MostLeastClient } from "@/components/questionnaires/MostLeastClient";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireMattering10Client } from "@/components/questionnaires/QuestionnaireMattering10Client";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

const dedicatedClients = {
  "most-least": MostLeastClient,
  catq25: CatQ25Client,
  mattering10: QuestionnaireMattering10Client,
} as const;

export function TraditionalTraitsSocialTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  const Client = Object.hasOwn(dedicatedClients, quiz.kind)
    ? dedicatedClients[quiz.kind as keyof typeof dedicatedClients]
    : undefined;
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", quiz.slug)}>
      {Client ? <Client quiz={takeQuiz} locale="zh" readingProfiles={quiz.profiles} />
        : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
