import { notFound } from "next/navigation";
import { ChanganQuiz } from "@/components/entertainment/ChanganQuiz";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { quizPath } from "@/lib/entertainment/guides";
import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { loadTraditionalChangan } from "@/lib/i18n/zh-TW/changan";
import { requireTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStoryReader";

type Props = { params: Promise<{ slug: string }> };

async function loadQuiz(slug: string) {
  const quiz = slug === CHANGAN_SLUG ? await loadTraditionalChangan() : (await requireTraditionalLegacyStory(slug)).quiz;
  if (!quiz) notFound();
  return quiz;
}

export async function generateMetadata({ params }: Props) {
  const quiz = await loadQuiz((await params).slug);
  return questionnaireTakeMetadata(quiz.title.zh, quizPath("zh-TW", quiz.slug));
}

export default async function TraditionalStoryTakePage({ params }: Props) {
  const quiz = await loadQuiz((await params).slug);
  const changan = quiz.slug === CHANGAN_SLUG;
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={quizPath("zh-TW", quiz.slug)} autoStart={!changan}>
      {changan ? <ChanganQuiz quiz={quiz} locale="zh" displayLocale="zh-TW" /> : <FunQuizClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
