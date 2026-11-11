import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
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
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div className="mt-6 space-y-8" data-fds-report="">
    <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 sm:p-6" aria-labelledby="fds-contexts-title">
      <h3 id="fds-contexts-title" className="text-xl font-semibold text-orange-950">{zh ? displayText("从食物线索进入对应情境") : "Find the food cues you want to revisit"}</h3>
      <p className="mt-2 max-w-prose leading-7 text-slate-700">{zh ? displayText("均分在 1–6 的原始回答范围内，表示对题目所述情境的想象感受。每组填满数字回答才计算，点开名称可读对应例子。") : "The mean uses the original 1–6 response scale for imagined reactions to each scenario. A group needs all of its numeric answers. Choose any cue for its examples."}</p>
      <ul className="mt-4 grid gap-x-6 md:grid-cols-2">
        {quiz.profiles.map(profile => {
          const score = result.facets[profile.directionIds[0]];
          return <li key={profile.id} className="min-w-0 border-b border-orange-200 last:border-b-0">
            <a className="flex min-h-12 items-center justify-between gap-2 py-2 text-orange-950" href={`#fds-guide-${profile.id}`}>
              <span className="min-w-0 font-semibold underline decoration-orange-400 underline-offset-4">{profile.title[locale]}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">{score.mean === null ? (zh ? displayText(`${score.rated}/${score.total} 项有效`) : `${score.rated}/${score.total} rated`) : `${score.mean.toFixed(1)} / 6`}</span>
            </a>
          </li>;
        })}
      </ul>
    </section>

    {quiz.profiles.map(profile => {
      const readingProfile = readingProfiles?.find(item => item.id === profile.id && item.directionIds.length === 1 && item.directionIds[0] === profile.directionIds[0] && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === profile.id) ?? profile;
      return <section key={profile.id} aria-labelledby={`fds-guide-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6" data-fds-full={profile.id}>
      <h3 id={`fds-guide-${profile.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const part = result.facets[profile.directionIds[0]]; return <p className="mb-4 font-semibold tabular-nums">{zh ? displayText("本次均分：") : "Your mean: "}{part.mean === null ? (zh ? displayText("资料不足") : "Insufficient information") : `${part.mean.toFixed(1)} / 6`}</p>; })()}
<QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} traditional={traditional} headingLevel={4} idPrefix="report" mode="result" previewSectionIds={[`${readingProfile.id}-scenario`, `${readingProfile.id}-action`]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读不含个人数值的公开完整指南") : "Read the complete public guide without personal values"}</Link>
    </section>; })}

    <details className="border-t border-slate-200 pt-3" data-result-reading-method><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("查看全部读数、原始记录与计算说明") : "View all readings, original records and calculation notes"}</summary>
<p className="leading-8 text-slate-700">{zh ? displayText("八组只概括对所述食物情境的想象恶心感。每组全部题都为数字才给均值，不补值、不合总分、不派型。结果不判断食物安全、营养或健康。") : "The eight parts summarise imagined disgust at the stated food situations. A mean requires every item in that part to be numeric. No values are filled, total calculated or type assigned. Results do not judge food safety, nutrition or health."}</p>
<section className="space-y-5" aria-label={zh ? displayText("八组独立原始读数") : "Eight separate raw readouts"}>{quiz.directions.map(d => {
      const score = result.facets[d.id];
      return <section key={d.id} data-fds-part={d.id} className="rounded-lg bg-slate-50 p-4"><h3 className="text-xl font-semibold">{d.title[locale]}</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3"><div><dt className="font-semibold">{zh ? displayText("已评数字原始和") : "Sum of numeric ratings"}</dt><dd className="mt-2" data-fds-sum={d.id}>{score.rated ? score.sum : "—"}</dd></div><div><dt className="font-semibold">{zh ? displayText("数字项数／本组题目") : "Numeric responses / part items"}</dt><dd className="mt-2" data-fds-count={d.id}>{score.rated} / {score.total}</dd></div><div><dt className="font-semibold">{zh ? displayText("本组原始均值") : "Raw mean for this part"}</dt><dd className="mt-2" data-fds-mean={d.id}>{score.mean === null ? (zh ? displayText("不计算") : "Not calculated") : `${score.mean.toFixed(1)} / 6`}</dd></div></dl>
        <p className="mt-4 leading-8" data-fds-calculation={d.id}>{score.mean === null ? (zh ? displayText(`本组${score.total}题都已回应，${score.rated}项为数字；需要全部${score.total}项数字才计算。不评分不当作零或中点，完整指南仍可读。`) : `All ${score.total} prompts in this part have responses, but ${score.rated} are numeric; all ${score.total} numeric ratings are needed. Unscored is not zero or a midpoint. The full guide remains available.`) : (zh ? displayText(`算式：${score.sum} ÷ ${score.total} = ${score.mean.toFixed(1)}（保留一位小数）。这是对指定场景的原始平均，不是恶心百分比、常模或风险。`) : `Arithmetic: ${score.sum} ÷ ${score.total} = ${score.mean.toFixed(1)} (rounded to one decimal). This is a raw average for specified scenes, not a disgust percentage, norm or risk.`)}</p>
      </section>;
    })}</section>
<details className="rounded-lg border border-slate-200 p-4 leading-8"><summary className="cursor-pointer font-semibold">{zh ? displayText("回看32题回答") : "Revisit all 32 responses"}</summary><ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(q => <li key={q.id} data-fds-answer={q.id}><p>{q.prompt[locale]}</p><p className="font-semibold">{q.options.find(o => o.id === answers[q.id])?.label[locale]}</p></li>)}</ol></details>
<QuestionnaireFds32Attribution locale={locale} traditional={traditional} />
    </details>
  </div>;
}
