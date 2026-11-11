import { notFound } from "next/navigation";
import { Afqt32Client } from "@/components/questionnaires/Afqt32Client";
import { Critical30Client } from "@/components/questionnaires/Critical30Client";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { Reasoning18Client } from "@/components/questionnaires/Reasoning18Client";
import { Technical30Client } from "@/components/questionnaires/Technical30Client";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { WrittenCoordinationClient } from "@/components/questionnaires/WrittenCoordinationClient";
import { questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

function WorkReasoningClient({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  const props = { quiz: takeQuiz, locale: "zh", readingProfiles: quiz.profiles } as const;
  const explanationCopy = Object.fromEntries(quiz.questions.flatMap(question =>
    question.explanation ? [[question.id, question.explanation.zh]] : [],
  ));
  switch (quiz.kind) {
    case "afqt32": return <Afqt32Client {...props} />;
    case "technical30": return <Technical30Client {...props} explanationCopy={explanationCopy} />;
    case "reasoning18": return <Reasoning18Client {...props} explanationCopy={explanationCopy} />;
    case "critical30": return <Critical30Client {...props} explanationCopy={explanationCopy} />;
    case "written-coordination": return <WrittenCoordinationClient quiz={takeQuiz} locale="zh" />;
    case "distributed-work24":
    case "preparation-actions20":
      return <QuestionnaireClient quiz={takeQuiz} locale="zh" workReasoningReadingProfiles={quiz.profiles} />;
    default: return notFound();
  }
}

export function TraditionalWorkReasoningTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument
      quiz={quiz}
      locale="zh"
      landing={questionnairePath("zh-TW", quiz.slug)}
      autoStart={quiz.kind === "distributed-work24" || quiz.kind === "preparation-actions20"}
    >
      <WorkReasoningClient quiz={quiz} takeQuiz={takeQuiz} />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
