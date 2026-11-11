import { notFound } from "next/navigation";
import { DataEntryClient } from "@/components/questionnaires/DataEntryClient";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TenKeyClient } from "@/components/questionnaires/TenKeyClient";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { TypingClient } from "@/components/questionnaires/TypingClient";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

function OfficeToolClient({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  switch (quiz.kind) {
    case "data-entry": return <DataEntryClient quiz={quiz} locale="zh" />;
    case "ten-key": return <TenKeyClient quiz={quiz} locale="zh" />;
    case "typing": return <TypingClient quiz={quiz} locale="zh" />;
    case "skills-evidence": return <QuestionnaireClient quiz={quiz} locale="zh" />;
    case "work-role12":
      return <QuestionnaireClient quiz={takeQuiz} locale="zh" workRoleReadingProfiles={quiz.profiles} />;
    default: return notFound();
  }
}

export function TraditionalOfficeToolTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument
      quiz={quiz}
      locale="zh"
      landing={questionnairePath("zh-TW", quiz.slug)}
      autoStart={quiz.kind === "skills-evidence" || quiz.kind === "work-role12"}
    >
      <OfficeToolClient quiz={quiz} takeQuiz={takeQuiz} />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
