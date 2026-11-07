import Link from "next/link";
import { MentalAgeShareCard } from "./MentalAgeShareCard";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { MentalAgeResult } from "@/lib/questionnaires/mentalAge";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMentalAgeReport({ quiz, result, answers, locale, readingProfile }: {
  quiz: Questionnaire; result: Extract<MentalAgeResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale; readingProfile?: Questionnaire["profiles"][number];
}) {
  const zh = locale === "zh", { sum, playfulAge, points } = result.mentalAge, profile = quiz.profiles[0];
  return <div className="mt-6 space-y-8" data-mental-age-report="">
    <section aria-label={zh ? "本次娱乐结果与算式" : "This quiz result and its formula"} className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
      <dl className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="p-4 sm:p-6"><dt className="font-semibold text-emerald-950">{zh ? "本次娱乐心理年龄（约定数字）" : "Your playful mental age (an arbitrary number)"}</dt><dd className="mt-2 text-6xl font-semibold tabular-nums sm:text-7xl text-emerald-950" data-mental-age-value="">{playfulAge}{zh ? "岁" : " years"}</dd></div>
        <div className="border-t border-emerald-200 bg-white p-4 sm:border-l sm:border-t-0 sm:p-6"><dt className="font-semibold">{zh ? "十二题熟悉偏好点数之和" : "Sum of twelve familiarity-point choices"}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums" data-mental-age-sum="">{sum} / 36</dd></div>
      </dl>
      <div className="border-t border-emerald-200 px-4 py-3 sm:px-6">
        <p className="text-sm leading-7" data-mental-age-arithmetic="">{zh ? `算式：18＋2×${sum}＝${playfulAge}。这不是你的真实年龄、脑龄、智商或成熟度；数字不用于年龄群体比较。` : `Formula: 18 + 2 × ${sum} = ${playfulAge}. This is not your real age, brain age, IQ or maturity, and is not compared with an age group.`}</p>
        <a className="mt-1 inline-block min-h-11 py-2 font-medium underline" href="#mental-age-full-guide">{zh ? "从日常选择读这个数字" : "Read this number in terms of everyday choices"}</a>
      </div>
    </section>
    <section className="space-y-4 rounded-xl border border-slate-200 p-5 sm:p-6" aria-label={zh ? "本次选择分布" : "Your choice pattern"}>
      <h3 className="text-xl font-semibold">{zh ? "为什么是这个数字？" : "Why this number?"}</h3>
      <p className="leading-7">{zh ? `你在12个情境中选出的熟悉偏好点数共${sum}点，按18＋2×${sum}得到${playfulAge}。下面显示每种选项的实际选择次数，不是人群百分位。` : `Your 12 choices added up to ${sum} familiarity points. The rule 18 + 2 × ${sum} gives ${playfulAge}. Below are your actual choice counts, not population percentiles.`}</p>
      <ol className="space-y-3">{[0, 1, 2, 3].map(point => {
        const count = Object.values(points).filter(value => value === point).length;
        const labels = zh ? ["全新体验", "熟悉中尝新", "惯常中微调", "保持熟悉形式"] : ["Something fully new", "New in a familiar setting", "A small familiar variation", "Keeping the familiar form"];
        return <li key={point} data-mental-age-choice-count={point}><div className="flex justify-between gap-3 text-sm"><span>{labels[point]} · {point}{zh ? "点" : " points"}</span><span className="shrink-0 tabular-nums">{count} / 12</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-emerald-700" style={{ width: `${count / 12 * 100}%` }} /></div></li>;
      })}</ol>
      <p className="text-sm leading-7 text-slate-600">{zh ? "同一个年龄可能来自不同的选择组合。低数字和高数字都不是更好、更聪明或更成熟。" : "Different combinations can produce the same age. A lower or higher number is not better, smarter or more mature."}</p>
    </section>
    <MentalAgeShareCard key={`${locale}-${playfulAge}-${sum}`} age={playfulAge} sum={sum} locale={locale} />
    <details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "核对十二题回答与点数" : "Check all twelve choices and points"}</summary>
      <ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => <li key={q.id} data-mental-age-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{q.options.find(o => o.id === answers[q.id])?.label[locale]} — {points[q.id]}{zh ? "点" : " points"}</p></li>)}</ol>
    </details>
    <section aria-labelledby="mental-age-full-guide" className="rounded-lg border border-slate-200 p-4 sm:p-6"><h3 id="mental-age-full-guide" className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile?.id === profile.id && readingProfile.resultReading?.quizSlug === quiz.slug && readingProfile.resultReading.profileId === profile.id ? readingProfile : profile} locale={locale} headingLevel={4} idPrefix="report" mode="result" previewSectionIds={["meaning", "situations", "action"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读不含个人年龄的公开完整指南" : "Read the complete public guide without your personal age"}</Link>
    </section>
  </div>;
}
