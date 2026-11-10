import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { quizPath } from "@/lib/entertainment/guides";
import { requireTraditionalLegacyStory } from "@/lib/i18n/zh-TW/legacyStoryReader";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { quiz } = await requireTraditionalLegacyStory((await params).slug);
  return questionnaireTakeMetadata(quiz.title.zh, quizPath("zh-TW", quiz.slug));
}

export default async function TraditionalStoryTakePage({ params }: Props) {
  const { quiz } = await requireTraditionalLegacyStory((await params).slug);
  return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={quizPath("zh-TW", quiz.slug)} autoStart>
      <FunQuizClient quiz={quiz} locale="zh" />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;
}
