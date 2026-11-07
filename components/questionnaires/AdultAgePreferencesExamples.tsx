import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

// Synthetic answer sheets in published item order.
const sheets = [
  { answers: "AAAAAAAAABABAAAAAB", label: { zh: "单项最高", en: "One highest count" } },
  { answers: "AAAAAAAAABABAAABAB", label: { zh: "两项并列", en: "Two-way tie" } },
  { answers: "AAAAAAAAAAAAAAAAAA", label: { zh: "三项并列", en: "Three-way tie" } },
] as const;

export function AdultAgePreferencesExamples({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  return <section id="age-result-examples" aria-labelledby="age-result-examples-title" className="my-8 scroll-mt-24 space-y-3">
    <h2 id="age-result-examples-title" className="text-2xl font-semibold">{zh ? "结果示例" : "Sample results"}</h2>
    <p className="leading-7 text-slate-700">{zh ? "以下是三份虚构答卷。每份有 18 次选择，最多的情境用粗体显示。" : "Three fictional answer sheets, each with 18 choices. Bold marks every context with the highest count."}</p>
    <div className="grid gap-3 sm:grid-cols-3">
      {sheets.map(({ answers, label }) => {
        const result = scoreDirectionalQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, i) => [question.id, answers[i]])));
        if (result.status !== "complete") return null;
        return <article key={answers} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold">{label[locale]}</h3>
          <dl className="mt-2 space-y-1 text-sm leading-6">
            {quiz.directions.map((direction, i) => <div key={direction.id} className={`flex justify-between gap-2 ${result.leaders.includes(direction.id) ? "font-bold" : ""}`}>
              <dt>{(zh ? ["年上情境", "同龄或同阶段", "年下情境"] : ["Older", "Similar age or stage", "Younger"])[i]}</dt>
              <dd className="tabular-nums">{result.counts[direction.id]}</dd>
            </div>)}
          </dl>
          <Link prefetch={false} className="mt-1 inline-flex min-h-11 items-center text-sm underline underline-offset-4" aria-label={zh ? `阅读${label.zh}指南` : `Read the guide: ${label.en}`} href={questionnaireGuidePath(locale, quiz.slug, result.profileId)}>{zh ? "阅读公开指南" : "Read public guide"}</Link>
        </article>;
      })}
    </div>
  </section>;
}
