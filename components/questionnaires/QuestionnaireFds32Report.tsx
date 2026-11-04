import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { QuestionnaireFds32Attribution } from "./QuestionnaireFds32Attribution";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireFds32Report({ quiz, result, answers, locale, readingProfiles }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale; readingProfiles?: Questionnaire["profiles"];
}) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-fds-report="">
    <p className="leading-8 text-slate-700">{zh ? "八组只概括对所述食物情境的想象恶心感。每组全部题都为数字才给均值，不补值、不合总分、不派型。结果不判断食物安全、营养或健康。" : "The eight parts summarise imagined disgust at the stated food situations. A mean requires every item in that part to be numeric. No values are filled, total calculated or type assigned. Results do not judge food safety, nutrition or health."}</p>
    <section className="space-y-5" aria-label={zh ? "八组独立原始读数" : "Eight separate raw readouts"}>{quiz.directions.map(d => {
      const score = result.facets[d.id];
      return <section key={d.id} data-fds-part={d.id} className="rounded-lg bg-slate-50 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3"><div><dt className="font-semibold">{zh ? "已评数字原始和" : "Sum of numeric ratings"}</dt><dd className="mt-2" data-fds-sum={d.id}>{score.rated ? score.sum : "—"}</dd></div><div><dt className="font-semibold">{zh ? "数字项数／本组题目" : "Numeric responses / part items"}</dt><dd className="mt-2" data-fds-count={d.id}>{score.rated} / {score.total}</dd></div><div><dt className="font-semibold">{zh ? "本组原始均值" : "Raw mean for this part"}</dt><dd className="mt-2" data-fds-mean={d.id}>{score.mean === null ? (zh ? "不计算" : "Not calculated") : `${score.mean.toFixed(1)} / 6`}</dd></div></dl>
        <p className="mt-4 leading-8" data-fds-calculation={d.id}>{score.mean === null ? (zh ? `本组${score.total}题都已回应，${score.rated}项为数字；需要全部${score.total}项数字才计算。不评分不当作零或中点，完整指南仍可读。` : `All ${score.total} prompts in this part have responses, but ${score.rated} are numeric; all ${score.total} numeric ratings are needed. Unscored is not zero or a midpoint. The full guide remains available.`) : (zh ? `算式：${score.sum} ÷ ${score.total} = ${score.mean.toFixed(1)}（保留一位小数）。这是对指定场景的原始平均，不是恶心百分比、常模或风险。` : `Arithmetic: ${score.sum} ÷ ${score.total} = ${score.mean.toFixed(1)} (rounded to one decimal). This is a raw average for specified scenes, not a disgust percentage, norm or risk.`)}</p>
      </section>;
    })}</section>
    <details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? "回看32题回答" : "Revisit all 32 responses"}</summary><ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => <li key={q.id} data-fds-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{q.options.find(o => o.id === answers[q.id])?.label[locale]}</p></li>)}</ol></details>
    <QuestionnaireFds32Attribution locale={locale} />
    {quiz.profiles.map(profile => {
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === profile.directionIds[0] && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={profile.id} aria-labelledby={`fds-guide-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6" data-fds-full={profile.id}>
      <h3 id={`fds-guide-${profile.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3><QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} headingLevel={4} idPrefix="report" />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读不含个人数值的公开完整指南" : "Read the complete public guide without personal values"}</Link>
    </section>; })}
  </div>;
}
