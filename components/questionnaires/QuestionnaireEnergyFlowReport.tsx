import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireEnergyFlowReport({ quiz, result, answers, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-energy-flow-report="">
    <section aria-labelledby="energy-flow-overview" className="border-y border-amber-200 bg-amber-50/60 p-4 sm:p-6">
      <h3 id="energy-flow-overview" className="text-lg font-semibold text-amber-950">{zh ? copy("回看过去两周的四种情境") : "Four contexts from the past two weeks"}</h3>
      <p className="mt-2 max-w-prose leading-7">{zh ? copy("从最想回看的情境开始。每组的数字回答和解读都可以单独查看。") : "Start with the situation you most want to revisit. Each topic has its own responses and explanation."}</p>
      <ul className="mt-4 grid grid-cols-1 gap-x-6 divide-y divide-amber-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {quiz.profiles.map(profile => {
          const score = result.facets[profile.directionIds[0]];
          return <li key={profile.id} className="min-w-0 py-2">
            <a href={`#energy-guide-${profile.id}`} className="block min-h-11 font-semibold text-amber-950 underline underline-offset-4">{quiz.directions.find(direction => direction.id === profile.directionIds[0])?.title[locale] ?? profile.headline[locale]}</a>
            <p className="text-sm leading-7 tabular-nums">{score.mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${score.mean.toFixed(1)} / 5`} <span className="text-slate-600">· {score.rated}/{score.total} {zh ? copy("项数字回答") : "numeric responses"}</span></p>
          </li>;
        })}
      </ul>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`energy-guide-${profile.id}`} className="border-b border-slate-200 pb-5 sm:pb-6" data-energy-full={profile.id}>
      <h3 id={`energy-guide-${profile.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const part = result.facets[profile.directionIds[0]]; return <p className="mb-4 font-semibold tabular-nums">{zh ? copy("本次均分：") : "Your mean: "}{part.mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${part.mean.toFixed(1)} / 5`}</p>; })()}
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix="report" mode="result" previewSectionIds={[`${profile.id}-scenario`, `${profile.id}-action`]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读不含个人数值的公开完整指南") : "Read the complete public guide without personal values"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-3" data-result-reading-method><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看全部读数、原始记录与计算说明") : "View all readings, original records and calculation notes"}</summary>
<p className="leading-8 text-slate-700">{zh ? copy("四组只概括过去两周对题文的认同程度。均值不相加、不排名、不派类型，不测生理作息、心流、表现或恢复能力。请结合数字项数与具体回答阅读。") : "The four topics summarise endorsement of the statements over the past two weeks. Their means are not combined, ranked or used to assign types, and do not measure biological timing, flow, performance or recovery capacity. Read numeric coverage and individual responses together."}</p>
<section className="space-y-5" aria-label={zh ? copy("四组独立自报数值") : "Four separate self-reported summaries"}>{quiz.directions.map(d => {
      const score = result.facets[d.id];
      return <section key={d.id} data-energy-topic={d.id} className="rounded-lg bg-slate-50 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3"><div><dt className="font-semibold">{zh ? copy("数字原始和") : "Sum of numeric ratings"}</dt><dd className="mt-2" data-energy-sum={d.id}>{score.rated ? score.sum : "—"}</dd></div><div><dt className="font-semibold">{zh ? copy("数字项数／全部题目") : "Numeric responses / all prompts"}</dt><dd className="mt-2" data-energy-count={d.id}>{score.rated} / {score.total}</dd></div><div><dt className="font-semibold">{zh ? copy("本组描述性均值") : "Descriptive mean for this topic"}</dt><dd className="mt-2" data-energy-mean={d.id}>{score.mean === null ? (zh ? copy("不计算") : "Not calculated") : `${score.mean.toFixed(1)} / 5`}</dd></div></dl>
        <p className="mt-4 leading-8" data-energy-calculation={d.id}>{score.mean === null ? (zh ? copy(`资料不足：本组五题已回应，只有${score.rated}项数字；至少三项才计算。不评分不当作零，以下完整指南仍可阅读。`) : `Insufficient information: all five prompts have responses, but only ${score.rated} are numeric; at least three are needed. Unscored is not zero. The complete guide below remains available.`) : (zh ? copy(`算式：${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)}（保留一位小数）。这不是专注百分比、精力水平或表现分。`) : `Arithmetic: ${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)} (rounded to one decimal). This is not a focus percentage, energy level or performance score.`)}</p>
      </section>;
    })}</section>
<details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? copy("回看二十题回答") : "Revisit all twenty responses"}</summary><ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => <li key={q.id} data-energy-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{q.options.find(o => o.id === answers[q.id])?.label[locale]}</p></li>)}</ol></details>
    </details>
  </div>;
}
