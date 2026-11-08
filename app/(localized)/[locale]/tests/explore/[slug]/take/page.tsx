import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { hasQuestionnaireTake } from "@/lib/questionnaires/take";
import { questionnairePath } from "@/lib/questionnaires/paths";
import catalog from "@/lib/questionnaires/catalog.json";
import QuestionnairePage from "@/components/questionnaires/QuestionnairePage";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";

type Props = { params: Promise<{ locale: string; slug: string }> };
async function entry(params: Props["params"]) {
  const { locale: input, slug } = await params, locale = resolveLocale(input);
  if (!hasQuestionnaireTake(slug) || !catalog.some(item => item.slug === slug && item.collection === "explore")) notFound();
  const quiz = await loadQuestionnaire(slug);
  if (!quiz) notFound();
  return { locale, quiz, landing: questionnairePath(locale, slug) };
}
export async function generateMetadata({ params }: Props) { const { locale, quiz, landing } = await entry(params); return questionnaireTakeMetadata(quiz.title[locale], landing); }
export default async function Page({ params }: Props) {
  const { locale, quiz, landing } = await entry(params);
  return <QuestionnaireTakeDocument quiz={quiz} locale={locale} landing={landing} autoStart={!["typing", "ten-key", "data-entry", "written-coordination", "rice100"].includes(quiz.kind)}>{await QuestionnairePage({ params, take: true })}</QuestionnaireTakeDocument>;
}
