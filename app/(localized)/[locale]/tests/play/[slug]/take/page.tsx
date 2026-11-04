import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { hasQuestionnaireTake } from "@/lib/questionnaires/take";
import catalog from "@/lib/questionnaires/catalog.json";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { FunQuizClient } from "@/components/entertainment/FunQuizClient";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";

type Props = { params: Promise<{ locale: string; slug: string }> };
async function entry(params: Props["params"]) {
  const { locale: input, slug } = await params, locale = resolveLocale(input);
  const native = catalog.some(item => item.slug === slug && item.collection === "play");
  if (native && !hasQuestionnaireTake(slug)) notFound();
  const landing = `/${locale}/tests/play/${slug}`;
  if (native) {
    const quiz = await loadQuestionnaire(slug);
    if (!quiz) notFound();
    return { locale, quiz, native: true as const, landing };
  }
  const quiz = await loadFunQuiz(slug);
  if (!quiz) notFound();
  return { locale, quiz, native: false as const, landing };
}
export async function generateMetadata({ params }: Props) { const { locale, quiz, landing } = await entry(params); return questionnaireTakeMetadata(quiz.title[locale], landing); }
export default async function Page({ params }: Props) {
  const selected = await entry(params);
  const { locale, quiz, landing } = selected;
  const engine = selected.native ? await QuestionnairePage({ params, take: true }) : <FunQuizClient quiz={selected.quiz} locale={locale} />;
  return <QuestionnaireTakeDocument quiz={quiz} locale={locale} landing={landing}>{engine}</QuestionnaireTakeDocument>;
}
