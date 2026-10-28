import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCognitiveFunctionsReport({ quiz, result, answers, locale }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-cognitive-functions-report="">
    <p className="leading-8 text-slate-700">{zh ? "八组分别概括过去一个月对题文的认同，未建立心理测量验证。不同题组没有共同标定，保留固定顺序，不相加、不排名、不推主导功能、功能栈、MBTI类型或能力。相同显示值保留相等，小差值没有经过验证的解释。" : "The eight topics separately summarize endorsement of the past-month statements, without established psychometric validation. Different item sets have no common calibration. We keep a fixed order, without combining, ranking or inferring a dominant function, stack, MBTI type or ability. Equal displayed values remain equal; small gaps have no validated interpretation."}</p>
    <section className="space-y-5" aria-label={zh ? "八组独立自报汇总" : "Eight separate self-reported summaries"}>{quiz.directions.map(d => {
      const score = result.facets[d.id];
      return <section key={d.id} data-cognitive-topic={d.id} className="rounded-lg bg-slate-50 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3"><div><dt className="font-semibold">{zh ? "换算后数字和" : "Sum of keyed ratings"}</dt><dd className="mt-2" data-cognitive-sum={d.id}>{score.rated ? score.sum : "—"}</dd></div><div><dt className="font-semibold">{zh ? "数字项数／全部题目" : "Numeric responses / all prompts"}</dt><dd className="mt-2" data-cognitive-count={d.id}>{score.rated} / {score.total}</dd></div><div><dt className="font-semibold">{zh ? "本组描述性均值" : "Descriptive mean for this topic"}</dt><dd className="mt-2" data-cognitive-mean={d.id}>{score.mean === null ? (zh ? "不计算" : "Not calculated") : `${score.mean.toFixed(1)} / 5`}</dd></div></dl>
        <p className="mt-4 leading-8" data-cognitive-calculation={d.id}>{score.mean === null ? (zh ? `资料不足：四题都已回应，只有${score.rated}项数字，至少三项才计算。不评分不当作零，以下完整指南仍可阅读。` : `Insufficient information: all four prompts have responses, but only ${score.rated} are numeric; at least three are needed. Unscored is not zero. The complete guide below remains available.`) : (zh ? `算式：${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)}（保留一位小数）。前三题直接计分，第四题为6减所选数；这不是功能强度、能力或人群排名。` : `Arithmetic: ${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)} (rounded to one decimal). The first three items keep their ratings; the fourth contributes 6 minus the response. This is not function strength, ability or a population rank.`)}</p>
      </section>;
    })}</section>
    <details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "回看32题回答与换算" : "Revisit all 32 responses and keyed contributions"}</summary><ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => {
      const option = q.options.find(o => o.id === answers[q.id]);
      const contribution = typeof option?.score === "number" ? (q.reverse ? 6 - option.score : option.score) : null;
      return <li key={q.id} data-cognitive-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{option?.label[locale]}</p><p className="text-sm text-slate-600">{zh ? `${q.reverse ? "反向题：6减所选数" : "直接计分"}；贡献${contribution === null ? "不评分" : contribution}` : `${q.reverse ? "Reverse item: 6 minus response" : "Direct rating"}; contribution: ${contribution === null ? "unscored" : contribution}`}</p></li>;
    })}</ol></details>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`cognitive-guide-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6" data-cognitive-full={profile.id}>
      <h3 id={`cognitive-guide-${profile.id}`} className="text-2xl font-semibold">{profile.title[locale]}</h3><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix="report" />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读不含个人数值的公开完整指南" : "Read the complete public guide without personal values"}</Link>
    </section>)}
  </div>;
}
