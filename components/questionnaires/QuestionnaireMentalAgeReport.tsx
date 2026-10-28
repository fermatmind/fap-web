import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { MentalAgeResult } from "@/lib/questionnaires/mentalAge";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMentalAgeReport({ quiz, result, answers, locale }: {
  quiz: Questionnaire; result: Extract<MentalAgeResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale;
}) {
  const zh = locale === "zh", { sum, playfulAge, points } = result.mentalAge, profile = quiz.profiles[0];
  return <div className="mt-6 space-y-8" data-mental-age-report="">
    <dl className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
      <div><dt className="font-semibold">{zh ? "本次娱乐心理年龄（约定数字）" : "Your playful mental age (an arbitrary number)"}</dt><dd className="mt-2 text-3xl font-semibold" data-mental-age-value="">{playfulAge}{zh ? "岁" : " years"}</dd></div>
      <div><dt className="font-semibold">{zh ? "十二题熟悉偏好点数之和" : "Sum of twelve familiarity-point choices"}</dt><dd className="mt-2" data-mental-age-sum="">{sum} / 36</dd></div>
    </dl>
    <p className="leading-8" data-mental-age-arithmetic="">{zh ? `算式：18＋2×${sum}＝${playfulAge}。这不是你的真实年龄、脑龄、智商或成熟度；数字不用于年龄群体比较。` : `Formula: 18 + 2 × ${sum} = ${playfulAge}. This is not your real age, brain age, IQ or maturity, and is not compared with an age group.`}</p>
    <details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "核对十二题回答与点数" : "Check all twelve choices and points"}</summary>
      <ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => <li key={q.id} data-mental-age-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{q.options.find(o => o.id === answers[q.id])?.label[locale]} — {points[q.id]}{zh ? "点" : " points"}</p></li>)}</ol>
    </details>
    <section aria-labelledby="mental-age-full-guide" className="rounded-lg border border-slate-200 p-4 sm:p-6"><h3 id="mental-age-full-guide" className="text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix="report" />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读不含个人年龄的公开完整指南" : "Read the complete public guide without your personal age"}</Link>
    </section>
  </div>;
}
