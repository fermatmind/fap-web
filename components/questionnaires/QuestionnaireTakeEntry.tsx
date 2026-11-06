import { StartTestButton } from "@/components/tests/StartTestButton";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { isFscrs22ConfigurationValid } from "@/lib/questionnaires/fscrs22";
import { QuestionnaireFscrs22Support } from "./QuestionnaireFscrs22Attribution";

export function QuestionnaireTakeEntry({ quiz, locale }: { quiz: Pick<Questionnaire, "slug" | "instructions">; locale: Locale }) {
  const zh = locale === "zh";
  const isSevenSins = quiz.slug === "seven-sins-virtues-test";
  const startLabel = isSevenSins ? (zh ? "开始免费测试" : "Start the free test") : (zh ? "开始测试" : "Start test");
  return <div id="take-test" className="my-6 space-y-4" data-questionnaire-take-entry>
    {isFscrs22ConfigurationValid(quiz) && <>
      <p className="text-sm leading-7">{quiz.fscrs22.privacy[locale]}</p>
      <p className="text-sm leading-7">{quiz.fscrs22.sensitiveNotice[locale]}</p>
      <QuestionnaireFscrs22Support support={quiz.fscrs22.support} locale={locale} />
    </>}
    <StartTestButton href={`${questionnairePath(locale, quiz.slug)}/take?start=1`}>
      {startLabel}<span aria-hidden="true">→</span>
    </StartTestButton>
    {isSevenSins && <a href="#seven-sins-sample" className="ml-4 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{zh ? "先看结果示例" : "See a sample result"}</a>}
    {quiz.instructions?.[locale] && <p className="text-sm leading-7 text-slate-600">{quiz.instructions[locale]}</p>}
  </div>;
}
