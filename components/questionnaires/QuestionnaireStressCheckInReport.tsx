import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { StressReflection4Questionnaire, StressReflection4Result } from "@/lib/questionnaires/stressReflection4";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

type Complete = Extract<StressReflection4Result, { status: "complete" }>;
export function QuestionnaireStressCheckInReport({ quiz, result, locale }: { quiz: StressReflection4Questionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  const valid = result.status === "complete" && result.answered === 4 && result.contributions.length === 4
    && result.contributions.every((p, i) => p.id === quiz.questions[i].id && Number.isInteger(p.chosen) && p.chosen >= 0 && p.chosen <= 4
      && p.reversed === quiz.questions[i].reverse && p.value === (p.reversed ? 4 - p.chosen : p.chosen))
    && result.total === result.contributions.reduce((sum, p) => sum + p.value, 0);
  if (!valid) return <p role="status">{zh ? "本次总分暂不可用，可以清除后重新开始。" : "This total is unavailable. Clear it and start again."}</p>;
  const profile = quiz.profiles[0];
  return <div data-stress-check-in-result className="my-6 space-y-8">
    <p data-stress-check-in-total className="rounded-lg border border-violet-200 bg-violet-50 p-5 text-2xl font-semibold">{zh ? "本次总分：" : "This check-in total: "}<span className="whitespace-nowrap">{result.total} / 16</span></p>
    <p className="leading-8">{profile.scoreReading[locale]}</p>
    <section aria-labelledby="stress-check-in-calculation" className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id="stress-check-in-calculation" className="text-xl font-semibold">{zh ? "这四项怎样相加" : "How these four choices add up"}</h3>
      <ol className="my-5 space-y-5">{result.contributions.map((part, i) => <li key={part.id} data-stress-check-in-contribution className="leading-8">
        <p className="font-medium">{i + 1}. {quiz.questions[i].prompt[locale]}</p>
        <p>{quiz.questions[i].options[part.chosen].label[locale]} ({part.chosen}) · {part.reversed ? `4 − ${part.chosen} = ${part.value}` : `${part.chosen} = ${part.value}`}</p>
      </li>)}</ol>
      <p className="leading-8">{result.contributions.map(p => p.value).join(" + ")} = {result.total}</p>
    </section>
    <QuestionnaireReport profile={profile} locale={locale} headingLevel={3} idPrefix="stress-check-in-report" />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读完整公开指南" : "Read the complete public guide separately"}</Link>
    <p className="rounded-lg border border-slate-200 p-4 leading-8">{quiz.guide.find(s => s.id === "privacy")!.paragraphs[0][locale]}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
