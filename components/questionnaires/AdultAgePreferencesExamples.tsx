import Link from "next/link";
import { adultAgeExamples } from "@/lib/entertainment/flagship/adult-age-config";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

export function AdultAgePreferencesExamples({ quiz, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const text = (zh: string, en: string, tw: string) => displayLocale === "zh-TW" ? tw : locale === "zh" ? copy(zh) : en;
  return <section id="age-result-examples" aria-labelledby="age-result-examples-title" className="my-8 scroll-mt-24 space-y-3">
    <h2 id="age-result-examples-title" className="text-2xl font-semibold">{text("结果示例", "Sample results", "作答結果範例")}</h2>
    <p className="leading-7 text-slate-700">{text("以下是三份虚构答卷。每份有 18 次选择，最多的情境用粗体显示。", "Three fictional answer sheets, each with 18 choices. Bold marks every context with the highest count.", "以下是三份模擬答卷，每份都作答 18 題。粗體標出選擇次數最高的情境。")}</p>
    <div className="grid gap-3 sm:grid-cols-3">
      {adultAgeExamples.map(({ answers, labels }) => {
        const result = scoreDirectionalQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, i) => [question.id, answers[i]])));
        if (result.status !== "complete") return null;
        return <article key={answers} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">{labels[displayLocale]}</h3>
          <dl className="mt-2 space-y-1 text-sm leading-6">
            {quiz.directions.map((direction, i) => <div key={direction.id} className={`flex justify-between gap-2 ${result.leaders.includes(direction.id) ? "font-bold" : ""}`}>
              <dt>{text(["年上情境", "同龄或同阶段", "年下情境"][i], ["Older", "Similar age or stage", "Younger"][i], ["年長", "同齡或同階段", "較年輕"][i])}</dt>
              <dd className="tabular-nums">{result.counts[direction.id]}</dd>
            </div>)}
          </dl>
          <Link prefetch={false} className="mt-1 inline-flex min-h-11 items-center text-sm underline underline-offset-4" aria-label={text(`阅读${labels.zh}指南`, `Read the guide: ${labels.en}`, `閱讀${labels["zh-TW"]}指南`)} href={questionnaireGuidePath(displayLocale, quiz.slug, result.profileId)}>{text("阅读公开指南", "Read public guide", "閱讀公開指南")}</Link>
        </article>;
      })}
    </div>
  </section>;
}
