import { GlobalHistoryTake } from "@/components/entertainment/GlobalHistoryTake";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { GLOBAL_HISTORY_MINUTES, globalHistoryPath, globalHistoryTitle } from "@/lib/entertainment/global-history/config";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { SITE_URL } from "@/lib/site";
import { resolveLocale } from "@/lib/i18n/getDict";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const input = (await params).locale;
  if (input === "zh-TW") {
    const copy = await loadTraditionalAssessmentText();
    return questionnaireTakeMetadata(copy(globalHistoryTitle.zh), `${SITE_URL}${globalHistoryPath("zh-TW")}`);
  }
  const locale = resolveLocale(input);
  return questionnaireTakeMetadata(globalHistoryTitle[locale], globalHistoryPath(locale));
}

export default async function Page({ params }: Props) {
  const input = (await params).locale;
  const traditional = input === "zh-TW";
  const locale = traditional ? "zh" : resolveLocale(input);
  const copy = traditional ? await loadTraditionalAssessmentText() : (text: string) => text;
  const displayLocale = traditional ? "zh-TW" : locale;
  const document = <QuestionnaireTakeDocument locale={locale} landing={globalHistoryPath(displayLocale)}
    quiz={{ title: { ...globalHistoryTitle, [locale]: copy(globalHistoryTitle[locale]) }, minutes: GLOBAL_HISTORY_MINUTES }} autoStart={false}>
    <GlobalHistoryTake locale={locale} />
  </QuestionnaireTakeDocument>;
  return traditional ? <TraditionalQuestionnaireCopy>{document}</TraditionalQuestionnaireCopy> : document;
}
