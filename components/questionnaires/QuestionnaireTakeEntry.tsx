import { StartTestButton } from "@/components/tests/StartTestButton";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnairePath } from "@/lib/questionnaires/paths";
import { isFscrs22ConfigurationValid } from "@/lib/questionnaires/fscrs22";
import { QuestionnaireFscrs22Support } from "./QuestionnaireFscrs22Attribution";

export function QuestionnaireTakeEntry({ quiz, locale }: { quiz: Pick<Questionnaire, "slug" | "instructions">; locale: Locale }) {
  return <div id="take-test" className="my-6 space-y-4" data-questionnaire-take-entry>
    {isFscrs22ConfigurationValid(quiz) && <>
      <p className="text-sm leading-7">{quiz.fscrs22.privacy[locale]}</p>
      <p className="text-sm leading-7">{quiz.fscrs22.sensitiveNotice[locale]}</p>
      <QuestionnaireFscrs22Support support={quiz.fscrs22.support} locale={locale} />
    </>}
    <StartTestButton href={`${questionnairePath(locale, quiz.slug)}/take?start=1`}>
      {locale === "zh" ? "开始测试" : "Start test"}<span aria-hidden="true">→</span>
    </StartTestButton>
    {quiz.instructions?.[locale] && <p className="text-sm leading-7 text-slate-600">{quiz.instructions[locale]}</p>}
  </div>;
}
