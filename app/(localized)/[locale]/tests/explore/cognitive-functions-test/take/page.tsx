import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { CognitiveFunctionsVersions } from "@/components/questionnaires/CognitiveFunctionsVersions";
import { isCognitiveFunctionsPageAvailable } from "@/components/questionnaires/CognitiveFunctionsPage";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ edition?: string }> };
async function entry(params: Props["params"]) { const locale = resolveLocale((await params).locale), quiz = await loadQuestionnaire("cognitive-functions-test"); if (!quiz || !isCognitiveFunctionsPageAvailable(quiz)) notFound(); return { locale, quiz, landing: questionnairePath(locale, quiz.slug) }; }
export async function generateMetadata({ params }: Props) { const { locale, quiz, landing } = await entry(params); return questionnaireTakeMetadata(quiz.title[locale], landing); }
export default async function Page({ params, searchParams }: Props) {
  const { locale, quiz, landing } = await entry(params), { edition } = await searchParams;
  if (edition && edition !== "ratings32" && edition !== "paired56") notFound();
  return <QuestionnaireTakeDocument quiz={{ ...quiz, minutes: edition === "paired56" ? 15 : edition === "ratings32" ? 10 : 0 }} locale={locale} landing={landing}><CognitiveFunctionsVersions locale={locale} initialMethod={edition === "ratings32" ? "ratings32" : edition === "paired56" ? "paired56" : null} /></QuestionnaireTakeDocument>;
}
