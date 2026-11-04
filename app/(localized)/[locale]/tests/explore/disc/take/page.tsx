import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { DiscPage } from "@/components/questionnaires/DiscPage";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { questionnairePath } from "@/lib/questionnaires/paths";

type Props = { params: Promise<{ locale: string }> };
async function entry(params: Props["params"]) { const locale = resolveLocale((await params).locale), quiz = await loadQuestionnaire("disc"); if (!quiz) notFound(); return { locale, quiz, landing: questionnairePath(locale, quiz.slug) }; }
export async function generateMetadata({ params }: Props) { const { locale, quiz, landing } = await entry(params); return questionnaireTakeMetadata(quiz.title[locale], landing); }
export default async function Page({ params }: Props) { const { locale, quiz, landing } = await entry(params); return <QuestionnaireTakeDocument quiz={quiz} locale={locale} landing={landing}><DiscPage quiz={quiz} locale={locale} take /></QuestionnaireTakeDocument>; }
