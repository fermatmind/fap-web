import { Dvmsq18Client } from "@/components/questionnaires/Dvmsq18Client";
import { Imagery12Client } from "@/components/questionnaires/Imagery12Client";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { Sens16Client } from "@/components/questionnaires/Sens16Client";
import { Synes15Client } from "@/components/questionnaires/Synes15Client";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

const dedicatedClients = {
  imagery12: Imagery12Client,
  synes15: Synes15Client,
  sens16: Sens16Client,
  dvmsq18: Dvmsq18Client,
} as const;

export function TraditionalSensoryExecutiveTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  const Client = Object.hasOwn(dedicatedClients, quiz.kind)
    ? dedicatedClients[quiz.kind as keyof typeof dedicatedClients]
    : undefined;
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={questionnairePath("zh-TW", quiz.slug)}>
      {Client ? <Client quiz={takeQuiz} displayQuiz={quiz} locale="zh" readingProfiles={quiz.profiles} />
        : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
