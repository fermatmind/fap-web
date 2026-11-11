import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import { ChanganQuiz } from "@/components/entertainment/ChanganQuiz";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { quizPath } from "@/lib/entertainment/guides";
import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { requireTraditionalStoryQuiz } from "@/lib/i18n/zh-TW/legacyStoryReader";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}/take`);
  if (directional) {
    const { traditionalLikertMetadata } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return traditionalLikertMetadata(directional);
  }
  const quiz = await requireTraditionalStoryQuiz((await params).slug);
  return questionnaireTakeMetadata(quiz.title.zh, quizPath("zh-TW", quiz.slug));
}

export default async function TraditionalStoryTakePage({ params }: Props) {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}/take`);
  if (directional) {
    const { LikertQuestionnairePage } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return <LikertQuestionnairePage {...directional} />;
  }
  const quiz = await requireTraditionalStoryQuiz((await params).slug);
  const changan = quiz.slug === CHANGAN_SLUG;
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={quizPath("zh-TW", quiz.slug)} autoStart={!changan}>
      {changan ? <ChanganQuiz quiz={quiz} locale="zh" displayLocale="zh-TW" /> : <FunQuizClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
