import { GlobalHistoryTake } from "@/components/entertainment/GlobalHistoryTake";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { GLOBAL_HISTORY_MINUTES, globalHistoryPath, globalHistoryTitle } from "@/lib/entertainment/global-history/config";
import { resolveLocale } from "@/lib/i18n/getDict";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  return questionnaireTakeMetadata(globalHistoryTitle[locale], globalHistoryPath(locale));
}

export default async function Page({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  return <QuestionnaireTakeDocument locale={locale} landing={globalHistoryPath(locale)}
    quiz={{ title: globalHistoryTitle, minutes: GLOBAL_HISTORY_MINUTES }} autoStart={false}>
    <GlobalHistoryTake locale={locale} />
  </QuestionnaireTakeDocument>;
}
